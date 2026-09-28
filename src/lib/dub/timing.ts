import type { TimingPlan } from "@/lib/dub/types";

export function estimateSpeakSec(fa: string): number {
  const chars = [...fa].filter((char) => char !== "\u200c" && char.trim() !== "").length;
  if (chars === 0) return 0;
  return Math.max(0.35, chars / 13.5);
}

export function softMaxChars(targetSec: number): number {
  return Math.max(8, Math.round(Math.max(0.4, targetSec) * 14));
}

export function planTiming(targetSec: number, spokenSec: number, tries: number): TimingPlan {
  const target = Math.max(0.25, targetSec);
  const spoken = Math.max(0.25, spokenSec);
  const ratio = spoken / target;
  if (ratio > 1.1) {
    const rate = Math.min(1.25, ratio);
    const overflow = spoken / rate > target + 0.08;
    return {
      targetSec: target,
      estimatedSec: spoken,
      rate,
      padSec: 0,
      tries,
      note: overflow ? "Still long at 1.25×. The next line may overlap." : "Sped up to fit the picture.",
    };
  }
  if (ratio < 0.9) {
    const rate = 0.9;
    const padSec = Math.max(0, target - spoken / rate);
    return {
      targetSec: target,
      estimatedSec: spoken,
      rate,
      padSec,
      tries,
      note: padSec > 0.05 ? "Slowed to 0.9×, then a little silence." : "Slowed to 0.9×.",
    };
  }
  return {
    targetSec: target,
    estimatedSec: spoken,
    rate: Number(ratio.toFixed(3)),
    padSec: 0,
    tries,
    note: "Within a tenth of the picture.",
  };
}
