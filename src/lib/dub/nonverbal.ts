const STAGE = /^[[(].*[\])]$/;
const INTERJECTION =
  /^(?:ah+|oh+|uh+|mm+|hmm+|hm|huh|ugh|argh|gah|ngh|ow|oww|hah|ha|heh|hehe|hahaha|haha|whoa|wow|gasp|gasp+|sigh|sighs|laughs?|screams?|grunt|grunts|cries|sobbing|whimper|whimpers)[.!?…\s]*$/i;

export function isNonverbal(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (STAGE.test(trimmed)) return true;
  if (INTERJECTION.test(trimmed)) return true;
  return false;
}
