import { createServerFn } from "@tanstack/react-start";
import { VOICES, type Delivery } from "@/lib/dub/types";

type LineIn = {
  id: string;
  speaker: string;
  note: string;
  tone: string;
  targetSec: number;
  english: string;
  prev: string | null;
  next: string | null;
  farsi?: string;
  maxChars?: number;
};

type TranslateIn = {
  scene: string;
  glossary: { source: string; fa: string }[];
  lines: LineIn[];
  mode: "translate" | "shorten";
};

const VOICE_IDS = new Set<string>(VOICES.map((voice) => voice.id));

const SYSTEM = `You dub English dialogue into spoken Persian for an anime-style scene.
Rules:
- Write محاوره‌ای, the way someone talks in Tehran, not literary, news, or dubbed-stiff Persian.
- Casual را is رو. It's fine to say می‌خوام، نمی‌دونم، بذار، بریم when the character would.
- Keep each character's personality. A dry adult stays plain. A hot-headed kid can be rougher. Do not make everyone sound the same.
- Use the scene summary and the previous/next lines. Resolve pronouns and jokes from that context.
- Localize idioms. Do not leave Japanese honorifics (-san, -kun, -chan, -sama, senpai) in Latin script. Use the glossary, or a natural spoken address (the name alone, or جان between friends).
- Glossary spellings are mandatory. Never leave a glossary name in Latin letters.
- Proper names are written in Persian script, never Latin letters.
- Include "names" for each person or place in these lines: {"English Name":"املای فارسی"}. Reuse a glossary spelling. Omit names you did not hear.
- Each line must be speakable in about target_sec. Stay near soft_max_chars. Do not add filler.
- Orthography: use ZWNJ (U+200C). می‌ره not می ره. نمی‌دونم not نمی دونم. کتاب‌ها not کتاب ها.
- Persian punctuation: ؟ ، …
- Write numbers as Persian words, never digits.
- No speaker labels, no quotes around the line, no notes.
- If the English is only a laugh, scream, gasp, or stage direction, return an empty fa.
Return JSON only: {"lines":{"<id>":{"fa":"<persian>"}},"names":{"English Name":"فارسی"}}`;

function parseModelJson(text: string): { lines: Record<string, { fa?: string }>; names: { source: string; fa: string }[] } {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The model did not return JSON.");
  const parsed = JSON.parse(raw.slice(start, end + 1)) as {
    lines?: Record<string, { fa?: string }> | { id?: string; fa?: string }[];
    names?: Record<string, string>;
  };
  const lines = parsed.lines;
  const map: Record<string, { fa?: string }> = {};
  if (Array.isArray(lines)) {
    for (const line of lines) {
      if (line.id) map[line.id] = { fa: line.fa };
    }
  } else if (lines) {
    Object.assign(map, lines);
  }
  const names = Object.entries(parsed.names ?? {})
    .map(([source, fa]) => ({ source: source.trim(), fa: String(fa ?? "").trim() }))
    .filter((entry) => entry.source && entry.fa && /[\u0600-\u06FF]/.test(entry.fa) && !/[A-Za-z]/.test(entry.fa))
    .slice(0, 12);
  return { lines: map, names };
}

async function complete(apiKey: string, user: string): Promise<string> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.4,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("Grok is busy. Try again in a moment.");
    throw new Error(`Translation failed (${response.status}).`);
  }
  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("Translation came back empty.");
  return content;
}

export const translateLines = createServerFn({ method: "POST" })
  .validator((input: TranslateIn) => {
    if (!input || !Array.isArray(input.lines) || input.lines.length === 0) {
      throw new Error("Nothing to translate.");
    }
    if (input.lines.length > 12) throw new Error("Too many lines in one pass.");
    return {
      scene: String(input.scene ?? "").slice(0, 2000),
      glossary: (input.glossary ?? [])
        .slice(0, 40)
        .map((entry) => ({
          source: String(entry.source ?? "").slice(0, 80),
          fa: String(entry.fa ?? "").slice(0, 80),
        }))
        .filter((entry) => entry.source && entry.fa),
      mode: input.mode === "shorten" ? "shorten" : "translate",
      lines: input.lines.map((line) => ({
        id: String(line.id).slice(0, 40),
        speaker: String(line.speaker ?? "").slice(0, 60),
        note: String(line.note ?? "").slice(0, 240),
        tone: String(line.tone ?? "").slice(0, 40),
        targetSec: Number(line.targetSec) || 1,
        english: String(line.english ?? "").slice(0, 500),
        prev: line.prev ? String(line.prev).slice(0, 300) : null,
        next: line.next ? String(line.next).slice(0, 300) : null,
        farsi: line.farsi ? String(line.farsi).slice(0, 500) : "",
        maxChars: line.maxChars ? Math.max(8, Math.min(180, Math.round(line.maxChars))) : undefined,
      })),
    } satisfies TranslateIn;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Translation is unavailable right now." };
    const instruction =
      data.mode === "shorten"
        ? "Shorten the current Persian so it can be said in target_sec, at or under max_chars, without losing the point or the personality. Return only that line."
        : "Translate every listed line. Keys must be the line ids.";
    const user = `${instruction}\n${JSON.stringify({
      scene: data.scene,
      glossary: data.glossary,
      lines: data.lines.map((line) => ({
        id: line.id,
        speaker: line.speaker,
        personality: line.note,
        delivery: line.tone,
        target_sec: Number(line.targetSec.toFixed(2)),
        soft_max_chars: line.maxChars,
        english: line.english,
        current_farsi: data.mode === "shorten" ? line.farsi : undefined,
        previous_english: line.prev,
        next_english: line.next,
      })),
    })}`;
    try {
      const content = await complete(apiKey, user);
      const parsed = parseModelJson(content);
      const fa: Record<string, string> = {};
      for (const [id, value] of Object.entries(parsed.lines)) {
        fa[id] = typeof value?.fa === "string" ? value.fa : "";
      }
      return { ok: true as const, fa, names: data.mode === "translate" ? parsed.names : [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Translation failed.";
      return { ok: false as const, error: message };
    }
  });

export const speakLine = createServerFn({ method: "POST" })
  .validator((input: { text: string; voiceId: string; delivery: Delivery }) => {
    const text = String(input?.text ?? "").trim();
    if (!text) throw new Error("Nothing to read.");
    if (text.length > 420) throw new Error("That line is too long to read.");
    const voiceId = VOICE_IDS.has(input.voiceId) ? input.voiceId : "ara";
    const delivery: Delivery =
      input.delivery === "shout" || input.delivery === "excited" || input.delivery === "calm"
        ? input.delivery
        : "calm";
    return { text, voiceId, delivery };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Voice reads are unavailable right now." };
    const wrapped =
      data.delivery === "shout"
        ? `<loud>${data.text}</loud>`
        : data.delivery === "calm"
          ? `<soft>${data.text}</soft>`
          : data.text;
    const response = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: wrapped,
        voice_id: data.voiceId,
        language: "auto",
      }),
    });
    if (!response.ok) {
      if (response.status === 429) return { ok: false as const, error: "Voice is busy. Try that line again." };
      return { ok: false as const, error: `Could not read the line (${response.status}).` };
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    const step = 0x8000;
    for (let index = 0; index < bytes.length; index += step) {
      binary += String.fromCharCode(...bytes.subarray(index, index + step));
    }
    return { ok: true as const, audioBase64: btoa(binary), mime: "audio/mpeg" };
  });
