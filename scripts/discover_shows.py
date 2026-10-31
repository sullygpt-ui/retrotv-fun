#!/usr/bin/env python3
"""
Find 70s/80s shows that aren't in the library yet and have frames available.

Reports by default; only writes to shows.json with --add. A candidate has to
clear three bars:

  * aired in the era (first air date 1970-1989, original language English)
  * not already in shows.json — matched on TMDB id *and* on normalized title,
    so "The Transformers" doesn't slip in next to "Transformers" and collide in
    the guess autocomplete
  * at least 6 episode stills on TMDB, checked the same way fetch_frames.py
    collects them, so an added show can actually be turned into a puzzle

Usage:
    python3 scripts/discover_shows.py                     # report only
    python3 scripts/discover_shows.py --add --limit 40     # append to shows.json
    python3 scripts/discover_shows.py --min-votes 50       # raise the bar

Then: fetch_frames.py -> fetch_show_details.py -> build_rotation.py
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

from tmdb_key import require_api_key

API_KEY = require_api_key()
BASE = "https://api.themoviedb.org/3"
SHOWS_FILE = Path(__file__).parent / "shows.json"
CANDIDATES_FILE = Path(__file__).parent / "candidates.json"

ERA = (1970, 1989)
FRAME_COUNT = 6
MAX_SEASONS = 12
# Documentary, News, Reality and Talk make poor guessing puzzles: a frame of a
# presenter or of stock footage identifies nothing.
SKIP_GENRES = {99, 10763, 10764, 10767}
# A show still in production has stills that post-date the era being guessed —
# Neighbours and Postman Pat look nothing today like they did in 1985.
LAST_AIR_CUTOFF = 1995
USER_AGENT = "retrotv.fun show discovery (+https://retrotv.fun)"


def api(path: str, params: dict | None = None):
    query = dict(params or {})
    query["api_key"] = API_KEY
    url = f"{BASE}{path}?" + urllib.parse.urlencode(query)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        if err.code == 429:
            time.sleep(10)
            return api(path, params)
        return None
    except urllib.error.URLError:
        return None


def normalize(title: str) -> str:
    """Mirror of normalizeTitle() in src/lib/matching.ts."""
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


def make_slug(name: str) -> str:
    slug = normalize(name).replace(" ", "-")
    return re.sub(r"-+", "-", slug).strip("-")


def inspect(tmdb_id: int, needed: int = FRAME_COUNT) -> tuple[int, dict | None]:
    """
    Episode stills available, stopping once there are enough, plus the show
    record the count came from.

    The detail call is the same one the still count needs, so the era and
    production-status checks ride along on it rather than costing a request of
    their own.
    """
    show = api(f"/tv/{tmdb_id}")
    if not show:
        return 0, None

    stills = 0
    for season in [s for s in show.get("seasons", []) if s["season_number"] > 0][:MAX_SEASONS]:
        number = season["season_number"]

        images = api(f"/tv/{tmdb_id}/season/{number}/images")
        time.sleep(0.2)
        if images:
            stills += len(images.get("stills", []))
        if stills >= needed:
            return stills, show

        detail = api(f"/tv/{tmdb_id}/season/{number}")
        time.sleep(0.2)
        if detail:
            stills += sum(1 for ep in detail.get("episodes", []) if ep.get("still_path"))
        if stills >= needed:
            return stills, show

    return stills, show


def discover() -> list[dict]:
    """
    Era shows from TMDB, most-voted first.

    Selected on *episode* air dates rather than the premiere date: Bewitched,
    Hogan's Heroes, Mission: Impossible and The Brady Bunch all started in the
    late 60s and ran well into the 70s, and filtering on first_air_date alone
    threw away every one of them.
    """
    found: dict[int, dict] = {}
    for year in range(ERA[0], ERA[1] + 1):
        for page in range(1, 6):
            data = api(
                "/discover/tv",
                {
                    "air_date.gte": f"{year}-01-01",
                    "air_date.lte": f"{year}-12-31",
                    "first_air_date.lte": f"{ERA[1]}-12-31",
                    "sort_by": "vote_count.desc",
                    "with_original_language": "en",
                    "vote_count.gte": "5",
                    "page": str(page),
                },
            )
            time.sleep(0.2)
            if not data:
                continue
            for show in data.get("results", []):
                if show["id"] in found:
                    continue
                if SKIP_GENRES & set(show.get("genre_ids", [])):
                    continue
                found[show["id"]] = {
                    "name": show["name"],
                    "tmdbId": show["id"],
                    "slug": make_slug(show["name"]),
                    "year": (show.get("first_air_date") or "")[:4],
                    "votes": show.get("vote_count", 0),
                    "rating": show.get("vote_average", 0),
                }
            if data.get("page", 1) >= data.get("total_pages", 1):
                break
    return sorted(found.values(), key=lambda s: s["votes"], reverse=True)


def era_verdict(detail: dict) -> str | None:
    """Why this show is a bad puzzle, or None if it is a good one."""
    if {g["id"] for g in detail.get("genres", [])} & SKIP_GENRES:
        return "documentary/news/reality/talk"

    last = (detail.get("last_air_date") or "")[:4]
    if last.isdigit() and int(last) > LAST_AIR_CUTOFF:
        return f"still running in {last}"
    if detail.get("status") in {"Returning Series", "In Production"}:
        return "still in production"

    first = (detail.get("first_air_date") or "")[:4]
    if first.isdigit() and int(first) > ERA[1]:
        return f"premiered {first}"
    if last.isdigit() and int(last) < ERA[0]:
        return f"ended {last}"
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--add", action="store_true", help="append accepted shows to shows.json")
    parser.add_argument("--limit", type=int, default=40, help="max shows to accept")
    parser.add_argument("--min-votes", type=int, default=20, help="minimum TMDB vote count")
    parser.add_argument("--check", type=int, default=200, help="how many candidates to check for stills")
    args = parser.parse_args()

    existing = json.loads(SHOWS_FILE.read_text())
    have_ids = {s["tmdbId"] for s in existing}
    have_keys = {normalize(s["name"]) for s in existing}
    have_slugs = {s["slug"] for s in existing}

    print(f"Library has {len(existing)} shows. Searching TMDB {ERA[0]}-{ERA[1]}...")
    candidates = discover()
    print(f"{len(candidates)} era shows on TMDB")

    fresh = [
        c
        for c in candidates
        if c["tmdbId"] not in have_ids
        and normalize(c["name"]) not in have_keys
        and c["votes"] >= args.min_votes
    ]
    print(f"{len(fresh)} not already in the library with >={args.min_votes} votes")
    print(f"Checking the top {min(args.check, len(fresh))} for episode stills...\n")

    accepted, rejected = [], []
    for candidate in fresh[: args.check]:
        if len(accepted) >= args.limit:
            break
        stills, detail = inspect(candidate["tmdbId"])
        label = f"{candidate['name']} ({candidate['year']}, {candidate['votes']} votes)"

        reason = era_verdict(detail) if detail else "no TMDB record"
        if reason is None and stills < FRAME_COUNT:
            reason = f"only {stills} stills"
        if reason:
            candidate["reason"] = reason
            rejected.append(candidate)
            print(f"  ✗  {label} — {reason}")
            continue

        slug = candidate["slug"]
        if slug in have_slugs:
            slug = f"{slug}-{candidate['year']}"
        candidate["slug"] = slug
        have_slugs.add(slug)
        candidate["stills"] = stills
        candidate["lastAired"] = (detail.get("last_air_date") or "")[:4]
        accepted.append(candidate)
        print(f"  ✅ {label} — {stills}+ stills")

    CANDIDATES_FILE.write_text(json.dumps({"accepted": accepted, "rejected": rejected}, indent=2) + "\n")
    print(f"\n{len(accepted)} accepted, {len(rejected)} rejected (written to candidates.json)")

    if not args.add:
        print("Report only — re-run with --add to append these to shows.json")
        return

    existing.extend({"name": c["name"], "tmdbId": c["tmdbId"], "slug": c["slug"]} for c in accepted)
    SHOWS_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n")
    print(f"shows.json now has {len(existing)} shows")
    print("Next: fetch_frames.py -> fetch_show_details.py -> build_rotation.py")


if __name__ == "__main__":
    main()
