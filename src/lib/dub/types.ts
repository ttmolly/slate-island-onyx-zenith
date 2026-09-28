export type Delivery = "calm" | "excited" | "shout";

export type Speaker = {
  id: string;
  name: string;
  voiceId: string;
  note: string;
};

export type GlossaryEntry = {
  id: string;
  source: string;
  fa: string;
};

export type SkipRange = {
  id: string;
  start: number;
  end: number;
  label: string;
};

export type RefClip = {
  id: string;
  speakerId: string;
  delivery: Delivery;
  start: number;
  end: number;
  energy: number;
  pitchHz: number;
  label: string;
  short: boolean;
};

export type TimingPlan = {
  targetSec: number;
  estimatedSec: number;
  rate: number;
  padSec: number;
  tries: number;
  note: string;
};

export type Segment = {
  id: string;
  speakerId: string;
  start: number;
  end: number;
  english: string;
  farsi: string;
  skip: boolean;
  nonverbal: boolean;
  energy: number;
  pitchHz: number;
  delivery: Delivery;
  refClipId: string | null;
  refLocked: boolean;
  timing: TimingPlan | null;
  spokenSec: number | null;
};

export type Project = {
  id: string;
  title: string;
  scene: string;
  speakers: Speaker[];
  glossary: GlossaryEntry[];
  segments: Segment[];
  clips: RefClip[];
  skipRanges: SkipRange[];
  mediaName: string | null;
  duration: number;
};

export type AsrWord = {
  text: string;
  start: number;
  end: number;
  speaker: number;
};

export const VOICES = [
  { id: "ara", name: "Ara" },
  { id: "rex", name: "Rex" },
  { id: "luna", name: "Luna" },
  { id: "orion", name: "Orion" },
  { id: "leo", name: "Leo" },
  { id: "sal", name: "Sal" },
  { id: "eve", name: "Eve" },
  { id: "atlas", name: "Atlas" },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];

export const DELIVERIES: { id: Delivery; label: string }[] = [
  { id: "calm", label: "Calm" },
  { id: "excited", label: "Heated" },
  { id: "shout", label: "Shout" },
];

export function voiceName(id: string): string {
  return VOICES.find((v) => v.id === id)?.name ?? "Ara";
}
