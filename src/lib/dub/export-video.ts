import { BROWSER_MIX_BYTES } from "@/lib/dub/safe-zone";
import {
  ALL_FORMATS,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Output,
  Quality,
  WebMOutputFormat,
} from "mediabunny";

async function build(file: Blob, audio: AudioBuffer, transcode: boolean): Promise<Blob> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
  const target = new BufferTarget();
  const output = new Output({
    format: new WebMOutputFormat(),
    target,
  });
  try {
    const conversion = await Conversion.init({
      input,
      output,
      audio: { discard: true },
      video: transcode ? { codec: "vp8", quality: new Quality("medium") } : undefined,
      composable: true,
      showWarnings: false,
    });
    if (!conversion.isValid) throw new Error("picture");
    const audioSource = new AudioBufferSource({
      codec: "opus",
      quality: new Quality({ bitrate: 64_000 }),
    });
    output.addAudioTrack(audioSource);
    await output.start();
    await Promise.all([conversion.execute(), audioSource.add(audio).then(() => audioSource.close())]);
    await output.finalize();
    const buffer = target.buffer;
    if (!buffer) throw new Error("empty");
    return new Blob([buffer], { type: "video/webm" });
  } finally {
    input.dispose();
  }
}

export async function muxDubbedVideo(file: Blob, audio: AudioBuffer): Promise<Blob> {
  if (file.size > BROWSER_MIX_BYTES) throw new Error("This file is too large to mix in the browser.");
  try {
    return await build(file, audio, false);
  } catch {
    try {
      return await build(file, audio, true);
    } catch {
      throw new Error("That video’s picture could not be kept. Try an mp4 or webm.");
    }
  }
}
