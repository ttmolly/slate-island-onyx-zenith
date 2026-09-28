import { a as AudioBufferSource, c as Input, d as Quality, i as WebMOutputFormat, m as BlobSource, n as Output, p as ALL_FORMATS, s as BufferTarget, t as Conversion } from "../_libs/mediabunny.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-video-4TA2qlWV.js
async function build(file, audio, transcode) {
	const input = new Input({
		source: new BlobSource(file),
		formats: ALL_FORMATS
	});
	const target = new BufferTarget();
	const output = new Output({
		format: new WebMOutputFormat(),
		target
	});
	try {
		const conversion = await Conversion.init({
			input,
			output,
			audio: { discard: true },
			video: transcode ? {
				codec: "vp8",
				quality: new Quality("medium")
			} : void 0,
			composable: true,
			showWarnings: false
		});
		if (!conversion.isValid) throw new Error("picture");
		const audioSource = new AudioBufferSource({
			codec: "opus",
			quality: new Quality({ bitrate: 64e3 })
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
async function muxDubbedVideo(file, audio) {
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
//#endregion
export { muxDubbedVideo };
