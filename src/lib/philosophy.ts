export const ELEMENTS = [
  { id: "water", han: "水", en: "Water", hint: "inward, deep" },
  { id: "wood", han: "木", en: "Wood", hint: "rising, restless" },
  { id: "fire", han: "火", en: "Fire", hint: "bright, open" },
  { id: "earth", han: "土", en: "Earth", hint: "centered" },
  { id: "metal", han: "金", en: "Metal", hint: "clear, spare" },
] as const;

export type ElementId = (typeof ELEMENTS)[number]["id"];

export const QUOTES = [
  { han: "静则生慧", en: "Stillness gives rise to wisdom." },
  { han: "天人合一", en: "Heaven and the human being are one." },
  { han: "和为贵", en: "Harmony is the precious thing." },
  { han: "上善若水", en: "The highest good is like water." },
  { han: "无为而无不为", en: "Do not force, and nothing is left undone." },
  { han: "知止而后有定", en: "Knowing when to stop, the mind finds rest." },
] as const;

export const BANDS = [
  { min: 1, max: 2, han: "静", en: "Stillness", yin: true },
  { min: 3, max: 4, han: "沉", en: "Depth", yin: true },
  { min: 5, max: 6, han: "和", en: "Harmony", yin: false },
  { min: 7, max: 8, han: "动", en: "Motion", yin: false },
  { min: 9, max: 10, han: "明", en: "Brightness", yin: false },
] as const;

export function bandFor(score: number) {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[2];
}

export function quoteForDay(isoDate: string) {
  const n = isoDate.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return QUOTES[n % QUOTES.length];
}

export function yangShare(score: number) {
  return (score - 1) / 9;
}
