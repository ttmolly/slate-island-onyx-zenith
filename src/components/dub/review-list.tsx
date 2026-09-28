import { normalizeFa } from "@/lib/dub/normalize";
import { useDub } from "@/lib/dub/store";
import { DELIVERIES, type Segment } from "@/lib/dub/types";
import { formatClock } from "@/lib/dub/clock";
import { Button } from "@/components/ui/button";

type Props = {
  activeId: string | null;
  busy: boolean;
  onPreview: (id: string) => void;
  onRewrite: (id: string) => void;
};

export function ReviewList({ activeId, busy, onPreview, onRewrite }: Props) {
  const project = useDub((state) => state.project);
  const setEnglish = useDub((state) => state.setEnglish);
  const setFarsi = useDub((state) => state.setFarsi);
  const setDelivery = useDub((state) => state.setDelivery);
  const setRef = useDub((state) => state.setRef);
  const setTimes = useDub((state) => state.setTimes);
  const updateSegment = useDub((state) => state.updateSegment);

  if (!project) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-elevated">
      <div className="hidden gap-3 border-b border-border px-4 py-3 text-xs font-medium text-faint lg:grid lg:grid-cols-[7.5rem_8.5rem_1fr_1.15fr_7.5rem]">
        <span>Speaker</span>
        <span>Time</span>
        <span>English</span>
        <span>Farsi</span>
        <span>Line</span>
      </div>
      <ul>
        {project.segments.map((segment) => (
          <li
            key={segment.id}
            className={
              activeId === segment.id
                ? "border-b border-border bg-subtle px-4 py-4 last:border-b-0"
                : "border-b border-border px-4 py-4 last:border-b-0"
            }
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[7.5rem_8.5rem_1fr_1.15fr_7.5rem] lg:gap-3">
              <div>
                <p className="text-sm font-medium">{nameOf(project.speakers, segment.speakerId)}</p>
                <label className="mt-2 block text-xs text-faint" htmlFor={`${segment.id}-delivery`}>
                  Delivery
                </label>
                <select
                  id={`${segment.id}-delivery`}
                  className="field mt-1"
                  value={segment.delivery}
                  onChange={(event) => setDelivery(segment.id, event.target.value as Segment["delivery"])}
                >
                  {DELIVERIES.map((delivery) => (
                    <option key={delivery.id} value={delivery.id}>
                      {delivery.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                <label className="block text-xs text-faint" htmlFor={`${segment.id}-start`}>
                  Start
                  <input
                    id={`${segment.id}-start`}
                    className="field mt-1 tabular-nums"
                    inputMode="decimal"
                    value={segment.start}
                    onChange={(event) => setTimes(segment.id, Number(event.target.value), segment.end)}
                  />
                </label>
                <label className="block text-xs text-faint" htmlFor={`${segment.id}-end`}>
                  End
                  <input
                    id={`${segment.id}-end`}
                    className="field mt-1 tabular-nums"
                    inputMode="decimal"
                    value={segment.end}
                    onChange={(event) => setTimes(segment.id, segment.start, Number(event.target.value))}
                  />
                </label>
                <p className="col-span-2 text-xs tabular-nums text-muted lg:col-span-1">
                  {formatClock(segment.start)} – {formatClock(segment.end)}
                </p>
              </div>
              <label className="block text-xs text-faint" htmlFor={`${segment.id}-en`}>
                English
                <textarea
                  id={`${segment.id}-en`}
                  className="field mt-1"
                  dir="ltr"
                  value={segment.english}
                  onChange={(event) => setEnglish(segment.id, event.target.value)}
                />
              </label>
              <label className="block text-xs text-faint" htmlFor={`${segment.id}-fa`}>
                Farsi
                <textarea
                  id={`${segment.id}-fa`}
                  className="field mt-1 text-base"
                  dir="rtl"
                  lang="fa"
                  value={segment.farsi}
                  placeholder={segment.nonverbal ? "Kept as the original sound" : "Not written yet"}
                  onChange={(event) => setFarsi(segment.id, event.target.value)}
                  onBlur={(event) => setFarsi(segment.id, normalizeFa(event.target.value, project.glossary))}
                />
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex min-h-11 items-center gap-2 text-sm text-muted">
                  <input
                    className="check"
                    type="checkbox"
                    checked={segment.skip || segment.nonverbal}
                    onChange={(event) => {
                      if (event.target.checked) updateSegment(segment.id, { skip: true });
                      else updateSegment(segment.id, { skip: false, nonverbal: false });
                    }}
                  />
                  Keep original
                </label>
                <Button variant="ghost" disabled={busy} onClick={() => onPreview(segment.id)}>
                  {segment.skip || segment.nonverbal ? "Play take" : "Read line"}
                </Button>
                <Button
                  variant="quiet"
                  disabled={busy || segment.nonverbal}
                  onClick={() => onRewrite(segment.id)}
                >
                  Rewrite
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block text-xs text-faint" htmlFor={`${segment.id}-clip`}>
                Reference take
                <select
                  id={`${segment.id}-clip`}
                  className="field mt-1"
                  value={segment.refLocked ? (segment.refClipId ?? "auto") : "auto"}
                  onChange={(event) => setRef(segment.id, event.target.value)}
                >
                  <option value="auto">
                    Best match
                    {segment.refClipId
                      ? ` · ${project.clips.find((clip) => clip.id === segment.refClipId)?.label ?? ""}`
                      : ""}
                  </option>
                  {project.clips
                    .filter((clip) => clip.speakerId === segment.speakerId)
                    .map((clip) => (
                      <option key={clip.id} value={clip.id}>
                        {clip.label} · {formatClock(clip.start)}
                      </option>
                    ))}
                </select>
              </label>
              <p className="text-xs text-muted sm:max-w-xs sm:text-right">
                {segment.timing
                  ? `${segment.timing.rate.toFixed(2)}× · ${segment.timing.note}`
                  : "Not fitted yet"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function nameOf(speakers: { id: string; name: string }[], id: string): string {
  return speakers.find((speaker) => speaker.id === id)?.name || "Speaker";
}
