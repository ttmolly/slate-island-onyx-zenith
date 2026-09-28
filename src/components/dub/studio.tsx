import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { fitTiming, dubAll, writeFarsi } from "@/lib/dub/actions";
import { analyzeSpan } from "@/lib/dub/analyze";
import { episodeCommand, replacedWindows } from "@/lib/dub/episode-cmd";
import { detectSongs } from "@/lib/dub/songs";
import { formatClock } from "@/lib/dub/clock";
import { clearMedia, getMedia, registerMediaElement, setMediaFile } from "@/lib/dub/media-bus";
import { BROWSER_MIX_BYTES, browserCanMix, formatBytes } from "@/lib/dub/safe-zone";
import { applyAnalysis, segmentWords, speakerIdsInOrder } from "@/lib/dub/segment";
import { useDub } from "@/lib/dub/store";
import { toAss, toCueSheet, toSrt } from "@/lib/dub/subtitles";
import type { AsrWord, Project } from "@/lib/dub/types";
import { VOICES } from "@/lib/dub/types";
import { assignClips, buildClips } from "@/lib/dub/voice-plan";
import { audioBufferToWav, downloadBlob, downloadText } from "@/lib/dub/wav";
import { ReviewList } from "@/components/dub/review-list";
import { useReads } from "@/components/dub/use-reads";

const EPISODE_LIMIT = 15 * 60;
const SCENE =
  "English scene. Keep every name in the glossary, in Persian script, and match how each person talks.";
const ANIME_SCENE =
  "English anime. Keep every name in the glossary, in Persian script, and match how each person talks.";
const VOICE_CYCLE = ["ara", "rex", "luna", "orion", "leo", "sal"];

export function Studio() {
  const project = useDub((state) => state.project);
  const banner = useDub((state) => state.banner);
  const busy = useDub((state) => state.busy);
  const reads = useReads();
  const [armed, setArmed] = useState(false);
  const [mediaTick, setMediaTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [dropLabel, setDropLabel] = useState<string | null>(null);
  const [command, setCommand] = useState<string | null>(null);
  const [held, setHeld] = useState<{ name: string; size: number; duration: number | null } | null>(null);

  useEffect(() => {
    void useDub.persist.rehydrate();
  }, []);

  async function holdFile(file: File): Promise<{ duration: number | null } | null> {
    setMediaFile(file, null);
    setMediaTick((value) => value + 1);
    setHeld({ name: file.name, size: file.size, duration: null });
    setDropLabel("Reading duration");
    try {
      const { probeDuration } = await import("@/lib/dub/anime-listen");
      const duration = await probeDuration(file);
      if (getMedia().file !== file) {
        useDub.getState().setBanner("upload it again.");
        return null;
      }
      const shown = Number.isFinite(duration) && duration > 0 ? duration : null;
      setHeld({ name: file.name, size: file.size, duration: shown });
      return { duration: shown };
    } catch {
      if (getMedia().file !== file) {
        useDub.getState().setBanner("upload it again.");
        return null;
      }
      return { duration: null };
    }
  }

  async function listenFile(file: File, scene: string, knownDuration: number | null): Promise<boolean> {
    if (getMedia().file !== file) {
      useDub.getState().setBanner("upload it again.");
      return false;
    }
    useDub.getState().setBusy("listen");
    useDub.getState().setBanner(null);
    try {
      const { transcribeAnime, decodeEpisode } = await import("@/lib/dub/anime-listen");
      const heard = await transcribeAnime(file, setDropLabel, () => getMedia().file === file);
      if (getMedia().file !== file) {
        useDub.getState().setBanner("upload it again.");
        return false;
      }
      const duration = Math.max(knownDuration ?? 0, heard.duration, heard.words.at(-1)?.end ?? 0);
      setHeld({ name: file.name, size: file.size, duration: duration > 0 ? duration : null });
      let audio: AudioBuffer | null = null;
      if (file.size <= BROWSER_MIX_BYTES && (duration === 0 || duration <= EPISODE_LIMIT)) {
        setDropLabel("Reading the audio");
        audio = await decodeEpisode(file);
      }
      return adopt(file, heard.words, Math.max(duration, audio?.duration ?? 0), audio, scene);
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not read that file.");
      return false;
    } finally {
      useDub.getState().setBusy(null);
    }
  }

  async function onFile(file: File, announce = true): Promise<boolean> {
    const parked = await holdFile(file);
    if (!parked) return false;
    const loaded = await listenFile(file, SCENE, parked.duration);
    if (loaded && announce) {
      useDub.getState().setBanner("Name the speakers and add Persian spellings, then write the lines.");
    }
    return loaded;
  }

  async function go(file?: File) {
    if (running || useDub.getState().busy) return;
    setRunning(true);
    reads.stop();
    try {
      if (file) {
        const loaded = await onFile(file, false);
        if (!loaded) return;
      }
      if (!useDub.getState().project) {
        useDub.getState().setBanner("Choose a video, then Go.");
        return;
      }
      const ready = await dubAll();
      if (!ready) return;
      await reads.playAll();
    } finally {
      setRunning(false);
    }
  }

  async function animeDrop(file: File) {
    if (running || useDub.getState().busy) return;
    if (!isAnimeFile(file)) {
      useDub.getState().setBanner("Drop an mp4, mkv, or webm.");
      return;
    }
    setRunning(true);
    setCommand(null);
    reads.stop();
    try {
      const parked = await holdFile(file);
      if (!parked) return;
      setDropLabel("Listening");
      const loaded = await listenFile(file, ANIME_SCENE, parked.duration);
      if (!loaded) return;
      const found = markSongs();
      const current = useDub.getState().project;
      const spoken = current?.segments.filter((segment) => !segment.skip && !segment.nonverbal && segment.english.trim()) ?? [];
      if (spoken.length > 0) {
        setDropLabel("Writing Farsi");
        const ready = await dubAll(30);
        if (!ready) return;
        const left =
          useDub.getState().project?.segments.filter(
            (segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim(),
          ).length ?? 0;
        if (left > 0) {
          useDub.getState().setBanner(`${left} lines still need Farsi. Fix them, then rebuild.`);
          return;
        }
      }
      if (found) {
        useDub.getState().setBanner("Songs stay on the original. Change a range if that detect is wrong, then rebuild.");
      }
      await finishEpisode();
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not dub that episode.");
    } finally {
      setRunning(false);
      setDropLabel(null);
    }
  }

  async function rebuildEpisode() {
    if (running || useDub.getState().busy) return;
    if (!getMedia().file || getMedia().kind !== "video") {
      useDub.getState().setBanner("upload it again.");
      return;
    }
    setRunning(true);
    reads.stop();
    try {
      const spoken = useDub.getState().project?.segments.filter(
        (segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim(),
      );
      if (spoken && spoken.length > 0) {
        setDropLabel("Writing Farsi");
        const ready = await dubAll(30);
        if (!ready) return;
      }
      await finishEpisode();
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not rebuild that episode.");
    } finally {
      setRunning(false);
      setDropLabel(null);
    }
  }

  function adopt(file: File, words: AsrWord[], duration: number, audio: AudioBuffer | null, scene: string): boolean {
    let segments = segmentWords(words);
    if (segments.length === 0) {
      useDub.getState().setBanner("No speech in that file.");
      return false;
    }
    if (audio) {
      const channel = audio.getChannelData(0);
      segments = applyAnalysis(segments, (start, end) => analyzeSpan(channel, audio.sampleRate, start, end));
    }
    const ids = speakerIdsInOrder(segments);
    const speakers = ids.map((id, index) => ({
      id,
      name: `Speaker ${index + 1}`,
      voiceId: VOICE_CYCLE[index % VOICE_CYCLE.length] ?? "ara",
      note: "Say how old they feel and how they talk, so the Persian matches.",
    }));
    const named = (id: string) => speakers.find((speaker) => speaker.id === id)?.name ?? id;
    const clips = buildClips(segments, named);
    const next: Project = {
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^.]+$/, "") || "Episode",
      scene,
      speakers,
      glossary: [],
      segments: assignClips(segments, clips),
      clips,
      skipRanges: [],
      mediaName: file.name,
      duration: Math.max(duration, segments.at(-1)?.end ?? 0),
    };
    setMediaFile(file, audio);
    setMediaTick((value) => value + 1);
    useDub.getState().loadProject(next);
    return true;
  }

  function markSongs(): boolean {
    const current = useDub.getState().project;
    if (!current) return false;
    const found = detectSongs(current.duration, current.segments);
    for (const song of found) useDub.getState().addSkipRange(song);
    return found.length > 0;
  }

  async function finishEpisode() {
    const source = getMedia().file;
    const current = useDub.getState().project;
    if (!current) return;
    if (!source || getMedia().kind !== "video") {
      useDub.getState().setBanner("upload it again.");
      return;
    }
    const heavy = source.size > BROWSER_MIX_BYTES;
    const long = current.duration > EPISODE_LIMIT;
    useDub.getState().setBusy("export");
    setDropLabel("Reading the lines");
    try {
      const bed = await reads.farsiBed(false);
      const latest = useDub.getState().project ?? current;
      const commandText = episodeCommand(source.name, replacedWindows(latest.segments));
      const prior = useDub.getState().banner;
      const memory = /memory|allocation|array buffer/i.test(prior ?? "");
      const cannotMix = heavy || long || !getMedia().buffer || !bed.audio || bed.incomplete;
      if (cannotMix) {
        handoffFiles(latest, bed.audio);
        setCommand(commandText);
        useDub.getState().setBanner(
          heavy
            ? "This file is too large to mix here. The files are downloading, with an ffmpeg command."
            : long
              ? "This episode is over 15 minutes, so the picture was not mixed here."
              : memory
                ? "The browser ran out of memory, so the picture was not mixed."
                : prior && /not read/i.test(prior)
                  ? "Some lines were not read. The files are downloading, with an ffmpeg command."
                  : "The video was not mixed. The files are downloading, with an ffmpeg command.",
        );
        return;
      }
      setDropLabel("Mixing");
      const mixed = await reads.mixReplaced(false);
      if (!mixed.audio || mixed.incomplete) {
        handoffFiles(latest, bed.audio);
        setCommand(commandText);
        if (!useDub.getState().banner) {
          useDub.getState().setBanner("The video was not mixed. The files are downloading, with an ffmpeg command.");
        }
        return;
      }
      try {
        const { renderTranslatedMp4 } = await import("@/lib/dub/export-mp4");
        const blob = await renderTranslatedMp4({
          video: source,
          wav: audioBufferToWav(mixed.audio),
          ass: toAss(latest),
          srt: toSrt(latest),
          soft: false,
          onStatus: setDropLabel,
        });
        downloadBlob("nava-anime-farsi.mp4", blob);
        const songs = (useDub.getState().project ?? latest).skipRanges;
        if (songs.length > 0) {
          useDub.getState().setBanner("Songs stay on the original. Change a range if that detect is wrong, then rebuild.");
        }
      } catch (error) {
        handoffFiles(latest, bed.audio);
        setCommand(commandText);
        const message = error instanceof Error ? error.message : "";
        useDub.getState().setBanner(
          /memory|allocation|array buffer/i.test(message)
            ? "The browser ran out of memory, so the picture was not mixed."
            : message || "Could not build the episode. The files are downloading, with an ffmpeg command.",
        );
      }
    } finally {
      useDub.getState().setBusy(null);
    }
  }

  function handoffFiles(current: Project, audio: AudioBuffer | null) {
    downloadText("nava-anime.srt", toSrt(current), "text/plain");
    window.setTimeout(() => downloadText("nava-anime.ass", toAss(current), "text/plain"), 350);
    window.setTimeout(() => downloadText("nava-anime-cues.json", toCueSheet(current), "application/json"), 700);
    if (audio) window.setTimeout(() => downloadBlob("nava-vocals.wav", audioBufferToWav(audio)), 1050);
  }

  function reset() {
    clearMedia();
    setMediaTick((value) => value + 1);
    useDub.getState().clear();
    setArmed(false);
    reads.stop();
    setCommand(null);
    setDropLabel(null);
    setHeld(null);
  }

  function releasePicture(latest: Project, audio: AudioBuffer | null, reason: string) {
    const source = getMedia().file;
    handoffFiles(latest, audio);
    if (source) setCommand(episodeCommand(source.name, replacedWindows(latest.segments)));
    useDub.getState().setBanner(reason);
  }

  const parkedFile = getMedia().file;
  const missing = Boolean((project?.mediaName || held) && !parkedFile);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl flex-col px-4 pb-20 pt-6 sm:px-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-faint">Nava</p>
            <h1 className="text-3xl font-semibold text-balance text-fg">نوا</h1>
            <p className="mt-1 max-w-xl text-sm text-pretty text-muted">
              English scenes, spoken Farsi. Write the line, hear it, then hand off subtitles and a vocal bed.
            </p>
          </div>
          {project ? (
            armed ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={reset}>
                  Clear
                </Button>
                <Button variant="quiet" onClick={() => setArmed(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <Button variant="quiet" onClick={() => setArmed(true)}>
                New scene
              </Button>
            )
          ) : null}
        </header>

        {banner ? (
          <p role="alert" className="mt-5 text-sm text-danger">
            {banner}
          </p>
        ) : null}

        {project ? (
          <Workspace
            busy={busy !== null || running}
            busyLabel={busy ?? (running ? "go" : null)}
            mediaTick={mediaTick}
            reads={reads}
            onFile={(file) => void onFile(file)}
            onGo={() => void go()}
            onAnime={(file) => void animeDrop(file)}
            onRebuild={() => void rebuildEpisode()}
            dropLabel={dropLabel}
            command={command}
            held={held}
            missing={missing}
            onRelease={releasePicture}
          />
        ) : (
          <Start
            busy={busy !== null || running}
            onSample={() => useDub.getState().openSample()}
            onFile={(file) => void onFile(file)}
            onGo={(file) => void go(file)}
            onAnime={(file) => void animeDrop(file)}
            dropLabel={dropLabel}
            held={held}
            missing={missing}
          />
        )}
      </div>
    </div>
  );
}

function Start({
  busy,
  dropLabel,
  held,
  missing,
  onSample,
  onFile,
  onGo,
  onAnime,
}: {
  busy: boolean;
  dropLabel: string | null;
  held: { name: string; size: number; duration: number | null } | null;
  missing: boolean;
  onSample: () => void;
  onFile: (file: File) => void;
  onGo: (file: File) => void;
  onAnime: (file: File) => void;
}) {
  return (
    <div className="mt-10">
      <SafeZone busy={busy} label={dropLabel} held={held} missing={missing} onFile={onAnime} />
      <label className="relative mt-3 block cursor-pointer rounded-xl border border-border bg-elevated p-5">
        <p className="text-xs font-medium">One pass</p>
        <p className="mt-2 text-lg font-medium">{busy ? "Working…" : "Go"}</p>
        <p className="mt-2 text-sm text-pretty">
          Pick a video. Every speaker is matched, then the scene is written, fitted, and played.
        </p>
        <input
          className="absolute inset-0 cursor-pointer opacity-0"
          type="file"
          accept="audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav,.flac,.ogg"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onGo(file);
          }}
        />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy}
          onClick={onSample}
          className="rounded-xl border border-border bg-elevated p-5 text-left transition-transform duration-150 ease-smooth active:scale-95 disabled:opacity-40"
        >
          <p className="text-xs font-medium text-faint">Sample</p>
          <p className="mt-2 text-lg font-medium">Lantern Alley</p>
          <p className="mt-2 text-sm text-pretty text-muted">
            Mira and Soren in the rain, about thirty seconds. Two tempers, one laugh left on the original.
          </p>
        </button>
        <label className="rounded-xl border border-border bg-elevated p-5 text-left">
          <p className="text-xs font-medium text-faint">Your scene</p>
          <p className="mt-2 text-lg font-medium">{busy ? "Listening…" : "Upload a clip"}</p>
          <p className="mt-2 text-sm text-pretty text-muted">
            mp3, wav, m4a, or mp4. The file stays in this tab. Only short listen pieces are sent.
          </p>
          <input
            className="mt-4 block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-sm file:border-0 file:bg-accent file:px-4 file:text-sm file:font-medium file:text-accent-fg"
            type="file"
            accept="audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav,.flac,.ogg"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onFile(file);
            }}
          />
        </label>
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-lg border border-border bg-bg px-4 py-3">
            <p className="text-xs tabular-nums text-faint">{index + 1}</p>
            <p className="mt-1 text-sm font-medium">{step.title}</p>
            <p className="mt-1 text-sm text-pretty text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

const STEPS = [
  { title: "Listen", body: "Lines, speakers, and rough delivery, from the sample or your clip." },
  { title: "Write", body: "Colloquial Persian, in that person’s mouth, timed to the original line." },
  { title: "Cast", body: "Each line picks the closest reference take. You can override it." },
  { title: "Fit", body: "If a line runs long, it is rewritten shorter, then sped up by at most a quarter." },
  { title: "Review", body: "Edit the Farsi, skip a song, rename a speaker, and hear one line." },
  { title: "Hand off", body: "SRT, ASS with Vazirmatn, a cue sheet, and a 48 kHz vocal bed." },
];

function Workspace({
  busy,
  busyLabel,
  mediaTick,
  reads,
  onFile,
  onGo,
  onAnime,
  onRebuild,
  dropLabel,
  command,
  held,
  missing,
  onRelease,
}: {
  busy: boolean;
  busyLabel: string | null;
  mediaTick: number;
  reads: ReturnType<typeof useReads>;
  onFile: (file: File) => void;
  onGo: () => void;
  onAnime: (file: File) => void;
  onRebuild: () => void;
  dropLabel: string | null;
  command: string | null;
  held: { name: string; size: number; duration: number | null } | null;
  missing: boolean;
  onRelease: (project: Project, audio: AudioBuffer | null, reason: string) => void;
}) {
  const project = useDub((state) => state.project);
  const setTitle = useDub((state) => state.setTitle);
  const setScene = useDub((state) => state.setScene);
  const renameSpeaker = useDub((state) => state.renameSpeaker);
  const setSpeakerVoice = useDub((state) => state.setSpeakerVoice);
  const setSpeakerNote = useDub((state) => state.setSpeakerNote);
  const updateGlossary = useDub((state) => state.updateGlossary);
  const addGlossary = useDub((state) => state.addGlossary);
  const removeGlossary = useDub((state) => state.removeGlossary);
  const addSkipRange = useDub((state) => state.addSkipRange);
  const removeSkipRange = useDub((state) => state.removeSkipRange);
  const [rangeStart, setRangeStart] = useState("0");
  const [rangeEnd, setRangeEnd] = useState("10");
  const [rangeLabel, setRangeLabel] = useState("Opening");
  const [exportLabel, setExportLabel] = useState<string | null>(null);

  if (!project) return null;
  const media = getMedia();
  const videoReady = media.kind === "video" && media.file != null;
  const speech = project.segments.filter((segment) => !segment.skip && !segment.nonverbal);
  const written = speech.filter((segment) => segment.farsi.trim()).length;
  const fitted = speech.filter((segment) => segment.timing).length;

  function onRange(event: FormEvent) {
    event.preventDefault();
    addSkipRange({
      start: Number(rangeStart),
      end: Number(rangeEnd),
      label: rangeLabel,
    });
  }

  async function saveMp4(soft: boolean) {
    const source = getMedia().file;
    if (!source || getMedia().kind !== "video") {
      useDub.getState().setBanner("upload the mp4 again.");
      return;
    }
    const current = useDub.getState().project;
    if (!current) return;
    if (!browserCanMix(source, current.duration) || !getMedia().buffer) {
      useDub.getState().setBusy("export");
      try {
        const bed = await reads.farsiBed(false);
        const latest = useDub.getState().project ?? current;
        onRelease(
          latest,
          bed.audio,
          source.size > BROWSER_MIX_BYTES
            ? "This file is too large to mix here. The files are downloading, with an ffmpeg command."
            : "The video was not mixed. The files are downloading, with an ffmpeg command.",
        );
      } finally {
        useDub.getState().setBusy(null);
      }
      return;
    }
    setExportLabel(soft ? "Attaching subtitles" : "Writing Farsi");
    useDub.getState().setBusy("export");
    useDub.getState().setBanner(null);
    try {
      const missing = current.segments.some(
        (segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim(),
      );
      if (missing) {
        const ready = await dubAll();
        if (!ready) return;
        useDub.getState().setBusy("export");
      }
      const latest = useDub.getState().project;
      if (!latest) return;
      setExportLabel("Mixing");
      const audio = await reads.mixPicture(false);
      if (!audio) return;
      const { renderTranslatedMp4 } = await import("@/lib/dub/export-mp4");
      const blob = await renderTranslatedMp4({
        video: source,
        wav: audioBufferToWav(audio),
        ass: toAss(latest),
        srt: toSrt(latest),
        soft,
        onStatus: setExportLabel,
      });
      downloadBlob(soft ? "nava-farsi-soft.mp4" : "nava-farsi.mp4", blob);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/memory|allocation|array buffer|too large/i.test(message)) {
        const bed = await reads.farsiBed(false);
        onRelease(
          useDub.getState().project ?? current,
          bed.audio,
          /too large/i.test(message)
            ? "This file is too large to mix here. The files are downloading, with an ffmpeg command."
            : "The browser ran out of memory, so the picture was not mixed.",
        );
      } else {
        useDub.getState().setBanner(message || "Could not build the translated MP4.");
      }
    } finally {
      useDub.getState().setBusy(null);
      setExportLabel(null);
    }
  }

  async function saveVideo() {
    const source = getMedia().file;
    if (!source || getMedia().kind !== "video") {
      useDub.getState().setBanner("upload it again.");
      return;
    }
    const current = useDub.getState().project;
    if (!current) return;
    if (!browserCanMix(source, current.duration) || !getMedia().buffer) {
      useDub.getState().setBusy("export");
      try {
        const bed = await reads.farsiBed(false);
        onRelease(
          useDub.getState().project ?? current,
          bed.audio,
          source.size > BROWSER_MIX_BYTES
            ? "This file is too large to mix here. The files are downloading, with an ffmpeg command."
            : "The video was not mixed. The files are downloading, with an ffmpeg command.",
        );
      } finally {
        useDub.getState().setBusy(null);
      }
      return;
    }
    const missing = current.segments.some(
      (segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim(),
    );
    if (missing) {
      const ready = await dubAll();
      if (!ready) return;
    }
    useDub.getState().setBusy("export");
    useDub.getState().setBanner(null);
    try {
      const audio = await reads.renderBed(false);
      if (!audio) return;
      const { muxDubbedVideo } = await import("@/lib/dub/export-video");
      const blob = await muxDubbedVideo(source, audio);
      const title = useDub.getState().project?.title ?? "nava";
      downloadBlob(`${slug(title)}-farsi.webm`, blob);
    } catch (error) {
      useDub.getState().setBanner(error instanceof Error ? error.message : "Could not build the translated video.");
    } finally {
      useDub.getState().setBusy(null);
    }
  }

  async function saveVocals() {
    const blob = await reads.vocalWav();
    if (!blob || !useDub.getState().project) return;
    downloadBlob(`${slug(useDub.getState().project?.title ?? "nava")}-vocals.wav`, blob);
  }

  return (
    <div className="mt-8">
      <SafeZone busy={busy} label={dropLabel} held={held} missing={missing} onFile={onAnime} />
      <p className="mt-4 text-sm tabular-nums text-muted">
        {speech.length} spoken lines · {written} written · {fitted} fitted · {reads.cached} reads
        {reads.progress ? ` · reading ${reads.progress.done}/${reads.progress.total}` : ""}
        {busyLabel === "go" ? " · matching speakers" : ""}
        {busyLabel === "listen" ? " · listening" : ""}
        {busyLabel === "write" ? " · writing" : ""}
        {busyLabel === "fit" ? " · fitting" : ""}
        {busyLabel === "read" ? " · reading" : ""}
        {busyLabel === "export" ? " · building the video" : ""}
        {dropLabel ? ` · ${dropLabel}` : ""}
      </p>

      <MediaBar
        key={mediaTick}
        url={media.url}
        kind={media.kind}
        name={project.mediaName}
        onFile={onFile}
        busy={busy}
        onDownload={() => void saveVideo()}
      />

      <div className="mt-5 grid gap-3">
        <label className="block text-xs text-faint" htmlFor="scene-title">
          Title
          <input
            id="scene-title"
            className="field mt-1 font-medium"
            value={project.title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block text-xs text-faint" htmlFor="scene-summary">
          Scene, for the translator
          <textarea
            id="scene-summary"
            className="field mt-1"
            value={project.scene}
            onChange={(event) => setScene(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {project.speakers.map((speaker) => (
          <div key={speaker.id} className="rounded-lg border border-border bg-elevated p-4">
            <label className="block text-xs text-faint" htmlFor={`${speaker.id}-name`}>
              Speaker
              <input
                id={`${speaker.id}-name`}
                className="field mt-1"
                value={speaker.name}
                onChange={(event) => renameSpeaker(speaker.id, event.target.value)}
              />
            </label>
            <label className="mt-3 block text-xs text-faint" htmlFor={`${speaker.id}-voice`}>
              Read voice
              <select
                id={`${speaker.id}-voice`}
                className="field mt-1"
                value={speaker.voiceId}
                onChange={(event) => setSpeakerVoice(speaker.id, event.target.value)}
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-faint" htmlFor={`${speaker.id}-note`}>
              How they talk
              <input
                id={`${speaker.id}-note`}
                className="field mt-1"
                value={speaker.note}
                onChange={(event) => setSpeakerNote(speaker.id, event.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <section className="mt-5 rounded-lg border border-border bg-elevated p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Names in Persian</h2>
          <Button variant="quiet" onClick={addGlossary}>
            Add name
          </Button>
        </div>
        <ul className="mt-3 grid gap-2">
          {project.glossary.map((entry) => (
            <li key={entry.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label="English name"
                className="field"
                value={entry.source}
                placeholder="English"
                onChange={(event) => updateGlossary(entry.id, { source: event.target.value })}
              />
              <input
                aria-label="Persian spelling"
                className="field"
                dir="rtl"
                lang="fa"
                value={entry.fa}
                placeholder="فارسی"
                onChange={(event) => updateGlossary(entry.id, { fa: event.target.value })}
              />
              <Button variant="quiet" onClick={() => removeGlossary(entry.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-lg border border-border bg-elevated p-4">
        <h2 className="text-sm font-medium">Skip a stretch</h2>
        <p className="mt-1 text-sm text-muted">Opening and ending songs stay on the original. Lines inside the range are marked keep-original.</p>
        <form className="mt-3 grid gap-2 sm:grid-cols-[6rem_6rem_1fr_auto]" onSubmit={onRange}>
          <input aria-label="Skip start seconds" className="field tabular-nums" inputMode="decimal" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
          <input aria-label="Skip end seconds" className="field tabular-nums" inputMode="decimal" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
          <input aria-label="Skip label" className="field" value={rangeLabel} onChange={(event) => setRangeLabel(event.target.value)} />
          <Button type="submit" variant="ghost">
            Mark
          </Button>
        </form>
        <Button className="mt-3" variant="ghost" disabled={busy || !videoReady} onClick={onRebuild}>
          Rebuild episode
        </Button>
        {!videoReady && project.mediaName ? <p className="mt-2 text-sm text-muted">upload it again.</p> : null}
        {project.skipRanges.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {project.skipRanges.map((range) => (
              <li key={range.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="tabular-nums text-muted">
                  {range.label} · {formatClock(range.start)} – {formatClock(range.end)}
                </span>
                <Button variant="quiet" onClick={() => removeSkipRange(range.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button disabled={busy} onClick={onGo}>
          Go
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void writeFarsi()}>
          Write Farsi
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void fitTiming()}>
          Fit to picture
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void reads.playAll()}>
          {reads.playing ? "Replay scene" : "Play scene"}
        </Button>
        <Button variant="quiet" disabled={!reads.playing && busy} onClick={reads.stop}>
          Stop
        </Button>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-pretty text-muted">
        A read uses the voice you picked, speaking the Persian, so you can judge the line. It is not a clone of the actor. The reference take is the delivery a clone would copy. Laughs and skipped stretches play from the file when the browser can decode it.
      </p>

      <ReviewList
        activeId={reads.activeId}
        busy={busy}
        onPreview={(id) => void reads.preview(id)}
        onRewrite={(id) => void writeFarsi(id)}
      />

      <section className="mt-5 rounded-lg border border-border bg-elevated p-4">
        <h2 className="text-sm font-medium">Hand off</h2>
        <p className="mt-1 text-sm text-muted">
          Subtitles are right to left, set in Vazirmatn. Download translated MP4 leaves the original low under the Farsi. Anime drop takes the English speech out. Music is not pulled out. Songs stay on the original.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="ghost"
            disabled={written === 0}
            onClick={() => downloadText(`${slug(project.title)}.srt`, toSrt(project), "text/plain")}
          >
            Farsi SRT
          </Button>
          <Button
            variant="ghost"
            disabled={written === 0}
            onClick={() => downloadText(`${slug(project.title)}.ass`, toAss(project), "text/plain")}
          >
            Farsi ASS
          </Button>
          <Button variant="ghost" onClick={() => downloadText(`${slug(project.title)}-cues.json`, toCueSheet(project), "application/json")}>
            Cue sheet
          </Button>
          <Button variant="ghost" disabled={busy || written === 0} onClick={() => void saveVocals()}>
            Vocal bed
          </Button>
          <Button className="whitespace-normal text-center" disabled={busy || !videoReady} onClick={() => void saveMp4(false)}>
            Download translated MP4
          </Button>
          <Button variant="ghost" disabled={busy || !videoReady || written === 0} onClick={() => void saveMp4(true)}>
            Soft-sub MP4
          </Button>
        </div>
        {exportLabel ? <p className="mt-2 text-sm text-muted">{exportLabel}</p> : null}
        {!videoReady ? <p className="mt-2 text-sm text-muted">upload the mp4 again.</p> : null}
        {command ? (
          <div className="mt-4">
            <p className="text-sm text-muted">
              Put Vazirmatn-Regular.ttf next to the files. This removes the English during speech, lays the Farsi bed, and burns the ASS. Songs stay on the original.
            </p>
            <pre className="mt-2 max-w-full overflow-x-auto rounded-lg bg-subtle p-3 text-xs text-fg">{command}</pre>
            <Button
              className="mt-2"
              variant="ghost"
              onClick={() => void navigator.clipboard.writeText(command)}
            >
              Copy command
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MediaBar({
  url,
  kind,
  name,
  onFile,
  busy,
  onDownload,
}: {
  url: string | null;
  kind: "audio" | "video" | null;
  name: string | null;
  onFile: (file: File) => void;
  busy: boolean;
  onDownload: () => void;
}) {
  if (!url) {
    return (
      <p className="mt-4 text-sm text-muted">
        {name ? `${name} was not kept in this browser. Upload it again to hear original takes.` : "No source file on this scene. Reads still play."}
      </p>
    );
  }
  const shared = {
    src: url,
    controls: true,
    preload: "metadata" as const,
    className: "mt-4 w-full rounded-lg bg-subtle",
    ref: (node: HTMLMediaElement | null) => registerMediaElement(node),
  };
  return (
    <div>
      {kind === "video" ? <video {...shared} playsInline className="mt-4 max-h-72 w-full rounded-lg bg-subtle" /> : <audio {...shared} />}
      {kind === "video" ? (
        <div className="mt-3">
          <Button disabled={busy} onClick={onDownload}>
            Download translated video
          </Button>
          <p className="mt-2 text-sm text-pretty text-muted">
            The picture stays. English speech is replaced by the Farsi reads. Marked songs stay on the original.
          </p>
        </div>
      ) : null}
      <label className="mt-2 block text-sm text-muted">
        Replace file
        <input
          className="mt-1 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-sm file:border-0 file:bg-subtle file:px-3 file:text-fg"
          type="file"
          disabled={busy}
          accept="audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}

function isAnimeFile(file: File): boolean {
  return /\.(mp4|mkv|webm)$/i.test(file.name) || /video\/(mp4|webm|x-matroska)/.test(file.type);
}

function SafeZone({
  busy,
  label,
  held,
  missing,
  onFile,
}: {
  busy: boolean;
  label: string | null;
  held: { name: string; size: number; duration: number | null } | null;
  missing: boolean;
  onFile: (file: File) => void;
}) {
  const duration =
    held?.duration == null
      ? label === "Reading duration"
        ? "Reading duration"
        : "Duration unknown"
      : formatClock(held.duration);
  return (
    <section>
      <p className="text-xs font-medium text-faint">Upload safe zone</p>
      <p className="mt-1 text-sm text-pretty text-muted">
        A large video stays in this tab. It is not sent whole. Listening posts short pieces only.
      </p>
      {missing ? <p className="mt-2 text-sm text-danger">upload it again.</p> : null}
      {held && !missing ? (
        <div className="mt-2">
          <p className="max-w-full truncate text-sm" title={held.name}>
            {held.name}
          </p>
          <p className="text-sm tabular-nums text-muted">
            {formatBytes(held.size)} · {duration}
          </p>
        </div>
      ) : null}
      <div className="mt-3">
        <AnimeDrop busy={busy} label={label} onFile={onFile} />
      </div>
    </section>
  );
}

function AnimeDrop({ busy, label, onFile }: { busy: boolean; label: string | null; onFile: (file: File) => void }) {
  return (
    <label
      className="relative block cursor-pointer rounded-xl border border-border bg-accent p-5 text-accent-fg"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && !busy) onFile(file);
      }}
    >
      <p className="text-lg font-medium">Anime drop</p>
      <p className="mt-2 text-sm text-pretty">
        {label ?? "Drop one English episode. mp4, mkv, or webm. Songs stay on the original. The read is the voice you picked, not a clone."}
      </p>
      <input
        className="absolute inset-0 cursor-pointer opacity-0"
        type="file"
        accept="video/mp4,video/webm,.mp4,.mkv,.webm"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function slug(title: string): string {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || "nava";
}
