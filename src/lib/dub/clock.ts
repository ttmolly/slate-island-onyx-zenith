export function formatClock(sec: number): string {
  const safe = Number.isFinite(sec) && sec > 0 ? sec : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, "0");
}

export function formatSrtTime(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milli = ms % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milli, 3)}`;
}

export function formatAssTime(sec: number): string {
  const cs = Math.max(0, Math.round(sec * 100));
  const hours = Math.floor(cs / 360_000);
  const minutes = Math.floor((cs % 360_000) / 6_000);
  const seconds = Math.floor((cs % 6_000) / 100);
  const centi = cs % 100;
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centi)}`;
}
