import { HashRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AuthLock } from "@/features/auth";
import { useThemeSync } from "@/features/settings";
import { ToastProvider } from "@/shared/ui";
import "./globals.css";

function ThemeSync() {
  useThemeSync();
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeSync />
      <ToastProvider>
        <AuthLock>
          <AppRoutes />
        </AuthLock>
      </ToastProvider>
    </HashRouter>
  );
}
