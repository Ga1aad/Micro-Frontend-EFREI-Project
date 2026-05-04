# Micro-Frontend EFREI Project — Boutique Retro Gaming

Boutique retro gaming en architecture Micro-Frontends (Module Federation, Webpack 5).

## Equipe 10

- [Galaad FILÂTRE](https://github.com/ga1aad)
- [Julien ESNAULT](https://github.com/julienesn)
- [Sofiane FARES](https://github.com/faressofiane)
- [Clément SUIRE](https://github.com/cleluke)

## Architecture

| Service       | Port | Rôle                                         | Responsable |
| ------------- | ---- | -------------------------------------------- | ----------- |
| `shell`       | 3000 | Orchestrateur, charge les 3 MFEs             | Étudiant A  |
| `mfe-product` | 3001 | Grille de produits + bouton "Ajouter"        | Étudiant B  |
| `mfe-cart`    | 3002 | Panier latéral (liste, total, vider)         | Étudiant C  |
| `mfe-reco`    | 3003 | Recommandations "Les joueurs achètent aussi" | Étudiant D  |

Voir [`CONTRACT.md`](./CONTRACT.md) pour la liste exhaustive des événements et payloads.

## Démarrer

### Option 1 — un seul terminal (recommandé)

Sur macOS (zsh par défaut) :

```zsh
./start-all.zsh
```

Sur Linux ou autre shell bash :

```bash
./start-all.sh
```

Lance les 4 services en parallèle, installe les deps si besoin, logs préfixés/colorés.
Ctrl+C arrête proprement tout le monde.

### Option 2 — 4 terminaux (mode classique)

```bash
cd mfe-product && npm install && npm start   # T1 :3001
cd mfe-cart    && npm install && npm start   # T2 :3002
cd mfe-reco    && npm install && npm start   # T3 :3003
cd shell       && npm install && npm start   # T4 :3000
```

Puis ouvrir <http://localhost:3000>.

## Structure

```
.
├── CONTRACT.md           # contrat d'événements partagé
├── shared/
│   ├── eventBus.js       # bus d'événements singleton (window)
│   └── products.js       # catalogue + algo de reco
├── shell/                # port 3000 (Étudiant A)
├── mfe-product/          # port 3001 (Étudiant B)
├── mfe-cart/             # port 3002 (Étudiant C)
└── mfe-reco/             # port 3003 (Étudiant D)
```

## Améliorations UI/UX (Retro Gaming)

Afin de renforcer le thème de la boutique, plusieurs améliorations graphiques et d'expérience utilisateur ont été ajoutées :
- **Design Retro** : Intégration de polices 8-bit (`Press Start 2P`), de boutons de type "arcade" en 3D (`box-shadow`), et d'un effet visuel de Scanlines d'écran cathodique sur toute l'application.
- **Skeleton Loaders** : Les zones de Micro-Frontends affichent des Skeletons (blocs clignotants) en attendant le chargement des composants asynchrones.
- **Toasts Notifications** : L'ajout d'un produit au panier déclenche un petit toast vert ("+ 1 Titre") en bas à droite pour un meilleur retour visuel.

## Branches

- `main` : scaffolding + parties "déjà faites" (JSX, CSS, layout, shared)
- `feature/shell` : implémentation Étudiant A (Module Federation + lazy + ErrorBoundary + badge)

## Validation

- [x] Les 4 services démarrent sans erreur (Verify.sh)
      <img width="561" height="179" alt="image" src="https://github.com/user-attachments/assets/79af6845-6289-4e49-be66-4dd248e89740" />

- [x] Cliquer "Ajouter" dans le catalogue ajoute l'article au panier
- [x] Le badge du header affiche le bon nombre
- [x] Les recommandations changent selon le contenu du panier
- [x] Vider le panier remet tout à zéro
- [x] Tuer `mfe-reco` (Ctrl+C) ne casse pas le reste de la page
