# 📺 RetroTV.fun

A daily TV show guessing game for classic 70s & 80s television. Like Framed, but
for the golden age of TV.

Live at **[retrotv.fun](https://retrotv.fun)**.

## How to Play

1. You get 6 frames from a classic TV show, starting zoomed far in
2. Guess which show it is — each wrong guess (or skip) reveals the next frame
3. Share your results with friends

## How puzzles are scheduled

Puzzles are **derived from the date**, not read from a fixed calendar: day `N`
since launch shows `rotation[N % rotation.length]`, so the game can never run
out. Day 0 is `EPOCH` (2026-03-13) and is puzzle #1.

`src/data/rotation.json` is therefore history — puzzle numbers key players'
saved games, so its order must not be rearranged. `build_rotation.py` preserves
the existing order and only appends new shows.

Two things stay off the client:

- **The answer.** Pages ship a SHA-256 of the normalized title; the browser
  hashes each guess to check it, and `/api/reveal/[date]` hands over the title
  only once the game is over (and refuses future dates).
- **The frame URLs.** Frames live in opaque directories, because
  `/frames/battlestar-galactica/1.jpg` would answer the puzzle for anyone who
  opened DevTools. See `scripts/frame_dirs.py`.

## Development

```bash
npm install
npm run dev        # http://localhost:3000

npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run build
```

## Adding shows

Shows come from TMDB. `scripts/shows.json` is the master list — it also feeds
the guess autocomplete, so every answer is guaranteed to be typeable.

The TMDB key comes from the environment — never commit it. Put it in
`.env.local` (gitignored) and load it:

```bash
set -a; . ./.env.local; set +a    # TMDB_API_KEY=...
```

```bash
# TMDB (needs a free v3 API key from themoviedb.org/settings/api)
python3 scripts/discover_shows.py          # find candidates (optional)
python3 scripts/fetch_frames.py            # 6 frames per show from TMDB
python3 scripts/fetch_frames.py --only some-slug other-slug

# TVmaze fallback (no key, no dependencies, CC BY-SA 4.0)
python3 scripts/fetch_frames_tvmaze.py     # fills what TMDB couldn't
python3 scripts/fetch_frames_tvmaze.py --dry-run   # report matches only

python3 scripts/build_rotation.py          # add complete shows to the rotation
npm run check:site                        # check the live site end to end
```

`discover_shows.py` reports by default and only writes with `--add`. A candidate
has to air in 1970-1989, not already be in the library (matched on TMDB id *and*
normalized title, so "The Transformers" can't land beside "Transformers"), and
have at least 6 episode stills. Its findings are kept in `candidates.json`,
including what was rejected and why.

`build_rotation.py` reports which shows still have no frames (9 of 375) and
appends a `schedule.json` segment when the pool grows.

Those 7 — Good Times, Webster, Mr. Belvedere, Head of the Class, 227, Land of
the Lost and Trapper John, M.D. — have no usable source yet. TMDB returns zero
episode stills for six of them (two for Webster) even scanning 12 seasons, and
TVmaze has fewer than six. TMDB *backdrops* exist but are promotional art that
often carries the show's logo, which would give the puzzle away. TheTVDB is the
next source worth trying.

`discover_shows.py` selects on *episode* air dates, not the premiere date:
filtering on first_air_date threw away every show that started in the late 60s
and ran deep into the 70s — Bewitched, Hogan's Heroes, Mission: Impossible,
The Brady Bunch. It rejects documentary/news/reality/talk genres and anything
still in production, whose stills would post-date the era being guessed.

Shows are also dropped by hand on fairness grounds. The test is ambiguity, not
obscurity: a second Heathcliff, a third Ghostbusters, or Josie and the
Pussycats in Outer Space alongside Josie and the Pussycats makes a
correct-feeling guess wrong, which is worse than a hard puzzle. Compare each
candidate title against the library and against the other candidates before
adding a batch.

### Why schedule.json exists

A puzzle is `rotation[day % poolSize]`, so growing the pool would change every
later day — reassigning puzzles people have already played and archive pages
that are already indexed. `src/data/schedule.json` records the pool size from
the day it takes effect, so new shows only appear from the next day onward.

Each segment walks the pool in order from its `startIndex` and wraps, so the
only real choice is where the seam between cycles falls. `build_rotation.py`
writes two future segments: one that debuts shows nobody has seen yet, and one
flagged `resume` that picks up afterwards at whichever show has gone longest
unseen. Resuming at index 0 instead would bring back the tail of the retired
190-day pool after 102 days; the chosen seam stretches that to 206. Everything
ahead of today is recomputed on each run and checked day by day against the old
schedule, so the script refuses to write a plan that would move a puzzle
somebody has already played.

### What runs on a schedule

`.github/workflows/site-check.yml` runs `scripts/site_check.py` against
retrotv.fun every morning, and resubmits the sitemap to IndexNow on Mondays. CI
only proves the code builds; this proves the site is serving a puzzle. Every
check in it corresponds to a bug that shipped at least once:

| Check | What it caught before |
| --- | --- |
| Today's puzzle resolves | A schedule that ran out and served one puzzle for 42 days |
| Every sitemap URL returns 200 | 9 genre URLs that 404'd the day the sitemap was submitted |
| Every internal link returns 200 | Show pages linking to genre routes that never existed |
| `/archive/<today>` has no answer | The archive reveal is one comparison away from spoiling the daily |
| Repeat gap stays above 120 days | The pool wrapping back onto recently played shows |

A failed run emails the repo owner. Run it by hand with `npm run check:site`,
or against a dev server with `--base http://localhost:3000`.

### Attribution

TMDB requires the notice "This product uses the TMDB API but is not endorsed or
certified by TMDB" and TVmaze is CC BY-SA 4.0 with attribution. Both are on the
[About page](src/app/about/page.tsx) — keep them there.

Note that TMDB's free key is for non-commercial use; the site carries affiliate
links, so check with TMDB before leaning on it further. TVmaze's licence
permits commercial use.

## Tech Stack

- 366 shows in the rotation, out of 375 in the guess list
- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS 4
- Vitest for the scheduling, matching and stats logic
- Vercel Analytics + Speed Insights
- Deployed on Vercel
