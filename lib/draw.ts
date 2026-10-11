/**
 * Heat draw engine. Pure functions, no React, so it is easy to test.
 *
 * Every round, each registered surfer gets exactly one heat. Heats hold
 * 1 to `maxPerHeat` surfers and are sized as evenly as possible, so 9 surfers
 * with max 4 gives heats of 3/3/3 rather than 4/4/1.
 *
 * To keep it social, each round is picked from many random shuffles, scoring
 * against: surfing with the same people again, and surfing back-to-back heats.
 */

export const BIBS = [
  { id: "red", label: "Red", bg: "#dc2626", fg: "#ffffff" },
  { id: "white", label: "White", bg: "#ffffff", fg: "#0f172a" },
  { id: "yellow", label: "Yellow", bg: "#facc15", fg: "#0f172a" },
  { id: "blue", label: "Blue", bg: "#2563eb", fg: "#ffffff" },
] as const;

export type BibId = (typeof BIBS)[number]["id"];

export type Surfer = { id: string; name: string };

export type HeatSlot = { surferId: string; bib: BibId };

export type Heat = { round: number; slots: HeatSlot[] };

export type EventSettings = {
  title: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  heatMinutes: number;
  changeoverMinutes: number;
  maxPerHeat: number; // 1..4
  rounds: number;
};

export type EventState = {
  settings: EventSettings;
  surfers: Surfer[];
  heats: Heat[] | null;
  drawnAt: string | null;
};

export const defaultSettings = (): EventSettings => ({
  title: "First Saturday Session",
  date: nextFirstSaturday(),
  startTime: "06:30",
  heatMinutes: 25,
  changeoverMinutes: 5,
  maxPerHeat: 4,
  rounds: 2,
});

export function nextFirstSaturday(from = new Date()): string {
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const d = new Date(from.getFullYear(), from.getMonth() + monthOffset, 1);
    while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
    const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    if (d >= today) return toIsoDate(d);
  }
  return toIsoDate(from);
}

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split n surfers into the fewest heats of at most `max`, sized as evenly as possible. */
export function heatSizes(n: number, max: number): number[] {
  if (n <= 0) return [];
  const count = Math.ceil(n / max);
  const base = Math.floor(n / count);
  const extra = n % count;
  return Array.from({ length: count }, (_, i) => (i < extra ? base + 1 : base));
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

function assignBibs(ids: string[]): HeatSlot[] {
  const colours = shuffle(BIBS.map((b) => b.id)).slice(0, ids.length);
  return ids.map((surferId, i) => ({ surferId, bib: colours[i] }));
}

function chunk(ids: string[], sizes: number[]): string[][] {
  const out: string[][] = [];
  let i = 0;
  for (const s of shuffle(sizes)) {
    out.push(ids.slice(i, i + s));
    i += s;
  }
  return out;
}

const ATTEMPTS_PER_ROUND = 400;
const REPEAT_PAIR_PENALTY = 10;
const BACK_TO_BACK_PENALTY = 25;

export function generateDraw(surfers: Surfer[], settings: EventSettings): Heat[] {
  const ids = surfers.map((s) => s.id);
  const max = Math.min(Math.max(1, settings.maxPerHeat), BIBS.length);
  const sizes = heatSizes(ids.length, max);
  const pairs = new Map<string, number>();
  const heats: Heat[] = [];

  for (let round = 1; round <= settings.rounds; round++) {
    const previous = heats.at(-1)?.slots.map((s) => s.surferId) ?? [];
    let best: string[][] = [];
    let bestScore = Infinity;

    for (let attempt = 0; attempt < ATTEMPTS_PER_ROUND && bestScore > 0; attempt++) {
      const groups = chunk(shuffle(ids), sizes);
      let score = 0;
      for (const g of groups)
        for (let i = 0; i < g.length; i++)
          for (let j = i + 1; j < g.length; j++)
            score += (pairs.get(pairKey(g[i], g[j])) ?? 0) * REPEAT_PAIR_PENALTY;
      // Nobody from the last heat of the previous round in the first heat of this one.
      if (groups[0])
        score +=
          groups[0].filter((id) => previous.includes(id)).length * BACK_TO_BACK_PENALTY;
      if (score < bestScore) {
        bestScore = score;
        best = groups;
      }
    }

    for (const g of best) {
      for (let i = 0; i < g.length; i++)
        for (let j = i + 1; j < g.length; j++) {
          const k = pairKey(g[i], g[j]);
          pairs.set(k, (pairs.get(k) ?? 0) + 1);
        }
      heats.push({ round, slots: assignBibs(g) });
    }
  }
  return heats;
}

/**
 * Slot a late registration into an existing draw without reshuffling anyone:
 * in each round, join the smallest heat that has a spare bib (latest heat wins
 * ties, as it is least likely to have started). If a round is full, a new heat
 * is added at the end of that round.
 */
export function addLateSurfer(
  heats: Heat[],
  surferId: string,
  settings: EventSettings,
): Heat[] {
  const max = Math.min(Math.max(1, settings.maxPerHeat), BIBS.length);
  const next = heats.map((h) => ({ ...h, slots: [...h.slots] }));
  const rounds = [...new Set(next.map((h) => h.round))];

  for (const round of rounds) {
    const candidates = next
      .map((h, index) => ({ h, index }))
      .filter(({ h }) => h.round === round && h.slots.length < max);
    if (candidates.length) {
      candidates.sort((a, b) => a.h.slots.length - b.h.slots.length || b.index - a.index);
      const target = candidates[0].h;
      const used = new Set(target.slots.map((s) => s.bib));
      const bib = shuffle(BIBS.filter((b) => !used.has(b.id)))[0].id;
      target.slots.push({ surferId, bib });
    } else {
      const lastIndex = next.findLastIndex((h) => h.round === round);
      next.splice(lastIndex + 1, 0, { round, slots: assignBibs([surferId]) });
    }
  }
  return next;
}

/** Remove a surfer from the draw. Empty heats are dropped and later times move up. */
export function removeFromDraw(heats: Heat[], surferId: string): Heat[] {
  return heats
    .map((h) => ({ ...h, slots: h.slots.filter((s) => s.surferId !== surferId) }))
    .filter((h) => h.slots.length > 0);
}

export type HeatTime = { start: Date; end: Date };

export function heatTimes(heats: Heat[], settings: EventSettings): HeatTime[] {
  const [y, m, d] = settings.date.split("-").map(Number);
  const [hh, mm] = settings.startTime.split(":").map(Number);
  const first = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
  const step = (settings.heatMinutes + settings.changeoverMinutes) * 60_000;
  return heats.map((_, i) => {
    const start = new Date(first.getTime() + i * step);
    return { start, end: new Date(start.getTime() + settings.heatMinutes * 60_000) };
  });
}

export const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
