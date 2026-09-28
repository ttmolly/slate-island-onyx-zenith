import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  VideoSample,
  VideoSampleSink,
  VideoSampleSource,
} from "mediabunny";

let ffmpeg: FFmpeg | null = null;
let onProgress: (progress: number) => void = () => {};

type Cue = { start: number; end: number; text: string };

async function encoder(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;
  const next = new FFmpeg();
  next.on("progress", ({ progress }) => onProgress(progress));
  await next.load({
    coreURL: await toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript"),
    wasmURL: await toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm"),
  });
  ffmpeg = next;
  return next;
}

let fontReady: Promise<void> | null = null;

async function ensureFont() {
  if (!fontReady) {
    fontReady = (async () => {
      const face = new FontFace("Vazirmatn", "url(/fonts/Vazirmatn-Regular.ttf)");
      await face.load();
      document.fonts.add(face);
    })();
  }
  await fontReady;
  await document.fonts.load("32px Vazirmatn");
}

function parseAss(ass: string): Cue[] {
  const cues: Cue[] = [];
  for (const line of ass.split(/\n/)) {
    if (!line.startsWith("Dialogue:")) continue;
    const body = line.slice("Dialogue:".length).trim();
    const parts = body.split(",");
    if (parts.length < 10) continue;
    const start = parseAssClock(parts[1] ?? "");
    const end = parseAssClock(parts[2] ?? "");
    const text = parts
      .slice(9)
      .join(",")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\\N/g, " ")
      .trim();
    if (text && end > start) cues.push({ start, end, text });
  }
  return cues;
}

function parseAssClock(value: string): number {
  const match = value.trim().match(/(\d+):(\d+):(\d+)\.(\d+)/);
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const centi = Number(match[4].padEnd(2, "0").slice(0, 2));
  return hours * 3600 + minutes * 60 + seconds + centi / 100;
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  const pushToken = (token: string) => {
    const next = current ? `${current} ${token}` : token;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    if (ctx.measureText(token).width <= maxWidth) {
      current = token;
      return;
    }
    let piece = "";
    for (const char of token) {
      const trial = piece + char;
      if (piece && ctx.measureText(trial).width > maxWidth) {
        lines.push(piece);
        piece = char;
      } else piece = trial;
    }
    current = piece;
  };
  for (const token of tokens.length > 0 ? tokens : [text]) pushToken(token);
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

function paintCue(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  const fontSize = Math.max(32, Math.round((64 * height) / 1080));
  ctx.font = `${fontSize}px Vazirmatn, sans-serif`;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const margin = Math.round((56 * height) / 1080);
  const lines = wrapLine(ctx, text, width - margin * 2);
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(4, Math.round((8 * height) / 1080));
  ctx.strokeStyle = "rgba(16,16,16,0.92)";
  ctx.fillStyle = "#ffffff";
  lines.forEach((line, index) => {
    const y = height - margin - (lines.length - 1 - index) * (fontSize + 6);
    ctx.strokeText(line, width / 2, y);
    ctx.fillText(line, width / 2, y);
  });
}

async function burnPicture(file: Blob, cues: Cue[], onStatus: (label: string) => void): Promise<Blob> {
  await ensureFont();
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) throw new Error("That file has no picture.");
    const width = track.displayWidth;
    const height = track.displayHeight;
    if (!width || !height) throw new Error("Could not read the picture size.");
    const duration = Math.max(await input.computeDuration(), 0.1);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw the picture.");
    const target = new BufferTarget();
    const output = new Output({ format: new Mp4OutputFormat(), target });
    const frames = new VideoSampleSource({
      codec: "avc",
      quality: new Quality({ quantizer: 22, bitrate: Math.max(800_000, Math.round(width * height * 5)) }),
    });
    output.addVideoTrack(frames);
    await output.start();
    const sink = new VideoSampleSink(track);
    let shown = -1;
    onStatus(`Burning Farsi 0%`);
    for await (const sample of sink.samples()) {
      sample.draw(ctx, 0, 0, width, height);
      const cue = cues.find((item) => sample.timestamp >= item.start && sample.timestamp < item.end);
      if (cue) paintCue(ctx, cue.text, width, height);
      const bitmap = await createImageBitmap(canvas);
      const stamped = new VideoSample(bitmap, {
        timestamp: Math.max(0, sample.timestamp),
        duration: sample.duration > 0 ? sample.duration : undefined,
      });
      bitmap.close();
      await frames.add(stamped);
      stamped.close();
      sample.close();
      const pct = Math.max(0, Math.min(99, Math.round((sample.timestamp / duration) * 100)));
      if (pct !== shown) {
        shown = pct;
        onStatus(`Burning Farsi ${pct}%`);
      }
    }
    frames.close();
    await output.finalize();
    const buffer = target.buffer;
    if (!buffer) throw new Error("The picture came out empty.");
    return new Blob([buffer], { type: "video/mp4" });
  } finally {
    input.dispose();
  }
}

function asBlob(data: Uint8Array | string): Blob {
  if (typeof data === "string") throw new Error("The encoder returned text instead of a video.");
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return new Blob([copy], { type: "video/mp4" });
}

async function muxAudio(video: Blob, wav: Blob, srt: string | null, onStatus: (label: string) => void): Promise<Blob> {
  const ff = await encoder();
  const logs: string[] = [];
  const onLog = ({ message }: { message: string }) => {
    logs.push(message);
    if (logs.length > 30) logs.shift();
  };
  ff.on("log", onLog);
  onProgress = (progress) => {
    const pct = Math.max(0, Math.min(99, Math.round(progress * 100)));
    onStatus(srt ? `Attaching subtitles ${pct}%` : `Encoding audio ${pct}%`);
  };
  try {
    onStatus(srt ? "Attaching subtitles" : "Encoding audio");
    await ff.writeFile("in.mp4", new Uint8Array(await video.arrayBuffer()));
    await ff.writeFile("mix.wav", new Uint8Array(await wav.arrayBuffer()));
    const args = ["-i", "in.mp4", "-i", "mix.wav"];
    if (srt != null) {
      await ff.writeFile("subs.srt", new TextEncoder().encode(srt));
      args.push("-i", "subs.srt", "-map", "0:v:0", "-map", "1:a:0", "-map", "2:s:0", "-c:s", "mov_text");
    } else {
      args.push("-map", "0:v:0", "-map", "1:a:0");
    }
    args.push(
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      "out.mp4",
    );
    const code = await ff.exec(args, 180_000);
    if (code !== 0) {
      const detail = logs.filter((line) => /error|invalid|failed|unknown/i.test(line)).at(-1);
      throw new Error(detail ?? "Could not build the translated MP4.");
    }
    return asBlob(await ff.readFile("out.mp4"));
  } finally {
    ff.off("log", onLog);
    onProgress = () => {};
    await Promise.all(
      ["in.mp4", "mix.wav", "subs.srt", "out.mp4"].map(async (name) => {
        try {
          await ff.deleteFile(name);
        } catch {
          /* already gone */
        }
      }),
    );
  }
}

export async function renderTranslatedMp4(options: {
  video: Blob;
  wav: Blob;
  ass: string;
  srt: string;
  soft: boolean;
  onStatus: (label: string) => void;
}): Promise<Blob> {
  if (options.soft) {
    options.onStatus("Loading the encoder");
    return muxAudio(options.video, options.wav, options.srt, options.onStatus);
  }
  const picture = await burnPicture(options.video, parseAss(options.ass), options.onStatus);
  options.onStatus("Loading the encoder");
  return muxAudio(picture, options.wav, null, options.onStatus);
}
