import "@ant-design/v5-patch-for-react-19";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store";
import { registerSW } from "virtual:pwa-register";

// Capture PWA install prompt globally
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPwaPrompt = e;
  window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: e }));
});

// Register Service Worker for PWA
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
);
