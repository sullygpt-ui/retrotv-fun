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


def segment_for_day(segments: list[dict], day: int) -> dict:
    """The segment in effect on `day`. Mirrors segmentForDay in rotation.ts."""
    active = segments[0]
    for segment in segments:
        if segment["fromDay"] <= day:
            active = segment
        else:
            break
    return active


def index_for_day(segments: list[dict], pool_size: int, day: int) -> int:
    """Mirrors rotationIndex in rotation.ts."""
    segment = segment_for_day(segments, day)
    pool = min(segment["poolSize"], pool_size)
    return (segment["startIndex"] + (day - segment["fromDay"])) % pool


def last_aired(segments: list[dict], pool_size: int, before_day: int) -> dict[int, int]:
    """The most recent day each rotation index aired, over days < before_day."""
    last: dict[int, int] = {}
    for day in range(segments[0]["fromDay"], before_day):
        last[index_for_day(segments, pool_size, day)] = day
    return last


def best_resume_index(last: dict[int, int], pool_size: int, resume_day: int) -> int:
    """
    The start index that leaves the longest gap before any show repeats.

    A segment walks the pool in order and wraps, so the only choice is where the
    seam falls — and starting at 0 puts the least rested shows first. When the
    pool grew from 190 to 249, days 190-232 had already replayed indices 0-42,
    so resuming at index 0 would have brought those back after 102 days when
    206 was available.
    """
    if not last:
        return 0

    best_index, best_gap = 0, -1
    for start in range(pool_size):
        gap = min(
            (resume_day + offset) - last[index]
            for offset in range(pool_size)
            if (index := (start + offset) % pool_size) in last
        )
        if gap > best_gap:
            best_index, best_gap = start, gap
    return best_index


def plan_future(segments: list[dict], pool_size: int, first_new_index: int, from_day: int) -> list[dict]:
    """
    The segments to run from `from_day` on, given the ones already in effect.

    At most two: one that debuts shows nobody has seen yet, and one that picks
    up afterwards at the best-rested index. Callers must check the result
    against verify_history — widening a pool is only safe while the segment
    walking it has not wrapped.
    """
    settled = [s for s in segments if s["fromDay"] < from_day]
    pending = [s for s in segments if s["fromDay"] >= from_day]

    # A pending debut hasn't aired yet, so keep the earliest of them: a second
    # run on the same day must not skip past the batch the first run queued up.
    debut_starts = [s["startIndex"] for s in pending if not s.get("resume")]
    if first_new_index < pool_size:
        debut_starts.append(first_new_index)

    future: list[dict] = []
    if debut_starts:
        future.append(
            {"fromDay": from_day, "poolSize": pool_size, "startIndex": min(debut_starts)}
        )

    # The seam falls where the walk in flight reaches the end of the pool, which
    # is also where a fresh run finishes airing. Anything earlier would cut that
    # run short; anything later would repeat a show the walk has already passed.
    walking = (settled + future)[-1]
    resume_day = max(from_day, walking["fromDay"] + pool_size - walking["startIndex"])

    last = last_aired(settled + future, pool_size, resume_day)
    future.append(
        {
            "fromDay": resume_day,
            "poolSize": pool_size,
            "startIndex": best_resume_index(last, pool_size, resume_day),
            "resume": True,
        }
    )
    return future


def verify_history(old: list[dict], new: list[dict], pool_size: int, today: int) -> int | None:
    """The first day whose puzzle changed, or None. Puzzle numbers key saves."""
    if not old:
        return None
    for day in range(old[0]["fromDay"], today + 1):
        if index_for_day(old, pool_size, day) != index_for_day(new, pool_size, day):
            return day
    return None


def update_schedule(pool_size: int, first_new_index: int) -> None:
    """
    Rewrite the part of the schedule that hasn't taken effect yet.

    Segments already in effect are history and are left alone; ahead of today
    the plan is rebuilt from scratch, so running this twice is a no-op. The
    result is checked day by day against the old schedule before it is written.
    """
    segments = json.loads(SCHEDULE_FILE.read_text()) if SCHEDULE_FILE.exists() else []

    # Puzzles roll over at UTC midnight, so "tomorrow" is a UTC day.
    today = (datetime.now(timezone.utc).date() - EPOCH).days
    from_day = max(today + 1, 0)

    if not segments:
        segments = [{"fromDay": 0, "poolSize": pool_size, "startIndex": 0}]
    settled = [s for s in segments if s["fromDay"] < from_day] or [segments[0]]

    # Shows appended to the rotation continue the walk of whatever segment is
    # already mid-run, so widening its pool debuts them without a seam. That
    # only holds while the walk hasn't wrapped, which verify_history checks.
    widened = [dict(s) for s in settled]
    widened[-1]["poolSize"] = pool_size
    candidates = [
        widened + plan_future(widened, pool_size, pool_size, from_day),
        settled + plan_future(segments, pool_size, first_new_index, from_day),
    ]

    for schedule in candidates:
        changed = verify_history(segments, schedule, pool_size, today)
        if changed is None:
            break
    else:
        sys.exit(
            "Refusing to write: every candidate schedule would reassign a puzzle "
            "that has already been played. Check src/data/schedule.json by hand."
        )

    if schedule == segments:
        return

    SCHEDULE_FILE.write_text(json.dumps(schedule, indent=2) + "\n")
    for segment in schedule[len(settled):]:
        day = EPOCH + timedelta(days=segment["fromDay"])
        print(
            f"Schedule: day {segment['fromDay']} ({day}) pool {segment['poolSize']} "
            f"from index {segment['startIndex']}"
        )

    resume = schedule[-1]
    # Count from the resume day, not today: the shows airing between now and
    # then are the ones most at risk of coming back too soon.
    last = last_aired(schedule, pool_size, resume["fromDay"])
    gap = min(
        (resume["fromDay"] + offset) - last[index]
        for offset in range(pool_size)
        if (index := (resume["startIndex"] + offset) % pool_size) in last
    ) if last else pool_size
    print(f"Soonest any show repeats after the current run: {gap} days")


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
