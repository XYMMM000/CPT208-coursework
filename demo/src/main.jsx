import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/climbquest.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter enables routing in the whole app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
