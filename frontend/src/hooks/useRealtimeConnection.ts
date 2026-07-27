import { useEffect } from "react";
import { realSocket } from "@/services/websocket/realSocket";
import { dispatchWsMessage } from "@/services/websocket/dispatch";
import { useUIStore } from "@/stores/uiStore";

/**
 * Mount once (in App shell) to establish the real-time connection for the
 * whole application.
 */
export function useRealtimeConnection() {
  const setWsConnectionState = useUIStore((s) => s.setWsConnectionState);

  useEffect(() => {
    const offMessage = realSocket.onMessage(dispatchWsMessage);
    const offState = realSocket.onStateChange(setWsConnectionState);
    realSocket.connect();

    return () => {
      offMessage();
      offState();
      realSocket.disconnect();
    };
  }, [setWsConnectionState]);
}
