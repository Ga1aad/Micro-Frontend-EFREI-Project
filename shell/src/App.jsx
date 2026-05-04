import React, { Suspense, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProductGrid, Cart, Reco } from "./remotes";
import eventBus, { EVENTS } from "../../shared/eventBus";

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
  const toastTimeouts = useRef(new Map());

  useEffect(() => {
    const offCart = eventBus.on(EVENTS.CART_UPDATED, (payload = {}) => {
      setCartCount(Number.isFinite(payload.count) ? payload.count : 0);
    });

    const offProduct = eventBus.on(EVENTS.PRODUCT_ADD, (product = {}) => {
      if (!product.title) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, title: product.title }]);
      const timeoutId = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastTimeouts.current.delete(id);
      }, 3000);
      toastTimeouts.current.set(id, timeoutId);
    });

    return () => {
      offCart();
      offProduct();
      toastTimeouts.current.forEach(clearTimeout);
      toastTimeouts.current.clear();
    };
  }, []);

  return (
    <div className="shell">
      <Header cartCount={cartCount} />
      <main className="shell__main">
        <section id="catalogue" className="shell__products">
          <ErrorBoundary name="mfe-product">
            <Suspense fallback={<SkeletonGrid />}>
              <ProductGrid />
            </Suspense>
          </ErrorBoundary>
        </section>

        <aside id="panier" className="shell__cart">
          <ErrorBoundary name="mfe-cart">
            <Suspense fallback={<SkeletonList />}>
              <Cart />
            </Suspense>
          </ErrorBoundary>
        </aside>

        <section id="recommandations" className="shell__reco">
          <ErrorBoundary name="mfe-reco">
            <Suspense fallback={<SkeletonGrid />}>
              <Reco />
            </Suspense>
          </ErrorBoundary>
        </section>
      </main>

      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status">
            + 1 {t.title}
          </div>
        ))}
      </div>
    </div>
  );
}
