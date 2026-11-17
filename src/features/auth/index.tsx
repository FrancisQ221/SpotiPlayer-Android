import { ReactNode } from "react";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./ui/LoginPage";

export function AuthLock({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (!user && !isGuest) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

export * from "./store/authStore";
export { default as LoginPage } from "./ui/LoginPage";
