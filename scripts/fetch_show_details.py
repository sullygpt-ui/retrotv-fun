#!/usr/bin/env python3
"""
Fill src/data/shows-detail.json from TMDB.

Show pages, the sitemap and the decade/genre pages all read this file. Shows
already in it are skipped, so this is safe to re-run after adding to shows.json.
It replaces the three one-off fetch_show_details_batch*.py scripts.

Usage:
    python3 scripts/fetch_show_details.py [--refresh]
"""

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from tmdb_key import require_api_key

API_KEY = require_api_key()
BASE = "https://api.themoviedb.org/3"
SHOWS_FILE = Path(__file__).parent / "shows.json"
DETAIL_FILE = Path(__file__).parent.parent / "src" / "data" / "shows-detail.json"
USER_AGENT = "retrotv.fun detail fetcher (+https://retrotv.fun)"


def api(path: str):
    url = f"{BASE}{path}?" + urllib.parse.urlencode({"api_key": API_KEY})
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        if err.code == 429:
            time.sleep(10)
            return api(path)
        print(f"  TMDB returned {err.code}")
        return None
    except urllib.error.URLError as err:
        print(f"  Request failed: {err}")
        return None


def detail_for(show: dict) -> dict | None:
    data = api(f"/tv/{show['tmdbId']}")
    if data is None:
        return None
    return {
        "name": show["name"],
        "slug": show["slug"],
        "tmdbId": show["tmdbId"],
        "overview": data.get("overview", ""),
        "first_air_date": data.get("first_air_date", "") or "",
        "last_air_date": data.get("last_air_date", "") or "",
        "number_of_seasons": data.get("number_of_seasons", 0) or 0,
        "number_of_episodes": data.get("number_of_episodes", 0) or 0,
        "genres": [g["name"] for g in data.get("genres", [])],
        "networks": [n["name"] for n in data.get("networks", [])],
        "vote_average": data.get("vote_average", 0) or 0,
        "poster_path": data.get("poster_path", "") or "",
        "backdrop_path": data.get("backdrop_path", "") or "",
        "created_by": [c["name"] for c in data.get("created_by", [])],
        "tagline": data.get("tagline", "") or "",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="re-fetch shows already present")
    args = parser.parse_args()

    shows = json.loads(SHOWS_FILE.read_text())
    details = json.loads(DETAIL_FILE.read_text()) if DETAIL_FILE.exists() else []
    by_slug = {d["slug"]: d for d in details}

    todo = shows if args.refresh else [s for s in shows if s["slug"] not in by_slug]
    if not todo:
        print(f"shows-detail.json already covers all {len(shows)} shows.")
        return

    print(f"Fetching details for {len(todo)} show(s)...")
    failed = []
    for i, show in enumerate(todo, 1):
        detail = detail_for(show)
        if detail is None:
            print(f"[{i}/{len(todo)}] {show['name']} — FAILED")
            failed.append(show["name"])
        else:
            by_slug[show["slug"]] = detail
            print(f"[{i}/{len(todo)}] {show['name']} — {detail['first_air_date'][:4] or '?'}")
        time.sleep(0.25)

    # Keep the file in shows.json order so diffs stay readable.
    ordered = [by_slug[s["slug"]] for s in shows if s["slug"] in by_slug]
    DETAIL_FILE.write_text(json.dumps(ordered, indent=2, ensure_ascii=False) + "\n")
    print(f"\nshows-detail.json now has {len(ordered)} entries")
    if failed:
        print(f"Failed: {', '.join(failed)}")


if __name__ == "__main__":
    main()
