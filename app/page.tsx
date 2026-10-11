import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Wave } from "@/components/Wave";
import { BIBS } from "@/lib/draw";
import { site } from "@/lib/site";

const crafts = [
  { name: "Longboard", note: "Nine-plus feet of glide" },
  { name: "Shortboard", note: "Snap, carve, repeat" },
  { name: "Your own body", note: "The original craft" },
  { name: "Bodyboard", note: "Belly down, no shame" },
  { name: "Foamie", note: "Soft top, big grin" },
  { name: "Mat or alaia", note: "Old-school slide" },
  { name: "An old door", note: "Yes, really" },
  { name: "Something else", note: "If it floats, bring it" },
];

const steps = [
  {
    title: "Turn up and register",
    body: "No sign-ups, no RSVPs, no entry fee. Rock up to the beach in the morning and put your name down. No categories, no divisions.",
  },
  {
    title: "Acknowledgement of Country",
    body: "Before anyone paddles out, we recognise the Traditional Custodians of the land and waters we're surfing, and pay our respects to Elders past and present.",
  },
  {
    title: "The draw and your bib",
    body: "Names go into a live draw that sorts everyone into small heats of up to four, about 25 minutes each, mixed up across the morning. Grab the bib colour you've been drawn and you're set.",
  },
  {
    title: "Paddle out and ride",
    body: "No judges, no scores, no winners. Heats just keep the lineup from getting crowded so everyone gets waves. Ride whatever you brought and cheer on whoever's out.",
  },
];

const tags = [
  "All ages",
  "All genders",
  "All abilities",
  "Any craft",
  "No judges",
  "Dogs welcome",
  "Free",
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-ocean text-sand">
        <div
          aria-hidden
          className="absolute -right-28 -top-40 size-64 rounded-full bg-sun/90 blur-[2px] sm:size-[28rem]"
        />
        <SiteHeader light />
        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-10 sm:px-6 sm:pb-36 sm:pt-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foam/80">
            {site.when}
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            {site.heroName.before}
            <br />
            <span className="text-sun">{site.heroName.highlight}</span>{" "}
            {site.heroName.after}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foam sm:text-xl">
            {site.tagline} Bring a longboard, a shortboard, an old door or just your body.
            As long as you&apos;re riding waves, you&apos;re one of us.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#how"
              className="rounded-full bg-sand px-6 py-3 font-semibold text-ink hover:bg-white"
            >
              How the day works
            </a>
            <Link
              href="/event/"
              className="rounded-full border border-sand/40 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Running a session? Draw heats
            </Link>
          </div>
        </div>
        <Wave className="absolute bottom-0 h-16 w-full text-sand sm:h-24" />
      </section>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-ink/15 bg-white/60 px-4 py-1.5 text-sm font-medium"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ride anything
          </h2>
          <p className="mt-3 max-w-2xl text-ink/75">
            That&apos;s the whole point of the name. This isn&apos;t a boardriders club,
            because you don&apos;t need a board. If it gets you sliding down a wave face,
            it counts.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {crafts.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
              >
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="mt-1 text-sm text-ink/60">{c.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-6 bg-sand-deep/60 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How the day works
            </h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="relative rounded-2xl bg-sand p-6 ring-1 ring-ink/5"
                >
                  <span className="font-display text-5xl font-extrabold text-coral/80">
                    {i + 1}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-ink/75">{s.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl bg-ink p-6 text-sand sm:flex sm:items-center sm:justify-between sm:gap-8">
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Four bibs, that&apos;s it
                </h3>
                <p className="mt-1 text-sand/75">
                  Bibs are only so people on the beach can tell who&apos;s who. Hand it
                  back when your heat&apos;s done.
                </p>
              </div>
              <div className="mt-5 flex gap-2 sm:mt-0">
                {BIBS.map((b) => (
                  <span
                    key={b.id}
                    className="grid size-14 place-items-center rounded-xl text-xs font-bold ring-1 ring-white/20"
                    style={{ background: b.bg, color: b.fg }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            The details
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {[
              ["When", site.when],
              ["Where", site.where],
              ["Cost", "Free"],
              ["Sign-ups", "None. Just turn up."],
              ["Judges", "None. Just waves."],
              ["Dogs", "Always welcome"],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-ink/15 pt-4">
                <dt className="text-sm font-semibold uppercase tracking-wider text-ocean">
                  {k}
                </dt>
                <dd className="mt-1 text-lg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-ink/75">
            Questions? Text {site.contact.name} on{" "}
            <a
              className="font-semibold underline decoration-coral underline-offset-4"
              href={`sms:${site.contact.phone.replace(/\s/g, "")}`}
            >
              {site.contact.phone}
            </a>{" "}
            or message{" "}
            <a
              className="font-semibold underline decoration-coral underline-offset-4"
              href={`https://instagram.com/${site.contact.instagram}`}
            >
              @{site.contact.instagram}
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="bg-ocean-deep py-8 text-center text-sm text-foam/70">
        {site.name} · Location and conditions shared ahead of each session
      </footer>
    </>
  );
}
