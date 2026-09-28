import { normalizeFa } from "@/lib/dub/normalize";
import { translateLines } from "@/lib/dub/server-fns";
import { useDub } from "@/lib/dub/store";
import { estimateSpeakSec, planTiming, softMaxChars } from "@/lib/dub/timing";
import type { Project, Segment } from "@/lib/dub/types";

function speechLines(project: Project): Segment[] {
  return project.segments.filter(
    (segment) => !segment.nonverbal && !segment.skip && segment.english.trim(),
  );
}

function payload(
  project: Project,
  lines: Segment[],
  mode: "translate" | "shorten",
) {
  const indexOf = new Map(project.segments.map((segment, index) => [segment.id, index]));
  return {
    scene: project.scene,
    glossary: project.glossary.map((entry) => ({ source: entry.source, fa: entry.fa })),
    mode,
    lines: lines.map((segment) => {
      const index = indexOf.get(segment.id) ?? 0;
      const speaker = project.speakers.find((item) => item.id === segment.speakerId);
      const targetSec = Math.max(0.3, segment.end - segment.start);
      return {
        id: segment.id,
        speaker: speaker?.name ?? segment.speakerId,
        note: speaker?.note ?? "",
        tone: segment.delivery,
        targetSec,
        english: segment.english,
        prev: project.segments[index - 1]?.english ?? null,
        next: project.segments[index + 1]?.english ?? null,
        farsi: segment.farsi,
        maxChars: softMaxChars(targetSec),
      };
    }),
  };
}

function applyFa(segments: Segment[], project: Project, fa: Record<string, string>): Segment[] {
  return segments.map((segment) => {
    const raw = fa[segment.id];
    if (typeof raw !== "string") return segment;
    const next = normalizeFa(raw, project.glossary);
    if (!next) return segment;
    return { ...segment, farsi: next, timing: null, spokenSec: null };
  });
}

export async function writeFarsi(onlyId?: string, quiet = false): Promise<boolean> {
  const { project, setBusy, setBanner, applyPlans } = useDub.getState();
  if (!project) return false;
  const pool = speechLines(project).filter((segment) => (onlyId ? segment.id === onlyId : !segment.farsi.trim()));
  if (pool.length === 0) {
    if (!quiet) setBanner(onlyId ? "That line is kept on the original." : "Every spoken line already has Farsi.");
    return true;
  }
  setBusy("write");
  setBanner(null);
  let segments = project.segments;
  let ok = true;
  try {
    const chunks: Segment[][] = [];
    for (let index = 0; index < pool.length && chunks.length < 4; index += 8) {
      chunks.push(pool.slice(index, index + 8));
    }
    for (const chunk of chunks) {
      const fresh = useDub.getState().project ?? project;
      const result = await translateLines({ data: payload(fresh, chunk, "translate") });
      if (!result.ok) {
        setBanner(result.error);
        ok = false;
        break;
      }
      if (result.names?.length) useDub.getState().rememberNames(result.names);
      const named = useDub.getState().project ?? fresh;
      segments = applyFa(segments, named, result.fa);
      applyPlans(segments);
    }
    const latest = useDub.getState().project;
    if (!latest) return false;
    const left = speechLines(latest).filter((segment) => !segment.farsi.trim()).length;
    if (left > 0 && ok && !quiet && !useDub.getState().banner) {
      setBanner(`${left} lines still need Farsi. Write again to continue.`);
    }
  } finally {
    useDub.getState().setBusy(null);
  }
  return ok;
}

export async function dubAll(rounds = 8): Promise<boolean> {
  useDub.getState().rematch();
  for (let pass = 0; pass < rounds; pass += 1) {
    const project = useDub.getState().project;
    if (!project) return false;
    const missing = speechLines(project).filter((segment) => !segment.farsi.trim()).length;
    if (missing === 0) break;
    const ok = await writeFarsi(undefined, true);
    if (!ok) return false;
    const after = useDub.getState().project;
    const left = after ? speechLines(after).filter((segment) => !segment.farsi.trim()).length : missing;
    if (left >= missing) break;
  }
  await fitTiming();
  return useDub.getState().banner == null;
}

export async function fitTiming(): Promise<void> {
  const { project, setBusy, setBanner, applyPlans } = useDub.getState();
  if (!project) return;
  const missing = speechLines(project).filter((segment) => !segment.farsi.trim()).length;
  if (missing === project.segments.filter((segment) => !segment.nonverbal && !segment.skip).length) {
    setBanner("Write the Farsi before fitting it to the picture.");
    return;
  }
  setBusy("fit");
  setBanner(null);
  let segments = project.segments.map((segment) => {
    if (segment.skip || segment.nonverbal || !segment.farsi.trim()) return segment;
    const spoken = segment.spokenSec ?? estimateSpeakSec(segment.farsi);
    return { ...segment, timing: planTiming(segment.end - segment.start, spoken, 0) };
  });
  applyPlans(segments);
  try {
    let budget = 8;
    for (const segment of segments) {
      if (budget <= 0) break;
      if (segment.skip || segment.nonverbal || !segment.farsi.trim()) continue;
      let current = segment;
      let tries = 0;
      while (tries < 2 && budget > 0) {
        const target = Math.max(0.3, current.end - current.start);
        const spoken = estimateSpeakSec(current.farsi);
        if (spoken <= target * 1.1) break;
        tries += 1;
        budget -= 1;
        const fresh = useDub.getState().project ?? project;
        const result = await translateLines({
          data: payload(fresh, [{ ...current, farsi: current.farsi }], "shorten"),
        });
        if (!result.ok) {
          setBanner(result.error);
          budget = 0;
          break;
        }
        const rewritten = normalizeFa(result.fa[current.id] ?? "", fresh.glossary);
        const shorter = charCount(rewritten) > 0 && charCount(rewritten) < charCount(current.farsi) ? rewritten : current.farsi;
        current = {
          ...current,
          farsi: shorter,
          spokenSec: null,
          timing: planTiming(target, estimateSpeakSec(shorter), tries),
        };
      }
      segments = segments.map((item) => (item.id === current.id ? current : item));
      applyPlans(segments);
    }
  } finally {
    useDub.getState().setBusy(null);
  }
}

function charCount(text: string): number {
  return [...text].filter((char) => char !== "\u200c" && char.trim()).length;
}
