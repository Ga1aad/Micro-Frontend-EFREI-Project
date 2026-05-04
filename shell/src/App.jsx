import React from "react";
import Header from "./components/Header";

// Squelette : Étudiant A doit remplacer ces placeholders par
// les remotes Module Federation, lazy() + Suspense + ErrorBoundary.
function Placeholder({ label }) {
  return (
    <div className="placeholder">
      <span>[ {label} non connecté — voir Étudiant A ]</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="shell">
      <Header />
      <main className="shell__main">
        <section className="shell__products">
          <Placeholder label="mfeProduct/ProductGrid" />
        </section>
        <aside className="shell__cart">
          <Placeholder label="mfeCart/Cart" />
        </aside>
        <section className="shell__reco">
          <Placeholder label="mfeReco/Reco" />
        </section>
      </main>
    </div>
  );
}
