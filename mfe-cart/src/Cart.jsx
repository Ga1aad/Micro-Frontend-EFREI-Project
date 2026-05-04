import React, { useEffect, useState, useCallback } from "react";
import eventBus, { EVENTS } from "../../shared/eventBus";
import "./styles.css";

function summarize(items) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return { items, count, total: Math.round(total * 100) / 100 };
}

function normalizeProduct(product) {
  if (!product || typeof product !== "object") return null;

  const price = Number(product.price);
  if (
    typeof product.id !== "string" ||
    typeof product.title !== "string" ||
    typeof product.image !== "string" ||
    !Number.isFinite(price)
  ) {
    return null;
  }

  return {
    id: product.id,
    title: product.title,
    price,
    image: product.image,
  };
}

export default function Cart() {
  const [items, setItems] = useState([]);

  // Re-emit cart:updated on every state change so listeners stay in sync.
  useEffect(() => {
    eventBus.emit(EVENTS.CART_UPDATED, summarize(items));
  }, [items]);

  // Listen for product:add — merge by id, increment qty.
  useEffect(() => {
    const off = eventBus.on(EVENTS.PRODUCT_ADD, (product) => {
      const nextProduct = normalizeProduct(product);
      if (!nextProduct) return;

      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === nextProduct.id);
        if (idx === -1) return [...prev, { ...nextProduct, qty: 1 }];
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      });
    });
    return off;
  }, []);

  // Listen for cart:clear (anyone can request a wipe).
  useEffect(() => {
    const off = eventBus.on(EVENTS.CART_CLEAR, () => setItems([]));
    return off;
  }, []);

  const handleClear = useCallback(() => {
    eventBus.emit(EVENTS.CART_CLEAR, {});
  }, []);

  const handleRemoveLine = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const { count, total } = summarize(items);

  return (
    <aside className="mfe-cart">
      <header className="mfe-cart__header">
        <h2 className="mfe-cart__title">Panier</h2>
        <span className="mfe-cart__count">{count}</span>
      </header>

      {items.length === 0 ? (
        <p className="mfe-cart__empty">Votre panier est vide.</p>
      ) : (
        <ul className="mfe-cart__list">
          {items.map((it) => (
            <li key={it.id} className="mfe-cart__item">
              <img src={it.image} alt={`Vignette : ${it.title}`} />
              <div className="mfe-cart__item-body">
                <span className="mfe-cart__item-title">{it.title}</span>
                <span className="mfe-cart__item-meta">
                  {it.qty} × {Number(it.price).toFixed(2)} €
                </span>
              </div>
              <button
                type="button"
                className="mfe-cart__remove"
                onClick={() => handleRemoveLine(it.id)}
                aria-label={`Retirer ${it.title} du panier`}
              >
                <span className="mfe-cart__remove-icon" aria-hidden="true">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="mfe-cart__footer">
        <div className="mfe-cart__total">
          <span>Total</span>
          <strong>{total.toFixed(2)} €</strong>
        </div>
        <button
          type="button"
          className="mfe-cart__clear"
          onClick={handleClear}
          disabled={items.length === 0}
        >
          Vider
        </button>
      </footer>
    </aside>
  );
}
