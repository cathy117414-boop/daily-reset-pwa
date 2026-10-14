import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { registerPwaUpdates } from './registerServiceWorker';

if (import.meta.env.PROD) registerPwaUpdates(import.meta.env.BASE_URL);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
