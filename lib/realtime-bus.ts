// Real-Time Event Bus for Liberia Digital Farmer Registry
// Enables instantaneous server-to-client broadcasts via Server-Sent Events (SSE)

export interface RealtimeEvent {
  id: string;
  channel:
    | "farmer:created"
    | "farmer:verified"
    | "farmer:updated"
    | "parcel:created"
    | "parcel:verified"
    | "party:registered"
    | "household:registered"
    | "delivery:updated"
    | "delivery:evidence_uploaded"
    | "sync:batch_completed"
    | "audit:logged"
    | "control:updated";
  payload: Record<string, any>;
  timestamp: string;
}

type Listener = (event: RealtimeEvent) => void;

class RealtimeBus {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(channel: RealtimeEvent["channel"], payload: Record<string, any> = {}): void {
    const event: RealtimeEvent = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channel,
      payload,
      timestamp: new Date().toISOString(),
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("RealtimeBus listener error:", err);
      }
    }
  }

  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Global singleton instance across server requests
const globalForRealtime = globalThis as unknown as { dfrRealtimeBus?: RealtimeBus };
export const realtimeBus = globalForRealtime.dfrRealtimeBus || new RealtimeBus();
if (process.env.NODE_ENV !== "production") {
  globalForRealtime.dfrRealtimeBus = realtimeBus;
}
