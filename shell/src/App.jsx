import React, { Suspense, useEffect, useState } from "react";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProductGrid, Cart, Reco } from "./remotes";
import eventBus from "../../shared/eventBus";

function Loading({ label }) {
  return <div className="shell__loading">Chargement {label}…</div>;
}

export default function App() {
  // Le badge du header reflète le panier en temps réel via cart:updated.
  // Single source of truth = mfe-cart, le shell n'est qu'un consommateur.
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const off = eventBus.on("cart:updated", ({ count }) => {
      setCartCount(count || 0);
    });
    return off;
  }, []);

  return (
    <div className="shell">
      <Header cartCount={cartCount} />
      <main className="shell__main">
        <section className="shell__products">
          <ErrorBoundary name="mfe-product">
            <Suspense fallback={<Loading label="catalogue" />}>
              <ProductGrid />
            </Suspense>
          </ErrorBoundary>
        </section>

        <aside className="shell__cart">
          <ErrorBoundary name="mfe-cart">
            <Suspense fallback={<Loading label="panier" />}>
              <Cart />
            </Suspense>
          </ErrorBoundary>
        </aside>

        <section className="shell__reco">
          <ErrorBoundary name="mfe-reco">
            <Suspense fallback={<Loading label="recommandations" />}>
              <Reco />
            </Suspense>
          </ErrorBoundary>
        </section>
      </main>
    </div>
  );
}
