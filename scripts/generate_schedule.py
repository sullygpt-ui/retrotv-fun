#!/usr/bin/env python3
"""
Generate a puzzle schedule from available frames.
Usage: python3 generate_schedule.py [start_date] [--shuffle]

Scans public/frames/ for shows that have all 6 frames,
then generates a puzzles.json schedule starting from the given date.
"""

import json
import os
import random
import sys
from datetime import date, timedelta
from pathlib import Path

FRAMES_DIR = Path(__file__).parent.parent / "public" / "frames"
SHOWS_FILE = Path(__file__).parent / "shows.json"
OUTPUT = Path(__file__).parent.parent / "public" / "puzzles.json"


def main():
    start_date = date(2026, 3, 13)
    shuffle = "--shuffle" in sys.argv

    if len(sys.argv) > 1 and sys.argv[1] != "--shuffle":
        start_date = date.fromisoformat(sys.argv[1])

    with open(SHOWS_FILE) as f:
        shows = json.load(f)

    # Filter to shows that have all 6 frames
    available = []
    for show in shows:
        slug = show["slug"]
        show_dir = FRAMES_DIR / slug
        if show_dir.exists() and all((show_dir / f"{i}.jpg").exists() for i in range(1, 7)):
            available.append(show)

    if not available:
        print("No shows with complete frames found!")
        print(f"Run fetch_frames.py first, or place frames in {FRAMES_DIR}/{{slug}}/1-6.jpg")
        sys.exit(1)

    if shuffle:
        random.shuffle(available)

    puzzles = []
    for i, show in enumerate(available):
        puzzle_date = start_date + timedelta(days=i)
        puzzles.append({
            "id": i + 1,
            "date": puzzle_date.isoformat(),
            "showName": show["name"],
            "showSlug": show["slug"],
            "tmdbId": show["tmdbId"],
            "frames": [f"/frames/{show['slug']}/{j}.jpg" for j in range(1, 7)]
        })

    with open(OUTPUT, "w") as f:
        json.dump(puzzles, f, indent=2)

    print(f"Generated {len(puzzles)} puzzles starting from {start_date}")
    print(f"Written to {OUTPUT}")
    for p in puzzles[:5]:
        print(f"  {p['date']}: {p['showName']}")
    if len(puzzles) > 5:
        print(f"  ... and {len(puzzles) - 5} more")


if __name__ == "__main__":
    main()
