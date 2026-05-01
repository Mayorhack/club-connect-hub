import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedIfNeeded } from "./lib/storage";

seedIfNeeded();
createRoot(document.getElementById("root")!).render(<App />);
