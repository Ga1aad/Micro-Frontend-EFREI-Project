import React from "react";

// Isole un MFE distant : si son rendu crashe, on affiche un fallback
// au lieu de propager et de tuer toute la page.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[shell] MFE "${this.props.name}" crashed:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="shell__error">
          <strong>⚠ {this.props.name}</strong>
          <p>Ce module n'a pas pu être chargé. Le reste de la page reste fonctionnel.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
