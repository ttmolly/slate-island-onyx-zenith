import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as VOICES, t as DELIVERIES } from "./types-z-OFUgnZ.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-k_gOWJC2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
/** Picture mix ceiling inside the tab. This is not the listen-chunk cap. */
var BROWSER_MIX_BYTES = 536870912;
function browserCanMix(file, duration) {
	return file.size <= 536870912 && duration > 0 && duration <= 900;
}
function formatBytes(size) {
	if (!Number.isFinite(size) || size <= 0) return "0 B";
	const units = [
		"B",
		"KB",
		"MB",
		"GB",
		"TB"
	];
	let value = size;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
	return `${value.toFixed(digits)} ${units[unit]}`;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ className, variant = "solid", type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-sm font-medium transition-transform duration-150 ease-smooth active:scale-95 disabled:opacity-40", variant === "solid" && "bg-accent text-accent-fg", variant === "ghost" && "border border-border bg-subtle text-fg", variant === "quiet" && "bg-transparent px-2 text-muted", className),
		...props
	});
}
var Z = "‌";
var ONES = [
	"",
	"یک",
	"دو",
	"سه",
	"چهار",
	"پنج",
	"شش",
	"هفت",
	"هشت",
	"نه"
];
var TEENS = [
	"ده",
	"یازده",
	"دوازده",
	"سیزده",
	"چهارده",
	"پانزده",
	"شانزده",
	"هفده",
	"هجده",
	"نوزده"
];
var TENS = [
	"",
	"",
	"بیست",
	"سی",
	"چهل",
	"پنجاه",
	"شصت",
	"هفتاد",
	"هشتاد",
	"نود"
];
var HUNDREDS = [
	"",
	"صد",
	"دویست",
	"سیصد",
	"چهارصد",
	"پانصد",
	"ششصد",
	"هفتصد",
	"هشتصد",
	"نهصد"
];
function under1000(n) {
	if (n <= 0) return "";
	if (n < 10) return ONES[n] ?? "";
	if (n < 20) return TEENS[n - 10] ?? "";
	if (n < 100) {
		const ten = Math.floor(n / 10);
		const one = n % 10;
		return one ? `${TENS[ten]} و ${ONES[one]}` : TENS[ten] ?? "";
	}
	const hundred = Math.floor(n / 100);
	const rest = n % 100;
	const head = HUNDREDS[hundred] ?? "";
	return rest ? `${head} و ${under1000(rest)}` : head;
}
function intToPersianWords(n) {
	if (!Number.isFinite(n)) return "";
	const rounded = Math.round(n);
	if (rounded === 0) return "صفر";
	if (rounded < 0) return `منهای ${intToPersianWords(-rounded)}`;
	if (rounded < 1e3) return under1000(rounded);
	if (rounded < 1e6) {
		const thousands = Math.floor(rounded / 1e3);
		const rest = rounded % 1e3;
		const head = thousands === 1 ? "هزار" : `${under1000(thousands)} هزار`;
		return rest ? `${head} و ${under1000(rest)}` : head;
	}
	return String(rounded);
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function applyGlossary(text, glossary) {
	let next = text;
	const entries = glossary.filter((entry) => entry.source.trim() && entry.fa.trim()).slice().sort((a, b) => b.source.trim().length - a.source.trim().length);
	for (const entry of entries) {
		const pattern = new RegExp(escapeRegExp(entry.source.trim()), "gi");
		next = next.replace(pattern, entry.fa.trim());
	}
	return next;
}
var DIGRAPHS = [
	["kh", "خ"],
	["gh", "غ"],
	["ch", "چ"],
	["sh", "ش"],
	["zh", "ژ"],
	["aa", "ا"],
	["ee", "ی"],
	["oo", "و"]
];
var LETTERS = {
	a: "ا",
	b: "ب",
	c: "ک",
	d: "د",
	e: "ه",
	f: "ف",
	g: "گ",
	h: "ه",
	i: "ی",
	j: "ج",
	k: "ک",
	l: "ل",
	m: "م",
	n: "ن",
	o: "و",
	p: "پ",
	q: "ق",
	r: "ر",
	s: "س",
	t: "ت",
	u: "و",
	v: "و",
	w: "و",
	x: "کس",
	y: "ی",
	z: "ز"
};
function transliterateLatin(word) {
	let rest = word.toLowerCase();
	let out = "";
	while (rest.length > 0) {
		const pair = DIGRAPHS.find(([latin]) => rest.startsWith(latin));
		if (pair) {
			out += pair[1];
			rest = rest.slice(pair[0].length);
			continue;
		}
		const mapped = LETTERS[rest[0] ?? ""];
		out += mapped ?? rest[0] ?? "";
		rest = rest.slice(1);
	}
	return out;
}
function replaceDigits(text) {
	return text.replace(/\d+(?:[.,]\d+)?/g, (raw) => {
		const normalized = raw.replace(",", ".");
		if (normalized.includes(".")) {
			const [whole, frac] = normalized.split(".");
			const head = intToPersianWords(Number(whole));
			const tail = (frac ?? "").split("").map((digit) => intToPersianWords(Number(digit))).join(" ");
			return tail ? `${head} ممیز ${tail}` : head;
		}
		return intToPersianWords(Number(normalized));
	});
}
function replaceLatin(text) {
	return text.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => transliterateLatin(word));
}
function applyZwnj(text) {
	let next = text;
	next = next.replace(/(^|[\s«"(\[])می\s+/g, `$1می${Z}`);
	next = next.replace(/(^|[\s«"(\[])نمی\s+/g, `$1نمی${Z}`);
	next = next.replace(/(^|[\s«"(\[])بی\s+(?=[\u0600-\u06FF])/g, `$1بی${Z}`);
	next = next.replace(/([\u0600-\u06FF])\s+(ها|های|تر|ترین)(?![\u0600-\u06FF])/g, `$1${Z}$2`);
	next = next.replace(new RegExp(`${Z}{2,}`, "g"), Z);
	return next;
}
function punctuate(text) {
	return text.replace(/,/g, "،").replace(/\?/g, "؟").replace(/;/g, "؛");
}
function normalizeFa(text, glossary) {
	const trimmed = text.replace(/\s+/g, " ").trim();
	if (!trimmed) return "";
	return applyZwnj(punctuate(replaceLatin(replaceDigits(applyGlossary(trimmed, glossary)))));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var VOICE_IDS = new Set(VOICES.map((voice) => voice.id));
var translateLines = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.lines) || input.lines.length === 0) throw new Error("Nothing to translate.");
	if (input.lines.length > 12) throw new Error("Too many lines in one pass.");
	return {
		scene: String(input.scene ?? "").slice(0, 2e3),
		glossary: (input.glossary ?? []).slice(0, 40).map((entry) => ({
			source: String(entry.source ?? "").slice(0, 80),
			fa: String(entry.fa ?? "").slice(0, 80)
		})).filter((entry) => entry.source && entry.fa),
		mode: input.mode === "shorten" ? "shorten" : "translate",
		lines: input.lines.map((line) => ({
			id: String(line.id).slice(0, 40),
			speaker: String(line.speaker ?? "").slice(0, 60),
			note: String(line.note ?? "").slice(0, 240),
			tone: String(line.tone ?? "").slice(0, 40),
			targetSec: Number(line.targetSec) || 1,
			english: String(line.english ?? "").slice(0, 500),
			prev: line.prev ? String(line.prev).slice(0, 300) : null,
			next: line.next ? String(line.next).slice(0, 300) : null,
			farsi: line.farsi ? String(line.farsi).slice(0, 500) : "",
			maxChars: line.maxChars ? Math.max(8, Math.min(180, Math.round(line.maxChars))) : void 0
		}))
	};
}).handler(createSsrRpc("c9a2ba47d229e18bd4e1e291b1b7e5635225959869969845aee350d2fdfc1946"));
var speakLine = createServerFn({ method: "POST" }).validator((input) => {
	const text = String(input?.text ?? "").trim();
	if (!text) throw new Error("Nothing to read.");
	if (text.length > 420) throw new Error("That line is too long to read.");
	return {
		text,
		voiceId: VOICE_IDS.has(input.voiceId) ? input.voiceId : "ara",
		delivery: input.delivery === "shout" || input.delivery === "excited" || input.delivery === "calm" ? input.delivery : "calm"
	};
}).handler(createSsrRpc("303a5d354cd8984263abc2b01dddb76a4b0cbe7070f2b9e7542b38116ea7b88d"));
var STAGE = /^[[(].*[\])]$/;
var INTERJECTION = /^(?:ah+|oh+|uh+|mm+|hmm+|hm|huh|ugh|argh|gah|ngh|ow|oww|hah|ha|heh|hehe|hahaha|haha|whoa|wow|gasp|gasp+|sigh|sighs|laughs?|screams?|grunt|grunts|cries|sobbing|whimper|whimpers)[.!?…\s]*$/i;
function isNonverbal(text) {
	const trimmed = text.trim();
	if (!trimmed) return true;
	if (STAGE.test(trimmed)) return true;
	if (INTERJECTION.test(trimmed)) return true;
	return false;
}
var DELIVERY_LABEL = {
	calm: "calm",
	excited: "heated",
	shout: "shout"
};
function bestClip(segment, clips) {
	const mine = clips.filter((clip) => clip.speakerId === segment.speakerId);
	if (mine.length === 0) return null;
	let winner = mine[0];
	let best = Infinity;
	for (const clip of mine) {
		const energyGap = Math.abs(clip.energy - segment.energy);
		const pitchGap = Math.abs(Math.log((clip.pitchHz || 160) / (segment.pitchHz || 160)));
		const same = clip.delivery === segment.delivery ? -.15 : 0;
		const score = energyGap + pitchGap * .45 + same;
		if (score < best) {
			best = score;
			winner = clip;
		}
	}
	return winner.id;
}
function buildClips(segments, speakerName) {
	const bySpeaker = /* @__PURE__ */ new Map();
	for (const segment of segments) {
		if (segment.nonverbal) continue;
		const list = bySpeaker.get(segment.speakerId) ?? [];
		list.push(segment);
		bySpeaker.set(segment.speakerId, list);
	}
	const clips = [];
	for (const [speakerId, lines] of bySpeaker) {
		const ordered = lines.slice().sort((a, b) => a.start - b.start);
		const windows = [];
		for (const line of ordered) {
			const last = windows[windows.length - 1];
			const prev = last?.[last.length - 1];
			if (!last || !prev || line.delivery !== prev.delivery || line.start - prev.end > 1.2) windows.push([line]);
			else last.push(line);
		}
		const ranked = windows.map((window) => {
			const start = window[0].start;
			const end = window[window.length - 1].end;
			const energy = average(window.map((line) => line.energy));
			const pitchHz = average(window.map((line) => line.pitchHz));
			return {
				delivery: window[0].delivery,
				start,
				end,
				energy,
				pitchHz,
				span: end - start
			};
		}).sort((a, b) => b.span - a.span);
		const chosen = [];
		for (const delivery of [
			"calm",
			"excited",
			"shout"
		]) {
			const found = ranked.find((item) => item.delivery === delivery && !chosen.includes(item));
			if (found) chosen.push(found);
		}
		for (const item of ranked) {
			if (chosen.length >= 3) break;
			if (!chosen.includes(item)) chosen.push(item);
		}
		chosen.sort((a, b) => a.start - b.start).forEach((item, index) => {
			const short = item.span < 8;
			const who = speakerName(speakerId);
			clips.push({
				id: `${speakerId}-take-${index + 1}`,
				speakerId,
				delivery: item.delivery,
				start: item.start,
				end: item.end,
				energy: item.energy,
				pitchHz: item.pitchHz,
				short,
				label: `${who} · ${DELIVERY_LABEL[item.delivery]}${short ? " · short take" : ""}`
			});
		});
	}
	return clips;
}
function assignClips(segments, clips) {
	return segments.map((segment) => {
		if (segment.refLocked) return segment;
		if (segment.nonverbal) return {
			...segment,
			refClipId: null
		};
		return {
			...segment,
			refClipId: bestClip(segment, clips)
		};
	});
}
function average(values) {
	if (values.length === 0) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
var speakers = [{
	id: "mira",
	name: "Mira",
	voiceId: "ara",
	note: "Tired courier. Dry, protective, plain-spoken. Not soft, not loud."
}, {
	id: "soren",
	name: "Soren",
	voiceId: "rex",
	note: "Younger, proud, easy to ignite. Rough colloquial when he is angry."
}];
var lines = [
	{
		id: "s1",
		speakerId: "mira",
		start: .4,
		end: 2.5,
		english: "Soren. Put the crate down.",
		energy: .32,
		pitchHz: 208,
		delivery: "calm",
		nonverbal: false
	},
	{
		id: "s2",
		speakerId: "soren",
		start: 2.8,
		end: 5.5,
		english: "He called me a stray. I'm not walking away from that.",
		energy: .66,
		pitchHz: 168,
		delivery: "excited",
		nonverbal: false
	},
	{
		id: "s3",
		speakerId: "mira",
		start: 5.7,
		end: 8.7,
		english: "You are walking away. The watch is two streets over.",
		energy: .36,
		pitchHz: 204,
		delivery: "calm",
		nonverbal: false
	},
	{
		id: "s4",
		speakerId: "soren",
		start: 8.95,
		end: 10,
		english: "[laughs]",
		energy: .5,
		pitchHz: 180,
		delivery: "excited",
		nonverbal: true
	},
	{
		id: "s5",
		speakerId: "soren",
		start: 10.3,
		end: 13.1,
		english: "Let them come. I'm done being quiet.",
		energy: .9,
		pitchHz: 196,
		delivery: "shout",
		nonverbal: false
	},
	{
		id: "s6",
		speakerId: "mira",
		start: 13.4,
		end: 17.3,
		english: "Quiet kept you alive last winter. Don't throw that away for a crate of pears.",
		energy: .6,
		pitchHz: 246,
		delivery: "excited",
		nonverbal: false
	},
	{
		id: "s7",
		speakerId: "soren",
		start: 17.6,
		end: 20.2,
		english: "You always do this. You make it small.",
		energy: .34,
		pitchHz: 142,
		delivery: "calm",
		nonverbal: false
	},
	{
		id: "s8",
		speakerId: "mira",
		start: 20.5,
		end: 24.6,
		english: "I make it survivable. Come on. Lantern alley, before the lamps go out.",
		energy: .33,
		pitchHz: 210,
		delivery: "calm",
		nonverbal: false
	},
	{
		id: "s9",
		speakerId: "soren",
		start: 24.9,
		end: 27.5,
		english: "If he follows us, I won't apologize.",
		energy: .62,
		pitchHz: 172,
		delivery: "excited",
		nonverbal: false
	},
	{
		id: "s10",
		speakerId: "mira",
		start: 27.8,
		end: 30.4,
		english: "Then don't speak. Just move.",
		energy: .3,
		pitchHz: 198,
		delivery: "calm",
		nonverbal: false
	}
];
function createLanternAlley() {
	const nameOf = (id) => speakers.find((speaker) => speaker.id === id)?.name ?? id;
	const segments = lines.map((line) => ({
		...line,
		farsi: "",
		skip: line.nonverbal,
		refClipId: null,
		refLocked: false,
		timing: null,
		spokenSec: null
	}));
	const clips = buildClips(segments, nameOf);
	return {
		id: "lantern-alley",
		title: "Lantern Alley",
		scene: "Night rain in a market alley. Mira, a tired courier, has found Soren after he shoved a stall keeper who called him a stray. The city watch is two streets away. They need to leave down Lantern Alley before the lamps go out. Mira stays plain and firm. Soren is proud and gets loud.",
		speakers,
		glossary: [
			{
				id: "g-soren",
				source: "Soren",
				fa: "سورن"
			},
			{
				id: "g-mira",
				source: "Mira",
				fa: "میرا"
			},
			{
				id: "g-alley",
				source: "Lantern alley",
				fa: "کوچه فانوس"
			},
			{
				id: "g-alley2",
				source: "Lantern Alley",
				fa: "کوچه فانوس"
			}
		],
		segments: assignClips(segments, clips),
		clips,
		skipRanges: [],
		mediaName: null,
		duration: 31
	};
}
function speakerName(project, id) {
	return project.speakers.find((speaker) => speaker.id === id)?.name ?? id;
}
function reclip(project, segments) {
	const clips = buildClips(segments, (id) => speakerName(project, id));
	return {
		clips,
		segments: assignClips(segments, clips)
	};
}
var glossarySeq = 0;
var useDub = create()(persist((set) => ({
	project: null,
	banner: null,
	busy: null,
	setBanner: (banner) => set({ banner }),
	setBusy: (busy) => set({ busy }),
	openSample: () => set({
		project: createLanternAlley(),
		banner: null
	}),
	loadProject: (project) => set({
		project,
		banner: null
	}),
	clear: () => set({
		project: null,
		banner: null,
		busy: null
	}),
	setTitle: (title) => set((state) => state.project ? { project: {
		...state.project,
		title
	} } : state),
	setScene: (scene) => set((state) => state.project ? { project: {
		...state.project,
		scene
	} } : state),
	renameSpeaker: (id, name) => set((state) => {
		if (!state.project) return state;
		const speakers = state.project.speakers.map((speaker) => speaker.id === id ? {
			...speaker,
			name
		} : speaker);
		const next = {
			...state.project,
			speakers
		};
		const voiced = reclip(next, next.segments.map((segment) => ({
			...segment,
			refLocked: false
		})));
		return { project: {
			...next,
			...voiced
		} };
	}),
	setSpeakerVoice: (id, voiceId) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			speakers: state.project.speakers.map((speaker) => speaker.id === id ? {
				...speaker,
				voiceId
			} : speaker)
		} };
	}),
	setSpeakerNote: (id, note) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			speakers: state.project.speakers.map((speaker) => speaker.id === id ? {
				...speaker,
				note
			} : speaker)
		} };
	}),
	updateGlossary: (id, patch) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			glossary: state.project.glossary.map((entry) => entry.id === id ? {
				...entry,
				...patch
			} : entry)
		} };
	}),
	addGlossary: () => set((state) => {
		if (!state.project) return state;
		glossarySeq += 1;
		return { project: {
			...state.project,
			glossary: [...state.project.glossary, {
				id: `g-${Date.now()}-${glossarySeq}`,
				source: "",
				fa: ""
			}]
		} };
	}),
	removeGlossary: (id) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			glossary: state.project.glossary.filter((entry) => entry.id !== id)
		} };
	}),
	rememberNames: (pairs) => set((state) => {
		if (!state.project || pairs.length === 0) return state;
		const glossary = [...state.project.glossary];
		for (const pair of pairs) {
			const source = pair.source.trim();
			const fa = pair.fa.trim();
			if (!source || !fa || !/[\u0600-\u06FF]/.test(fa) || /[A-Za-z]/.test(fa)) continue;
			if (glossary.some((entry) => entry.source.trim().toLowerCase() === source.toLowerCase())) continue;
			glossarySeq += 1;
			glossary.push({
				id: `g-${Date.now()}-${glossarySeq}`,
				source,
				fa
			});
			if (glossary.length >= 40) break;
		}
		if (glossary.length === state.project.glossary.length) return state;
		return { project: {
			...state.project,
			glossary
		} };
	}),
	updateSegment: (id, patch) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			segments: state.project.segments.map((segment) => segment.id === id ? {
				...segment,
				...patch
			} : segment)
		} };
	}),
	setEnglish: (id, english) => set((state) => {
		if (!state.project) return state;
		const nonverbal = isNonverbal(english);
		return { project: {
			...state.project,
			segments: state.project.segments.map((segment) => {
				if (segment.id !== id) return segment;
				return {
					...segment,
					english,
					nonverbal,
					skip: nonverbal ? true : segment.skip,
					timing: null,
					spokenSec: null
				};
			})
		} };
	}),
	setFarsi: (id, farsi) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			segments: state.project.segments.map((segment) => segment.id === id ? {
				...segment,
				farsi,
				timing: null,
				spokenSec: null
			} : segment)
		} };
	}),
	setDelivery: (id, delivery) => set((state) => {
		if (!state.project) return state;
		const segments = state.project.segments.map((segment) => {
			if (segment.id !== id) return segment;
			const next = {
				...segment,
				delivery,
				spokenSec: null
			};
			if (next.refLocked) return next;
			return {
				...next,
				refClipId: bestClip(next, state.project.clips)
			};
		});
		return { project: {
			...state.project,
			segments
		} };
	}),
	setRef: (id, clipId) => set((state) => {
		if (!state.project) return state;
		return { project: {
			...state.project,
			segments: state.project.segments.map((segment) => {
				if (segment.id !== id) return segment;
				if (clipId === "auto") return {
					...segment,
					refLocked: false,
					refClipId: bestClip({
						...segment,
						refLocked: false
					}, state.project.clips)
				};
				return {
					...segment,
					refLocked: true,
					refClipId: clipId
				};
			})
		} };
	}),
	setTimes: (id, start, end) => set((state) => {
		if (!state.project) return state;
		const safeStart = Math.max(0, start);
		const safeEnd = Math.max(safeStart + .15, end);
		return { project: {
			...state.project,
			segments: state.project.segments.map((segment) => segment.id === id ? {
				...segment,
				start: safeStart,
				end: safeEnd,
				timing: null
			} : segment),
			duration: Math.max(state.project.duration, ...state.project.segments.map((segment) => segment.id === id ? safeEnd : segment.end))
		} };
	}),
	addSkipRange: (range) => set((state) => {
		if (!state.project) return state;
		const start = Math.max(0, Math.min(range.start, range.end));
		const end = Math.max(range.start, range.end);
		if (end - start < .2) return state;
		const skipRange = {
			id: `skip-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
			start,
			end,
			label: range.label.trim() || "Skip"
		};
		const segments = state.project.segments.map((segment) => segment.start < end && segment.end > start ? {
			...segment,
			skip: true
		} : segment);
		return { project: {
			...state.project,
			skipRanges: [...state.project.skipRanges, skipRange],
			segments
		} };
	}),
	removeSkipRange: (id) => set((state) => {
		if (!state.project) return state;
		const skipRanges = state.project.skipRanges.filter((range) => range.id !== id);
		const segments = state.project.segments.map((segment) => {
			const covered = skipRanges.some((range) => segment.start < range.end && segment.end > range.start);
			if (segment.nonverbal) return {
				...segment,
				skip: true
			};
			if (covered) return {
				...segment,
				skip: true
			};
			return segment.skip ? {
				...segment,
				skip: false
			} : segment;
		});
		return { project: {
			...state.project,
			skipRanges,
			segments
		} };
	}),
	applyPlans: (segments) => set((state) => state.project ? { project: {
		...state.project,
		segments
	} } : state),
	rematch: () => set((state) => {
		if (!state.project) return state;
		const unlocked = state.project.segments.map((segment) => ({
			...segment,
			refLocked: false
		}));
		return { project: {
			...state.project,
			...reclip(state.project, unlocked)
		} };
	})
}), {
	name: "nava-desk",
	skipHydration: true,
	partialize: (state) => ({ project: state.project })
}));
function estimateSpeakSec(fa) {
	const chars = [...fa].filter((char) => char !== "‌" && char.trim() !== "").length;
	if (chars === 0) return 0;
	return Math.max(.35, chars / 13.5);
}
function softMaxChars(targetSec) {
	return Math.max(8, Math.round(Math.max(.4, targetSec) * 14));
}
function planTiming(targetSec, spokenSec, tries) {
	const target = Math.max(.25, targetSec);
	const spoken = Math.max(.25, spokenSec);
	const ratio = spoken / target;
	if (ratio > 1.1) {
		const rate = Math.min(1.25, ratio);
		return {
			targetSec: target,
			estimatedSec: spoken,
			rate,
			padSec: 0,
			tries,
			note: spoken / rate > target + .08 ? "Still long at 1.25×. The next line may overlap." : "Sped up to fit the picture."
		};
	}
	if (ratio < .9) {
		const rate = .9;
		const padSec = Math.max(0, target - spoken / rate);
		return {
			targetSec: target,
			estimatedSec: spoken,
			rate,
			padSec,
			tries,
			note: padSec > .05 ? "Slowed to 0.9×, then a little silence." : "Slowed to 0.9×."
		};
	}
	return {
		targetSec: target,
		estimatedSec: spoken,
		rate: Number(ratio.toFixed(3)),
		padSec: 0,
		tries,
		note: "Within a tenth of the picture."
	};
}
function speechLines(project) {
	return project.segments.filter((segment) => !segment.nonverbal && !segment.skip && segment.english.trim());
}
function payload(project, lines, mode) {
	const indexOf = new Map(project.segments.map((segment, index) => [segment.id, index]));
	return {
		scene: project.scene,
		glossary: project.glossary.map((entry) => ({
			source: entry.source,
			fa: entry.fa
		})),
		mode,
		lines: lines.map((segment) => {
			const index = indexOf.get(segment.id) ?? 0;
			const speaker = project.speakers.find((item) => item.id === segment.speakerId);
			const targetSec = Math.max(.3, segment.end - segment.start);
			return {
				id: segment.id,
				speaker: speaker?.name ?? segment.speakerId,
				note: speaker?.note ?? "",
				tone: segment.delivery,
				targetSec,
				english: segment.english,
				prev: project.segments[index - 1]?.english ?? null,
				next: project.segments[index + 1]?.english ?? null,
				farsi: segment.farsi,
				maxChars: softMaxChars(targetSec)
			};
		})
	};
}
function applyFa(segments, project, fa) {
	return segments.map((segment) => {
		const raw = fa[segment.id];
		if (typeof raw !== "string") return segment;
		const next = normalizeFa(raw, project.glossary);
		if (!next) return segment;
		return {
			...segment,
			farsi: next,
			timing: null,
			spokenSec: null
		};
	});
}
async function writeFarsi(onlyId, quiet = false) {
	const { project, setBusy, setBanner, applyPlans } = useDub.getState();
	if (!project) return false;
	const pool = speechLines(project).filter((segment) => onlyId ? segment.id === onlyId : !segment.farsi.trim());
	if (pool.length === 0) {
		if (!quiet) setBanner(onlyId ? "That line is kept on the original." : "Every spoken line already has Farsi.");
		return true;
	}
	setBusy("write");
	setBanner(null);
	let segments = project.segments;
	let ok = true;
	try {
		const chunks = [];
		for (let index = 0; index < pool.length && chunks.length < 4; index += 8) chunks.push(pool.slice(index, index + 8));
		for (const chunk of chunks) {
			const fresh = useDub.getState().project ?? project;
			const result = await translateLines({ data: payload(fresh, chunk, "translate") });
			if (!result.ok) {
				setBanner(result.error);
				ok = false;
				break;
			}
			if (result.names?.length) useDub.getState().rememberNames(result.names);
			const named = useDub.getState().project ?? fresh;
			segments = applyFa(segments, named, result.fa);
			applyPlans(segments);
		}
		const latest = useDub.getState().project;
		if (!latest) return false;
		const left = speechLines(latest).filter((segment) => !segment.farsi.trim()).length;
		if (left > 0 && ok && !quiet && !useDub.getState().banner) setBanner(`${left} lines still need Farsi. Write again to continue.`);
	} finally {
		useDub.getState().setBusy(null);
	}
	return ok;
}
async function dubAll(rounds = 8) {
	useDub.getState().rematch();
	for (let pass = 0; pass < rounds; pass += 1) {
		const project = useDub.getState().project;
		if (!project) return false;
		const missing = speechLines(project).filter((segment) => !segment.farsi.trim()).length;
		if (missing === 0) break;
		if (!await writeFarsi(void 0, true)) return false;
		const after = useDub.getState().project;
		if ((after ? speechLines(after).filter((segment) => !segment.farsi.trim()).length : missing) >= missing) break;
	}
	await fitTiming();
	return useDub.getState().banner == null;
}
async function fitTiming() {
	const { project, setBusy, setBanner, applyPlans } = useDub.getState();
	if (!project) return;
	if (speechLines(project).filter((segment) => !segment.farsi.trim()).length === project.segments.filter((segment) => !segment.nonverbal && !segment.skip).length) {
		setBanner("Write the Farsi before fitting it to the picture.");
		return;
	}
	setBusy("fit");
	setBanner(null);
	let segments = project.segments.map((segment) => {
		if (segment.skip || segment.nonverbal || !segment.farsi.trim()) return segment;
		const spoken = segment.spokenSec ?? estimateSpeakSec(segment.farsi);
		return {
			...segment,
			timing: planTiming(segment.end - segment.start, spoken, 0)
		};
	});
	applyPlans(segments);
	try {
		let budget = 8;
		for (const segment of segments) {
			if (budget <= 0) break;
			if (segment.skip || segment.nonverbal || !segment.farsi.trim()) continue;
			let current = segment;
			let tries = 0;
			while (tries < 2 && budget > 0) {
				const target = Math.max(.3, current.end - current.start);
				if (estimateSpeakSec(current.farsi) <= target * 1.1) break;
				tries += 1;
				budget -= 1;
				const fresh = useDub.getState().project ?? project;
				const result = await translateLines({ data: payload(fresh, [{
					...current,
					farsi: current.farsi
				}], "shorten") });
				if (!result.ok) {
					setBanner(result.error);
					budget = 0;
					break;
				}
				const rewritten = normalizeFa(result.fa[current.id] ?? "", fresh.glossary);
				const shorter = charCount(rewritten) > 0 && charCount(rewritten) < charCount(current.farsi) ? rewritten : current.farsi;
				current = {
					...current,
					farsi: shorter,
					spokenSec: null,
					timing: planTiming(target, estimateSpeakSec(shorter), tries)
				};
			}
			segments = segments.map((item) => item.id === current.id ? current : item);
			applyPlans(segments);
		}
	} finally {
		useDub.getState().setBusy(null);
	}
}
function charCount(text) {
	return [...text].filter((char) => char !== "‌" && char.trim()).length;
}
function analyzeSpan(channel, sampleRate, start, end) {
	const from = Math.max(0, Math.floor(start * sampleRate));
	const to = Math.min(channel.length, Math.floor(end * sampleRate));
	if (to - from < sampleRate * .08) return {
		energy: .3,
		pitchHz: 170
	};
	let sum = 0;
	for (let index = from; index < to; index += 1) {
		const sample = channel[index] ?? 0;
		sum += sample * sample;
	}
	const rms = Math.sqrt(sum / (to - from));
	return {
		energy: Math.max(0, Math.min(1, rms / .16)),
		pitchHz: estimatePitch(channel, from, to, sampleRate)
	};
}
function estimatePitch(channel, from, to, sampleRate) {
	const length = Math.min(4096, to - from);
	const mid = from + Math.max(0, Math.floor((to - from - length) / 2));
	const minLag = Math.max(1, Math.floor(sampleRate / 420));
	const maxLag = Math.min(length - 2, Math.floor(sampleRate / 70));
	let bestLag = minLag;
	let best = 0;
	for (let lag = minLag; lag <= maxLag; lag += 1) {
		let score = 0;
		for (let index = 0; index < length - lag; index += 2) score += (channel[mid + index] ?? 0) * (channel[mid + index + lag] ?? 0);
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
function replacedWindows(segments) {
	const raw = segments.filter((segment) => !segment.skip && !segment.nonverbal && segment.farsi.trim() && segment.english.trim()).map((segment) => ({
		start: Math.max(0, segment.start - .04),
		end: segment.end + .06
	})).sort((a, b) => a.start - b.start);
	const merged = [];
	for (const span of raw) {
		const last = merged.at(-1);
		if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
		else merged.push({ ...span });
	}
	return subtract(merged, segments.filter((segment) => segment.skip || segment.nonverbal).map((segment) => ({
		start: segment.start,
		end: segment.end
	})));
}
function subtract(windows, holes) {
	let pieces = windows;
	for (const hole of holes) {
		const next = [];
		for (const piece of pieces) {
			if (hole.end <= piece.start || hole.start >= piece.end) {
				next.push(piece);
				continue;
			}
			if (hole.start > piece.start + .02) next.push({
				start: piece.start,
				end: hole.start
			});
			if (hole.end < piece.end - .02) next.push({
				start: hole.end,
				end: piece.end
			});
		}
		pieces = next;
	}
	return pieces;
}
function episodeCommand(inputName, windows) {
	const mute = windows.length === 0 ? "1" : `if(${windows.map((window) => `between(t\\,${window.start.toFixed(2)}\\,${window.end.toFixed(2)})`).join("+")}\\,0\\,1)`;
	return [
		"ffmpeg",
		"-i",
		quote(inputName || "episode.mkv"),
		"-i",
		quote("nava-vocals.wav"),
		"-filter_complex",
		quote(`[0:a]volume='${mute}':eval=frame[bg];[bg][1:a]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.97:level=disabled[a];[0:v]ass=nava-anime.ass:fontsdir=.[v]`),
		"-map",
		quote("[v]"),
		"-map",
		quote("[a]"),
		"-c:v",
		"libx264",
		"-crf",
		"18",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		"-b:a",
		"160k",
		"-ar",
		"48000",
		quote("nava-anime-farsi.mp4")
	].join(" ");
}
function quote(value) {
	return `'${value.replaceAll("'", `'\\''`)}'`;
}
function detectSongs(duration, segments) {
	if (duration < 480) return [];
	const speech = segments.filter((segment) => !segment.skip && segment.end - segment.start > .15).sort((a, b) => a.start - b.start);
	const hits = [];
	const openGap = gapAfter(speech, 70, 130, 3);
	if (openGap != null && coverage(speech, 0, Math.min(90, openGap)) >= .42) hits.push({
		start: 0,
		end: Math.min(openGap, 120),
		label: "Opening"
	});
	const endGap = lastGap(speech, duration - 140, duration - 50, 3);
	if (endGap != null && duration - endGap >= 45 && duration - endGap <= 140 && coverage(speech, endGap, duration) >= .45) {
		if (hits.every((hit) => endGap > hit.end + 20)) hits.push({
			start: endGap,
			end: duration,
			label: "Ending"
		});
	}
	return hits;
}
function coverage(segments, from, to) {
	const span = Math.max(.1, to - from);
	let covered = 0;
	for (const segment of segments) {
		const start = Math.max(from, segment.start);
		const end = Math.min(to, segment.end);
		if (end > start) covered += end - start;
	}
	return covered / span;
}
function lastGap(segments, from, to, minGap) {
	let found = null;
	for (let index = 1; index < segments.length; index += 1) {
		const previous = segments[index - 1];
		const next = segments[index];
		if (!previous || !next) continue;
		const gapStart = previous.end;
		if (next.start - gapStart >= minGap && gapStart >= from && gapStart <= to) found = gapStart;
	}
	return found;
}
function gapAfter(segments, from, to, minGap) {
	for (let index = 1; index < segments.length; index += 1) {
		const previous = segments[index - 1];
		const next = segments[index];
		if (!previous || !next) continue;
		const gapStart = previous.end;
		if (next.start - gapStart >= minGap && gapStart >= from && gapStart <= to) return gapStart;
	}
	const last = [...segments].reverse().find((segment) => segment.end <= to && segment.end >= from);
	if (last && to - last.end >= minGap) return last.end;
	return null;
}
function formatClock(sec) {
	const safe = Number.isFinite(sec) && sec > 0 ? sec : 0;
	const minutes = Math.floor(safe / 60);
	return `${minutes}:${(safe - minutes * 60).toFixed(1).padStart(4, "0")}`;
}
function pad(value, size = 2) {
	return String(value).padStart(size, "0");
}
function formatSrtTime(sec) {
	const ms = Math.max(0, Math.round(sec * 1e3));
	const hours = Math.floor(ms / 36e5);
	const minutes = Math.floor(ms % 36e5 / 6e4);
	const seconds = Math.floor(ms % 6e4 / 1e3);
	const milli = ms % 1e3;
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milli, 3)}`;
}
function formatAssTime(sec) {
	const cs = Math.max(0, Math.round(sec * 100));
	const hours = Math.floor(cs / 36e4);
	const minutes = Math.floor(cs % 36e4 / 6e3);
	const seconds = Math.floor(cs % 6e3 / 100);
	const centi = cs % 100;
	return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centi)}`;
}
var objectUrl = null;
var decoded = null;
var kind = null;
var element = null;
var file = null;
function setMediaFile(next, audio) {
	if (objectUrl) URL.revokeObjectURL(objectUrl);
	objectUrl = URL.createObjectURL(next);
	decoded = audio;
	file = next;
	kind = next.type.startsWith("video") || /\.(mp4|mkv|webm|mov)$/i.test(next.name) ? "video" : "audio";
}
function clearMedia() {
	if (objectUrl) URL.revokeObjectURL(objectUrl);
	objectUrl = null;
	decoded = null;
	kind = null;
	element = null;
	file = null;
}
function getMedia() {
	return {
		url: objectUrl,
		buffer: decoded,
		kind,
		file
	};
}
function registerMediaElement(node) {
	element = node;
}
function getMediaElement() {
	return element;
}
var GAP = .55;
function deliveryFor(energy, peers) {
	if (peers.length < 2) {
		if (energy >= .72) return "shout";
		if (energy >= .48) return "excited";
		return "calm";
	}
	const sorted = peers.slice().sort((a, b) => a - b);
	const high = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .75))] ?? .7;
	const mid = sorted[Math.floor(sorted.length * .45)] ?? .4;
	if (energy >= high && energy >= .55) return "shout";
	if (energy >= mid && energy >= .4) return "excited";
	return "calm";
}
function segmentWords(words) {
	const clean = words.filter((word) => word.text.trim() && Number.isFinite(word.start) && Number.isFinite(word.end)).map((word) => ({
		text: word.text.trim(),
		start: word.start,
		end: Math.max(word.end, word.start + .05),
		speaker: Number.isFinite(word.speaker) ? word.speaker : 0
	})).sort((a, b) => a.start - b.start);
	const groups = [];
	for (const word of clean) {
		const last = groups[groups.length - 1];
		const gap = last ? word.start - last.end : Infinity;
		if (!last || last.speaker !== word.speaker || gap > GAP) {
			groups.push({
				speaker: word.speaker,
				start: word.start,
				end: word.end,
				text: word.text
			});
			continue;
		}
		last.end = word.end;
		last.text = `${last.text} ${word.text}`;
	}
	const rough = groups.filter((group) => group.end - group.start >= .12 || group.text.length > 1);
	const energies = rough.map(() => .32);
	return rough.map((group, index) => {
		const english = group.text.replace(/\s+/g, " ").trim();
		const nonverbal = isNonverbal(english);
		return {
			id: `l${index + 1}`,
			speakerId: `sp${group.speaker}`,
			start: round3(group.start),
			end: round3(group.end),
			english,
			farsi: "",
			skip: nonverbal,
			nonverbal,
			energy: energies[index] ?? .45,
			pitchHz: 170,
			delivery: deliveryFor(energies[index] ?? .45, energies),
			refClipId: null,
			refLocked: false,
			timing: null,
			spokenSec: null
		};
	});
}
function applyAnalysis(segments, measure) {
	const measured = segments.map((segment) => {
		if (segment.end - segment.start < .12) return segment;
		const stats = measure(segment.start, segment.end);
		return {
			...segment,
			energy: stats.energy,
			pitchHz: stats.pitchHz
		};
	});
	return measured.map((segment) => {
		const peers = measured.filter((item) => item.speakerId === segment.speakerId).map((item) => item.energy);
		return {
			...segment,
			delivery: deliveryFor(segment.energy, peers)
		};
	});
}
function round3(value) {
	return Math.round(value * 1e3) / 1e3;
}
function speakerIdsInOrder(segments) {
	const ids = [];
	for (const segment of segments) if (!ids.includes(segment.speakerId)) ids.push(segment.speakerId);
	return ids;
}
var RLE = "‫";
var PDF = "‬";
function spokenLines(project) {
	return project.segments.filter((segment) => segment.farsi.trim() && !segment.skip && !segment.nonverbal);
}
function toSrt(project) {
	return spokenLines(project).map((segment, index) => {
		const text = `${RLE}${segment.farsi.trim()}${PDF}`;
		return `${index + 1}\n${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}\n${text}\n`;
	}).join("\n");
}
function assEscape(text) {
	return text.replace(/\r?\n/g, " ").replace(/\{/g, "(").replace(/\}/g, ")");
}
function toAss(project) {
	const events = spokenLines(project).map((segment) => {
		const text = `{\\rtl1}${assEscape(segment.farsi.trim())}`;
		return `Dialogue: 0,${formatAssTime(segment.start)},${formatAssTime(segment.end)},Farsi,,0,0,0,,${text}`;
	}).join("\n");
	return `[Script Info]
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1920
PlayResY: 1080
Title: ${project.title}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Farsi,Vazirmatn,64,&H00FFFFFF,&H000000FF,&H00101010,&H64000000,0,0,0,0,100,100,0,0,1,3,0,2,90,90,56,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;
}
function toCueSheet(project) {
	const speakers = Object.fromEntries(project.speakers.map((speaker) => [speaker.id, speaker]));
	const clips = Object.fromEntries(project.clips.map((clip) => [clip.id, clip]));
	const lines = project.segments.map((segment) => {
		const clip = segment.refClipId ? clips[segment.refClipId] : void 0;
		return {
			id: segment.id,
			speaker: speakers[segment.speakerId]?.name ?? segment.speakerId,
			readVoice: speakers[segment.speakerId]?.voiceId ?? "ara",
			start: segment.start,
			end: segment.end,
			english: segment.english,
			farsi: segment.farsi,
			keepOriginal: segment.skip || segment.nonverbal,
			delivery: segment.delivery,
			reference: clip ? {
				label: clip.label,
				start: clip.start,
				end: clip.end,
				short: clip.short
			} : null,
			timing: segment.timing
		};
	});
	return JSON.stringify({
		title: project.title,
		scene: project.scene,
		glossary: project.glossary.map((entry) => ({
			source: entry.source,
			fa: entry.fa
		})),
		skipRanges: project.skipRanges,
		lines,
		mix: {
			sampleRate: 48e3,
			vocals: "Farsi reads placed at the original start time. Edges fade in 20 ms.",
			keptOriginal: "Laughs, gasps, and skipped ranges stay on the source take when the file is loaded.",
			background: "Music and effects are not separated in this desk, so the vocal bed is dry."
		}
	}, null, 2);
}
function audioBufferToWav(buffer) {
	const samples = buffer.getChannelData(0);
	const rate = buffer.sampleRate;
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
function downloadBlob(filename, blob) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 4e3);
}
function downloadText(filename, text, mime) {
	downloadBlob(filename, new Blob([text], { type: mime }));
}
function ReviewList({ activeId, busy, onPreview, onRewrite }) {
	const project = useDub((state) => state.project);
	const setEnglish = useDub((state) => state.setEnglish);
	const setFarsi = useDub((state) => state.setFarsi);
	const setDelivery = useDub((state) => state.setDelivery);
	const setRef = useDub((state) => state.setRef);
	const setTimes = useDub((state) => state.setTimes);
	const updateSegment = useDub((state) => state.updateSegment);
	if (!project) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 overflow-hidden rounded-xl border border-border bg-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden gap-3 border-b border-border px-4 py-3 text-xs font-medium text-faint lg:grid lg:grid-cols-[7.5rem_8.5rem_1fr_1.15fr_7.5rem]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Speaker" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Time" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "English" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Farsi" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Line" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: project.segments.map((segment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: activeId === segment.id ? "border-b border-border bg-subtle px-4 py-4 last:border-b-0" : "border-b border-border px-4 py-4 last:border-b-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-3 lg:grid-cols-[7.5rem_8.5rem_1fr_1.15fr_7.5rem] lg:gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: nameOf(project.speakers, segment.speakerId)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-2 block text-xs text-faint",
							htmlFor: `${segment.id}-delivery`,
							children: "Delivery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: `${segment.id}-delivery`,
							className: "field mt-1",
							value: segment.delivery,
							onChange: (event) => setDelivery(segment.id, event.target.value),
							children: DELIVERIES.map((delivery) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: delivery.id,
								children: delivery.label
							}, delivery.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 lg:grid-cols-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-faint",
								htmlFor: `${segment.id}-start`,
								children: ["Start", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: `${segment.id}-start`,
									className: "field mt-1 tabular-nums",
									inputMode: "decimal",
									value: segment.start,
									onChange: (event) => setTimes(segment.id, Number(event.target.value), segment.end)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-faint",
								htmlFor: `${segment.id}-end`,
								children: ["End", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: `${segment.id}-end`,
									className: "field mt-1 tabular-nums",
									inputMode: "decimal",
									value: segment.end,
									onChange: (event) => setTimes(segment.id, segment.start, Number(event.target.value))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "col-span-2 text-xs tabular-nums text-muted lg:col-span-1",
								children: [
									formatClock(segment.start),
									" – ",
									formatClock(segment.end)
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-faint",
						htmlFor: `${segment.id}-en`,
						children: ["English", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: `${segment.id}-en`,
							className: "field mt-1",
							dir: "ltr",
							value: segment.english,
							onChange: (event) => setEnglish(segment.id, event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-faint",
						htmlFor: `${segment.id}-fa`,
						children: ["Farsi", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: `${segment.id}-fa`,
							className: "field mt-1 text-base",
							dir: "rtl",
							lang: "fa",
							value: segment.farsi,
							placeholder: segment.nonverbal ? "Kept as the original sound" : "Not written yet",
							onChange: (event) => setFarsi(segment.id, event.target.value),
							onBlur: (event) => setFarsi(segment.id, normalizeFa(event.target.value, project.glossary))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-2 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "check",
									type: "checkbox",
									checked: segment.skip || segment.nonverbal,
									onChange: (event) => {
										if (event.target.checked) updateSegment(segment.id, { skip: true });
										else updateSegment(segment.id, {
											skip: false,
											nonverbal: false
										});
									}
								}), "Keep original"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy,
								onClick: () => onPreview(segment.id),
								children: segment.skip || segment.nonverbal ? "Play take" : "Read line"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								disabled: busy || segment.nonverbal,
								onClick: () => onRewrite(segment.id),
								children: "Rewrite"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-faint",
					htmlFor: `${segment.id}-clip`,
					children: ["Reference take", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: `${segment.id}-clip`,
						className: "field mt-1",
						value: segment.refLocked ? segment.refClipId ?? "auto" : "auto",
						onChange: (event) => setRef(segment.id, event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "auto",
							children: ["Best match", segment.refClipId ? ` · ${project.clips.find((clip) => clip.id === segment.refClipId)?.label ?? ""}` : ""]
						}), project.clips.filter((clip) => clip.speakerId === segment.speakerId).map((clip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: clip.id,
							children: [
								clip.label,
								" · ",
								formatClock(clip.start)
							]
						}, clip.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted sm:max-w-xs sm:text-right",
					children: segment.timing ? `${segment.timing.rate.toFixed(2)}× · ${segment.timing.note}` : "Not fitted yet"
				})]
			})]
		}, segment.id)) })]
	});
}
function nameOf(speakers, id) {
	return speakers.find((speaker) => speaker.id === id)?.name || "Speaker";
}
var SESSION_CAP = 240;
var spent = 0;
var sharedCtx = null;
function context() {
	if (!sharedCtx) sharedCtx = new AudioContext();
	return sharedCtx;
}
function keyFor(project, segment) {
	return `${project.speakers.find((speaker) => speaker.id === segment.speakerId)?.voiceId ?? "ara"}|${segment.delivery}|${segment.farsi}`;
}
function decodeBase64(audioBase64) {
	const binary = atob(audioBase64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
	return bytes.buffer;
}
function synthable(segment) {
	return !segment.skip && !segment.nonverbal && segment.farsi.trim().length > 0;
}
function useReads() {
	const cache = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const sources = (0, import_react.useRef)([]);
	const clock = (0, import_react.useRef)(null);
	const [cacheRev, setCacheRev] = (0, import_react.useState)(0);
	const [progress, setProgress] = (0, import_react.useState)(null);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	function stop() {
		for (const source of sources.current) try {
			source.stop();
		} catch {}
		sources.current = [];
		if (clock.current != null) window.clearInterval(clock.current);
		clock.current = null;
		const media = getMediaElement();
		if (media) media.pause();
		setPlaying(false);
		setActiveId(null);
	}
	(0, import_react.useEffect)(() => () => stop(), []);
	async function ensure(project, segment) {
		const key = keyFor(project, segment);
		const hit = cache.current.get(key);
		if (hit) return hit;
		if (spent >= SESSION_CAP) throw new Error("Voice reads are paused for this session.");
		const speaker = project.speakers.find((item) => item.id === segment.speakerId);
		spent += 1;
		const result = await speakLine({ data: {
			text: segment.farsi,
			voiceId: speaker?.voiceId ?? "ara",
			delivery: segment.delivery
		} });
		if (!result.ok) throw new Error(result.error);
		const audio = await context().decodeAudioData(decodeBase64(result.audioBase64));
		cache.current.set(key, audio);
		setCacheRev((value) => value + 1);
		const target = Math.max(.3, segment.end - segment.start);
		useDub.getState().updateSegment(segment.id, {
			spokenSec: audio.duration,
			timing: planTiming(target, audio.duration, segment.timing?.tries ?? 0)
		});
		return audio;
	}
	async function prepare(project, lines) {
		const todo = lines.filter((segment) => synthable(segment) && !cache.current.has(keyFor(project, segment)));
		const batch = todo.slice(0, 20);
		setProgress({
			done: 0,
			total: batch.length
		});
		for (let index = 0; index < batch.length; index += 1) {
			const line = batch[index];
			if (!line) continue;
			await ensure(useDub.getState().project ?? project, line);
			setProgress({
				done: index + 1,
				total: batch.length
			});
		}
		setProgress(null);
		return todo.length > batch.length;
	}
	function schedule(ctx, when, buffer, offset, duration, rate) {
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.playbackRate.value = Math.max(.5, rate);
		const audible = duration ?? buffer.duration / Math.max(.5, rate);
		const gain = ctx.createGain();
		const fade = Math.min(.02, Math.max(.004, audible / 5));
		const end = when + audible;
		gain.gain.setValueAtTime(0, when);
		gain.gain.linearRampToValueAtTime(1, when + Math.min(fade, audible));
		gain.gain.setValueAtTime(1, Math.max(when + fade, end - fade));
		gain.gain.linearRampToValueAtTime(0, Math.max(end, when + .02));
		source.connect(gain);
		gain.connect(ctx.destination);
		if (duration == null) source.start(when);
		else {
			const offsetSafe = Math.min(Math.max(0, offset), Math.max(0, buffer.duration - .05));
			const room = Math.max(.05, buffer.duration - offsetSafe);
			source.start(when, offsetSafe, Math.min(duration, room));
		}
		if (ctx instanceof AudioContext) sources.current.push(source);
	}
	async function preview(id) {
		const project = useDub.getState().project;
		if (!project) return;
		const segment = project.segments.find((item) => item.id === id);
		if (!segment) return;
		stop();
		useDub.getState().setBusy("read");
		useDub.getState().setBanner(null);
		try {
			const live = context();
			await live.resume();
			if (synthable(segment)) {
				const buffer = await ensure(project, segment);
				const rate = (useDub.getState().project?.segments.find((item) => item.id === id) ?? segment).timing?.rate ?? 1;
				schedule(live, live.currentTime + .05, buffer, 0, void 0, rate);
			} else {
				const original = getMedia().buffer;
				if (!original) {
					useDub.getState().setBanner("No source audio to play for that original take.");
					return;
				}
				schedule(live, live.currentTime + .05, original, segment.start, segment.end - segment.start, 1);
			}
			setActiveId(id);
			setPlaying(true);
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not read that line.");
		} finally {
			useDub.getState().setBusy(null);
		}
	}
	async function playAll() {
		const project = useDub.getState().project;
		if (!project) return;
		stop();
		useDub.getState().setBusy("read");
		useDub.getState().setBanner(null);
		try {
			if (await prepare(project, project.segments)) useDub.getState().setBanner("Prepared the first 20 reads. Play again for the rest.");
			const latest = useDub.getState().project ?? project;
			const live = context();
			await live.resume();
			const media = getMediaElement();
			if (media) {
				media.pause();
				media.currentTime = 0;
				media.muted = true;
			}
			const origin = live.currentTime + .15;
			const original = getMedia().buffer;
			for (const segment of latest.segments) if (synthable(segment)) {
				const buffer = cache.current.get(keyFor(latest, segment));
				if (!buffer) continue;
				const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
				schedule(live, origin + segment.start, buffer, 0, void 0, rate);
			} else if (original && (segment.skip || segment.nonverbal)) schedule(live, origin + segment.start, original, segment.start, Math.max(.05, segment.end - segment.start), 1);
			if (media instanceof HTMLVideoElement) media.play();
			setPlaying(true);
			clock.current = window.setInterval(() => {
				const at = live.currentTime - origin;
				const current = latest.segments.find((segment) => at >= segment.start && at <= segment.end + .15);
				setActiveId(current?.id ?? null);
				if (at > latest.duration + 2) stop();
			}, 120);
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not play the scene.");
		} finally {
			useDub.getState().setBusy(null);
		}
	}
	async function renderBed(manageBusy) {
		const project = useDub.getState().project;
		if (!project) return null;
		if (manageBusy) {
			useDub.getState().setBusy("read");
			useDub.getState().setBanner(null);
		}
		try {
			let more = true;
			for (let pass = 0; more && pass < 6; pass += 1) {
				const live = useDub.getState().project ?? project;
				more = await prepare(live, live.segments);
			}
			const latest = useDub.getState().project ?? project;
			const original = getMedia().buffer;
			let tail = latest.duration;
			for (const segment of latest.segments) {
				const buffer = cache.current.get(keyFor(latest, segment));
				const rate = segment.timing?.rate || 1;
				if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + .2);
				else tail = Math.max(tail, segment.end);
			}
			tail = Math.min(tail + .4, 600);
			const offline = new OfflineAudioContext(1, Math.ceil(tail * 48e3), 48e3);
			for (const segment of latest.segments) if (synthable(segment)) {
				const buffer = cache.current.get(keyFor(latest, segment));
				if (!buffer) continue;
				const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
				schedule(offline, segment.start, buffer, 0, void 0, rate);
			} else if (original && (segment.skip || segment.nonverbal)) schedule(offline, segment.start, original, segment.start, Math.max(.05, segment.end - segment.start), 1);
			const rendered = await offline.startRendering();
			const data = rendered.getChannelData(0);
			let peak = 0;
			for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
			if (peak > .01) {
				const gain = .89 / peak;
				for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
			}
			if (more) useDub.getState().setBanner("Some lines were not read. The file uses what was ready.");
			return rendered;
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the vocal bed.");
			return null;
		} finally {
			if (manageBusy) useDub.getState().setBusy(null);
		}
	}
	async function mixPicture(manageBusy) {
		const project = useDub.getState().project;
		if (!project) return null;
		const original = getMedia().buffer;
		if (!original) {
			useDub.getState().setBanner("upload the mp4 again.");
			return null;
		}
		if (manageBusy) {
			useDub.getState().setBusy("read");
			useDub.getState().setBanner(null);
		}
		try {
			let more = true;
			for (let pass = 0; more && pass < 6; pass += 1) {
				const live = useDub.getState().project ?? project;
				more = await prepare(live, live.segments);
			}
			const latest = useDub.getState().project ?? project;
			const media = getMediaElement();
			const videoDur = media && Number.isFinite(media.duration) ? media.duration : 0;
			let tail = Math.max(latest.duration, original.duration, videoDur);
			for (const segment of latest.segments) {
				const buffer = cache.current.get(keyFor(latest, segment));
				const rate = segment.timing?.rate || 1;
				if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + .2);
			}
			tail = Math.min(Math.max(tail, .5) + .15, 600);
			const offline = new OfflineAudioContext(1, Math.ceil(tail * 48e3), 48e3);
			const bed = offline.createGain();
			bed.gain.setValueAtTime(.22, 0);
			for (const span of keepSpans(latest)) {
				const start = Math.max(0, Math.min(span.start, tail));
				const end = Math.max(start, Math.min(span.end, tail));
				bed.gain.setValueAtTime(1, start);
				if (end < tail) bed.gain.setValueAtTime(.22, end);
			}
			const source = offline.createBufferSource();
			source.buffer = original;
			source.connect(bed);
			bed.connect(offline.destination);
			source.start(0);
			for (const segment of latest.segments) {
				if (!synthable(segment)) continue;
				const buffer = cache.current.get(keyFor(latest, segment));
				if (!buffer) continue;
				const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
				schedule(offline, segment.start, buffer, 0, void 0, rate);
			}
			const rendered = await offline.startRendering();
			const data = rendered.getChannelData(0);
			let peak = 0;
			for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
			if (peak > .01) {
				const gain = .97 / peak;
				for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
			}
			if (more) useDub.getState().setBanner("Some lines were not read. The file uses what was ready.");
			return rendered;
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the picture.");
			return null;
		} finally {
			if (manageBusy) useDub.getState().setBusy(null);
		}
	}
	async function readAll(project) {
		let more = true;
		for (let pass = 0; more && pass < 16; pass += 1) try {
			const live = useDub.getState().project ?? project;
			more = await prepare(live, live.segments);
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (/paused for this session/i.test(message)) {
				useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
				return true;
			}
			throw error;
		}
		return more;
	}
	function peakAt(rendered, level) {
		const data = rendered.getChannelData(0);
		let peak = 0;
		for (let index = 0; index < data.length; index += 1) peak = Math.max(peak, Math.abs(data[index] ?? 0));
		if (peak > .01) {
			const gain = level / peak;
			for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
		}
	}
	async function farsiBed(manageBusy) {
		const project = useDub.getState().project;
		if (!project) return {
			audio: null,
			incomplete: false
		};
		if (manageBusy) {
			useDub.getState().setBusy("read");
			useDub.getState().setBanner(null);
		}
		try {
			const incomplete = await readAll(project);
			const latest = useDub.getState().project ?? project;
			let tail = .5;
			for (const segment of latest.segments) {
				const buffer = cache.current.get(keyFor(latest, segment));
				const rate = segment.timing?.rate || 1;
				if (buffer) tail = Math.max(tail, segment.start + buffer.duration / rate + .2);
				else tail = Math.max(tail, segment.end);
			}
			tail = tail + .2;
			if (tail > 2400) {
				useDub.getState().setBanner("This episode is too long to mix in the browser.");
				return {
					audio: null,
					incomplete: true
				};
			}
			const offline = new OfflineAudioContext(1, Math.ceil(tail * 48e3), 48e3);
			for (const segment of latest.segments) {
				if (!synthable(segment)) continue;
				const buffer = cache.current.get(keyFor(latest, segment));
				if (!buffer) continue;
				const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
				schedule(offline, segment.start, buffer, 0, void 0, rate);
			}
			const rendered = await offline.startRendering();
			peakAt(rendered, .97);
			if (incomplete) useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
			return {
				audio: rendered,
				incomplete
			};
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the vocal bed.");
			return {
				audio: null,
				incomplete: true
			};
		} finally {
			if (manageBusy) useDub.getState().setBusy(null);
		}
	}
	async function mixReplaced(manageBusy) {
		const project = useDub.getState().project;
		if (!project) return {
			audio: null,
			incomplete: false
		};
		const original = getMedia().buffer;
		if (!original) {
			useDub.getState().setBanner("upload it again.");
			return {
				audio: null,
				incomplete: false
			};
		}
		if (manageBusy) {
			useDub.getState().setBusy("read");
			useDub.getState().setBanner(null);
		}
		try {
			const incomplete = await readAll(project);
			const latest = useDub.getState().project ?? project;
			const media = getMediaElement();
			const videoDur = media && Number.isFinite(media.duration) ? media.duration : 0;
			const tail = Math.min(Math.max(latest.duration, original.duration, videoDur, .5) + .15, 960);
			const offline = new OfflineAudioContext(1, Math.ceil(tail * 48e3), 48e3);
			const bed = offline.createGain();
			muteSpeech(bed.gain, replacedWindows(latest.segments), tail);
			const source = offline.createBufferSource();
			source.buffer = original;
			source.connect(bed);
			bed.connect(offline.destination);
			source.start(0);
			for (const segment of latest.segments) {
				if (!synthable(segment)) continue;
				const buffer = cache.current.get(keyFor(latest, segment));
				if (!buffer) continue;
				const rate = segment.timing?.rate && segment.timing.rate > 0 ? segment.timing.rate : 1;
				schedule(offline, segment.start, buffer, 0, void 0, rate);
			}
			const rendered = await offline.startRendering();
			peakAt(rendered, .97);
			if (incomplete) useDub.getState().setBanner("Some lines were not read. The video was not mixed.");
			return {
				audio: rendered,
				incomplete
			};
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not mix the episode.");
			return {
				audio: null,
				incomplete: true
			};
		} finally {
			if (manageBusy) useDub.getState().setBusy(null);
		}
	}
	async function vocalWav() {
		const rendered = await renderBed(true);
		return rendered ? audioBufferToWav(rendered) : null;
	}
	const project = useDub((state) => state.project);
	return {
		preview,
		playAll,
		stop,
		vocalWav,
		renderBed,
		mixPicture,
		mixReplaced,
		farsiBed,
		progress,
		activeId,
		playing,
		cached: project ? project.segments.filter((segment) => synthable(segment) && cache.current.has(keyFor(project, segment))).length : 0,
		cacheRev
	};
}
function muteSpeech(gain, windows, tail) {
	const fade = .025;
	let last = 0;
	gain.setValueAtTime(1, 0);
	const at = (time) => {
		const next = Math.min(tail, Math.max(time, last + .001));
		last = next;
		return next;
	};
	for (const window of windows) {
		const start = Math.max(0, window.start);
		const end = Math.min(tail, window.end);
		if (end - start < .08) continue;
		const down = at(start);
		const quiet = at(Math.min(end - .01, start + fade));
		gain.setValueAtTime(1, down);
		gain.linearRampToValueAtTime(0, quiet);
		const hold = Math.max(quiet + .001, end - fade);
		if (hold < end) {
			const held = at(hold);
			gain.setValueAtTime(0, held);
		}
		const back = at(end);
		gain.linearRampToValueAtTime(1, back);
	}
}
function keepSpans(project) {
	const spans = [...project.skipRanges.map((range) => ({
		start: range.start,
		end: range.end
	})), ...project.segments.filter((segment) => segment.skip || segment.nonverbal).map((segment) => ({
		start: segment.start,
		end: segment.end
	}))].filter((span) => span.end > span.start);
	spans.sort((a, b) => a.start - b.start);
	const merged = [];
	for (const span of spans) {
		const last = merged.at(-1);
		if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
		else merged.push({ ...span });
	}
	return merged;
}
var EPISODE_LIMIT = 900;
var SCENE = "English scene. Keep every name in the glossary, in Persian script, and match how each person talks.";
var ANIME_SCENE = "English anime. Keep every name in the glossary, in Persian script, and match how each person talks.";
var VOICE_CYCLE = [
	"ara",
	"rex",
	"luna",
	"orion",
	"leo",
	"sal"
];
function Studio() {
	const project = useDub((state) => state.project);
	const banner = useDub((state) => state.banner);
	const busy = useDub((state) => state.busy);
	const reads = useReads();
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [mediaTick, setMediaTick] = (0, import_react.useState)(0);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [dropLabel, setDropLabel] = (0, import_react.useState)(null);
	const [command, setCommand] = (0, import_react.useState)(null);
	const [held, setHeld] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		useDub.persist.rehydrate();
	}, []);
	async function holdFile(file) {
		setMediaFile(file, null);
		setMediaTick((value) => value + 1);
		setHeld({
			name: file.name,
			size: file.size,
			duration: null
		});
		setDropLabel("Reading duration");
		try {
			const { probeDuration } = await import("./anime-listen-glmCCnap.mjs");
			const duration = await probeDuration(file);
			if (getMedia().file !== file) {
				useDub.getState().setBanner("upload it again.");
				return null;
			}
			const shown = Number.isFinite(duration) && duration > 0 ? duration : null;
			setHeld({
				name: file.name,
				size: file.size,
				duration: shown
			});
			return { duration: shown };
		} catch {
			if (getMedia().file !== file) {
				useDub.getState().setBanner("upload it again.");
				return null;
			}
			return { duration: null };
		}
	}
	async function listenFile(file, scene, knownDuration) {
		if (getMedia().file !== file) {
			useDub.getState().setBanner("upload it again.");
			return false;
		}
		useDub.getState().setBusy("listen");
		useDub.getState().setBanner(null);
		try {
			const { transcribeAnime, decodeEpisode } = await import("./anime-listen-glmCCnap.mjs");
			const heard = await transcribeAnime(file, setDropLabel, () => getMedia().file === file);
			if (getMedia().file !== file) {
				useDub.getState().setBanner("upload it again.");
				return false;
			}
			const duration = Math.max(knownDuration ?? 0, heard.duration, heard.words.at(-1)?.end ?? 0);
			setHeld({
				name: file.name,
				size: file.size,
				duration: duration > 0 ? duration : null
			});
			let audio = null;
			if (file.size <= 536870912 && (duration === 0 || duration <= EPISODE_LIMIT)) {
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
	async function onFile(file, announce = true) {
		const parked = await holdFile(file);
		if (!parked) return false;
		const loaded = await listenFile(file, SCENE, parked.duration);
		if (loaded && announce) useDub.getState().setBanner("Name the speakers and add Persian spellings, then write the lines.");
		return loaded;
	}
	async function go(file) {
		if (running || useDub.getState().busy) return;
		setRunning(true);
		reads.stop();
		try {
			if (file) {
				if (!await onFile(file, false)) return;
			}
			if (!useDub.getState().project) {
				useDub.getState().setBanner("Choose a video, then Go.");
				return;
			}
			if (!await dubAll()) return;
			await reads.playAll();
		} finally {
			setRunning(false);
		}
	}
	async function animeDrop(file) {
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
			if (!await listenFile(file, ANIME_SCENE, parked.duration)) return;
			const found = markSongs();
			if ((useDub.getState().project?.segments.filter((segment) => !segment.skip && !segment.nonverbal && segment.english.trim()) ?? []).length > 0) {
				setDropLabel("Writing Farsi");
				if (!await dubAll(30)) return;
				const left = useDub.getState().project?.segments.filter((segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim()).length ?? 0;
				if (left > 0) {
					useDub.getState().setBanner(`${left} lines still need Farsi. Fix them, then rebuild.`);
					return;
				}
			}
			if (found) useDub.getState().setBanner("Songs stay on the original. Change a range if that detect is wrong, then rebuild.");
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
			const spoken = useDub.getState().project?.segments.filter((segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim());
			if (spoken && spoken.length > 0) {
				setDropLabel("Writing Farsi");
				if (!await dubAll(30)) return;
			}
			await finishEpisode();
		} catch (error) {
			useDub.getState().setBanner(error instanceof Error ? error.message : "Could not rebuild that episode.");
		} finally {
			setRunning(false);
			setDropLabel(null);
		}
	}
	function adopt(file, words, duration, audio, scene) {
		let segments = segmentWords(words);
		if (segments.length === 0) {
			useDub.getState().setBanner("No speech in that file.");
			return false;
		}
		if (audio) {
			const channel = audio.getChannelData(0);
			segments = applyAnalysis(segments, (start, end) => analyzeSpan(channel, audio.sampleRate, start, end));
		}
		const speakers = speakerIdsInOrder(segments).map((id, index) => ({
			id,
			name: `Speaker ${index + 1}`,
			voiceId: VOICE_CYCLE[index % VOICE_CYCLE.length] ?? "ara",
			note: "Say how old they feel and how they talk, so the Persian matches."
		}));
		const named = (id) => speakers.find((speaker) => speaker.id === id)?.name ?? id;
		const clips = buildClips(segments, named);
		const next = {
			id: crypto.randomUUID(),
			title: file.name.replace(/\.[^.]+$/, "") || "Episode",
			scene,
			speakers,
			glossary: [],
			segments: assignClips(segments, clips),
			clips,
			skipRanges: [],
			mediaName: file.name,
			duration: Math.max(duration, segments.at(-1)?.end ?? 0)
		};
		setMediaFile(file, audio);
		setMediaTick((value) => value + 1);
		useDub.getState().loadProject(next);
		return true;
	}
	function markSongs() {
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
			if (heavy || long || !getMedia().buffer || !bed.audio || bed.incomplete) {
				handoffFiles(latest, bed.audio);
				setCommand(commandText);
				useDub.getState().setBanner(heavy ? "This file is too large to mix here. The files are downloading, with an ffmpeg command." : long ? "This episode is over 15 minutes, so the picture was not mixed here." : memory ? "The browser ran out of memory, so the picture was not mixed." : prior && /not read/i.test(prior) ? "Some lines were not read. The files are downloading, with an ffmpeg command." : "The video was not mixed. The files are downloading, with an ffmpeg command.");
				return;
			}
			setDropLabel("Mixing");
			const mixed = await reads.mixReplaced(false);
			if (!mixed.audio || mixed.incomplete) {
				handoffFiles(latest, bed.audio);
				setCommand(commandText);
				if (!useDub.getState().banner) useDub.getState().setBanner("The video was not mixed. The files are downloading, with an ffmpeg command.");
				return;
			}
			try {
				const { renderTranslatedMp4 } = await import("./export-mp4-CD9fcHpc.mjs");
				downloadBlob("nava-anime-farsi.mp4", await renderTranslatedMp4({
					video: source,
					wav: audioBufferToWav(mixed.audio),
					ass: toAss(latest),
					srt: toSrt(latest),
					soft: false,
					onStatus: setDropLabel
				}));
				if ((useDub.getState().project ?? latest).skipRanges.length > 0) useDub.getState().setBanner("Songs stay on the original. Change a range if that detect is wrong, then rebuild.");
			} catch (error) {
				handoffFiles(latest, bed.audio);
				setCommand(commandText);
				const message = error instanceof Error ? error.message : "";
				useDub.getState().setBanner(/memory|allocation|array buffer/i.test(message) ? "The browser ran out of memory, so the picture was not mixed." : message || "Could not build the episode. The files are downloading, with an ffmpeg command.");
			}
		} finally {
			useDub.getState().setBusy(null);
		}
	}
	function handoffFiles(current, audio) {
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
	function releasePicture(latest, audio, reason) {
		const source = getMedia().file;
		handoffFiles(latest, audio);
		if (source) setCommand(episodeCommand(source.name, replacedWindows(latest.segments)));
		useDub.getState().setBanner(reason);
	}
	const parkedFile = getMedia().file;
	const missing = Boolean((project?.mediaName || held) && !parkedFile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col px-4 pb-20 pt-6 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-faint",
							children: "Nava"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-semibold text-balance text-fg",
							children: "نوا"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xl text-sm text-pretty text-muted",
							children: "English scenes, spoken Farsi. Write the line, hear it, then hand off subtitles and a vocal bed."
						})
					] }), project ? armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: reset,
							children: "Clear"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setArmed(false),
							children: "Keep"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: () => setArmed(true),
						children: "New scene"
					}) : null]
				}),
				banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-5 text-sm text-danger",
					children: banner
				}) : null,
				project ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workspace, {
					busy: busy !== null || running,
					busyLabel: busy ?? (running ? "go" : null),
					mediaTick,
					reads,
					onFile: (file) => void onFile(file),
					onGo: () => void go(),
					onAnime: (file) => void animeDrop(file),
					onRebuild: () => void rebuildEpisode(),
					dropLabel,
					command,
					held,
					missing,
					onRelease: releasePicture
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Start, {
					busy: busy !== null || running,
					onSample: () => useDub.getState().openSample(),
					onFile: (file) => void onFile(file),
					onGo: (file) => void go(file),
					onAnime: (file) => void animeDrop(file),
					dropLabel,
					held,
					missing
				})
			]
		})
	});
}
function Start({ busy, dropLabel, held, missing, onSample, onFile, onGo, onAnime }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafeZone, {
				busy,
				label: dropLabel,
				held,
				missing,
				onFile: onAnime
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "relative mt-3 block cursor-pointer rounded-xl border border-border bg-elevated p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium",
						children: "One pass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg font-medium",
						children: busy ? "Working…" : "Go"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-pretty",
						children: "Pick a video. Every speaker is matched, then the scene is written, fitted, and played."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "absolute inset-0 cursor-pointer opacity-0",
						type: "file",
						accept: "audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav,.flac,.ogg",
						disabled: busy,
						onChange: (event) => {
							const file = event.target.files?.[0];
							event.target.value = "";
							if (file) onGo(file);
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: busy,
					onClick: onSample,
					className: "rounded-xl border border-border bg-elevated p-5 text-left transition-transform duration-150 ease-smooth active:scale-95 disabled:opacity-40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-faint",
							children: "Sample"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-lg font-medium",
							children: "Lantern Alley"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-muted",
							children: "Mira and Soren in the rain, about thirty seconds. Two tempers, one laugh left on the original."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "rounded-xl border border-border bg-elevated p-5 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-faint",
							children: "Your scene"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-lg font-medium",
							children: busy ? "Listening…" : "Upload a clip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-muted",
							children: "mp3, wav, m4a, or mp4. The file stays in this tab. Only short listen pieces are sent."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-4 block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-sm file:border-0 file:bg-accent file:px-4 file:text-sm file:font-medium file:text-accent-fg",
							type: "file",
							accept: "audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav,.flac,.ogg",
							disabled: busy,
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (file) onFile(file);
							}
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-8 grid gap-3 sm:grid-cols-2",
				children: STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-bg px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tabular-nums text-faint",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium",
							children: step.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-pretty text-muted",
							children: step.body
						})
					]
				}, step.title))
			})
		]
	});
}
var STEPS = [
	{
		title: "Listen",
		body: "Lines, speakers, and rough delivery, from the sample or your clip."
	},
	{
		title: "Write",
		body: "Colloquial Persian, in that person’s mouth, timed to the original line."
	},
	{
		title: "Cast",
		body: "Each line picks the closest reference take. You can override it."
	},
	{
		title: "Fit",
		body: "If a line runs long, it is rewritten shorter, then sped up by at most a quarter."
	},
	{
		title: "Review",
		body: "Edit the Farsi, skip a song, rename a speaker, and hear one line."
	},
	{
		title: "Hand off",
		body: "SRT, ASS with Vazirmatn, a cue sheet, and a 48 kHz vocal bed."
	}
];
function Workspace({ busy, busyLabel, mediaTick, reads, onFile, onGo, onAnime, onRebuild, dropLabel, command, held, missing, onRelease }) {
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
	const [rangeStart, setRangeStart] = (0, import_react.useState)("0");
	const [rangeEnd, setRangeEnd] = (0, import_react.useState)("10");
	const [rangeLabel, setRangeLabel] = (0, import_react.useState)("Opening");
	const [exportLabel, setExportLabel] = (0, import_react.useState)(null);
	if (!project) return null;
	const media = getMedia();
	const videoReady = media.kind === "video" && media.file != null;
	const speech = project.segments.filter((segment) => !segment.skip && !segment.nonverbal);
	const written = speech.filter((segment) => segment.farsi.trim()).length;
	const fitted = speech.filter((segment) => segment.timing).length;
	function onRange(event) {
		event.preventDefault();
		addSkipRange({
			start: Number(rangeStart),
			end: Number(rangeEnd),
			label: rangeLabel
		});
	}
	async function saveMp4(soft) {
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
				onRelease(useDub.getState().project ?? current, bed.audio, source.size > 536870912 ? "This file is too large to mix here. The files are downloading, with an ffmpeg command." : "The video was not mixed. The files are downloading, with an ffmpeg command.");
			} finally {
				useDub.getState().setBusy(null);
			}
			return;
		}
		setExportLabel(soft ? "Attaching subtitles" : "Writing Farsi");
		useDub.getState().setBusy("export");
		useDub.getState().setBanner(null);
		try {
			if (current.segments.some((segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim())) {
				if (!await dubAll()) return;
				useDub.getState().setBusy("export");
			}
			const latest = useDub.getState().project;
			if (!latest) return;
			setExportLabel("Mixing");
			const audio = await reads.mixPicture(false);
			if (!audio) return;
			const { renderTranslatedMp4 } = await import("./export-mp4-CD9fcHpc.mjs");
			const blob = await renderTranslatedMp4({
				video: source,
				wav: audioBufferToWav(audio),
				ass: toAss(latest),
				srt: toSrt(latest),
				soft,
				onStatus: setExportLabel
			});
			downloadBlob(soft ? "nava-farsi-soft.mp4" : "nava-farsi.mp4", blob);
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (/memory|allocation|array buffer|too large/i.test(message)) {
				const bed = await reads.farsiBed(false);
				onRelease(useDub.getState().project ?? current, bed.audio, /too large/i.test(message) ? "This file is too large to mix here. The files are downloading, with an ffmpeg command." : "The browser ran out of memory, so the picture was not mixed.");
			} else useDub.getState().setBanner(message || "Could not build the translated MP4.");
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
				onRelease(useDub.getState().project ?? current, bed.audio, source.size > 536870912 ? "This file is too large to mix here. The files are downloading, with an ffmpeg command." : "The video was not mixed. The files are downloading, with an ffmpeg command.");
			} finally {
				useDub.getState().setBusy(null);
			}
			return;
		}
		if (current.segments.some((segment) => !segment.skip && !segment.nonverbal && segment.english.trim() && !segment.farsi.trim())) {
			if (!await dubAll()) return;
		}
		useDub.getState().setBusy("export");
		useDub.getState().setBanner(null);
		try {
			const audio = await reads.renderBed(false);
			if (!audio) return;
			const { muxDubbedVideo } = await import("./export-video-DTtjDuQG.mjs");
			const blob = await muxDubbedVideo(source, audio);
			downloadBlob(`${slug(useDub.getState().project?.title ?? "nava")}-farsi.webm`, blob);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafeZone, {
				busy,
				label: dropLabel,
				held,
				missing,
				onFile: onAnime
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm tabular-nums text-muted",
				children: [
					speech.length,
					" spoken lines · ",
					written,
					" written · ",
					fitted,
					" fitted · ",
					reads.cached,
					" reads",
					reads.progress ? ` · reading ${reads.progress.done}/${reads.progress.total}` : "",
					busyLabel === "go" ? " · matching speakers" : "",
					busyLabel === "listen" ? " · listening" : "",
					busyLabel === "write" ? " · writing" : "",
					busyLabel === "fit" ? " · fitting" : "",
					busyLabel === "read" ? " · reading" : "",
					busyLabel === "export" ? " · building the video" : "",
					dropLabel ? ` · ${dropLabel}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaBar, {
				url: media.url,
				kind: media.kind,
				name: project.mediaName,
				onFile,
				busy,
				onDownload: () => void saveVideo()
			}, mediaTick),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-faint",
					htmlFor: "scene-title",
					children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "scene-title",
						className: "field mt-1 font-medium",
						value: project.title,
						onChange: (event) => setTitle(event.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-faint",
					htmlFor: "scene-summary",
					children: ["Scene, for the translator", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "scene-summary",
						className: "field mt-1",
						value: project.scene,
						onChange: (event) => setScene(event.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: project.speakers.map((speaker) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-faint",
							htmlFor: `${speaker.id}-name`,
							children: ["Speaker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: `${speaker.id}-name`,
								className: "field mt-1",
								value: speaker.name,
								onChange: (event) => renameSpeaker(speaker.id, event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-xs text-faint",
							htmlFor: `${speaker.id}-voice`,
							children: ["Read voice", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: `${speaker.id}-voice`,
								className: "field mt-1",
								value: speaker.voiceId,
								onChange: (event) => setSpeakerVoice(speaker.id, event.target.value),
								children: VOICES.map((voice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: voice.id,
									children: voice.name
								}, voice.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-xs text-faint",
							htmlFor: `${speaker.id}-note`,
							children: ["How they talk", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: `${speaker.id}-note`,
								className: "field mt-1",
								value: speaker.note,
								onChange: (event) => setSpeakerNote(speaker.id, event.target.value)
							})]
						})
					]
				}, speaker.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Names in Persian"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						onClick: addGlossary,
						children: "Add name"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: project.glossary.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "English name",
								className: "field",
								value: entry.source,
								placeholder: "English",
								onChange: (event) => updateGlossary(entry.id, { source: event.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Persian spelling",
								className: "field",
								dir: "rtl",
								lang: "fa",
								value: entry.fa,
								placeholder: "فارسی",
								onChange: (event) => updateGlossary(entry.id, { fa: event.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								onClick: () => removeGlossary(entry.id),
								children: "Remove"
							})
						]
					}, entry.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Skip a stretch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Opening and ending songs stay on the original. Lines inside the range are marked keep-original."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 grid gap-2 sm:grid-cols-[6rem_6rem_1fr_auto]",
						onSubmit: onRange,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Skip start seconds",
								className: "field tabular-nums",
								inputMode: "decimal",
								value: rangeStart,
								onChange: (event) => setRangeStart(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Skip end seconds",
								className: "field tabular-nums",
								inputMode: "decimal",
								value: rangeEnd,
								onChange: (event) => setRangeEnd(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": "Skip label",
								className: "field",
								value: rangeLabel,
								onChange: (event) => setRangeLabel(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "ghost",
								children: "Mark"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						variant: "ghost",
						disabled: busy || !videoReady,
						onClick: onRebuild,
						children: "Rebuild episode"
					}),
					!videoReady && project.mediaName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "upload it again."
					}) : null,
					project.skipRanges.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: project.skipRanges.map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-muted",
								children: [
									range.label,
									" · ",
									formatClock(range.start),
									" – ",
									formatClock(range.end)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								onClick: () => removeSkipRange(range.id),
								children: "Remove"
							})]
						}, range.id))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: busy,
						onClick: onGo,
						children: "Go"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						disabled: busy,
						onClick: () => void writeFarsi(),
						children: "Write Farsi"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						disabled: busy,
						onClick: () => void fitTiming(),
						children: "Fit to picture"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						disabled: busy,
						onClick: () => void reads.playAll(),
						children: reads.playing ? "Replay scene" : "Play scene"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "quiet",
						disabled: !reads.playing && busy,
						onClick: reads.stop,
						children: "Stop"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm text-pretty text-muted",
				children: "A read uses the voice you picked, speaking the Persian, so you can judge the line. It is not a clone of the actor. The reference take is the delivery a clone would copy. Laughs and skipped stretches play from the file when the browser can decode it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewList, {
				activeId: reads.activeId,
				busy,
				onPreview: (id) => void reads.preview(id),
				onRewrite: (id) => void writeFarsi(id)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Hand off"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Subtitles are right to left, set in Vazirmatn. Download translated MP4 leaves the original low under the Farsi. Anime drop takes the English speech out. Music is not pulled out. Songs stay on the original."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: written === 0,
								onClick: () => downloadText(`${slug(project.title)}.srt`, toSrt(project), "text/plain"),
								children: "Farsi SRT"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: written === 0,
								onClick: () => downloadText(`${slug(project.title)}.ass`, toAss(project), "text/plain"),
								children: "Farsi ASS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => downloadText(`${slug(project.title)}-cues.json`, toCueSheet(project), "application/json"),
								children: "Cue sheet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy || written === 0,
								onClick: () => void saveVocals(),
								children: "Vocal bed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "whitespace-normal text-center",
								disabled: busy || !videoReady,
								onClick: () => void saveMp4(false),
								children: "Download translated MP4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy || !videoReady || written === 0,
								onClick: () => void saveMp4(true),
								children: "Soft-sub MP4"
							})
						]
					}),
					exportLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: exportLabel
					}) : null,
					!videoReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "upload the mp4 again."
					}) : null,
					command ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Put Vazirmatn-Regular.ttf next to the files. This removes the English during speech, lays the Farsi bed, and burns the ASS. Songs stay on the original."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "mt-2 max-w-full overflow-x-auto rounded-lg bg-subtle p-3 text-xs text-fg",
								children: command
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-2",
								variant: "ghost",
								onClick: () => void navigator.clipboard.writeText(command),
								children: "Copy command"
							})
						]
					}) : null
				]
			})
		]
	});
}
function MediaBar({ url, kind, name, onFile, busy, onDownload }) {
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-muted",
		children: name ? `${name} was not kept in this browser. Upload it again to hear original takes.` : "No source file on this scene. Reads still play."
	});
	const shared = {
		src: url,
		controls: true,
		preload: "metadata",
		className: "mt-4 w-full rounded-lg bg-subtle",
		ref: (node) => registerMediaElement(node)
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			...shared,
			playsInline: true,
			className: "mt-4 max-h-72 w-full rounded-lg bg-subtle"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", { ...shared }),
		kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: busy,
				onClick: onDownload,
				children: "Download translated video"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-pretty text-muted",
				children: "The picture stays. English speech is replaced by the Farsi reads. Marked songs stay on the original."
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-2 block text-sm text-muted",
			children: ["Replace file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "mt-1 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-sm file:border-0 file:bg-subtle file:px-3 file:text-fg",
				type: "file",
				disabled: busy,
				accept: "audio/*,video/mp4,video/webm,.mkv,.m4a,.mp3,.wav",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) onFile(file);
				}
			})]
		})
	] });
}
function isAnimeFile(file) {
	return /\.(mp4|mkv|webm)$/i.test(file.name) || /video\/(mp4|webm|x-matroska)/.test(file.type);
}
function SafeZone({ busy, label, held, missing, onFile }) {
	const duration = held?.duration == null ? label === "Reading duration" ? "Reading duration" : "Duration unknown" : formatClock(held.duration);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-faint",
			children: "Upload safe zone"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-pretty text-muted",
			children: "A large video stays in this tab. It is not sent whole. Listening posts short pieces only."
		}),
		missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-danger",
			children: "upload it again."
		}) : null,
		held && !missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-full truncate text-sm",
				title: held.name,
				children: held.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums text-muted",
				children: [
					formatBytes(held.size),
					" · ",
					duration
				]
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeDrop, {
				busy,
				label,
				onFile
			})
		})
	] });
}
function AnimeDrop({ busy, label, onFile }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "relative block cursor-pointer rounded-xl border border-border bg-accent p-5 text-accent-fg",
		onDragOver: (event) => event.preventDefault(),
		onDrop: (event) => {
			event.preventDefault();
			const file = event.dataTransfer.files[0];
			if (file && !busy) onFile(file);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-medium",
				children: "Anime drop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-pretty",
				children: label ?? "Drop one English episode. mp4, mkv, or webm. Songs stay on the original. The read is the voice you picked, not a clone."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "absolute inset-0 cursor-pointer opacity-0",
				type: "file",
				accept: "video/mp4,video/webm,.mp4,.mkv,.webm",
				disabled: busy,
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) onFile(file);
				}
			})
		]
	});
}
function slug(title) {
	return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nava";
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => SplitComponent });
var SplitComponent = Studio;
//#endregion
export { routes_exports as t };
