let objectUrl: string | null = null;
let decoded: AudioBuffer | null = null;
let kind: "audio" | "video" | null = null;
let element: HTMLMediaElement | null = null;
let file: File | null = null;

export function setMediaFile(next: File, audio: AudioBuffer | null) {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(next);
  decoded = audio;
  file = next;
  kind = next.type.startsWith("video") || /\.(mp4|mkv|webm|mov)$/i.test(next.name) ? "video" : "audio";
}

export function clearMedia() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  decoded = null;
  kind = null;
  element = null;
  file = null;
}

export function getMedia() {
  return { url: objectUrl, buffer: decoded, kind, file };
}

export function registerMediaElement(node: HTMLMediaElement | null) {
  element = node;
}

export function getMediaElement() {
  return element;
}
