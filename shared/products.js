// Catalogue retro gaming partagé.
export const products = [
  {
    id: "nes-001",
    title: "Nintendo NES (1985)",
    price: 149,
    image: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=400",
    tags: ["nintendo", "console", "8bit"],
  },
  {
    id: "snes-002",
    title: "Super Nintendo",
    price: 179,
    image: "https://images.unsplash.com/photo-1591105327764-4c3aef251c7e?w=400",
    tags: ["nintendo", "console", "16bit"],
  },
  {
    id: "gb-003",
    title: "Game Boy Classic",
    price: 89,
    image: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=400",
    tags: ["nintendo", "portable", "8bit"],
  },
  {
    id: "md-004",
    title: "Sega Mega Drive",
    price: 159,
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400",
    tags: ["sega", "console", "16bit"],
  },
  {
    id: "ps1-005",
    title: "PlayStation 1",
    price: 129,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
    tags: ["sony", "console", "32bit"],
  },
  {
    id: "n64-006",
    title: "Nintendo 64",
    price: 199,
    image: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=400",
    tags: ["nintendo", "console", "64bit"],
  },
  {
    id: "atari-007",
    title: "Atari 2600",
    price: 119,
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
    tags: ["atari", "console", "8bit"],
  },
  {
    id: "gba-008",
    title: "Game Boy Advance",
    price: 99,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400",
    tags: ["nintendo", "portable", "32bit"],
  },
];

// Recommandations naïves : tags partagés, pondérés par fréquence dans le panier.
export function recommend(cartItems, all = products) {
  if (!cartItems || cartItems.length === 0) {
    return all.slice(0, 3);
  }
  const inCart = new Set(cartItems.map((i) => i.id));
  const tagScore = new Map();
  for (const item of cartItems) {
    const p = all.find((x) => x.id === item.id);
    if (!p) continue;
    for (const t of p.tags) tagScore.set(t, (tagScore.get(t) || 0) + 1);
  }
  return all
    .filter((p) => !inCart.has(p.id))
    .map((p) => ({
      product: p,
      score: p.tags.reduce((s, t) => s + (tagScore.get(t) || 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.product);
}
