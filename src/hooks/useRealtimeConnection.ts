import { useEffect } from "react";
import { mockSocket } from "@/services/websocket/mockSocket";
import { produceNextMessage } from "@/services/websocket/messageProducer";
import { dispatchWsMessage } from "@/services/websocket/dispatch";
import { useUIStore } from "@/stores/uiStore";

/**
 * Mount once (in App shell) to establish the real-time connection for the
 * whole application. Swappable for a real WebSocket without touching
 * consuming components, since they only ever read from Zustand stores.
 */
export function useRealtimeConnection() {
  const setWsConnectionState = useUIStore((s) => s.setWsConnectionState);

  useEffect(() => {
    const offMessage = mockSocket.onMessage(dispatchWsMessage);
    const offState = mockSocket.onStateChange(setWsConnectionState);
    mockSocket.connect(produceNextMessage, 1200);

    return () => {
      offMessage();
      offState();
      mockSocket.disconnect();
    };
  }, [setWsConnectionState]);
}
