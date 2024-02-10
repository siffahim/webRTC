import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { SocketProvider } from "./providers/Socket";
import route from "./routes";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <RouterProvider router={route} />
    </SocketProvider>
  </React.StrictMode>
);
