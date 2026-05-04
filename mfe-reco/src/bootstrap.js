import React from "react";
import { createRoot } from "react-dom/client";
import Reco from "./Reco";
import "./styles.css";

const el = document.getElementById("root");
if (el) createRoot(el).render(<Reco />);
