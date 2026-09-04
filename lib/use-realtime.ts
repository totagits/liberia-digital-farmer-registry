"use client";

import { useEffect, useState, useRef } from "react";
import { RealtimeEvent } from "./realtime-bus";

export interface RealtimeOptions {
  onFarmerChange?: (event: RealtimeEvent) => void;
  onParcelChange?: (event: RealtimeEvent) => void;
  onPartyChange?: (event: RealtimeEvent) => void;
  onDeliveryChange?: (event: RealtimeEvent) => void;
  onHouseholdChange?: (event: RealtimeEvent) => void;
  onSyncBatch?: (event: RealtimeEvent) => void;
  onAny?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export function useRealtime(options: RealtimeOptions = {}) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>("");

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (options.enabled === false) {
      setStatus("disconnected");
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;

    const connect = () => {
      setStatus("connecting");
      try {
        eventSource = new EventSource("/api/realtime");

        eventSource.onopen = () => {
          setStatus("connected");
          retryCount = 0;
        };

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === "connected") {
              setStatus("connected");
              setLastHeartbeat(new Date().toLocaleTimeString());
              return;
            }

            const event = data as RealtimeEvent;
            setLastEvent(event);
            setLastHeartbeat(new Date().toLocaleTimeString());

            // Dispatch callbacks
            if (optionsRef.current.onAny) {
              optionsRef.current.onAny(event);
            }

            if (event.channel.startsWith("farmer:") && optionsRef.current.onFarmerChange) {
              optionsRef.current.onFarmerChange(event);
            } else if (event.channel.startsWith("parcel:") && optionsRef.current.onParcelChange) {
              optionsRef.current.onParcelChange(event);
            } else if (event.channel.startsWith("party:") && optionsRef.current.onPartyChange) {
              optionsRef.current.onPartyChange(event);
            } else if (event.channel.startsWith("delivery:") && optionsRef.current.onDeliveryChange) {
              optionsRef.current.onDeliveryChange(event);
            } else if (event.channel.startsWith("household:") && optionsRef.current.onHouseholdChange) {
              optionsRef.current.onHouseholdChange(event);
            } else if (event.channel.startsWith("sync:") && optionsRef.current.onSyncBatch) {
              optionsRef.current.onSyncBatch(event);
            }
          } catch (parseErr) {
            // Non-JSON or comment
          }
        };

        eventSource.onerror = () => {
          setStatus("disconnected");
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff (capped at 15s)
          const delay = Math.min(1000 * Math.pow(1.5, retryCount), 15000);
          retryCount++;
          reconnectTimeout = setTimeout(connect, delay);
        };
      } catch (err) {
        setStatus("disconnected");
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [options.enabled]);

  return {
    status,
    connected: status === "connected",
    lastEvent,
    lastHeartbeat,
  };
}
