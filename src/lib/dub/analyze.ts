export function analyzeSpan(
  channel: Float32Array,
  sampleRate: number,
  start: number,
  end: number,
): { energy: number; pitchHz: number } {
  const from = Math.max(0, Math.floor(start * sampleRate));
  const to = Math.min(channel.length, Math.floor(end * sampleRate));
  if (to - from < sampleRate * 0.08) return { energy: 0.3, pitchHz: 170 };
  let sum = 0;
  for (let index = from; index < to; index += 1) {
    const sample = channel[index] ?? 0;
    sum += sample * sample;
  }
  const rms = Math.sqrt(sum / (to - from));
  const energy = Math.max(0, Math.min(1, rms / 0.16));
  return { energy, pitchHz: estimatePitch(channel, from, to, sampleRate) };
}

function estimatePitch(channel: Float32Array, from: number, to: number, sampleRate: number): number {
  const length = Math.min(4096, to - from);
  const mid = from + Math.max(0, Math.floor((to - from - length) / 2));
  const minLag = Math.max(1, Math.floor(sampleRate / 420));
  const maxLag = Math.min(length - 2, Math.floor(sampleRate / 70));
  let bestLag = minLag;
  let best = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let score = 0;
    for (let index = 0; index < length - lag; index += 2) {
      score += (channel[mid + index] ?? 0) * (channel[mid + index + lag] ?? 0);
    }
    if (score > best) {
      best = score;
      bestLag = lag;
    }
  }
  if (best <= 0) return 170;
  const hz = sampleRate / bestLag;
  if (hz < 70 || hz > 420) return 170;
  return Math.round(hz);
}
