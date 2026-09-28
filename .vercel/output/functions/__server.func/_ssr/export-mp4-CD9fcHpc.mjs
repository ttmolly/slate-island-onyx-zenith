import { c as StreamTarget, d as VideoSampleSink, f as Quality, h as BlobSource, l as Input, m as ALL_FORMATS, n as Output, o as VideoSampleSource, p as VideoSample, r as Mp4OutputFormat, s as BufferTarget } from "../_libs/mediabunny.mjs";
import "./routes-k_gOWJC2.mjs";
import { t as FFmpeg } from "../_libs/ffmpeg__ffmpeg.mjs";
import { t as toBlobURL } from "../_libs/ffmpeg__util.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/export-mp4-CD9fcHpc.js
var ffmpeg = null;
var onProgress = () => {};
async function encoder() {
	if (ffmpeg?.loaded) return ffmpeg;
	const next = new FFmpeg();
	next.on("progress", ({ progress }) => onProgress(progress));
	await next.load({
		coreURL: await toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript"),
		wasmURL: await toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm")
	});
	ffmpeg = next;
	return next;
}
var fontReady = null;
async function ensureFont() {
	if (!fontReady) fontReady = (async () => {
		const face = new FontFace("Vazirmatn", "url(/fonts/Vazirmatn-Regular.ttf)");
		await face.load();
		document.fonts.add(face);
	})();
	await fontReady;
	await document.fonts.load("32px Vazirmatn");
}
function parseAss(ass) {
	const cues = [];
	for (const line of ass.split(/\n/)) {
		if (!line.startsWith("Dialogue:")) continue;
		const parts = line.slice(9).trim().split(",");
		if (parts.length < 10) continue;
		const start = parseAssClock(parts[1] ?? "");
		const end = parseAssClock(parts[2] ?? "");
		const text = parts.slice(9).join(",").replace(/\{[^}]*\}/g, "").replace(/\\N/g, " ").trim();
		if (text && end > start) cues.push({
			start,
			end,
			text
		});
	}
	return cues;
}
function parseAssClock(value) {
	const match = value.trim().match(/(\d+):(\d+):(\d+)\.(\d+)/);
	if (!match) return 0;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	const seconds = Number(match[3]);
	const centi = Number(match[4].padEnd(2, "0").slice(0, 2));
	return hours * 3600 + minutes * 60 + seconds + centi / 100;
}
function wrapLine(ctx, text, maxWidth) {
	const tokens = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";
	const pushToken = (token) => {
		const next = current ? `${current} ${token}` : token;
		if (ctx.measureText(next).width <= maxWidth) {
			current = next;
			return;
		}
		if (current) lines.push(current);
		if (ctx.measureText(token).width <= maxWidth) {
			current = token;
			return;
		}
		let piece = "";
		for (const char of token) {
			const trial = piece + char;
			if (piece && ctx.measureText(trial).width > maxWidth) {
				lines.push(piece);
				piece = char;
			} else piece = trial;
		}
		current = piece;
	};
	for (const token of tokens.length > 0 ? tokens : [text]) pushToken(token);
	if (current) lines.push(current);
	return lines.length > 0 ? lines : [text];
}
function paintCue(ctx, text, width, height) {
	const fontSize = Math.max(32, Math.round(64 * height / 1080));
	ctx.font = `${fontSize}px Vazirmatn, sans-serif`;
	ctx.direction = "rtl";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	const margin = Math.round(56 * height / 1080);
	const lines = wrapLine(ctx, text, width - margin * 2);
	ctx.lineJoin = "round";
	ctx.lineWidth = Math.max(4, Math.round(8 * height / 1080));
	ctx.strokeStyle = "rgba(16,16,16,0.92)";
	ctx.fillStyle = "#ffffff";
	lines.forEach((line, index) => {
		const y = height - margin - (lines.length - 1 - index) * (fontSize + 6);
		ctx.strokeText(line, width / 2, y);
		ctx.fillText(line, width / 2, y);
	});
}
async function openPictureOut(allowMemory) {
	try {
		const root = await navigator.storage.getDirectory();
		const name = `nava-burn-${Date.now()}.mp4`;
		const handle = await root.getFileHandle(name, { create: true });
		const writable = await handle.createWritable();
		let closed = false;
		const close = async () => {
			if (closed) return;
			closed = true;
			await writable.close();
		};
		return {
			target: new StreamTarget(new WritableStream({
				write: (chunk) => writable.write({
					type: "write",
					position: chunk.position,
					data: chunk.data
				}),
				close,
				abort: async () => {
					if (closed) return;
					closed = true;
					await writable.abort();
				}
			}), {
				chunked: true,
				chunkSize: 2097152
			}),
			finish: () => handle.getFile(),
			release: async () => {
				try {
					await root.removeEntry(name);
				} catch {}
			}
		};
	} catch (error) {
		if (!allowMemory) throw new Error("This file is too large to mix in the browser.");
		if (error instanceof Error && error.message === "This file is too large to mix in the browser.") throw error;
		const target = new BufferTarget();
		return {
			target,
			finish: async () => {
				const buffer = target.buffer;
				if (!buffer) throw new Error("The picture came out empty.");
				return new Blob([buffer], { type: "video/mp4" });
			},
			release: async () => {}
		};
	}
}
async function burnPicture(file, cues, onStatus) {
	if (file.size > 536870912) throw new Error("This file is too large to mix in the browser.");
	await ensureFont();
	const input = new Input({
		source: new BlobSource(file, { maxCacheSize: 8388608 }),
		formats: ALL_FORMATS
	});
	const picture = await openPictureOut(file.size <= 83886080);
	try {
		const track = await input.getPrimaryVideoTrack();
		if (!track) throw new Error("That file has no picture.");
		const width = track.displayWidth;
		const height = track.displayHeight;
		if (!width || !height) throw new Error("Could not read the picture size.");
		const duration = Math.max(await input.computeDuration(), .1);
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not draw the picture.");
		const output = new Output({
			format: new Mp4OutputFormat(),
			target: picture.target
		});
		const frames = new VideoSampleSource({
			codec: "avc",
			quality: new Quality({
				quantizer: 22,
				bitrate: Math.max(8e5, Math.round(width * height * 5))
			})
		});
		output.addVideoTrack(frames);
		await output.start();
		const sink = new VideoSampleSink(track);
		let shown = -1;
		onStatus("Burning Farsi 0%");
		for await (const sample of sink.samples()) {
			sample.draw(ctx, 0, 0, width, height);
			const cue = cues.find((item) => sample.timestamp >= item.start && sample.timestamp < item.end);
			if (cue) paintCue(ctx, cue.text, width, height);
			const bitmap = await createImageBitmap(canvas);
			const stamped = new VideoSample(bitmap, {
				timestamp: Math.max(0, sample.timestamp),
				duration: sample.duration > 0 ? sample.duration : void 0
			});
			bitmap.close();
			await frames.add(stamped);
			stamped.close();
			sample.close();
			const pct = Math.max(0, Math.min(99, Math.round(sample.timestamp / duration * 100)));
			if (pct !== shown) {
				shown = pct;
				onStatus(`Burning Farsi ${pct}%`);
			}
		}
		frames.close();
		await output.finalize();
		const blob = await picture.finish();
		if (blob.size > 536870912) throw new Error("This file is too large to mix in the browser.");
		return {
			...picture,
			blob
		};
	} catch (error) {
		await picture.release();
		throw error;
	} finally {
		input.dispose();
	}
}
function asBlob(data) {
	if (typeof data === "string") throw new Error("The encoder returned text instead of a video.");
	const copy = new Uint8Array(data.byteLength);
	copy.set(data);
	return new Blob([copy], { type: "video/mp4" });
}
async function muxAudio(video, wav, srt, onStatus) {
	const ff = await encoder();
	const logs = [];
	const onLog = ({ message }) => {
		logs.push(message);
		if (logs.length > 30) logs.shift();
	};
	ff.on("log", onLog);
	onProgress = (progress) => {
		const pct = Math.max(0, Math.min(99, Math.round(progress * 100)));
		onStatus(srt ? `Attaching subtitles ${pct}%` : `Encoding audio ${pct}%`);
	};
	try {
		onStatus(srt ? "Attaching subtitles" : "Encoding audio");
		await ff.writeFile("in.mp4", new Uint8Array(await video.arrayBuffer()));
		await ff.writeFile("mix.wav", new Uint8Array(await wav.arrayBuffer()));
		const args = [
			"-i",
			"in.mp4",
			"-i",
			"mix.wav"
		];
		if (srt != null) {
			await ff.writeFile("subs.srt", new TextEncoder().encode(srt));
			args.push("-i", "subs.srt", "-map", "0:v:0", "-map", "1:a:0", "-map", "2:s:0", "-c:s", "mov_text");
		} else args.push("-map", "0:v:0", "-map", "1:a:0");
		args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", "out.mp4");
		if (await ff.exec(args, 18e4) !== 0) {
			const detail = logs.filter((line) => /error|invalid|failed|unknown/i.test(line)).at(-1);
			throw new Error(detail ?? "Could not build the translated MP4.");
		}
		return asBlob(await ff.readFile("out.mp4"));
	} finally {
		ff.off("log", onLog);
		onProgress = () => {};
		await Promise.all([
			"in.mp4",
			"mix.wav",
			"subs.srt",
			"out.mp4"
		].map(async (name) => {
			try {
				await ff.deleteFile(name);
			} catch {}
		}));
	}
}
async function renderTranslatedMp4(options) {
	if (options.video.size > 536870912) throw new Error("This file is too large to mix in the browser.");
	if (options.soft) {
		options.onStatus("Loading the encoder");
		return muxAudio(options.video, options.wav, options.srt, options.onStatus);
	}
	const picture = await burnPicture(options.video, parseAss(options.ass), options.onStatus);
	try {
		options.onStatus("Loading the encoder");
		return await muxAudio(picture.blob, options.wav, null, options.onStatus);
	} finally {
		await picture.release();
	}
}
//#endregion
export { renderTranslatedMp4 };
