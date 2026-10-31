#!/usr/bin/env python3
"""
Fetch frames from TVmaze for shows TMDB couldn't fill.

TVmaze needs no API key and its data is CC BY-SA 4.0, which permits commercial
use with attribution — so it's the fallback when fetch_frames.py comes up short.
Run it after fetch_frames.py and before build_rotation.py:

    python3 scripts/fetch_frames_tvmaze.py
    python3 scripts/build_rotation.py

Matching is the risky part. TVmaze's singlesearch endpoint answers "227" with
'22/7', a 2020 anime, so a candidate is only accepted when its normalized name
matches and it first aired inside the era this game covers. Accepted matches are
recorded in tvmaze_ids.json so later runs reuse a reviewed decision instead of
searching again.

Usage:
    python3 scripts/fetch_frames_tvmaze.py [--only SLUG ...] [--dry-run]

Standard library only — no pip install, no API key.
"""

import argparse
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from frame_dirs import frame_dir

ROOT = Path(__file__).parent.parent
FRAMES_DIR = ROOT / "public" / "frames"
SHOWS_FILE = Path(__file__).parent / "shows.json"
IDS_FILE = Path(__file__).parent / "tvmaze_ids.json"

API = "https://api.tvmaze.com"
# TVmaze asks for at most 20 calls per 10 seconds per IP.
THROTTLE = 0.6
FRAME_COUNT = 6
# The game is 70s/80s TV; a candidate premiering outside this window is a
# different show that happens to share a title.
ERA = (1965, 1995)

USER_AGENT = "retrotv.fun frame fetcher (+https://retrotv.fun)"


def normalize(title: str) -> str:
    """Mirror of normalizeTitle() in src/lib/matching.ts, for match checking."""
    text = unicodedata.normalize("NFD", title)
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"['’‘]", "", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\b(?:[a-z0-9] )+[a-z0-9]\b", lambda m: m.group(0).replace(" ", ""), text)
    while True:
        stripped = re.sub(r"^(the|a|an) ", "", text)
        if stripped == text or not stripped:
            return text
        text = stripped


def fetch(url: str, timeout: int = 20) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def get(path: str, **params):
    """GET a TVmaze endpoint as JSON. None for 404; backs off on 429."""
    url = f"{API}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    try:
        body = fetch(url)
    except urllib.error.HTTPError as err:
        if err.code == 404:
            time.sleep(THROTTLE)
            return None
        if err.code == 429:
            print("  Rate limited — pausing 10s")
            time.sleep(10)
            return get(path, **params)
        raise
    finally:
        time.sleep(THROTTLE)
    return json.loads(body)


def has_frames(slug: str) -> bool:
    directory = FRAMES_DIR / frame_dir(slug)
    return directory.is_dir() and all(
        (directory / f"{i}.jpg").is_file() for i in range(1, FRAME_COUNT + 1)
    )


def find_show(name: str) -> dict | None:
    """Best TVmaze match for a show name, or None if nothing is convincing."""
    results = get("/search/shows", q=name) or []
    target = normalize(name)

    for result in results:
        show = result["show"]
        if normalize(show["name"]) != target:
            continue
        premiered = (show.get("premiered") or "")[:4]
        if not premiered.isdigit() or not ERA[0] <= int(premiered) <= ERA[1]:
            print(f"  Rejected {show['name']!r} ({premiered or 'no date'}) — outside {ERA[0]}-{ERA[1]}")
            continue
        return show

    return None


def pick_stills(show_id: int) -> list[str]:
    """Six evenly spaced episode stills, earliest episodes first."""
    episodes = get(f"/shows/{show_id}/episodes") or []
    stills = [
        (ep.get("image") or {}).get("original")
        for ep in episodes
        if (ep.get("image") or {}).get("original")
    ]
    stills = list(dict.fromkeys(stills))
    if len(stills) < FRAME_COUNT:
        return []

    step = len(stills) / FRAME_COUNT
    return [stills[int(i * step)] for i in range(FRAME_COUNT)]


def download(slug: str, urls: list[str]) -> bool:
    out_dir = FRAMES_DIR / frame_dir(slug)
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, url in enumerate(urls, 1):
        try:
            image = fetch(url, timeout=30)
        except (urllib.error.HTTPError, urllib.error.URLError) as err:
            print(f"  Failed to download frame {i}: {err}")
            return False
        if not image:
            print(f"  Frame {i} came back empty")
            return False
        (out_dir / f"{i}.jpg").write_bytes(image)
        time.sleep(0.2)
    print(f"  Saved {FRAME_COUNT} frames to frames/{frame_dir(slug)}/")
    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", nargs="*", metavar="SLUG", help="limit to these slugs")
    parser.add_argument("--dry-run", action="store_true", help="report matches, download nothing")
    args = parser.parse_args()

    shows = json.loads(SHOWS_FILE.read_text())
    known_ids = json.loads(IDS_FILE.read_text()) if IDS_FILE.exists() else {}

    todo = [s for s in shows if not has_frames(s["slug"])]
    if args.only:
        todo = [s for s in todo if s["slug"] in set(args.only)]

    if not todo:
        print("Every show already has a complete set of frames.")
        return

    print(f"{len(todo)} show(s) without frames\n")
    filled, unmatched, too_few = [], [], []

    for show in todo:
        slug, name = show["slug"], show["name"]
        print(f"{name}")

        tvmaze_id = known_ids.get(slug)
        if tvmaze_id is None:
            match = find_show(name)
            if match is None:
                print("  No convincing match on TVmaze")
                unmatched.append(name)
                continue
            tvmaze_id = match["id"]
            print(f"  Matched {match['name']!r} ({(match.get('premiered') or '?')[:4]}) id={tvmaze_id}")
            known_ids[slug] = tvmaze_id
        else:
            print(f"  Using recorded TVmaze id {tvmaze_id}")

        stills = pick_stills(tvmaze_id)
        if not stills:
            print(f"  Fewer than {FRAME_COUNT} episode stills available")
            too_few.append(name)
            continue

        if args.dry_run:
            print(f"  Would download {len(stills)} frames")
            filled.append(name)
            continue

        if download(slug, stills):
            filled.append(name)
        else:
            too_few.append(name)

    if not args.dry_run and known_ids:
        IDS_FILE.write_text(json.dumps(known_ids, indent=2, sort_keys=True) + "\n")

    print(f"\nFilled {len(filled)}/{len(todo)}")
    if filled:
        print(f"  Got frames: {', '.join(filled)}")
    if too_few:
        print(f"  Too few stills on TVmaze: {', '.join(too_few)}")
    if unmatched:
        print(f"  Not found on TVmaze: {', '.join(unmatched)}")
    if filled and not args.dry_run:
        print("\nNow run: python3 scripts/build_rotation.py")
        print("TVmaze data is CC BY-SA 4.0 — keep the credit on the About page.")


if __name__ == "__main__":
    main()
