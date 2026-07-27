import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/domain";
import { apiClient } from "@/services/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  rememberMe: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: false,
      isAuthenticated: false,
      login: async (email, password, rememberMe) => {
        try {
          const { data } = await apiClient.post("/auth/login", {
            email,
            password,
            remember_me: rememberMe,
          });
          set({
            user: data.user,
            token: data.accessToken,
            rememberMe,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (error: any) {
          return {
            success: false,
            error: error.response?.data?.error?.message || "Login failed.",
          };
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "rescuehive-auth" }
  )
);
