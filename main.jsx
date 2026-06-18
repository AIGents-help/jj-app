import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import JourneyJournal from "./App_base.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <JourneyJournal />
  </React.StrictMode>
);
