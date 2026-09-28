import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 4 * 1024 * 1024;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          return Response.json(
            { ok: false, error: "Listening is unavailable right now." },
            { status: 503 },
          );
        }
        const declared = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(declared) && declared > MAX_BYTES) {
          return Response.json({ ok: false, error: "That listen chunk is over 4 MB." }, { status: 413 });
        }
        const incoming = await request.formData();
        const file = incoming.get("file");
        if (!(file instanceof File)) {
          return Response.json({ ok: false, error: "Choose an audio or video file." }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json(
            { ok: false, error: "That listen chunk is over 4 MB." },
            { status: 400 },
          );
        }
        const forward = new FormData();
        forward.append("file", file, file.name || "scene");
        forward.append("model", "grok-voice-transcribe-2.0");
        forward.append("language", "en");
        forward.append("diarize", "true");
        forward.append("format", "true");
        const response = await fetch("https://api.x.ai/v1/stt", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: forward,
        });
        if (!response.ok) {
          console.error("stt failed", response.status);
          return Response.json(
            { ok: false, error: `Could not transcribe that file (${response.status}).` },
            { status: 502 },
          );
        }
        const data = (await response.json()) as {
          text?: string;
          duration?: number;
          words?: { text?: string; start?: number; end?: number; speaker?: number }[];
        };
        const words = (data.words ?? [])
          .filter((word) => typeof word.text === "string")
          .map((word) => ({
            text: word.text ?? "",
            start: Number(word.start ?? 0),
            end: Number(word.end ?? 0),
            speaker: Number(word.speaker ?? 0),
          }));
        return Response.json({
          ok: true,
          text: data.text ?? "",
          duration: Number(data.duration ?? 0),
          words,
        });
      },
    },
  },
});
