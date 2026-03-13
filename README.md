# 📺 RetroTV.fun

A daily TV show guessing game for classic 70s & 80s shows. Like Framed, but for the golden age of television.

## How to Play

1. You get 6 frames from a classic TV show
2. Guess which show it is — each wrong guess reveals the next frame
3. Share your results with friends!

## Development

```bash
npm install
npm run dev
```

## Fetching Real Frames

```bash
# Get a TMDB API key from https://www.themoviedb.org/settings/api
export TMDB_API_KEY=your_key_here

# Fetch frames for all shows
pip install requests Pillow
python3 scripts/fetch_frames.py

# Generate puzzle schedule
python3 scripts/generate_schedule.py 2026-03-13 --shuffle
```

## Deploy to Vercel

```bash
npx vercel
```

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Deployed on Vercel
