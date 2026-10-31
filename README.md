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

```bash
# TMDB (needs a free v3 API key from themoviedb.org/settings/api)
export TMDB_API_KEY=your_key_here
pip install requests
python3 scripts/discover_shows.py          # find candidates (optional)
python3 scripts/fetch_frames.py            # 6 frames per show from TMDB

# TVmaze fallback (no key, no dependencies, CC BY-SA 4.0)
python3 scripts/fetch_frames_tvmaze.py     # fills what TMDB couldn't
python3 scripts/fetch_frames_tvmaze.py --dry-run   # report matches only

python3 scripts/build_rotation.py          # add complete shows to the rotation
```

`build_rotation.py` reports which shows still have no frames (7 currently) and
appends a `schedule.json` segment when the pool grows.

### Why schedule.json exists

A puzzle is `rotation[day % poolSize]`, so growing the pool would change every
later day — reassigning puzzles people have already played and archive pages
that are already indexed. `src/data/schedule.json` records the pool size from
the day it takes effect, so new shows only appear from the next day onward.

### Attribution

TMDB requires the notice "This product uses the TMDB API but is not endorsed or
certified by TMDB" and TVmaze is CC BY-SA 4.0 with attribution. Both are on the
[About page](src/app/about/page.tsx) — keep them there.

Note that TMDB's free key is for non-commercial use; the site carries affiliate
links, so check with TMDB before leaning on it further. TVmaze's licence
permits commercial use.

## Tech Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS 4
- Vitest for the scheduling, matching and stats logic
- Vercel Analytics + Speed Insights
- Deployed on Vercel
