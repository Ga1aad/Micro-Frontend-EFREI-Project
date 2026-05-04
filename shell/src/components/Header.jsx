import React from "react";

export default function Header({ cartCount = 0 }) {
  return (
    <header className="shell__header">
      <div className="shell__brand">
        <span className="shell__logo">▶</span>
        <h1 className="shell__title">RetroPlay</h1>
        <span className="shell__tagline">Retro Gaming Shop</span>
      </div>
      <div className="shell__nav">
        <a href="#catalogue">Catalogue</a>
        <a href="#panier">Panier</a>
        <div className="shell__badge" aria-label="Articles dans le panier">
          🛒 <span className="shell__badge-count">{cartCount}</span>
        </div>
      </div>
    </header>
  );
}
