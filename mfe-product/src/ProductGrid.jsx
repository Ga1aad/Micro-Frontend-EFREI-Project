import React from "react";
import eventBus, { EVENTS } from "../../shared/eventBus";
import { products } from "../../shared/products";
import "./styles.css";

function toCartPayload(product) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
  };
}

export default function ProductGrid() {
  const handleAdd = (product) => {
    eventBus.emit(EVENTS.PRODUCT_ADD, toCartPayload(product));
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
              <button
                type="button"
                className="card__btn"
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
