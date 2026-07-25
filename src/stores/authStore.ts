import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/domain";
import { MOCK_USERS } from "@/utils/mockData";

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
        // Simulated network latency + JWT issuance.
        await new Promise((r) => setTimeout(r, 650));
        const record = MOCK_USERS[email.toLowerCase()];
        if (!record || record.password !== password) {
          return { success: false, error: "Invalid email or password." };
        }
        const { password: _pw, ...user } = record;
        set({
          user,
          token: `mock.jwt.${user.id}.${Date.now()}`,
          rememberMe,
          isAuthenticated: true,
        });
        return { success: true };
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "rescuehive-auth" }
  )
);
