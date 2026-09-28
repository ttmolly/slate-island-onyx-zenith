import type { Delivery, RefClip, Segment } from "@/lib/dub/types";

const DELIVERY_LABEL: Record<Delivery, string> = {
  calm: "calm",
  excited: "heated",
  shout: "shout",
};

export function bestClip(segment: Segment, clips: RefClip[]): string | null {
  const mine = clips.filter((clip) => clip.speakerId === segment.speakerId);
  if (mine.length === 0) return null;
  let winner = mine[0]!;
  let best = Infinity;
  for (const clip of mine) {
    const energyGap = Math.abs(clip.energy - segment.energy);
    const pitchGap = Math.abs(Math.log((clip.pitchHz || 160) / (segment.pitchHz || 160)));
    const same = clip.delivery === segment.delivery ? -0.15 : 0;
    const score = energyGap + pitchGap * 0.45 + same;
    if (score < best) {
      best = score;
      winner = clip;
    }
  }
  return winner.id;
}

export function buildClips(segments: Segment[], speakerName: (id: string) => string): RefClip[] {
  const bySpeaker = new Map<string, Segment[]>();
  for (const segment of segments) {
    if (segment.nonverbal) continue;
    const list = bySpeaker.get(segment.speakerId) ?? [];
    list.push(segment);
    bySpeaker.set(segment.speakerId, list);
  }

  const clips: RefClip[] = [];
  for (const [speakerId, lines] of bySpeaker) {
    const ordered = lines.slice().sort((a, b) => a.start - b.start);
    const windows: Segment[][] = [];
    for (const line of ordered) {
      const last = windows[windows.length - 1];
      const prev = last?.[last.length - 1];
      if (!last || !prev || line.delivery !== prev.delivery || line.start - prev.end > 1.2) {
        windows.push([line]);
      } else {
        last.push(line);
      }
    }

    const ranked = windows
      .map((window) => {
        const start = window[0]!.start;
        const end = window[window.length - 1]!.end;
        const energy = average(window.map((line) => line.energy));
        const pitchHz = average(window.map((line) => line.pitchHz));
        return {
          delivery: window[0]!.delivery,
          start,
          end,
          energy,
          pitchHz,
          span: end - start,
        };
      })
      .sort((a, b) => b.span - a.span);

    const chosen: typeof ranked = [];
    for (const delivery of ["calm", "excited", "shout"] as Delivery[]) {
      const found = ranked.find((item) => item.delivery === delivery && !chosen.includes(item));
      if (found) chosen.push(found);
    }
    for (const item of ranked) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(item)) chosen.push(item);
    }

    chosen
      .sort((a, b) => a.start - b.start)
      .forEach((item, index) => {
        const short = item.span < 8;
        const who = speakerName(speakerId);
        clips.push({
          id: `${speakerId}-take-${index + 1}`,
          speakerId,
          delivery: item.delivery,
          start: item.start,
          end: item.end,
          energy: item.energy,
          pitchHz: item.pitchHz,
          short,
          label: `${who} · ${DELIVERY_LABEL[item.delivery]}${short ? " · short take" : ""}`,
        });
      });
  }
  return clips;
}

export function assignClips(segments: Segment[], clips: RefClip[]): Segment[] {
  return segments.map((segment) => {
    if (segment.refLocked) return segment;
    if (segment.nonverbal) return { ...segment, refClipId: null };
    return { ...segment, refClipId: bestClip(segment, clips) };
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
