import { isScrapeRunning, getScrapeStatus } from "@/lib/scraper";

export const dynamic = "force-dynamic";

const STATUS_INTERVAL_MS = 3_000;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const pushStatus = () => {
        send("status", {
          ...getScrapeStatus(),
          running: isScrapeRunning(),
        });
      };

      send("connected", { timestamp: new Date().toISOString() });
      pushStatus();

      const interval = setInterval(pushStatus, STATUS_INTERVAL_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
