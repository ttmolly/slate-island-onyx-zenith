import type { AsrWord, Delivery, Segment } from "@/lib/dub/types";
import { isNonverbal } from "@/lib/dub/nonverbal";

const GAP = 0.55;

function deliveryFor(energy: number, peers: number[]): Delivery {
  if (peers.length < 2) {
    if (energy >= 0.72) return "shout";
    if (energy >= 0.48) return "excited";
    return "calm";
  }
  const sorted = peers.slice().sort((a, b) => a - b);
  const high = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.75))] ?? 0.7;
  const mid = sorted[Math.floor(sorted.length * 0.45)] ?? 0.4;
  if (energy >= high && energy >= 0.55) return "shout";
  if (energy >= mid && energy >= 0.4) return "excited";
  return "calm";
}

export function segmentWords(words: AsrWord[]): Segment[] {
  const clean = words
    .filter((word) => word.text.trim() && Number.isFinite(word.start) && Number.isFinite(word.end))
    .map((word) => ({
      text: word.text.trim(),
      start: word.start,
      end: Math.max(word.end, word.start + 0.05),
      speaker: Number.isFinite(word.speaker) ? word.speaker : 0,
    }))
    .sort((a, b) => a.start - b.start);

  type Group = { speaker: number; start: number; end: number; text: string };
  const groups: Group[] = [];
  for (const word of clean) {
    const last = groups[groups.length - 1];
    const gap = last ? word.start - last.end : Infinity;
    if (!last || last.speaker !== word.speaker || gap > GAP) {
      groups.push({ speaker: word.speaker, start: word.start, end: word.end, text: word.text });
      continue;
    }
    last.end = word.end;
    last.text = `${last.text} ${word.text}`;
  }

  const rough = groups.filter((group) => group.end - group.start >= 0.12 || group.text.length > 1);
  const energies = rough.map(() => 0.32);
  return rough.map((group, index) => {
    const english = group.text.replace(/\s+/g, " ").trim();
    const nonverbal = isNonverbal(english);
    return {
      id: `l${index + 1}`,
      speakerId: `sp${group.speaker}`,
      start: round3(group.start),
      end: round3(group.end),
      english,
      farsi: "",
      skip: nonverbal,
      nonverbal,
      energy: energies[index] ?? 0.45,
      pitchHz: 170,
      delivery: deliveryFor(energies[index] ?? 0.45, energies),
      refClipId: null,
      refLocked: false,
      timing: null,
      spokenSec: null,
    };
  });
}

export function applyAnalysis(
  segments: Segment[],
  measure: (start: number, end: number) => { energy: number; pitchHz: number },
): Segment[] {
  const measured = segments.map((segment) => {
    if (segment.end - segment.start < 0.12) return segment;
    const stats = measure(segment.start, segment.end);
    return { ...segment, energy: stats.energy, pitchHz: stats.pitchHz };
  });
  return measured.map((segment) => {
    const peers = measured.filter((item) => item.speakerId === segment.speakerId).map((item) => item.energy);
    return { ...segment, delivery: deliveryFor(segment.energy, peers) };
  });
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function speakerIdsInOrder(segments: Segment[]): string[] {
  const ids: string[] = [];
  for (const segment of segments) {
    if (!ids.includes(segment.speakerId)) ids.push(segment.speakerId);
  }
  return ids;
}
