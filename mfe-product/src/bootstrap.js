import React from "react";
import { createRoot } from "react-dom/client";
import ProductGrid from "./ProductGrid";
import "./styles.css";

const el = document.getElementById("root");
if (el) createRoot(el).render(<ProductGrid />);
