import { generateAiHelperReply, streamAiHelperReply, type ChatMessage } from "@/lib/aiHelper";
import { getEffectiveSettings } from "@/lib/runtimeSettings.server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const settings = await getEffectiveSettings();
    const body = (await request.json()) as {
      message?: string;
      history?: ChatMessage[];
      stream?: boolean;
    };

    const message = body.message?.trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const history = Array.isArray(body.history) ? body.history : [];

    if (body.stream !== false) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of streamAiHelperReply(
              message,
              history,
              settings.openaiApiKey
            )) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              );
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to generate response";
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`)
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const { reply, sources } = await generateAiHelperReply(
      message,
      history,
      settings.openaiApiKey
    );
    return Response.json({ reply, sources });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate response";
    console.error("AI Helper error:", err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
