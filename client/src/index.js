import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
// import "semantic-ui-css/semantic.min.css";
// import "./styles.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App";
import { ContextProvider } from "./store/context";

render(
  <ContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ContextProvider>,
  document.getElementById("root")
);
