import type { WsInboundMessage, WsConnectionState } from "@/types/websocket";

/**
 * MockRescueHiveSocket simulates the production WebSocket contract described in
 * the backend integration spec (telemetry / robot_status / map_update / detection
 * / mission_progress channels). It can be swapped 1:1 for a real `WebSocket`-backed
 * client — same `onMessage` / `onStateChange` surface — once the FastAPI backend
 * is available. See services/websocket/realSocket.ts (stub) for the swap point.
 */
type Listener = (msg: WsInboundMessage) => void;
type StateListener = (state: WsConnectionState) => void;

class MockRescueHiveSocket {
  private listeners = new Set<Listener>();
  private stateListeners = new Set<StateListener>();
  private state: WsConnectionState = "connecting";
  private interval: number | null = null;
  private reconnectTimeout: number | null = null;
  private producer: (() => WsInboundMessage | null) | null = null;

  connect(producer: () => WsInboundMessage | null, tickMs = 1500) {
    this.producer = producer;
    this.setState("connecting");
    // Simulate connection handshake latency
    window.setTimeout(() => {
      this.setState("open");
      this.startTicking(tickMs);
    }, 500);

    // Simulate an occasional connection blip + auto-reconnect, like real infra.
    this.scheduleRandomDisconnect();
  }

  private startTicking(tickMs: number) {
    if (this.interval) window.clearInterval(this.interval);
    this.interval = window.setInterval(() => {
      if (!this.producer) return;
      const msg = this.producer();
      if (msg) this.emit(msg);
    }, tickMs);
  }

  private scheduleRandomDisconnect() {
    const delay = 30_000 + Math.random() * 45_000;
    this.reconnectTimeout = window.setTimeout(() => {
      if (this.state === "open") {
        this.setState("reconnecting");
        if (this.interval) window.clearInterval(this.interval);
        window.setTimeout(() => {
          this.setState("open");
          this.startTicking(1500);
          this.scheduleRandomDisconnect();
        }, 2000 + Math.random() * 2000);
      } else {
        this.scheduleRandomDisconnect();
      }
    }, delay);
  }

  private emit(msg: WsInboundMessage) {
    this.listeners.forEach((l) => l(msg));
  }

  private setState(state: WsConnectionState) {
    this.state = state;
    this.stateListeners.forEach((l) => l(state));
  }

  onMessage(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStateChange(listener: StateListener) {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  disconnect() {
    if (this.interval) window.clearInterval(this.interval);
    if (this.reconnectTimeout) window.clearTimeout(this.reconnectTimeout);
    this.setState("closed");
  }
}

export const mockSocket = new MockRescueHiveSocket();
