/** Picture mix ceiling inside the tab. This is not the listen-chunk cap. */
export const BROWSER_MIX_BYTES = 512 * 1024 * 1024;
export const EPISODE_LIMIT_SEC = 15 * 60;

export function browserCanMix(file: Blob, duration: number): boolean {
  return file.size <= BROWSER_MIX_BYTES && duration > 0 && duration <= EPISODE_LIMIT_SEC;
}

export function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unit]}`;
}
