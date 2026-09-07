import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { realTimeBus } from "@/lib/real-time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let cleanupUserSub: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED", userId: session.id })}\n\n`));

      cleanupUserSub = realTimeBus.subscribe(`user:${session.id}`, (event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // stream closed
        }
      });
    },
    cancel() {
      if (cleanupUserSub) cleanupUserSub();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
