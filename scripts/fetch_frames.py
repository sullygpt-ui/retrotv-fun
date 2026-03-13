#!/usr/bin/env python3
"""
Fetch TV show frames from TMDB API.
Usage: TMDB_API_KEY=your_key python3 fetch_frames.py

Requires: pip install requests
"""

import json
import os
import sys
import time
import requests
from pathlib import Path

API_KEY = os.environ.get("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"
IMG_BASE = "https://image.tmdb.org/t/p/w780"
FRAMES_DIR = Path(__file__).parent.parent / "public" / "frames"
SHOWS_FILE = Path(__file__).parent / "shows.json"


def get_show_images(tmdb_id: int) -> list[str]:
    """Get episode stills for a TV show."""
    # First get seasons
    url = f"{BASE_URL}/tv/{tmdb_id}?api_key={API_KEY}"
    resp = requests.get(url)
    if resp.status_code != 200:
        print(f"  Failed to get show info: {resp.status_code}")
        return []

    show = resp.json()
    seasons = [s for s in show.get("seasons", []) if s["season_number"] > 0]

    stills = []
    for season in seasons[:4]:  # Check first 4 seasons
        sn = season["season_number"]
        url = f"{BASE_URL}/tv/{tmdb_id}/season/{sn}/images?api_key={API_KEY}"
        resp = requests.get(url)
        time.sleep(0.25)  # Rate limit

        if resp.status_code == 200:
            data = resp.json()
            for img in data.get("stills", [])[:20]:
                stills.append(img["file_path"])

        if len(stills) >= 12:
            break

        # Also try individual episodes
        url = f"{BASE_URL}/tv/{tmdb_id}/season/{sn}?api_key={API_KEY}"
        resp = requests.get(url)
        time.sleep(0.25)

        if resp.status_code == 200:
            episodes = resp.json().get("episodes", [])
            for ep in episodes[:10]:
                if ep.get("still_path"):
                    stills.append(ep["still_path"])

        if len(stills) >= 12:
            break

    # Deduplicate
    seen = set()
    unique = []
    for s in stills:
        if s not in seen:
            seen.add(s)
            unique.append(s)

    return unique


def download_frames(show: dict) -> bool:
    """Download 6 frames for a show."""
    slug = show["slug"]
    tmdb_id = show["tmdbId"]
    name = show["name"]

    print(f"Processing: {name} (TMDB: {tmdb_id})")

    out_dir = FRAMES_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    # Check if already done
    if all((out_dir / f"{i}.jpg").exists() for i in range(1, 7)):
        print(f"  Already have frames for {name}")
        return True

    stills = get_show_images(tmdb_id)
    if len(stills) < 6:
        print(f"  Only found {len(stills)} stills for {name}, need 6")
        return False

    # Pick 6 evenly spaced frames
    step = max(1, len(stills) // 6)
    selected = [stills[i * step] for i in range(6)]

    for i, still_path in enumerate(selected, 1):
        url = f"{IMG_BASE}{still_path}"
        resp = requests.get(url)
        if resp.status_code == 200:
            (out_dir / f"{i}.jpg").write_bytes(resp.content)
            print(f"  Downloaded frame {i}")
        else:
            print(f"  Failed to download frame {i}: {resp.status_code}")
            return False
        time.sleep(0.25)

    return True


def main():
    if not API_KEY:
        print("Error: Set TMDB_API_KEY environment variable")
        print("Get one at https://www.themoviedb.org/settings/api")
        sys.exit(1)

    with open(SHOWS_FILE) as f:
        shows = json.load(f)

    FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    successful = []
    for show in shows:
        if download_frames(show):
            successful.append(show)
        time.sleep(0.5)

    print(f"\nSuccessfully fetched frames for {len(successful)}/{len(shows)} shows")

    # Generate puzzles.json
    puzzles = []
    from datetime import date, timedelta
    start_date = date(2026, 3, 13)

    for i, show in enumerate(successful):
        puzzle_date = start_date + timedelta(days=i)
        puzzles.append({
            "id": i + 1,
            "date": puzzle_date.isoformat(),
            "showName": show["name"],
            "showSlug": show["slug"],
            "tmdbId": show["tmdbId"],
            "frames": [f"/frames/{show['slug']}/{j}.jpg" for j in range(1, 7)]
        })

    output = Path(__file__).parent.parent / "public" / "puzzles.json"
    with open(output, "w") as f:
        json.dump(puzzles, f, indent=2)

    print(f"Generated {len(puzzles)} puzzles in puzzles.json")


if __name__ == "__main__":
    main()
