import { NextResponse } from "next/server";
import { getMatchesList, selectHomepageLiveMatch } from "@/server/services/matchesServerService";
import { subscribeMatchUpdates } from "@/server/db/pgListener";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeEnqueue = (chunk: Uint8Array) => {
        if (isClosed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          isClosed = true;
        }
      };

      const sendMatchUpdate = async () => {
        try {
          const matches = await getMatchesList();
          const selected = selectHomepageLiveMatch(matches);
          const data = JSON.stringify({ match: selected, timestamp: Date.now() });
          safeEnqueue(encoder.encode(`event: match_update\ndata: ${data}\n\n`));
        } catch {
          // Preserve stream
        }
      };

      // 1. Initial snapshot on connection
      await sendMatchUpdate();

      // 2. Subscribe to PostgreSQL LISTEN notifications
      const unsubscribe = subscribeMatchUpdates(() => {
        sendMatchUpdate();
      });

      // 3. Heartbeat ping frame every 15s to keep Render / NGINX reverse proxy alive
      const pingInterval = setInterval(() => {
        safeEnqueue(encoder.encode(": ping\n\n"));
      }, 15000);

      // 4. Cleanup when client disconnects
      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
