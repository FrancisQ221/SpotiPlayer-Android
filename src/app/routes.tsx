import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/features/home/ui/HomePage";
import LoginPage from "@/features/auth/ui/LoginPage";
import PlayerPage from "@/features/player/ui/PlayerPage";
import SettingsPage from "@/features/settings/ui/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player" element={<PlayerPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
