"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BIBS,
  type BibId,
  type EventSettings,
  type EventState,
  type Heat,
  addLateSurfer,
  defaultSettings,
  formatTime,
  generateDraw,
  heatTimes,
  newId,
  removeFromDraw,
} from "@/lib/draw";

const STORAGE_KEY = "waveriders:event:v1";

const freshEvent = (): EventState => ({
  settings: defaultSettings(),
  surfers: [],
  heats: null,
  drawnAt: null,
});

function loadEvent(): EventState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EventState) : null;
  } catch {
    return null;
  }
}

function saveEvent(state: EventState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage blocked: the app still works for this tab.
  }
}

const bibOf = (id: BibId) => BIBS.find((b) => b.id === id)!;

export function EventBuilder() {
  const [state, setState] = useState<EventState>(freshEvent);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<"schedule" | "surfers">("schedule");

  // Restore after mount so server HTML and first client render match.
  useEffect(() => {
    const saved = loadEvent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off restore from storage
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveEvent(state);
  }, [state, hydrated]);

  const { settings, surfers, heats } = state;
  const names = useMemo(() => new Map(surfers.map((s) => [s.id, s.name])), [surfers]);

  const updateSettings = (patch: Partial<EventSettings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const addSurfers = (raw: string[]) => {
    const cleaned = raw.map((n) => n.trim().replace(/\s+/g, " ")).filter(Boolean);
    if (!cleaned.length) return;
    setState((s) => {
      let next = { ...s, surfers: [...s.surfers] };
      for (const name of cleaned) {
        const surfer = { id: newId(), name };
        next.surfers.push(surfer);
        if (next.heats)
          next = { ...next, heats: addLateSurfer(next.heats, surfer.id, next.settings) };
      }
      return next;
    });
  };

  const removeSurfer = (id: string) =>
    setState((s) => ({
      ...s,
      surfers: s.surfers.filter((x) => x.id !== id),
      heats: s.heats ? removeFromDraw(s.heats, id) : null,
    }));

  const draw = () =>
    setState((s) => ({
      ...s,
      heats: generateDraw(s.surfers, s.settings),
      drawnAt: new Date().toISOString(),
    }));

  const clearDraw = () => setState((s) => ({ ...s, heats: null, drawnAt: null }));
  const resetAll = () => setState(freshEvent());

  return (
    <div className="space-y-8">
      <div className="no-print pt-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Run a draw
        </h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          Add names as people register on the beach, then draw. Everyone gets one heat per
          round, heats are kept small and mixed, and each surfer gets a bib colour.
          Everything is saved on this device as you go.
        </p>
      </div>

      <SettingsPanel settings={settings} onChange={updateSettings} locked={!!heats} />

      <RegistrationPanel
        surfers={surfers}
        drawn={!!heats}
        onAdd={addSurfers}
        onRemove={removeSurfer}
      />

      <section className="no-print flex flex-wrap items-center gap-3">
        {!heats ? (
          <button
            onClick={draw}
            disabled={surfers.length === 0}
            className="rounded-full bg-coral px-7 py-3 text-lg font-semibold text-white shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Draw heats ({surfers.length} {surfers.length === 1 ? "surfer" : "surfers"})
          </button>
        ) : (
          <>
            <ConfirmButton onConfirm={draw} label="Reshuffle the whole draw" />
            <ConfirmButton onConfirm={clearDraw} label="Unlock settings" subtle />
            <button
              onClick={() => window.print()}
              className="rounded-full border border-ink/20 px-5 py-2.5 font-medium hover:bg-white"
            >
              Print
            </button>
            <CopyButton text={() => drawAsText(state, names)} />
          </>
        )}
        <span className="flex-1" />
        <ConfirmButton onConfirm={resetAll} label="New event" subtle />
      </section>

      {heats && (
        <section className="space-y-5">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {settings.title}
              </h2>
              <p className="text-ink/70">
                {new Date(`${settings.date}T00:00`).toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                · {heats.length} heats · {settings.heatMinutes} min each
              </p>
            </div>
            <div className="no-print inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
              {(["schedule", "surfers"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === v ? "bg-ink text-sand" : "text-ink/70"}`}
                >
                  {v === "schedule" ? "Heats" : "Find a surfer"}
                </button>
              ))}
            </div>
          </header>

          {view === "schedule" ? (
            <Schedule heats={heats} settings={settings} names={names} />
          ) : (
            <BySurfer heats={heats} settings={settings} surfers={surfers} />
          )}
        </section>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */

function SettingsPanel({
  settings,
  onChange,
  locked,
}: {
  settings: EventSettings;
  onChange: (p: Partial<EventSettings>) => void;
  locked: boolean;
}) {
  const field =
    "mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 disabled:bg-sand";
  const num = (v: string, min: number, max: number) =>
    Math.min(max, Math.max(min, Number.parseInt(v, 10) || min));

  return (
    <details
      open={!locked}
      className="no-print rounded-2xl bg-white/70 p-5 ring-1 ring-ink/10"
    >
      <summary className="cursor-pointer font-display text-lg font-semibold">
        Event settings
        {locked && (
          <span className="ml-2 text-sm font-normal text-ink/60">
            (timing can still change)
          </span>
        )}
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="sm:col-span-3">
          <span className="text-sm font-medium">Event name</span>
          <input
            className={field}
            value={settings.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </label>
        <label>
          <span className="text-sm font-medium">Date</span>
          <input
            type="date"
            className={field}
            value={settings.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </label>
        <label>
          <span className="text-sm font-medium">First heat starts</span>
          <input
            type="time"
            className={field}
            value={settings.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
          />
        </label>
        <label>
          <span className="text-sm font-medium">Heat length (min)</span>
          <input
            type="number"
            min={5}
            max={60}
            className={field}
            value={settings.heatMinutes}
            onChange={(e) => onChange({ heatMinutes: num(e.target.value, 5, 60) })}
          />
        </label>
        <label>
          <span className="text-sm font-medium">Changeover between heats (min)</span>
          <input
            type="number"
            min={0}
            max={30}
            className={field}
            value={settings.changeoverMinutes}
            onChange={(e) => onChange({ changeoverMinutes: num(e.target.value, 0, 30) })}
          />
        </label>
        <label>
          <span className="text-sm font-medium">Max surfers per heat</span>
          <select
            className={field}
            disabled={locked}
            value={settings.maxPerHeat}
            onChange={(e) => onChange({ maxPerHeat: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Rounds (heats per surfer)</span>
          <select
            className={field}
            disabled={locked}
            value={settings.rounds}
            onChange={(e) => onChange({ rounds: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
}

/* ---------- Registration ---------- */

function RegistrationPanel({
  surfers,
  drawn,
  onAdd,
  onRemove,
}: {
  surfers: EventState["surfers"];
  drawn: boolean;
  onAdd: (names: string[]) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const duplicates = useMemo(() => {
    const seen = new Map<string, number>();
    for (const s of surfers)
      seen.set(s.name.toLowerCase(), (seen.get(s.name.toLowerCase()) ?? 0) + 1);
    return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
  }, [surfers]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd([name]);
    setName("");
    inputRef.current?.focus();
  };

  return (
    <section className="no-print rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">
          Registered <span className="text-ink/50">({surfers.length})</span>
        </h2>
        <button
          onClick={() => setShowBulk((v) => !v)}
          className="text-sm font-medium text-ocean underline-offset-4 hover:underline"
        >
          {showBulk ? "Add one at a time" : "Paste a list"}
        </button>
      </div>

      {drawn && (
        <p className="mt-2 rounded-xl bg-foam px-3 py-2 text-sm text-ocean-deep">
          The draw is set. Late arrivals are slotted into a heat with a spare bib in each
          round, without moving anyone else.
        </p>
      )}

      {showBulk ? (
        <div className="mt-4">
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={5}
            placeholder={"One name per line\nor separated by commas"}
            className="w-full rounded-xl border border-ink/15 px-3 py-2"
          />
          <button
            onClick={() => {
              onAdd(bulk.split(/[\n,]/));
              setBulk("");
              setShowBulk(false);
            }}
            className="mt-2 rounded-full bg-ink px-5 py-2 font-semibold text-sand"
          >
            Add names
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={drawn ? "Late arrival's name" : "Surfer's name"}
            autoComplete="off"
            enterKeyHint="done"
            className="min-w-0 flex-1 rounded-xl border border-ink/15 px-3 py-2.5 text-lg"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-xl bg-ink px-5 font-semibold text-sand disabled:opacity-40"
          >
            Add
          </button>
        </form>
      )}

      {surfers.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {surfers.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-1 rounded-full py-1 pl-3 pr-1 text-sm ${duplicates.has(s.name.toLowerCase()) ? "bg-sun/30 ring-1 ring-sun" : "bg-sand"}`}
              title={
                duplicates.has(s.name.toLowerCase())
                  ? "Duplicate name, add a surname initial?"
                  : undefined
              }
            >
              {s.name}
              <button
                onClick={() => onRemove(s.id)}
                aria-label={`Remove ${s.name}`}
                className="grid size-6 place-items-center rounded-full text-ink/50 hover:bg-ink/10 hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {duplicates.size > 0 && (
        <p className="mt-2 text-sm text-ink/60">
          Highlighted names appear twice. Add a surname initial so people know which heat
          is theirs.
        </p>
      )}
    </section>
  );
}

/* ---------- Draw views ---------- */

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Bib({ id, compact = false }: { id: BibId; compact?: boolean }) {
  const b = bibOf(id);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold ring-1 ring-ink/15 ${compact ? "h-6 px-2 text-xs" : "h-9 w-20 text-sm"}`}
      style={{ background: b.bg, color: b.fg }}
    >
      {b.label}
    </span>
  );
}

function Schedule({
  heats,
  settings,
  names,
}: {
  heats: Heat[];
  settings: EventSettings;
  names: Map<string, string>;
}) {
  const times = heatTimes(heats, settings);
  const now = useNow();
  const bibOrder = BIBS.map((b) => b.id) as BibId[];

  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {heats.map((h, i) => {
        const t = times[i];
        const live = now !== null && now >= t.start.getTime() && now < t.end.getTime();
        const done = now !== null && now >= t.end.getTime();
        const newRound = i === 0 || heats[i - 1].round !== h.round;
        return (
          <li key={i} className={`print-break contents`}>
            {newRound && settings.rounds > 1 && (
              <h3 className="font-display text-xl font-semibold text-ocean sm:col-span-2">
                Round {h.round}
              </h3>
            )}
            <div
              className={`rounded-2xl bg-white p-5 ring-1 transition ${live ? "ring-2 ring-coral" : "ring-ink/10"} ${done ? "opacity-55" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <p className="font-display text-2xl font-bold">Heat {i + 1}</p>
                <p className="text-sm font-medium text-ink/70">
                  {live && (
                    <span className="mr-2 rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">
                      IN THE WATER
                    </span>
                  )}
                  {formatTime(t.start)} – {formatTime(t.end)}
                </p>
              </div>
              <ul className="mt-4 space-y-2">
                {[...h.slots]
                  .sort((a, b) => bibOrder.indexOf(a.bib) - bibOrder.indexOf(b.bib))
                  .map((s) => (
                    <li key={s.surferId} className="flex items-center gap-3">
                      <Bib id={s.bib} />
                      <span className="text-lg">{names.get(s.surferId) ?? "?"}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BySurfer({
  heats,
  settings,
  surfers,
}: {
  heats: Heat[];
  settings: EventSettings;
  surfers: EventState["surfers"];
}) {
  const [q, setQ] = useState("");
  const times = heatTimes(heats, settings);
  const rows = surfers
    .filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      surfer: s,
      entries: heats
        .map((h, i) => ({ i, slot: h.slots.find((x) => x.surferId === s.id) }))
        .filter((e): e is { i: number; slot: Heat["slots"][number] } => !!e.slot),
    }));

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type your name"
        className="no-print w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg"
      />
      <ul className="mt-4 divide-y divide-ink/10 rounded-2xl bg-white ring-1 ring-ink/10">
        {rows.map(({ surfer, entries }) => (
          <li
            key={surfer.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          >
            <span className="font-semibold">{surfer.name}</span>
            <span className="flex flex-wrap gap-3">
              {entries.map(({ i, slot }) => (
                <span key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-ink/70">
                    Heat {i + 1} · {formatTime(times[i].start)}
                  </span>
                  <Bib id={slot.bib} compact />
                </span>
              ))}
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-5 py-4 text-ink/60">No one by that name.</li>
        )}
      </ul>
    </div>
  );
}

/* ---------- Small controls ---------- */

function ConfirmButton({
  onConfirm,
  label,
  subtle = false,
}: {
  onConfirm: () => void;
  label: string;
  subtle?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);

  const base = subtle
    ? "text-ink/70 hover:bg-white border border-transparent"
    : "border border-ink/20 hover:bg-white";
  return (
    <button
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
      className={`rounded-full px-5 py-2.5 font-medium ${armed ? "bg-coral text-white" : base}`}
    >
      {armed ? "Tap again to confirm" : label}
    </button>
  );
}

function CopyButton({ text }: { text: () => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked; nothing else to do.
        }
      }}
      className="rounded-full border border-ink/20 px-5 py-2.5 font-medium hover:bg-white"
    >
      {copied ? "Copied" : "Copy as text"}
    </button>
  );
}

function drawAsText(state: EventState, names: Map<string, string>): string {
  const { heats, settings } = state;
  if (!heats) return "";
  const times = heatTimes(heats, settings);
  const lines = [`${settings.title} · ${settings.date}`, ""];
  heats.forEach((h, i) => {
    if (settings.rounds > 1 && (i === 0 || heats[i - 1].round !== h.round))
      lines.push(`ROUND ${h.round}`);
    lines.push(
      `Heat ${i + 1} · ${formatTime(times[i].start)}–${formatTime(times[i].end)}`,
    );
    for (const s of h.slots)
      lines.push(`  ${bibOf(s.bib).label}: ${names.get(s.surferId)}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}
