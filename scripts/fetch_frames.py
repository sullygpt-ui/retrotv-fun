#!/usr/bin/env python3
"""
Fetch TV show frames from TMDB API.

Usage:
    TMDB_API_KEY=your_key python3 scripts/fetch_frames.py [--only SLUG ...]

Frames are written to an opaque directory per show so the image URL doesn't
give the answer away. Shows that already have all 6 frames are skipped without
an API call. Run build_rotation.py afterwards to put new shows into the puzzle
rotation.

Standard library only — no pip install.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from frame_dirs import frame_dir

API_KEY = os.environ.get("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"
IMG_BASE = "https://image.tmdb.org/t/p/w780"
FRAMES_DIR = Path(__file__).parent.parent / "public" / "frames"
SHOWS_FILE = Path(__file__).parent / "shows.json"

FRAME_COUNT = 6
# Obscure shows keep their stills in later seasons, so scan deep before giving
# up. The old limit of 4 seasons is why 11 shows came back empty.
MAX_SEASONS = 12
STILLS_PER_SEASON = 30
ENOUGH_STILLS = 24
USER_AGENT = "retrotv.fun frame fetcher (+https://retrotv.fun)"


def api(path: str, **params):
    """GET a TMDB endpoint as JSON, or None if it isn't there."""
    params["api_key"] = API_KEY
    url = f"{BASE_URL}{path}?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        if err.code == 429:
            print("  Rate limited — pausing 10s")
            time.sleep(10)
            return api(path, **{k: v for k, v in params.items() if k != "api_key"})
        print(f"  TMDB returned {err.code} for {path}")
        return None
    except urllib.error.URLError as err:
        print(f"  Request failed for {path}: {err}")
        return None


def download_image(url: str) -> bytes | None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read()
    except (urllib.error.HTTPError, urllib.error.URLError) as err:
        print(f"  Download failed: {err}")
        return None


def get_show_images(tmdb_id: int) -> list[str]:
    """Episode stills for a show, newest seasons last."""
    show = api(f"/tv/{tmdb_id}")
    if show is None:
        return []

    seasons = [s for s in show.get("seasons", []) if s["season_number"] > 0]
    stills: list[str] = []

    for season in seasons[:MAX_SEASONS]:
        number = season["season_number"]

        images = api(f"/tv/{tmdb_id}/season/{number}/images")
        time.sleep(0.25)
        if images:
            for still in images.get("stills", [])[:STILLS_PER_SEASON]:
                stills.append(still["file_path"])

        if len(stills) >= ENOUGH_STILLS:
            break

        # Season images are often empty even when episodes have stills.
        detail = api(f"/tv/{tmdb_id}/season/{number}")
        time.sleep(0.25)
        if detail:
            for episode in detail.get("episodes", []):
                if episode.get("still_path"):
                    stills.append(episode["still_path"])

        if len(stills) >= ENOUGH_STILLS:
            break

    return list(dict.fromkeys(stills))


def download_frames(show: dict) -> bool:
    """Download 6 frames for a show."""
    slug = show["slug"]
    tmdb_id = show["tmdbId"]
    name = show["name"]

    print(f"Processing: {name} (TMDB: {tmdb_id})")

    out_dir = FRAMES_DIR / frame_dir(slug)

    # Already done — don't spend API calls on it.
    if all((out_dir / f"{i}.jpg").is_file() for i in range(1, FRAME_COUNT + 1)):
        return True

    out_dir.mkdir(parents=True, exist_ok=True)

    stills = get_show_images(tmdb_id)
    if len(stills) < FRAME_COUNT:
        print(f"  Only found {len(stills)} stills, need {FRAME_COUNT}")
        return False

    step = len(stills) / FRAME_COUNT
    selected = [stills[int(i * step)] for i in range(FRAME_COUNT)]

    for i, still_path in enumerate(selected, 1):
        image = download_image(f"{IMG_BASE}{still_path}")
        if not image:
            return False
        (out_dir / f"{i}.jpg").write_bytes(image)
        time.sleep(0.25)

    print(f"  Saved {FRAME_COUNT} frames to frames/{frame_dir(slug)}/")
    return True


def main():
    if not API_KEY:
        print("Error: Set TMDB_API_KEY environment variable")
        print("Get one at https://www.themoviedb.org/settings/api")
        sys.exit(1)

    parser = argparse.ArgumentParser()
    parser.add_argument("--only", nargs="*", metavar="SLUG", help="limit to these slugs")
    args = parser.parse_args()

    shows = json.loads(SHOWS_FILE.read_text())
    if args.only:
        shows = [s for s in shows if s["slug"] in set(args.only)]

    FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    filled, failed = [], []
    for show in shows:
        if download_frames(show):
            filled.append(show["name"])
        else:
            failed.append(show["name"])
        time.sleep(0.3)

    print(f"\n{len(filled)}/{len(shows)} shows have a complete set of frames")
    if failed:
        print(f"Still short: {', '.join(failed)}")
    print("Now run: python3 scripts/build_rotation.py")


if __name__ == "__main__":
    main()
