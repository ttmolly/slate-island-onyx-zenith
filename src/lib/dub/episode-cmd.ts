type Window = { start: number; end: number };

type Line = {
  start: number;
  end: number;
  skip: boolean;
  nonverbal: boolean;
  farsi: string;
  english: string;
};

export function replacedWindows(segments: Line[]): Window[] {
  const raw = segments
    .filter((segment) => !segment.skip && !segment.nonverbal && segment.farsi.trim() && segment.english.trim())
    .map((segment) => ({ start: Math.max(0, segment.start - 0.04), end: segment.end + 0.06 }))
    .sort((a, b) => a.start - b.start);
  const merged: Window[] = [];
  for (const span of raw) {
    const last = merged.at(-1);
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  const holes = segments
    .filter((segment) => segment.skip || segment.nonverbal)
    .map((segment) => ({ start: segment.start, end: segment.end }));
  return subtract(merged, holes);
}

function subtract(windows: Window[], holes: Window[]): Window[] {
  let pieces = windows;
  for (const hole of holes) {
    const next: Window[] = [];
    for (const piece of pieces) {
      if (hole.end <= piece.start || hole.start >= piece.end) {
        next.push(piece);
        continue;
      }
      if (hole.start > piece.start + 0.02) next.push({ start: piece.start, end: hole.start });
      if (hole.end < piece.end - 0.02) next.push({ start: hole.end, end: piece.end });
    }
    pieces = next;
  }
  return pieces;
}

export function episodeCommand(inputName: string, windows: Window[]): string {
  const mute =
    windows.length === 0
      ? "1"
      : `if(${windows.map((window) => `between(t\\,${window.start.toFixed(2)}\\,${window.end.toFixed(2)})`).join("+")}\\,0\\,1)`;
  const input = quote(inputName || "episode.mkv");
  return [
    "ffmpeg",
    "-i",
    input,
    "-i",
    quote("nava-vocals.wav"),
    "-filter_complex",
    quote(
      `[0:a]volume='${mute}':eval=frame[bg];[bg][1:a]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.97:level=disabled[a];[0:v]ass=nava-anime.ass:fontsdir=.[v]`,
    ),
    "-map",
    quote("[v]"),
    "-map",
    quote("[a]"),
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-ar",
    "48000",
    quote("nava-anime-farsi.mp4"),
  ].join(" ");
}

function quote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
