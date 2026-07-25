import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  wsConnectionState: "connecting" | "open" | "reconnecting" | "closed";
  setWsConnectionState: (s: UIState["wsConnectionState"]) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  wsConnectionState: "connecting",
  setWsConnectionState: (s) => set({ wsConnectionState: s }),
}));
