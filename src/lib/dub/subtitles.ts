import type { Project } from "@/lib/dub/types";
import { formatAssTime, formatSrtTime } from "@/lib/dub/clock";

const RLE = "\u202B";
const PDF = "\u202C";

function spokenLines(project: Project) {
  return project.segments.filter((segment) => segment.farsi.trim() && !segment.skip && !segment.nonverbal);
}

export function toSrt(project: Project): string {
  return spokenLines(project)
    .map((segment, index) => {
      const text = `${RLE}${segment.farsi.trim()}${PDF}`;
      return `${index + 1}\n${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}\n${text}\n`;
    })
    .join("\n");
}

function assEscape(text: string): string {
  return text.replace(/\r?\n/g, " ").replace(/\{/g, "(").replace(/\}/g, ")");
}

export function toAss(project: Project): string {
  const events = spokenLines(project)
    .map((segment) => {
      const text = `{\\rtl1}${assEscape(segment.farsi.trim())}`;
      return `Dialogue: 0,${formatAssTime(segment.start)},${formatAssTime(segment.end)},Farsi,,0,0,0,,${text}`;
    })
    .join("\n");

  return `[Script Info]
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080
Title: ${project.title}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Farsi,Vazirmatn,64,&H00FFFFFF,&H000000FF,&H00101010,&H64000000,0,0,0,0,100,100,0,0,1,3,0,2,90,90,56,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;
}

export function toCueSheet(project: Project): string {
  const speakers = Object.fromEntries(project.speakers.map((speaker) => [speaker.id, speaker]));
  const clips = Object.fromEntries(project.clips.map((clip) => [clip.id, clip]));
  const lines = project.segments.map((segment) => {
    const clip = segment.refClipId ? clips[segment.refClipId] : undefined;
    return {
      id: segment.id,
      speaker: speakers[segment.speakerId]?.name ?? segment.speakerId,
      readVoice: speakers[segment.speakerId]?.voiceId ?? "ara",
      start: segment.start,
      end: segment.end,
      english: segment.english,
      farsi: segment.farsi,
      keepOriginal: segment.skip || segment.nonverbal,
      delivery: segment.delivery,
      reference: clip
        ? {
            label: clip.label,
            start: clip.start,
            end: clip.end,
            short: clip.short,
          }
        : null,
      timing: segment.timing,
    };
  });
  return JSON.stringify(
    {
      title: project.title,
      scene: project.scene,
      glossary: project.glossary.map((entry) => ({ source: entry.source, fa: entry.fa })),
      skipRanges: project.skipRanges,
      lines,
      mix: {
        sampleRate: 48000,
        vocals: "Farsi reads placed at the original start time. Edges fade in 20 ms.",
        keptOriginal: "Laughs, gasps, and skipped ranges stay on the source take when the file is loaded.",
        background: "Music and effects are not separated in this desk, so the vocal bed is dry.",
      },
    },
    null,
    2,
  );
}
