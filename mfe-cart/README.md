# mfe-cart — Panier (Micro-Frontend)

MFE **RetroShop** : panier latéral (liste des articles, quantités, total, bouton « Vider »). Il est chargé par le shell via **Module Federation**.

## Port et commandes

| Script        | Action                          |
|---------------|---------------------------------|
| `npm install` | Dépendances                     |
| `npm start`   | Dev server Webpack — port **3002** |
| `npm run build` | Build production              |

En développement, le shell attend ce remote à `http://localhost:3002/remoteEntry.js`.

## Contrat d’événements

Référence complète : [`../CONTRACT.md`](../CONTRACT.md).

Ce MFE utilise [`../shared/eventBus.js`](../shared/eventBus.js) (singleton `window.__eventBus__`), comme les autres applications.

| Événement       | Rôle pour ce MFE |
|-----------------|------------------|
| **`product:add`** | **Écoute** — ajoute ou incrémente une ligne (fusion par `id`). |
| **`cart:updated`** | **Émet** — à chaque changement du panier : `{ items, count, total }` (consommé par le shell pour le badge et par `mfe-reco`). |
| **`cart:clear`** | **Émet** au clic « Vider » (`{}`) ; **écoute** pour réinitialiser l’état local. Un `cart:updated` vide suit via la mise à jour d’état. |

## Module Federation

- **Nom du remote** : `mfeCart`
- **Fichier** : `remoteEntry.js`
- **Expose** : `./Cart` → composant [`src/Cart.jsx`](src/Cart.jsx)

Le shell importe `mfeCart/Cart` (voir `shell/webpack.config.js` et `shell/src/remotes.js`).

## Structure

```
mfe-cart/
├── public/index.html
├── src/
│   ├── index.js      # point d’entrée async (MF)
│   ├── bootstrap.js  # rendu standalone (dev isolé)
│   ├── Cart.jsx      # composant exposé
│   └── styles.css
├── webpack.config.js
└── package.json
```

Pour tester **avec** le catalogue et le shell : depuis la racine du dépôt, lancer `./start-all.sh` ou démarrer `mfe-product`, `mfe-cart`, puis `shell` comme dans le README racine.
