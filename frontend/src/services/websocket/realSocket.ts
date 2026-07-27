import type { WsConnectionState, WsInboundMessage } from "@/types/websocket";
import { useAuthStore } from "@/stores/authStore";

type MessageHandler = (msg: WsInboundMessage) => void;
type StateHandler = (state: WsConnectionState) => void;

class RealSocket {
  private ws: WebSocket | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private stateHandlers = new Set<StateHandler>();
  private state: WsConnectionState = "closed";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalDisconnect = false;

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStateChange(handler: StateHandler) {
    this.stateHandlers.add(handler);
    handler(this.state);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  private setState(newState: WsConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateHandlers.forEach((h) => h(newState));
    }
  }

  connect() {
    this.isIntentionalDisconnect = false;
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn("No auth token available, cannot connect WS");
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setState("connecting");

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      this.setState("open");
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "ping") return;
        this.messageHandlers.forEach((h) => h(msg));
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    this.ws.onclose = (event) => {
      this.setState("closed");
      if (event.code === 4401) {
        // Token expired/invalid, logout user
        useAuthStore.getState().logout();
      } else if (!this.isIntentionalDisconnect) {
        this.setState("reconnecting");
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };

    this.ws.onerror = () => {
      // Error handled by onclose
    };
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState("closed");
  }
}

export const realSocket = new RealSocket();
