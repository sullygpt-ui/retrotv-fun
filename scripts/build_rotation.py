#!/usr/bin/env python3
"""
Build the puzzle rotation from the frames on disk.

Usage: python3 scripts/build_rotation.py [--shuffle-new]

The rotation is an ordered list, not a calendar: the site maps day N since
launch to rotation[N % len(rotation)], so it never runs out of puzzles. That
also means the existing order is history — puzzle numbers key players' saved
games — so this script preserves the current order and only appends shows that
aren't in it yet.

Growing the pool changes `day % poolSize` for every later day, which would
reassign puzzles people have already played and archive pages that are already
indexed. So schedule.json records the pool size from the day it takes effect,
and this script appends a segment starting tomorrow whenever the pool changes.

It also moves any frames still sitting in a slug-named directory into their
opaque directory (see frame_dirs.py).
"""

import json
import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from frame_dirs import frame_dir

ROOT = Path(__file__).parent.parent
FRAMES_DIR = ROOT / "public" / "frames"
SHOWS_FILE = Path(__file__).parent / "shows.json"
ROTATION_FILE = ROOT / "src" / "data" / "rotation.json"
SCHEDULE_FILE = ROOT / "src" / "data" / "schedule.json"

FRAME_COUNT = 6
# Must match EPOCH in src/lib/rotation.ts.
EPOCH = date(2026, 3, 13)


def has_frames(directory: Path) -> bool:
    return directory.is_dir() and all((directory / f"{i}.jpg").is_file() for i in range(1, FRAME_COUNT + 1))


def migrate_slug_dirs(shows: list[dict]) -> int:
    """Rename public/frames/<slug>/ to public/frames/<token>/."""
    moved = 0
    for show in shows:
        legacy = FRAMES_DIR / show["slug"]
        target = FRAMES_DIR / frame_dir(show["slug"])
        if has_frames(legacy) and not has_frames(target):
            legacy.rename(target)
            moved += 1
        elif legacy.is_dir() and has_frames(target):
            for leftover in sorted(legacy.iterdir()):
                leftover.unlink()
            legacy.rmdir()
    return moved


def update_schedule(pool_size: int, first_new_index: int) -> None:
    """
    Record the new pool size, effective tomorrow, if the pool changed.

    startIndex points at the first newly added show so the new batch debuts
    tomorrow instead of waiting out the rest of the current cycle.
    """
    segments = json.loads(SCHEDULE_FILE.read_text()) if SCHEDULE_FILE.exists() else []
    if segments and segments[-1]["poolSize"] == pool_size:
        return

    # Puzzles roll over at UTC midnight, so "tomorrow" is a UTC day.
    today_utc = datetime.now(timezone.utc).date()
    from_day = max((today_utc - EPOCH + timedelta(days=1)).days, 0)
    start_index = first_new_index % pool_size

    # A segment added earlier today hasn't taken effect yet, so replace it
    # rather than stacking a second one on the same day — but keep its
    # startIndex, which already points at the first show never aired. Taking the
    # newer one would skip past the batch that segment was about to debut.
    if segments and segments[-1]["fromDay"] >= from_day:
        start_index = min(start_index, segments[-1]["startIndex"])
        segments[-1] = {"fromDay": from_day, "poolSize": pool_size, "startIndex": start_index}
    else:
        segments.append({"fromDay": from_day, "poolSize": pool_size, "startIndex": start_index})

    SCHEDULE_FILE.write_text(json.dumps(segments, indent=2) + "\n")
    previous = segments[-2]["poolSize"] if len(segments) > 1 else 0
    print(
        f"Schedule: pool {previous} -> {pool_size} from day {from_day} (tomorrow), "
        f"debuting at index {start_index}"
    )


def main() -> None:
    shuffle_new = "--shuffle-new" in sys.argv

    shows = json.loads(SHOWS_FILE.read_text())
    by_slug = {show["slug"]: show for show in shows}

    moved = migrate_slug_dirs(shows)
    if moved:
        print(f"Moved {moved} frame directories to opaque names")

    existing = json.loads(ROTATION_FILE.read_text()) if ROTATION_FILE.exists() else []

    rotation = []
    seen = set()
    dropped = []
    for entry in existing:
        slug = entry["showSlug"]
        show = by_slug.get(slug)
        if show is None or not has_frames(FRAMES_DIR / frame_dir(slug)):
            dropped.append(slug)
            continue
        rotation.append(
            {
                "showName": show["name"],
                "showSlug": slug,
                "tmdbId": show["tmdbId"],
                "frameDir": frame_dir(slug),
            }
        )
        seen.add(slug)

    added = [
        show
        for show in shows
        if show["slug"] not in seen and has_frames(FRAMES_DIR / frame_dir(show["slug"]))
    ]
    if shuffle_new:
        random.shuffle(added)
    else:
        added.sort(key=lambda s: s["name"])

    for show in added:
        rotation.append(
            {
                "showName": show["name"],
                "showSlug": show["slug"],
                "tmdbId": show["tmdbId"],
                "frameDir": frame_dir(show["slug"]),
            }
        )

    if not rotation:
        print("No shows have a complete set of 6 frames — run fetch_frames.py first.")
        sys.exit(1)

    ROTATION_FILE.write_text(json.dumps(rotation, indent=2, ensure_ascii=False) + "\n")
    update_schedule(len(rotation), len(rotation) - len(added))

    missing = [s["name"] for s in shows if s["slug"] not in {e["showSlug"] for e in rotation}]
    print(f"Rotation: {len(rotation)} shows ({len(added)} newly added)")
    if dropped:
        print(f"Dropped (frames missing): {', '.join(dropped)}")
    if missing:
        print(f"{len(missing)} shows still have no frames: {', '.join(missing)}")


if __name__ == "__main__":
    main()
