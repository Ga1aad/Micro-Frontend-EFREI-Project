import React, { useEffect, useState } from "react";
import eventBus from "../../shared/eventBus";
import { recommend } from "../../shared/products";
import "./styles.css";

export default function Reco() {
  const [recos, setRecos] = useState(() => recommend([]));

  useEffect(() => {
    const off = eventBus.on("cart:updated", ({ items }) => {
      setRecos(recommend(items || []));
    });
    return off;
  }, []);

  const handleAdd = (p) => {
    eventBus.emit("product:add", {
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
    });
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
            />
            <div className="reco-card__body">
              <h3 className="reco-card__title">{p.title}</h3>
              <p className="reco-card__price">{p.price} €</p>
              <button className="reco-card__btn" onClick={() => handleAdd(p)}>
                Ajouter
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
