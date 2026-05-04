import React, { Suspense, useEffect, useState } from "react";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProductGrid, Cart, Reco } from "./remotes";
import eventBus from "../../shared/eventBus";

function SkeletonGrid() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-title"></div>
      <div className="skeleton-grid">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-title" style={{ width: "60%" }}></div>
      <div className="skeleton-card" style={{ height: "60px" }}></div>
      <div className="skeleton-card" style={{ height: "60px" }}></div>
      <div className="skeleton-card" style={{ height: "60px" }}></div>
    </div>
  );
}

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const offCart = eventBus.on("cart:updated", ({ count }) => {
      setCartCount(count || 0);
    });

    const offProduct = eventBus.on("product:add", (product) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, title: product.title }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    });

    return () => {
      offCart();
      offProduct();
    };
  }, []);

  return (
    <div className="shell">
      <Header cartCount={cartCount} />
      <main className="shell__main">
        <section className="shell__products">
          <ErrorBoundary name="mfe-product">
            <Suspense fallback={<SkeletonGrid />}>
              <ProductGrid />
            </Suspense>
          </ErrorBoundary>
        </section>

        <aside className="shell__cart">
          <ErrorBoundary name="mfe-cart">
            <Suspense fallback={<SkeletonList />}>
              <Cart />
            </Suspense>
          </ErrorBoundary>
        </aside>

        <section className="shell__reco">
          <ErrorBoundary name="mfe-reco">
            <Suspense fallback={<SkeletonGrid />}>
              <Reco />
            </Suspense>
          </ErrorBoundary>
        </section>
      </main>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            + 1 {t.title}
          </div>
        ))}
      </div>
    </div>
  );
}
