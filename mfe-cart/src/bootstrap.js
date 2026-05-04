import React from "react";
import { createRoot } from "react-dom/client";
import Cart from "./Cart";
import "./styles.css";

const el = document.getElementById("root");
if (el) createRoot(el).render(<Cart />);
