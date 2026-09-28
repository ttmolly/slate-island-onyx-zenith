import type { GlossaryEntry } from "@/lib/dub/types";

const Z = "\u200c";

const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];

function under1000(n: number): string {
  if (n <= 0) return "";
  if (n < 10) return ONES[n] ?? "";
  if (n < 20) return TEENS[n - 10] ?? "";
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one ? `${TENS[ten]} و ${ONES[one]}` : (TENS[ten] ?? "");
  }
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const head = HUNDREDS[hundred] ?? "";
  return rest ? `${head} و ${under1000(rest)}` : head;
}

export function intToPersianWords(n: number): string {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n);
  if (rounded === 0) return "صفر";
  if (rounded < 0) return `منهای ${intToPersianWords(-rounded)}`;
  if (rounded < 1000) return under1000(rounded);
  if (rounded < 1_000_000) {
    const thousands = Math.floor(rounded / 1000);
    const rest = rounded % 1000;
    const head = thousands === 1 ? "هزار" : `${under1000(thousands)} هزار`;
    return rest ? `${head} و ${under1000(rest)}` : head;
  }
  return String(rounded);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function applyGlossary(text: string, glossary: GlossaryEntry[]): string {
  let next = text;
  const entries = glossary
    .filter((entry) => entry.source.trim() && entry.fa.trim())
    .slice()
    .sort((a, b) => b.source.trim().length - a.source.trim().length);
  for (const entry of entries) {
    const pattern = new RegExp(escapeRegExp(entry.source.trim()), "gi");
    next = next.replace(pattern, entry.fa.trim());
  }
  return next;
}

const DIGRAPHS: [string, string][] = [
  ["kh", "خ"],
  ["gh", "غ"],
  ["ch", "چ"],
  ["sh", "ش"],
  ["zh", "ژ"],
  ["aa", "ا"],
  ["ee", "ی"],
  ["oo", "و"],
];

const LETTERS: Record<string, string> = {
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
  z: "ز",
};

export function transliterateLatin(word: string): string {
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

function replaceDigits(text: string): string {
  return text.replace(/\d+(?:[.,]\d+)?/g, (raw) => {
    const normalized = raw.replace(",", ".");
    if (normalized.includes(".")) {
      const [whole, frac] = normalized.split(".");
      const head = intToPersianWords(Number(whole));
      const tail = (frac ?? "")
        .split("")
        .map((digit) => intToPersianWords(Number(digit)))
        .join(" ");
      return tail ? `${head} ممیز ${tail}` : head;
    }
    return intToPersianWords(Number(normalized));
  });
}

function replaceLatin(text: string): string {
  return text.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => transliterateLatin(word));
}

export function applyZwnj(text: string): string {
  let next = text;
  next = next.replace(/(^|[\s«"(\[])می\s+/g, `$1می${Z}`);
  next = next.replace(/(^|[\s«"(\[])نمی\s+/g, `$1نمی${Z}`);
  next = next.replace(/(^|[\s«"(\[])بی\s+(?=[\u0600-\u06FF])/g, `$1بی${Z}`);
  next = next.replace(/([\u0600-\u06FF])\s+(ها|های|تر|ترین)(?![\u0600-\u06FF])/g, `$1${Z}$2`);
  next = next.replace(new RegExp(`${Z}{2,}`, "g"), Z);
  return next;
}

function punctuate(text: string): string {
  return text.replace(/,/g, "،").replace(/\?/g, "؟").replace(/;/g, "؛");
}

export function normalizeFa(text: string, glossary: GlossaryEntry[]): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return applyZwnj(punctuate(replaceLatin(replaceDigits(applyGlossary(trimmed, glossary)))));
}
