# Sunshine Coast Waveriders Club

A small Next.js (App Router, TypeScript) site for a free, judge-free, ride-anything surf
gathering on the Sunshine Coast, plus the beach-side heat draw tool in the same app.

- `/` is the club landing page: what it is, ride anything, how the day works, details.
- `/event` is the draw tool: register names one at a time (or paste a list), draw heats
  of up to four with Red / White / Yellow / Blue bibs, ~25 min heats, multiple rounds.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run format     # Prettier
npm run lint
```

## Where things live

| File                          | What it does                                                 |
| ----------------------------- | ------------------------------------------------------------ |
| `lib/site.ts`                 | Club name, tagline, when/where, contact. Rename here.        |
| `lib/draw.ts`                 | Pure draw logic: heat sizing, shuffling, bibs, late entries. |
| `components/EventBuilder.tsx` | The `/event` UI (client component, saved to localStorage).   |
| `app/page.tsx`                | Landing page.                                                |

## Announcing a session

Set `nextEvent` in `lib/site.ts` (date, time, beach) and push. The landing page shows it
in the hero. Set it back to `null` afterwards and the site says "to be announced".

## How the draw works

- Each round, every surfer gets one heat. Heats are as even as possible
  (9 surfers → 3/3/3, not 4/4/1).
- Each round is picked from 400 random shuffles, preferring people you haven't surfed with
  yet and avoiding back-to-back heats across rounds.
- Bib colours are random per heat.
- After the draw, late arrivals are slotted into the smallest heat with a spare bib in each
  round without moving anyone; removing someone closes the gap and later heats move up.
- Heat length, changeover and start time can change after the draw; times recalc.
- "In the water" highlights the live heat when the event date is today.
- Everything is saved in the browser on that device. No server, no accounts.

## Environment variables

Next.js loads `.env*` files itself. `dotenv` is installed for any standalone Node scripts
you add later (`import "dotenv/config"`). See `.env.example`.

- `NEXT_PUBLIC_BASE_PATH`: sub-path for GitHub Pages, e.g. `/waveriders`.

## Deploying

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`
(set Pages source to "GitHub Actions" in the repo settings). The base path is picked up
automatically.
