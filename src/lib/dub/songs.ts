export type SongRange = { start: number; end: number; label: string };

type Span = { start: number; end: number; skip?: boolean };

export function detectSongs(duration: number, segments: Span[]): SongRange[] {
  if (duration < 8 * 60) return [];
  const speech = segments
    .filter((segment) => !segment.skip && segment.end - segment.start > 0.15)
    .sort((a, b) => a.start - b.start);
  const hits: SongRange[] = [];
  const openGap = gapAfter(speech, 70, 130, 3);
  if (openGap != null && coverage(speech, 0, Math.min(90, openGap)) >= 0.42) {
    hits.push({ start: 0, end: Math.min(openGap, 120), label: "Opening" });
  }
  const endingFrom = duration - 140;
  const endingTo = duration - 50;
  const endGap = lastGap(speech, endingFrom, endingTo, 3);
  if (endGap != null && duration - endGap >= 45 && duration - endGap <= 140 && coverage(speech, endGap, duration) >= 0.45) {
    if (hits.every((hit) => endGap > hit.end + 20)) {
      hits.push({ start: endGap, end: duration, label: "Ending" });
    }
  }
  return hits;
}

function coverage(segments: Span[], from: number, to: number): number {
  const span = Math.max(0.1, to - from);
  let covered = 0;
  for (const segment of segments) {
    const start = Math.max(from, segment.start);
    const end = Math.min(to, segment.end);
    if (end > start) covered += end - start;
  }
  return covered / span;
}

function lastGap(segments: Span[], from: number, to: number, minGap: number): number | null {
  let found: number | null = null;
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const next = segments[index];
    if (!previous || !next) continue;
    const gapStart = previous.end;
    if (next.start - gapStart >= minGap && gapStart >= from && gapStart <= to) found = gapStart;
  }
  return found;
}
function gapAfter(segments: Span[], from: number, to: number, minGap: number): number | null {
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const next = segments[index];
    if (!previous || !next) continue;
    const gapStart = previous.end;
    if (next.start - gapStart >= minGap && gapStart >= from && gapStart <= to) return gapStart;
  }
  const last = [...segments].reverse().find((segment) => segment.end <= to && segment.end >= from);
  if (last && to - last.end >= minGap) return last.end;
  return null;
}
