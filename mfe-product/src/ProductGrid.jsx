import React from "react";
import eventBus from "../../shared/eventBus";
import { products } from "../../shared/products";
import "./styles.css";

export default function ProductGrid() {
  const handleAdd = (product) => {
    eventBus.emit("product:add", {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <section className="mfe-product">
      <h2 className="mfe-product__title">Catalogue</h2>
      <div className="mfe-product__grid">
        {products.map((p) => (
          <article key={p.id} className="card">
            <div
              className="card__img"
              style={{ backgroundImage: `url(${p.image})` }}
              aria-hidden="true"
            />
            <div className="card__body">
              <h3 className="card__title">{p.title}</h3>
              <p className="card__price">{p.price} €</p>
              <button className="card__btn" onClick={() => handleAdd(p)}>
                Ajouter
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
