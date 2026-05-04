import React, { useEffect, useState } from "react";
import eventBus, { EVENTS } from "../../shared/eventBus";
import { recommend } from "../../shared/products";
import "./styles.css";

function toCartPayload(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
  };
}

export default function Reco() {
  const [recos, setRecos] = useState(() => recommend([]));

  useEffect(() => {
    const off = eventBus.on(EVENTS.CART_UPDATED, (payload = {}) => {
      setRecos(recommend(payload.items || []));
    });
    return off;
  }, []);

  const handleAdd = (p) => {
    eventBus.emit(EVENTS.PRODUCT_ADD, toCartPayload(p));
  };

  return (
    <section className="mfe-reco">
      <h2 className="mfe-reco__title">Les joueurs achètent aussi</h2>
      <div className="mfe-reco__row">
        {recos.map((p) => (
          <article key={p.id} className="reco-card">
            <div
              className="reco-card__img"
              style={{ backgroundImage: `url(${p.image})` }}
              aria-hidden="true"
            />
            <div className="reco-card__body">
              <h3 className="reco-card__title">{p.title}</h3>
              <p className="reco-card__price">{p.price} €</p>
              <button
                type="button"
                className="reco-card__btn"
                onClick={() => handleAdd(p)}
              >
                Ajouter
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
