import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON
    ? createClient(SUPABASE_URL, SUPABASE_ANON)
    : null;

interface AuthState {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  continueAsGuest: () => void;
  setError: (e: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isGuest: false,

      signIn: async (email, password) => {
        if (!supabase) {
          // No Supabase configured: auto sign in as guest with email
          set({ user: { id: "local", email }, isGuest: false, error: null });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({
            user: { id: data.user.id, email: data.user.email ?? email },
            isLoading: false,
          });
        } catch (e: unknown) {
          set({ error: String((e as Error).message ?? e), isLoading: false });
        }
      },

      signUp: async (email, password) => {
        if (!supabase) {
          set({ user: { id: "local", email }, isGuest: false, error: null });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          set({
            user: { id: data.user!.id, email: data.user!.email ?? email },
            isLoading: false,
          });
        } catch (e: unknown) {
          set({ error: String((e as Error).message ?? e), isLoading: false });
        }
      },

      signOut: () => {
        supabase?.auth.signOut();
        set({ user: null, isGuest: false });
      },

      continueAsGuest: () => set({ isGuest: true, user: null }),
      setError: (e) => set({ error: e }),
    }),
    {
      name: "spoplayer-auth",
      partialize: (s) => ({ user: s.user, isGuest: s.isGuest }),
    }
  )
);
