import React, { useEffect, useState, useCallback } from "react";
import eventBus from "../../shared/eventBus";
import "./styles.css";

function summarize(items) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  return { items, count, total: Math.round(total * 100) / 100 };
}

export default function Cart() {
  const [items, setItems] = useState([]);

  // Re-emit cart:updated on every state change so listeners stay in sync.
  useEffect(() => {
    eventBus.emit("cart:updated", summarize(items));
  }, [items]);

  // Listen for product:add — merge by id, increment qty.
  useEffect(() => {
    const off = eventBus.on("product:add", (product) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === product.id);
        if (idx === -1) return [...prev, { ...product, qty: 1 }];
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      });
    });
    return off;
  }, []);

  // Listen for cart:clear (anyone can request a wipe).
  useEffect(() => {
    const off = eventBus.on("cart:clear", () => setItems([]));
    return off;
  }, []);

  const handleClear = useCallback(() => {
    eventBus.emit("cart:clear", {});
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
              <img src={it.image} alt="" />
              <div className="mfe-cart__item-body">
                <span className="mfe-cart__item-title">{it.title}</span>
                <span className="mfe-cart__item-meta">
                  {it.qty} × {it.price} €
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="mfe-cart__footer">
        <div className="mfe-cart__total">
          <span>Total</span>
          <strong>{total} €</strong>
        </div>
        <button
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
