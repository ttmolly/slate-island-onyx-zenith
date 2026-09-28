import { ALL_FORMATS, AudioSampleSink, BlobSource, Input } from "mediabunny";
import type { AsrWord } from "@/lib/dub/types";

const CHUNK_SEC = 60;

export async function probeDuration(file: Blob): Promise<number> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const duration = await input.computeDuration();
    return Number.isFinite(duration) ? duration : 0;
  } finally {
    input.dispose();
  }
}

export async function transcribeAnime(
  file: File,
  onStatus: (label: string) => void,
): Promise<{ words: AsrWord[]; duration: number }> {
  if (file.size <= 3.5 * 1024 * 1024) {
    onStatus("Listening");
    const words = await postAudio(file);
    const duration = words.reduce((max, word) => Math.max(max, word.end), 0);
    return { words, duration };
  }
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const duration = await input.computeDuration();
    const track = await input.getPrimaryAudioTrack();
    if (!track) throw new Error("That file has no audio.");
    const sink = new AudioSampleSink(track);
    const pending = new Float32Array(16000 * CHUNK_SEC);
    let filled = 0;
    let origin = 0;
    let chunk = 1;
    const words: AsrWord[] = [];
    const total = Math.max(1, Math.ceil((Number.isFinite(duration) ? duration : CHUNK_SEC) / CHUNK_SEC));
    const flush = async () => {
      if (filled < 1600) return;
      onStatus(`Listening ${chunk}/${total}`);
      const heard = await postAudio(wav16(pending.subarray(0, filled), 16000));
      for (const word of heard) {
        words.push({
          ...word,
          start: word.start + origin,
          end: word.end + origin,
          speaker: word.speaker + (chunk - 1) * 100,
        });
      }
      origin += filled / 16000;
      filled = 0;
      chunk += 1;
    };
    for await (const sample of sink.samples()) {
      if (sample.timestamp + sample.duration <= 0) {
        sample.close();
        continue;
      }
      filled = pushDownmix(pending, filled, sample.toAudioBuffer());
      sample.close();
      if (filled >= pending.length - 1600) await flush();
    }
    await flush();
    return { words, duration: Number.isFinite(duration) ? duration : origin };
  } finally {
    input.dispose();
  }
}

export async function decodeEpisode(file: Blob): Promise<AudioBuffer | null> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const duration = await input.computeDuration();
    if (!Number.isFinite(duration) || duration <= 0 || duration > 15 * 60) return null;
    const track = await input.getPrimaryAudioTrack();
    if (!track) return null;
    const sink = new AudioSampleSink(track);
    const rate = 48000;
    const length = Math.ceil((duration + 0.25) * rate);
    const ctx = new AudioContext({ sampleRate: rate });
    try {
      const buffer = ctx.createBuffer(1, length, rate);
      const channel = buffer.getChannelData(0);
      for await (const sample of sink.samples()) {
        writeSample(channel, rate, sample.timestamp, sample.toAudioBuffer());
        sample.close();
      }
      return buffer;
    } finally {
      await ctx.close();
    }
  } catch {
    return null;
  } finally {
    input.dispose();
  }
}

async function postAudio(file: Blob): Promise<AsrWord[]> {
  const body = new FormData();
  body.append("file", file, "chunk.wav");
  const response = await fetch("/api/transcribe", { method: "POST", body });
  const data = (await response.json()) as { ok: boolean; error?: string; words?: AsrWord[] };
  if (!data.ok) throw new Error(data.error ?? "Could not listen to that file.");
  return data.words ?? [];
}

function writeSample(target: Float32Array, rate: number, timestamp: number, buffer: AudioBuffer) {
  const ratio = buffer.sampleRate / rate;
  const start = Math.max(0, Math.round(timestamp * rate));
  const frames = Math.floor(buffer.length / ratio);
  const planes = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  for (let index = 0; index < frames; index += 1) {
    const at = start + index;
    if (at >= target.length) return;
    const pos = index * ratio;
    const left = Math.floor(pos);
    const frac = pos - left;
    let sum = 0;
    for (const plane of planes) {
      const a = plane[left] ?? 0;
      const b = plane[Math.min(left + 1, plane.length - 1)] ?? a;
      sum += a + (b - a) * frac;
    }
    target[at] = sum / planes.length;
  }
}

function pushDownmix(target: Float32Array, filled: number, buffer: AudioBuffer): number {
  const ratio = buffer.sampleRate / 16000;
  const frames = Math.floor(buffer.length / ratio);
  const room = target.length - filled;
  const count = Math.min(frames, room);
  const channels = buffer.numberOfChannels;
  const planes = Array.from({ length: channels }, (_, index) => buffer.getChannelData(index));
  for (let index = 0; index < count; index += 1) {
    const pos = index * ratio;
    const left = Math.floor(pos);
    const frac = pos - left;
    let sum = 0;
    for (const plane of planes) {
      const a = plane[left] ?? 0;
      const b = plane[Math.min(left + 1, plane.length - 1)] ?? a;
      sum += a + (b - a) * frac;
    }
    target[filled + index] = sum / channels;
  }
  return filled + count;
}

function wav16(samples: Float32Array, rate: number): Blob {
  const bytes = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(bytes);
  write(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(view, 8, "WAVE");
  write(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

function write(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}
