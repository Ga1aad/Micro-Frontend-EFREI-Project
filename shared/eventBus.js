// Bus d'événements partagé entre tous les MFEs.
// Singleton global porté par window pour survivre aux frontières de bundle.

const KEY = "__eventBus__";

export const EVENTS = Object.freeze({
  PRODUCT_ADD: "product:add",
  CART_UPDATED: "cart:updated",
  CART_CLEAR: "cart:clear",
});

function createBus() {
  const listeners = new Map(); // event -> Set<handler>

  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => {
        const set = listeners.get(event);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) listeners.delete(event);
      };
    },
    off(event, handler) {
      const set = listeners.get(event);
      if (!set) return;
      set.delete(handler);
      if (set.size === 0) listeners.delete(event);
    },
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      for (const h of set) {
        try {
          h(payload);
        } catch (err) {
          console.error(`[eventBus] handler "${event}" threw:`, err);
        }
      }
    },
  };
}

if (typeof window !== "undefined" && !window[KEY]) {
  window[KEY] = createBus();
}

export const eventBus =
  typeof window !== "undefined" ? window[KEY] : createBus();

export default eventBus;
