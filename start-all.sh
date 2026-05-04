#!/usr/bin/env bash
# Lance les 4 services (mfe-product, mfe-cart, mfe-reco, shell) en parallèle.
# Ctrl+C tue tout proprement.
#
# Si EADDRINUSE : ports encore pris par une vieille instance. Voir check_ports ou :
#   ./start-all.sh --free-ports

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FREE_PORTS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --free-ports | -F) FREE_PORTS=1; shift ;;
    --help | -h)
      echo "Usage: $0 [--free-ports|-F]"
      echo "  --free-ports  Tuer les processus qui écoutent sur les ports du projet (Windows : PowerShell ; Linux : fuser)."
      exit 0
      ;;
    *)
      echo "Option inconnue: $1 (voir $0 --help)" >&2
      exit 1
      ;;
  esac
done

SERVICES=(
  "mfe-product:3001"
  "mfe-cart:3002"
  "mfe-reco:3003"
  "shell:3000"
)

# Couleurs ANSI pour distinguer les logs ($'…' → vrai ESC, évite d’afficher littéralement \033 sur certains shells).
COLORS=($'\033[36m' $'\033[32m' $'\033[35m' $'\033[33m') # cyan, vert, magenta, jaune
RESET=$'\033[0m'
BOLD=$'\033[1m'

collect_unique_ports() {
  local -a p=()
  for entry in "${SERVICES[@]}"; do
    p+=("${entry##*:}")
  done
  printf '%s\n' "${p[@]}" | sort -u
}

port_is_listening() {
  local port="$1"
  case "$(uname -s 2>/dev/null)" in
    MINGW* | MSYS* | CYGWIN*)
      netstat -ano 2>/dev/null | grep LISTENING | grep -E ":${port}[[:space:]]" >/dev/null
      ;;
    Darwin*)
      if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
      else
        return 1
      fi
      ;;
    *)
      if command -v ss >/dev/null 2>&1; then
        ss -tuln 2>/dev/null | grep -q ":${port} "
      elif command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
      else
        netstat -tuln 2>/dev/null | grep -q ":${port} "
      fi
      ;;
  esac
}

free_port_win() {
  local port="$1"
  MSYS2_ARG_CONV_EXCL='*' powershell.exe -NoProfile -Command \
    "\$p = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if (\$null -ne \$p) { foreach (\$x in \$p) { Stop-Process -Id \$x -Force -ErrorAction SilentlyContinue } }" \
    2>/dev/null || true
}

maybe_free_ports() {
  [[ "${FREE_PORTS}" -eq 1 ]] || return 0
  echo -e "${BOLD}→ Libération des ports (node / webpack-dev-server)…${RESET}"
  local p
  while IFS= read -r p; do
    [[ -z "${p}" ]] && continue
    case "$(uname -s 2>/dev/null)" in
      MINGW* | MSYS* | CYGWIN*)
        free_port_win "${p}"
        ;;
      *)
        if command -v fuser >/dev/null 2>&1; then
          fuser -k "${p}/tcp" 2>/dev/null || true
        else
          echo -e "${BOLD}→ fuser absent : impossible de libérer automatiquement le port ${p}.${RESET}" >&2
        fi
        ;;
    esac
  done < <(collect_unique_ports)
  sleep 1
}

check_ports_or_fail() {
  local p busy=()
  while IFS= read -r p; do
    [[ -z "${p}" ]] && continue
    if port_is_listening "${p}"; then
      busy+=("${p}")
    fi
  done < <(collect_unique_ports)
  if [[ ${#busy[@]} -gt 0 ]]; then
    printf '\n' >&2
    printf '%b✗ Port(s) déjà utilisé(s) : %s%b\n' "${BOLD}" "${busy[*]}" "${RESET}" >&2
    printf '%s\n' "  Souvent une ancienne instance du script ou de webpack encore en cours." >&2
    printf '  Essayez : %b./start-all.sh --free-ports%b puis relancez sans l’option.\n' "${BOLD}" "${RESET}" >&2
    printf '%s\n' "  Ou : netstat -ano | findstr :3000   puis  taskkill /PID <pid> /F" >&2
    exit 1
  fi
}

PIDS=()
LOG_DIR="${ROOT}/.logs"
# PIDs réels de « npm start » (chef de groupe du pipeline webpack), pas ceux du sous-shell enveloppe.
NPM_PIDS_FILE="${LOG_DIR}/.service-npm-pids"

mkdir -p "${LOG_DIR}"
rm -f "${NPM_PIDS_FILE}"

cleanup() {
  trap - INT TERM
  echo ""
  echo -e "${BOLD}→ Arrêt des services…${RESET}"

  # 1) Tuer npm / node et leur groupe (webpack est enfant du processus $!).
  if [[ -f "${NPM_PIDS_FILE}" ]]; then
    while IFS= read -r npm_pid || [[ -n "${npm_pid}" ]]; do
      npm_pid="${npm_pid%%$'\r'}"
      npm_pid="${npm_pid// /}"
      [[ -z "${npm_pid}" ]] && continue
      if kill -0 "${npm_pid}" 2>/dev/null; then
        kill -TERM -- "-${npm_pid}" 2>/dev/null || kill -TERM "${npm_pid}" 2>/dev/null || true
      fi
    done < "${NPM_PIDS_FILE}"
  fi

  # 2) Enveloppes (sous-shells) encore vivants après l’arrêt de npm.
  for pid in "${PIDS[@]}"; do
    if kill -0 "${pid}" 2>/dev/null; then
      kill -TERM "${pid}" 2>/dev/null || true
    fi
  done

  wait 2>/dev/null
  rm -f "${NPM_PIDS_FILE}"
  echo -e "${BOLD}→ Stoppé.${RESET}"
  exit 0
}
trap cleanup INT TERM

maybe_free_ports
check_ports_or_fail

# Vérifie que chaque MFE a ses dépendances. Sinon, npm install.
for entry in "${SERVICES[@]}"; do
  name="${entry%%:*}"
  if [[ ! -d "${ROOT}/${name}/node_modules" ]]; then
    echo -e "${BOLD}→ Installation des deps pour ${name}…${RESET}"
    (cd "${ROOT}/${name}" && npm install --silent) || {
      echo "✗ npm install a échoué pour ${name}"
      exit 1
    }
  fi
done

echo ""
echo -e "${BOLD}→ Démarrage des micro-frontends${RESET}"
for entry in "${SERVICES[@]}"; do
  echo "  • ${entry}"
done
echo ""

# Lance chaque service en arrière-plan, préfixe ses logs avec [name].
# Redirection via >( ) pour que $! soit le PID de npm (chef de groupe), pas le sous-shell du tube npm | while.
for i in "${!SERVICES[@]}"; do
  entry="${SERVICES[$i]}"
  name="${entry%%:*}"
  port="${entry##*:}"
  color="${COLORS[$i]}"

  (
    set -m
    cd "${ROOT}/${name}"
    npm start > >(
      while IFS= read -r line; do
        printf "%b[%s:%s]%b %s\n" "${color}" "${name}" "${port}" "${RESET}" "${line}"
      done
    ) 2>&1 &
    echo $! >> "${NPM_PIDS_FILE}"
    wait $!
  ) &
  PIDS+=($!)
done

echo ""
echo -e "${BOLD}→ Tous les services lancés. Ouvrez http://localhost:3000${RESET}"
echo -e "${BOLD}→ Ctrl+C pour tout arrêter.${RESET}"
echo ""

# Surveille les enfants : si l'un meurt, on stoppe le reste.
# (Polling compatible bash 3.2 — pas de wait -n.)
while true; do
  for pid in "${PIDS[@]}"; do
    if ! kill -0 "${pid}" 2>/dev/null; then
      echo ""
      echo -e "${BOLD}✗ Un service s'est arrêté (pid ${pid}). Nettoyage.${RESET}"
      cleanup
    fi
  done
  sleep 2
done
