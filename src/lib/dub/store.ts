import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Delivery, GlossaryEntry, Project, Segment, SkipRange } from "@/lib/dub/types";
import { isNonverbal } from "@/lib/dub/nonverbal";
import { assignClips, bestClip, buildClips } from "@/lib/dub/voice-plan";
import { createLanternAlley } from "@/lib/dub/sample";

type DubState = {
  project: Project | null;
  banner: string | null;
  busy: "listen" | "write" | "fit" | "read" | "export" | null;
  setBanner: (banner: string | null) => void;
  setBusy: (busy: DubState["busy"]) => void;
  openSample: () => void;
  loadProject: (project: Project) => void;
  clear: () => void;
  setTitle: (title: string) => void;
  setScene: (scene: string) => void;
  renameSpeaker: (id: string, name: string) => void;
  setSpeakerVoice: (id: string, voiceId: string) => void;
  setSpeakerNote: (id: string, note: string) => void;
  updateGlossary: (id: string, patch: Partial<Pick<GlossaryEntry, "source" | "fa">>) => void;
  addGlossary: () => void;
  removeGlossary: (id: string) => void;
  rememberNames: (pairs: { source: string; fa: string }[]) => void;
  updateSegment: (id: string, patch: Partial<Segment>) => void;
  setEnglish: (id: string, english: string) => void;
  setFarsi: (id: string, farsi: string) => void;
  setDelivery: (id: string, delivery: Delivery) => void;
  setRef: (id: string, clipId: string | "auto") => void;
  setTimes: (id: string, start: number, end: number) => void;
  addSkipRange: (range: Omit<SkipRange, "id">) => void;
  removeSkipRange: (id: string) => void;
  applyPlans: (segments: Segment[]) => void;
  rematch: () => void;
};

function speakerName(project: Project, id: string): string {
  return project.speakers.find((speaker) => speaker.id === id)?.name ?? id;
}

function reclip(project: Project, segments: Segment[]): Pick<Project, "segments" | "clips"> {
  const clips = buildClips(segments, (id) => speakerName(project, id));
  return { clips, segments: assignClips(segments, clips) };
}

let glossarySeq = 0;

export const useDub = create<DubState>()(
  persist(
    (set) => ({
      project: null,
      banner: null,
      busy: null,
      setBanner: (banner) => set({ banner }),
      setBusy: (busy) => set({ busy }),
      openSample: () => set({ project: createLanternAlley(), banner: null }),
      loadProject: (project) => set({ project, banner: null }),
      clear: () => set({ project: null, banner: null, busy: null }),
      setTitle: (title) =>
        set((state) => (state.project ? { project: { ...state.project, title } } : state)),
      setScene: (scene) =>
        set((state) => (state.project ? { project: { ...state.project, scene } } : state)),
      renameSpeaker: (id, name) =>
        set((state) => {
          if (!state.project) return state;
          const speakers = state.project.speakers.map((speaker) =>
            speaker.id === id ? { ...speaker, name } : speaker,
          );
          const next = { ...state.project, speakers };
          const voiced = reclip(next, next.segments.map((segment) => ({ ...segment, refLocked: false })));
          return { project: { ...next, ...voiced } };
        }),
      setSpeakerVoice: (id, voiceId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              speakers: state.project.speakers.map((speaker) =>
                speaker.id === id ? { ...speaker, voiceId } : speaker,
              ),
            },
          };
        }),
      setSpeakerNote: (id, note) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              speakers: state.project.speakers.map((speaker) =>
                speaker.id === id ? { ...speaker, note } : speaker,
              ),
            },
          };
        }),
      updateGlossary: (id, patch) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              glossary: state.project.glossary.map((entry) =>
                entry.id === id ? { ...entry, ...patch } : entry,
              ),
            },
          };
        }),
      addGlossary: () =>
        set((state) => {
          if (!state.project) return state;
          glossarySeq += 1;
          return {
            project: {
              ...state.project,
              glossary: [
                ...state.project.glossary,
                { id: `g-${Date.now()}-${glossarySeq}`, source: "", fa: "" },
              ],
            },
          };
        }),
      removeGlossary: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              glossary: state.project.glossary.filter((entry) => entry.id !== id),
            },
          };
        }),
      rememberNames: (pairs) =>
        set((state) => {
          if (!state.project || pairs.length === 0) return state;
          const glossary = [...state.project.glossary];
          for (const pair of pairs) {
            const source = pair.source.trim();
            const fa = pair.fa.trim();
            if (!source || !fa || !/[\u0600-\u06FF]/.test(fa) || /[A-Za-z]/.test(fa)) continue;
            const exists = glossary.some((entry) => entry.source.trim().toLowerCase() === source.toLowerCase());
            if (exists) continue;
            glossarySeq += 1;
            glossary.push({ id: `g-${Date.now()}-${glossarySeq}`, source, fa });
            if (glossary.length >= 40) break;
          }
          if (glossary.length === state.project.glossary.length) return state;
          return { project: { ...state.project, glossary } };
        }),
      updateSegment: (id, patch) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              segments: state.project.segments.map((segment) =>
                segment.id === id ? { ...segment, ...patch } : segment,
              ),
            },
          };
        }),
      setEnglish: (id, english) =>
        set((state) => {
          if (!state.project) return state;
          const nonverbal = isNonverbal(english);
          return {
            project: {
              ...state.project,
              segments: state.project.segments.map((segment) => {
                if (segment.id !== id) return segment;
                return {
                  ...segment,
                  english,
                  nonverbal,
                  skip: nonverbal ? true : segment.skip,
                  timing: null,
                  spokenSec: null,
                };
              }),
            },
          };
        }),
      setFarsi: (id, farsi) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              segments: state.project.segments.map((segment) =>
                segment.id === id ? { ...segment, farsi, timing: null, spokenSec: null } : segment,
              ),
            },
          };
        }),
      setDelivery: (id, delivery) =>
        set((state) => {
          if (!state.project) return state;
          const segments = state.project.segments.map((segment) => {
            if (segment.id !== id) return segment;
            const next = { ...segment, delivery, spokenSec: null };
            if (next.refLocked) return next;
            return { ...next, refClipId: bestClip(next, state.project!.clips) };
          });
          return { project: { ...state.project, segments } };
        }),
      setRef: (id, clipId) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              segments: state.project.segments.map((segment) => {
                if (segment.id !== id) return segment;
                if (clipId === "auto") {
                  return {
                    ...segment,
                    refLocked: false,
                    refClipId: bestClip({ ...segment, refLocked: false }, state.project!.clips),
                  };
                }
                return { ...segment, refLocked: true, refClipId: clipId };
              }),
            },
          };
        }),
      setTimes: (id, start, end) =>
        set((state) => {
          if (!state.project) return state;
          const safeStart = Math.max(0, start);
          const safeEnd = Math.max(safeStart + 0.15, end);
          return {
            project: {
              ...state.project,
              segments: state.project.segments.map((segment) =>
                segment.id === id
                  ? { ...segment, start: safeStart, end: safeEnd, timing: null }
                  : segment,
              ),
              duration: Math.max(
                state.project.duration,
                ...state.project.segments.map((segment) =>
                  segment.id === id ? safeEnd : segment.end,
                ),
              ),
            },
          };
        }),
      addSkipRange: (range) =>
        set((state) => {
          if (!state.project) return state;
          const start = Math.max(0, Math.min(range.start, range.end));
          const end = Math.max(range.start, range.end);
          if (end - start < 0.2) return state;
          const skipRange: SkipRange = {
            id: `skip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            start,
            end,
            label: range.label.trim() || "Skip",
          };
          const segments = state.project.segments.map((segment) =>
            segment.start < end && segment.end > start ? { ...segment, skip: true } : segment,
          );
          return {
            project: {
              ...state.project,
              skipRanges: [...state.project.skipRanges, skipRange],
              segments,
            },
          };
        }),
      removeSkipRange: (id) =>
        set((state) => {
          if (!state.project) return state;
          const skipRanges = state.project.skipRanges.filter((range) => range.id !== id);
          const segments = state.project.segments.map((segment) => {
            const covered = skipRanges.some((range) => segment.start < range.end && segment.end > range.start);
            if (segment.nonverbal) return { ...segment, skip: true };
            if (covered) return { ...segment, skip: true };
            return segment.skip ? { ...segment, skip: false } : segment;
          });
          return { project: { ...state.project, skipRanges, segments } };
        }),
      applyPlans: (segments) =>
        set((state) => (state.project ? { project: { ...state.project, segments } } : state)),
      rematch: () =>
        set((state) => {
          if (!state.project) return state;
          const unlocked = state.project.segments.map((segment) => ({ ...segment, refLocked: false }));
          return { project: { ...state.project, ...reclip(state.project, unlocked) } };
        }),
    }),
    {
      name: "nava-desk",
      skipHydration: true,
      partialize: (state) => ({ project: state.project }),
    },
  ),
);
