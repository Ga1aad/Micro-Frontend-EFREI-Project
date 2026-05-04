import React, { lazy } from "react";

// Composant fallback en cas d'échec de chargement du remote (réseau, MFE down, etc).
// On le retourne dans le lazy().catch() pour que React.lazy reste satisfait
// et que ErrorBoundary n'ait pas à attraper une promesse rejetée non typée.
function makeFallback(name) {
  return function RemoteUnavailable() {
    return (
      <div className="shell__error">
        <strong>⚠ {name}</strong>
        <p>Service indisponible. Vérifiez que <code>{name}</code> tourne sur le bon port.</p>
      </div>
    );
  };
}

// lazy() + .catch() : si le remote ne répond pas, on substitue le fallback.
// Sans ce .catch(), une promesse rejetée fait remonter une erreur que
// même un ErrorBoundary parent peut mal capturer (selon la version de React).
export const ProductGrid = lazy(() =>
  import("mfeProduct/ProductGrid").catch((err) => {
    console.error("[shell] failed to load mfeProduct/ProductGrid:", err);
    return { default: makeFallback("mfe-product") };
  })
);

export const Cart = lazy(() =>
  import("mfeCart/Cart").catch((err) => {
    console.error("[shell] failed to load mfeCart/Cart:", err);
    return { default: makeFallback("mfe-cart") };
  })
);

export const Reco = lazy(() =>
  import("mfeReco/Reco").catch((err) => {
    console.error("[shell] failed to load mfeReco/Reco:", err);
    return { default: makeFallback("mfe-reco") };
  })
);
