# Contrat d'événements — Retro Gaming Shop MFE

Référence partagée par tous les MFEs. Toute divergence = silence radio à l'assemblage.

## Bus

`shared/eventBus.js` — singleton global exposé sur `window.__eventBus__`.
API : `emit(event, payload)`, `on(event, handler) -> unsubscribe`, `off(event, handler)`.
Les noms d'événements sont aussi exportés via `EVENTS` pour éviter les divergences de chaînes.

## Événements

### `product:add`
- **Émis par** : `mfe-product` (clic sur "Ajouter")
- **Écouté par** : `mfe-cart`
- **Payload** :
  ```ts
  { id: string, title: string, price: number, image: string }
  ```

### `cart:updated`
- **Émis par** : `mfe-cart` (à chaque mutation du panier)
- **Écouté par** : `shell` (badge), `mfe-reco`
- **Payload** :
  ```ts
  {
    items: Array<{ id: string, title: string, price: number, image: string, qty: number }>,
    count: number,   // somme des qty
    total: number    // somme price * qty
  }
  ```

### `cart:clear`
- **Émis par** : `mfe-cart` (clic "Vider")
- **Écouté par** : `mfe-cart` (lui-même, pour reset interne) ; déclenche aussi un `cart:updated` vide
- **Payload** : `{}`

## Ports
| Service       | Port |
|---------------|------|
| shell         | 3000 |
| mfe-product   | 3001 |
| mfe-cart      | 3002 |
| mfe-reco      | 3003 |

## Exposes (clés Module Federation)
| Remote      | name        | exposes              |
|-------------|-------------|----------------------|
| mfe-product | mfeProduct  | `./ProductGrid`      |
| mfe-cart    | mfeCart     | `./Cart`             |
| mfe-reco    | mfeReco     | `./Reco`             |
