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
# Get a TMDB API key from https://www.themoviedb.org/settings/api
export TMDB_API_KEY=your_key_here
pip install requests

python3 scripts/discover_shows.py          # find candidates (optional)
python3 scripts/fetch_frames.py            # download 6 frames per show
python3 scripts/build_rotation.py          # add complete shows to the rotation
```

`build_rotation.py` reports which shows still have no frames; 11 are currently
missing.

## Tech Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS 4
- Vitest for the scheduling, matching and stats logic
- Vercel Analytics + Speed Insights
- Deployed on Vercel
