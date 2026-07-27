import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";

export function AppShell() {
  useRealtimeConnection();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            border: "1px solid #243244",
            color: "#E2E8F0",
          },
        }}
      />
    </div>
  );
}
