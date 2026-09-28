import { h as BlobSource, l as Input, m as ALL_FORMATS, u as AudioSampleSink } from "../_libs/mediabunny.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anime-listen-glmCCnap.js
var CHUNK_RATE = 16e3;
function maxListenSamples() {
	return Math.floor(1572330);
}
function listenRouteDown(text, contentType) {
	const type = (contentType ?? "").toLowerCase();
	const trimmed = text.trimStart().replace(/^\uFEFF/, "");
	if (type.includes("text/html") || trimmed.startsWith("<")) return true;
	try {
		JSON.parse(trimmed);
		return false;
	} catch {
		return true;
	}
}
async function probeDuration(file) {
	const input = new Input({
		source: new BlobSource(file, { maxCacheSize: 8388608 }),
		formats: ALL_FORMATS
	});
	try {
		const duration = await input.computeDuration();
		return Number.isFinite(duration) ? duration : 0;
	} finally {
		input.dispose();
	}
}
async function transcribeAnime(file, onStatus, stillThere = () => true) {
	if (!stillThere()) throw new Error("upload it again.");
	const input = new Input({
		source: new BlobSource(file, { maxCacheSize: 8388608 }),
		formats: ALL_FORMATS
	});
	try {
		const duration = await input.computeDuration();
		const track = await input.getPrimaryAudioTrack();
		if (!track) throw new Error("That file has no audio.");
		const sink = new AudioSampleSink(track);
		const pending = new Float32Array(maxListenSamples());
		let filled = 0;
		let origin = 0;
		let chunk = 1;
		const words = [];
		const total = Math.max(1, Math.ceil((Number.isFinite(duration) ? duration : 60) / 60));
		const flush = async () => {
			if (filled < 1600) return;
			if (!stillThere()) throw new Error("upload it again.");
			onStatus(`Listening ${chunk}/${total}`);
			const wav = wav16(pending.subarray(0, filled), CHUNK_RATE);
			if (wav.size >= 3145728) throw new Error("A listen chunk was over 3 MB.");
			const heard = await postAudio(wav);
			for (const word of heard) words.push({
				...word,
				start: word.start + origin,
				end: word.end + origin,
				speaker: word.speaker + (chunk - 1) * 100
			});
			origin += filled / CHUNK_RATE;
			filled = 0;
			chunk += 1;
		};
		for await (const sample of sink.samples()) {
			if (!stillThere()) throw new Error("upload it again.");
			if (sample.timestamp + sample.duration <= 0) {
				sample.close();
				continue;
			}
			const audio = sample.toAudioBuffer();
			sample.close();
			let frame = 0;
			const frames = Math.floor(audio.length / (audio.sampleRate / CHUNK_RATE));
			while (frame < frames) {
				const next = downmixInto(pending, filled, audio, frame);
				if (next.frame === frame) break;
				filled = next.filled;
				frame = next.frame;
				if (filled >= pending.length) await flush();
			}
		}
		await flush();
		return {
			words,
			duration: Number.isFinite(duration) ? duration : origin
		};
	} finally {
		input.dispose();
	}
}
async function decodeEpisode(file) {
	if (file.size > 536870912) return null;
	const input = new Input({
		source: new BlobSource(file, { maxCacheSize: 8388608 }),
		formats: ALL_FORMATS
	});
	try {
		const duration = await input.computeDuration();
		if (!Number.isFinite(duration) || duration <= 0 || duration > 900) return null;
		const track = await input.getPrimaryAudioTrack();
		if (!track) return null;
		const sink = new AudioSampleSink(track);
		const rate = 48e3;
		const length = Math.ceil((duration + .25) * rate);
		const ctx = new AudioContext({ sampleRate: rate });
		try {
			const buffer = ctx.createBuffer(1, length, rate);
			const channel = buffer.getChannelData(0);
			for await (const sample of sink.samples()) {
				writeSample(channel, rate, sample.timestamp, sample.toAudioBuffer());
				sample.close();
			}
			return buffer;
		} finally {
			await ctx.close();
		}
	} catch {
		return null;
	} finally {
		input.dispose();
	}
}
async function postAudio(file) {
	const body = new FormData();
	body.append("file", file, "chunk.wav");
	const response = await fetch("/api/transcribe", {
		method: "POST",
		body
	});
	const trimmed = (await response.text()).trimStart().replace(/^\uFEFF/, "");
	if (listenRouteDown(trimmed, response.headers.get("content-type"))) throw new Error("The listen route is down.");
	const data = JSON.parse(trimmed);
	if (!data.ok) throw new Error(data.error ?? "Could not listen to that file.");
	return data.words ?? [];
}
function downmixInto(target, filled, buffer, frame) {
	const ratio = buffer.sampleRate / CHUNK_RATE;
	const total = Math.floor(buffer.length / ratio);
	const planes = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
	let at = filled;
	let index = frame;
	while (index < total && at < target.length) {
		const pos = index * ratio;
		const left = Math.floor(pos);
		const frac = pos - left;
		let sum = 0;
		for (const plane of planes) {
			const a = plane[left] ?? 0;
			const b = plane[Math.min(left + 1, plane.length - 1)] ?? a;
			sum += a + (b - a) * frac;
		}
		target[at] = sum / planes.length;
		at += 1;
		index += 1;
	}
	return {
		filled: at,
		frame: index
	};
}
function writeSample(target, rate, timestamp, buffer) {
	const ratio = buffer.sampleRate / rate;
	const start = Math.max(0, Math.round(timestamp * rate));
	const frames = Math.floor(buffer.length / ratio);
	const planes = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
	for (let index = 0; index < frames; index += 1) {
		const at = start + index;
		if (at >= target.length) return;
		const pos = index * ratio;
		const left = Math.floor(pos);
		const frac = pos - left;
		let sum = 0;
		for (const plane of planes) {
			const a = plane[left] ?? 0;
			const b = plane[Math.min(left + 1, plane.length - 1)] ?? a;
			sum += a + (b - a) * frac;
		}
		target[at] = sum / planes.length;
	}
}
function wav16(samples, rate) {
	const bytes = /* @__PURE__ */ new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(bytes);
	write(view, 0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	write(view, 8, "WAVE");
	write(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, rate, true);
	view.setUint32(28, rate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	write(view, 36, "data");
	view.setUint32(40, samples.length * 2, true);
	let offset = 44;
	for (let index = 0; index < samples.length; index += 1) {
		const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
		view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
		offset += 2;
	}
	return new Blob([bytes], { type: "audio/wav" });
}
function write(view, offset, text) {
	for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}
//#endregion
export { decodeEpisode, probeDuration, transcribeAnime };
