# Micro-Frontend EFREI Project — Boutique Retro Gaming

Boutique retro gaming en architecture Micro-Frontends (Module Federation, Webpack 5).

## Architecture

| Service       | Port  | Rôle                                         | Responsable     |
|---------------|-------|----------------------------------------------|-----------------|
| `shell`       | 3000  | Orchestrateur, charge les 3 MFEs             | Étudiant A      |
| `mfe-product` | 3001  | Grille de produits + bouton "Ajouter"        | Étudiant B      |
| `mfe-cart`    | 3002  | Panier latéral (liste, total, vider)         | Étudiant C      |
| `mfe-reco`    | 3003  | Recommandations "Les joueurs achètent aussi" | Étudiant D      |

Voir [`CONTRACT.md`](./CONTRACT.md) pour la liste exhaustive des événements et payloads.

## Démarrer

Dans 4 terminaux :

```bash
# T1
cd mfe-product && npm install && npm start
# T2
cd mfe-cart && npm install && npm start
# T3
cd mfe-reco && npm install && npm start
# T4
cd shell && npm install && npm start
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

## Branches

- `main` : scaffolding + parties "déjà faites" (JSX, CSS, layout, shared)
- `feature/shell` : implémentation Étudiant A (Module Federation + lazy + ErrorBoundary + badge)

## Validation

- [ ] Les 4 services démarrent sans erreur
- [ ] Cliquer "Ajouter" dans le catalogue ajoute l'article au panier
- [ ] Le badge du header affiche le bon nombre
- [ ] Les recommandations changent selon le contenu du panier
- [ ] Vider le panier remet tout à zéro
- [ ] Tuer `mfe-reco` (Ctrl+C) ne casse pas le reste de la page
