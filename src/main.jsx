import { createRoot } from "react-dom/client";
import "./index.css";

import { Provider } from "react-redux";
import { persistor, store } from "./components/Store/Store";

import { RouterProvider } from "react-router-dom";
import router from "./Routes.jsx";

import { PersistGate } from "redux-persist/integration/react";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
   <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);