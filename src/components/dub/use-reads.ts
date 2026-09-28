import { useEffect, useRef, useState } from "react";
import { getMedia, getMediaElement } from "@/lib/dub/media-bus";
import { speakLine } from "@/lib/dub/server-fns";
import { useDub } from "@/lib/dub/store";
import { planTiming } from "@/lib/dub/timing";
import { audioBufferToWav } from "@/lib/dub/wav";
import type { Project, Segment } from "@/lib/dub/types";
import { replacedWindows } from "@/lib/dub/episode-cmd";

const SESSION_CAP = 240;

let spent = 0;
let sharedCtx: AudioContext | null = null;

function context(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

function keyFor(project: Project, segment: Segment): string {
  const voice = project.speakers.find((speaker) => speaker.id === segment.speakerId)?.voiceId ?? "ara";
  return `${voice}|${segment.delivery}|${segment.farsi}`;
}

function decodeBase64(audioBase64: string): ArrayBuffer {
  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function synthable(segment: Segment): boolean {
  return !segment.skip && !segment.nonverbal && segment.farsi.trim().length > 0;
}

export function useReads() {
  const cache = useRef(new Map<string, AudioBuffer>());
  const sources = useRef<AudioBufferSourceNode[]>([]);
  const clock = useRef<number | null>(null);
  const [cacheRev, setCacheRev] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  function stop() {
    for (const source of sources.current) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    sources.current = [];
    if (clock.current != null) window.clearInterval(clock.current);
    clock.current = null;
    const media = getMediaElement();
    if (media) media.pause();
    setPlaying(false);
    setActiveId(null);
  }

  useEffect(() => () => stop(), []);

  async function ensure(project: Project, segment: Segment): Promise<AudioBuffer> {
    const key = keyFor(project, segment);
    const hit = cache.current.get(key);
    if (hit) return hit;
    if (spent >= SESSION_CAP) throw new Error("Voice reads are paused for this session.");
    const speaker = project.speakers.find((item) => item.id === segment.speakerId);
    spent += 1;
    const result = await speakLine({
      data: {
        text: segment.farsi,
        voiceId: speaker?.voiceId ?? "ara",
        delivery: segment.delivery,
      },
    });
    if (!result.ok) throw new Error(result.error);
    const audio = await context().decodeAudioData(decodeBase64(result.audioBase64));
    cache.current.set(key, audio);
    setCacheRev((value) => value + 1);
    const target = Math.max(0.3, segment.end - segment.start);
    useDub.getState().updateSegment(segment.id, {
      spokenSec: audio.duration,
      timing: planTiming(target, audio.duration, segment.timing?.tries ?? 0),
    });
    return audio;
  }

  async function prepare(project: Project, lines: Segment[]) {
    const todo = lines.filter((segment) => synthable(segment) && !cache.current.has(keyFor(project, segment)));
    const batch = todo.slice(0, 20);
    setProgress({ done: 0, total: batch.length });
    for (let index = 0; index < batch.length; index += 1) {
      const line = batch[index];
      if (!line) continue;
      await ensure(useDub.getState().project ?? project, line);
      setProgress({ done: index + 1, total: batch.length });
    }
    setProgress(null);
    return todo.length > batch.length;
  }

  function schedule(
    ctx: BaseAudioContext,
    when: number,
    buffer: AudioBuffer,
    offset: number,
    duration: number | undefined,
    rate: number,
  ) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.max(0.5, rate);
    const audible = duration ?? buffer.duration / Math.max(0.5, rate);
    const gain = ctx.createGain();
    const fade = Math.min(0.02, Math.max(0.004, audible / 5));
    const end = when + audible;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(1, when + Math.min(fade, audible));
    gain.gain.setValueAtTime(1, Math.max(when + fade, end - fade));
    gain.gain.linearRampToValueAtTime(0, Math.max(end, when + 0.02));
    source.connect(gain);
    gain.connect(ctx.destination);
    if (duration == null) {
      source.start(when);
    } else {
      const offsetSafe = Math.min(Math.max(0, offset), Math.max(0, buffer.duration - 0.05));
      const room = Math.max(0.05, buffer.duration - offsetSafe);
      source.start(when, offsetSafe, Math.min(duration, room));
    }
    if (ctx instanceof AudioContext) sources.current.push(source);
  }

  async function preview(id: string) {
    const project = useDub.getState().project;
    if (!project) return;
    const segment = project.segments.find((item) => item.id === id);
    if (!segment) return;
    stop();
    useDub.getState().setBusy("read");
    useDub.getState().setBanner(null);
    try {
      const live = context();
      await live.resume();
      if (synthable(segment)) {
        const buffer = await ensure(project, segment);
        const latest = useDub.getState().project?.segments.find((item) => item.id === id) ?? segment;
        const rate = latest.timing?.rate ?? 1;
        schedule(live, live.currentTime + 0.05, buffer, 0, undefined, rate);
      } else {
        const original = getMedia().buffer;
        if (!original) {
          useDub.getState().setBanner("No source audio to play for that original take.");
          return;
        }
        schedule(live, live.currentTime + 0.05, original, segment.start, segment.end - segment.start, 1);
      }
      setActiveId(id);
      setPlaying(true);
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not read that line.");
    } finally {
      useDub.getState().setBusy(null);
    }
  }

  async function playAll() {
    const project = useDub.getState().project;
    if (!project) return;
    stop();
    useDub.getState().setBusy("read");
    useDub.getState().setBanner(null);
    try {
      const more = await prepare(project, project.segments);
      if (more) {
        useDub.getState().setBanner("Prepared the first 20 reads. Play again for the rest.");
      }
      const latest = useDub.getState().project ?? project;
      const live = context();
      await live.resume();
      const media = getMediaElement();
      if (media) {
        media.pause();
        media.currentTime = 0;
        media.muted = true;
      }
      const origin = live.currentTime + 0.15;
      const original = getMedia().buffer;
      for (const segment of latest.segments) {
        if (synthable(segment)) {
          const buffer = cache.current.get(keyFor(latest, segment));
          if (!buffer) continue;
          const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
          schedule(live, origin + segment.start, buffer, 0, undefined, rate);
        } else if (original && (segment.skip || segment.nonverbal)) {
          schedule(live, origin + segment.start, original, segment.start, Math.max(0.05, segment.end - segment.start), 1);
        }
      }
      if (media instanceof HTMLVideoElement) void media.play();
      setPlaying(true);
      clock.current = window.setInterval(() => {
        const at = live.currentTime - origin;
        const current = latest.segments.find((segment) => at >= segment.start && at <= segment.end + 0.15);
        setActiveId(current?.id ?? null);
        if (at > latest.duration + 2) stop();
      }, 120);
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not play the scene.");
    } finally {
      useDub.getState().setBusy(null);
    }
  }

  async function renderBed(manageBusy: boolean): Promise<AudioBuffer | null> {
    const project = useDub.getState().project;
    if (!project) return null;
    if (manageBusy) {
      useDub.getState().setBusy("read");
      useDub.getState().setBanner(null);
    }
    try {
      let more = true;
      for (let pass = 0; more && pass < 6; pass += 1) {
        const live = useDub.getState().project ?? project;
        more = await prepare(live, live.segments);
      }
      const latest = useDub.getState().project ?? project;
      const original = getMedia().buffer;
      let tail = latest.duration;
      for (const segment of latest.segments) {
        const buffer = cache.current.get(keyFor(latest, segment));
        const rate = segment.timing?.rate || 1;
        if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + 0.2);
        else tail = Math.max(tail, segment.end);
      }
      tail = Math.min(tail + 0.4, 600);
      const offline = new OfflineAudioContext(1, Math.ceil(tail * 48000), 48000);
      for (const segment of latest.segments) {
        if (synthable(segment)) {
          const buffer = cache.current.get(keyFor(latest, segment));
          if (!buffer) continue;
          const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
          schedule(offline, segment.start, buffer, 0, undefined, rate);
        } else if (original && (segment.skip || segment.nonverbal)) {
          schedule(offline, segment.start, original, segment.start, Math.max(0.05, segment.end - segment.start), 1);
        }
      }
      const rendered = await offline.startRendering();
      const data = rendered.getChannelData(0);
      let peak = 0;
      for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
      if (peak > 0.01) {
        const gain = 0.89 / peak;
        for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
      }
      if (more) useDub.getState().setBanner("Some lines were not read. The file uses what was ready.");
      return rendered;
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the vocal bed.");
      return null;
    } finally {
      if (manageBusy) useDub.getState().setBusy(null);
    }
  }

  async function mixPicture(manageBusy: boolean): Promise<AudioBuffer | null> {
    const project = useDub.getState().project;
    if (!project) return null;
    const original = getMedia().buffer;
    if (!original) {
      useDub.getState().setBanner("upload the mp4 again.");
      return null;
    }
    if (manageBusy) {
      useDub.getState().setBusy("read");
      useDub.getState().setBanner(null);
    }
    try {
      let more = true;
      for (let pass = 0; more && pass < 6; pass += 1) {
        const live = useDub.getState().project ?? project;
        more = await prepare(live, live.segments);
      }
      const latest = useDub.getState().project ?? project;
      const media = getMediaElement();
      const videoDur = media && Number.isFinite(media.duration) ? media.duration : 0;
      let tail = Math.max(latest.duration, original.duration, videoDur);
      for (const segment of latest.segments) {
        const buffer = cache.current.get(keyFor(latest, segment));
        const rate = segment.timing?.rate || 1;
        if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + 0.2);
      }
      tail = Math.min(Math.max(tail, 0.5) + 0.15, 600);
      const offline = new OfflineAudioContext(1, Math.ceil(tail * 48000), 48000);
      const bed = offline.createGain();
      bed.gain.setValueAtTime(0.22, 0);
      for (const span of keepSpans(latest)) {
        const start = Math.max(0, Math.min(span.start, tail));
        const end = Math.max(start, Math.min(span.end, tail));
        bed.gain.setValueAtTime(1, start);
        if (end < tail) bed.gain.setValueAtTime(0.22, end);
      }
      const source = offline.createBufferSource();
      source.buffer = original;
      source.connect(bed);
      bed.connect(offline.destination);
      source.start(0);
      for (const segment of latest.segments) {
        if (!synthable(segment)) continue;
        const buffer = cache.current.get(keyFor(latest, segment));
        if (!buffer) continue;
        const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
        schedule(offline, segment.start, buffer, 0, undefined, rate);
      }
      const rendered = await offline.startRendering();
      const data = rendered.getChannelData(0);
      let peak = 0;
      for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
      if (peak > 0.01) {
        const gain = 0.97 / peak;
        for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
      }
      if (more) useDub.getState().setBanner("Some lines were not read. The file uses what was ready.");
      return rendered;
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the picture.");
      return null;
    } finally {
      if (manageBusy) useDub.getState().setBusy(null);
    }
  }

  async function readAll(project: Project): Promise<boolean> {
    let more = true;
    for (let pass = 0; more && pass < 16; pass += 1) {
      try {
        const live = useDub.getState().project ?? project;
        more = await prepare(live, live.segments);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/paused for this session/i.test(message)) {
          useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
          return true;
        }
        throw error;
      }
    }
    return more;
  }

  function peakAt(rendered: AudioBuffer, level: number) {
    const data = rendered.getChannelData(0);
    let peak = 0;
    for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
    if (peak > 0.01) {
      const gain = level / peak;
      for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
    }
  }

  async function farsiBed(manageBusy: boolean): Promise<{ audio: AudioBuffer | null; incomplete: boolean }> {
    const project = useDub.getState().project;
    if (!project) return { audio: null, incomplete: false };
    if (manageBusy) {
      useDub.getState().setBusy("read");
      useDub.getState().setBanner(null);
    }
    try {
      const incomplete = await readAll(project);
      const latest = useDub.getState().project ?? project;
      let tail = 0.5;
      for (const segment of latest.segments) {
        const buffer = cache.current.get(keyFor(latest, segment));
        const rate = segment.timing?.rate || 1;
        if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + 0.2);
        else tail = Math.max(tail, segment.end);
      }
      tail = tail + 0.2;
      if (tail > 40 * 60) {
        useDub.getState().setBanner("This episode is too long to mix in the browser.");
        return { audio: null, incomplete: true };
      }
      const offline = new OfflineAudioContext(1, Math.ceil(tail * 48000), 48000);
      for (const segment of latest.segments) {
        if (!synthable(segment)) continue;
        const buffer = cache.current.get(keyFor(latest, segment));
        if (!buffer) continue;
        const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
        schedule(offline, segment.start, buffer, 0, undefined, rate);
      }
      const rendered = await offline.startRendering();
      peakAt(rendered, 0.97);
      if (incomplete) useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
      return { audio: rendered, incomplete };
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the vocal bed.");
      return { audio: null, incomplete: true };
    } finally {
      if (manageBusy) useDub.getState().setBusy(null);
    }
  }

  async function mixReplaced(manageBusy: boolean): Promise<{ audio: AudioBuffer | null; incomplete: boolean }> {
    const project = useDub.getState().project;
    if (!project) return { audio: null, incomplete: false };
    const original = getMedia().buffer;
    if (!original) {
      useDub.getState().setBanner("upload it again.");
      return { audio: null, incomplete: false };
    }
    if (manageBusy) {
      useDub.getState().setBusy("read");
      useDub.getState().setBanner(null);
    }
    try {
      const incomplete = await readAll(project);
      const latest = useDub.getState().project ?? project;
      const media = getMediaElement();
      const videoDur = media && Number.isFinite(media.duration) ? media.duration : 0;
      const tail = Math.min(Math.max(latest.duration, original.duration, videoDur, 0.5) + 0.15, 16 * 60);
      const offline = new OfflineAudioContext(1, Math.ceil(tail * 48000), 48000);
      const bed = offline.createGain();
      muteSpeech(bed.gain, replacedWindows(latest.segments), tail);
      const source = offline.createBufferSource();
      source.buffer = original;
      source.connect(bed);
      bed.connect(offline.destination);
      source.start(0);
      for (const segment of latest.segments) {
        if (!synthable(segment)) continue;
        const buffer = cache.current.get(keyFor(latest, segment));
        if (!buffer) continue;
        const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
        schedule(offline, segment.start, buffer, 0, undefined, rate);
      }
      const rendered = await offline.startRendering();
      peakAt(rendered, 0.97);
      if (incomplete) useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
      return { audio: rendered, incomplete };
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the episode.");
      return { audio: null, incomplete: true };
    } finally {
      if (manageBusy) useDub.getState().setBusy(null);
    }
  }

  async function vocalWav(): Promise<Blob | null> {
    const rendered = await renderBed(true);
    return rendered ? audioBufferToWav(rendered) : null;
  }

  const project = useDub((state) => state.project);
  const cached = project
    ? project.segments.filter((segment) => synthable(segment) && cache.current.has(keyFor(project, segment))).length
    : 0;

  return { preview, playAll, stop, vocalWav, renderBed, mixPicture, mixReplaced, farsiBed, progress, activeId, playing, cached, cacheRev };
}

function muteSpeech(gain: AudioParam, windows: { start: number; end: number }[], tail: number) {
  const fade = 0.025;
  let last = 0;
  gain.setValueAtTime(1, 0);
  const at = (time: number) => {
    const next = Math.min(tail, Math.max(time, last + 0.001));
    last = next;
    return next;
  };
  for (const window of windows) {
    const start = Math.max(0, window.start);
    const end = Math.min(tail, window.end);
    if (end - start < 0.08) continue;
    const down = at(start);
    const quiet = at(Math.min(end - 0.01, start + fade));
    gain.setValueAtTime(1, down);
    gain.linearRampToValueAtTime(0, quiet);
    const hold = Math.max(quiet + 0.001, end - fade);
    if (hold < end) {
      const held = at(hold);
      gain.setValueAtTime(0, held);
    }
    const back = at(end);
    gain.linearRampToValueAtTime(1, back);
  }
}

function keepSpans(project: Project): { start: number; end: number }[] {
  const spans = [
    ...project.skipRanges.map((range) => ({ start: range.start, end: range.end })),
    ...project.segments
      .filter((segment) => segment.skip || segment.nonverbal)
      .map((segment) => ({ start: segment.start, end: segment.end })),
  ].filter((span) => span.end > span.start);
  spans.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const span of spans) {
    const last = merged.at(-1);
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  return merged;
}
