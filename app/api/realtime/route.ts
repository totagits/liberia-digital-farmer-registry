import { NextRequest, NextResponse } from "next/server";
import { realtimeBus, RealtimeEvent } from "../../../lib/realtime-bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let keepAliveTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connection greeting
      const initMessage = `data: ${JSON.stringify({
        type: "connected",
        message: "Liberia DFR Real-Time Pipeline Connected",
        activeClients: realtimeBus.getListenerCount() + 1,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // 2. Subscribe to realtime event bus
      unsubscribe = realtimeBus.subscribe((event: RealtimeEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          // Stream might be closed
        }
      });

      // 3. Keep-alive heartbeat every 20 seconds
      keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          if (keepAliveTimer) clearInterval(keepAliveTimer);
        }
      }, 20000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (keepAliveTimer) clearInterval(keepAliveTimer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, payload } = body;
    if (!channel) {
      return NextResponse.json({ error: "Missing channel" }, { status: 400 });
    }

    realtimeBus.publish(channel, payload || {});
    return NextResponse.json({ ok: true, channel, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
