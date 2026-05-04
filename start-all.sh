#!/usr/bin/env bash
# Lance les 4 services (mfe-product, mfe-cart, mfe-reco, shell) en parallèle.
# Ctrl+C tue tout proprement.

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SERVICES=(
  "mfe-product:3001"
  "mfe-cart:3002"
  "mfe-reco:3003"
  "shell:3000"
)

# Couleurs ANSI pour distinguer les logs.
COLORS=("\033[36m" "\033[32m" "\033[35m" "\033[33m") # cyan, vert, magenta, jaune
RESET="\033[0m"
BOLD="\033[1m"

PIDS=()
LOG_DIR="${ROOT}/.logs"
mkdir -p "${LOG_DIR}"

cleanup() {
  echo ""
  echo -e "${BOLD}→ Arrêt des services…${RESET}"
  for pid in "${PIDS[@]}"; do
    if kill -0 "${pid}" 2>/dev/null; then
      # Kill tout le process group (npm start lance webpack en enfant).
      kill -TERM -- "-${pid}" 2>/dev/null || kill "${pid}" 2>/dev/null
    fi
  done
  wait 2>/dev/null
  echo -e "${BOLD}→ Stoppé.${RESET}"
  exit 0
}
trap cleanup INT TERM

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
for i in "${!SERVICES[@]}"; do
  entry="${SERVICES[$i]}"
  name="${entry%%:*}"
  port="${entry##*:}"
  color="${COLORS[$i]}"

  (
    set -m
    cd "${ROOT}/${name}"
    npm start 2>&1 \
      | while IFS= read -r line; do
          printf "%b[%s:%s]%b %s\n" "${color}" "${name}" "${port}" "${RESET}" "${line}"
        done
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
