#!/usr/bin/env python3
"""
Check the live site for the things that have actually broken before.

Every check here exists because the corresponding bug shipped at least once:
a schedule that ran out and served the same puzzle for 42 days, 9 sitemap URLs
that 404'd the day after the sitemap was submitted to Google, internal links
pointing at genre pages that were never routes, and an answer-reveal feature
one guard away from spoiling the daily puzzle.

Usage:
    python3 scripts/site_check.py                     # check production
    python3 scripts/site_check.py --base http://localhost:3000
    python3 scripts/site_check.py --indexnow          # also resubmit the sitemap
    python3 scripts/site_check.py --runway-days 60    # fail sooner on content

Exits non-zero if anything fails, so CI mails you. Standard library only.
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from build_rotation import EPOCH, index_for_day  # noqa: E402

ROOT = Path(__file__).parent.parent
ROTATION_FILE = ROOT / "src" / "data" / "rotation.json"
SCHEDULE_FILE = ROOT / "src" / "data" / "schedule.json"
INDEXNOW_KEY = "8f794212-13e7-4c4c-848a-382bbe6cba7a"
UA = "retrotv.fun site check (+https://retrotv.fun)"
SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

failures: list[str] = []


def fail(message: str) -> None:
    failures.append(message)
    print(f"  FAIL  {message}")


def ok(message: str) -> None:
    print(f"  ok    {message}")


def fetch(url: str, timeout: int = 30) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, ""
    except (urllib.error.URLError, TimeoutError) as err:
        print(f"  (request failed: {err})")
        return 0, ""


def status_only(url: str) -> tuple[str, int]:
    return url, fetch(url, timeout=25)[0]


def check_basics(base: str) -> None:
    print("Core pages")
    for path in ("/", "/archive", "/shows", "/about", "/faq"):
        code, _ = fetch(base + path)
        ok(f"{path} {code}") if code == 200 else fail(f"{path} returned {code}")

    code, robots = fetch(base + "/robots.txt")
    if code != 200:
        fail(f"/robots.txt returned {code}")
    elif "Sitemap:" not in robots:
        fail("/robots.txt does not point at the sitemap")
    else:
        ok("/robots.txt names the sitemap")


def check_sitemap(base: str) -> list[str]:
    print("\nSitemap")
    code, body = fetch(base + "/sitemap.xml")
    if code != 200:
        fail(f"/sitemap.xml returned {code}")
        return []

    try:
        root = ET.fromstring(body)
    except ET.ParseError as err:
        fail(f"/sitemap.xml is not valid XML: {err}")
        return []

    urls = [u.findtext(f"{SITEMAP_NS}loc") or "" for u in root.findall(f"{SITEMAP_NS}url")]
    if not urls:
        fail("/sitemap.xml lists no URLs")
        return []
    if len(urls) != len(set(urls)):
        fail(f"/sitemap.xml repeats {len(urls) - len(set(urls))} URLs")
    ok(f"{len(urls)} URLs, valid XML")

    # A sitemap URL that 404s is reported as an error against the property, so
    # this is worse than simply leaving the page out.
    print("  crawling every sitemap URL...")
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(status_only, urls))
    broken = [(u, c) for u, c in results if c != 200]
    if broken:
        fail(f"{len(broken)} sitemap URLs do not return 200")
        for url, code in broken[:10]:
            print(f"        {code} {url}")
    else:
        ok(f"all {len(urls)} sitemap URLs return 200")
    return urls


def check_internal_links(base: str) -> None:
    """Crawl one page of each type; a link to a 404 is what crawlers follow."""
    print("\nInternal links")
    seeds = ["/", "/archive", "/shows", "/shows/decade/1970s"]
    rotation = json.loads(ROTATION_FILE.read_text())
    seeds.append(f"/shows/{rotation[0]['showSlug']}")
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    seeds.append(f"/archive/{yesterday}")

    links: set[str] = set()
    for seed in seeds:
        code, html = fetch(base + seed)
        if code != 200:
            fail(f"seed page {seed} returned {code}")
            continue
        links.update(re.findall(r'href="(/[^"#?]*)"', html))

    with ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(status_only, [base + href for href in sorted(links)]))
    broken = [(u, c) for u, c in results if c != 200]
    if broken:
        fail(f"{len(broken)} internal links are broken")
        for url, code in broken[:10]:
            print(f"        {code} {url}")
    else:
        ok(f"all {len(links)} internal links from {len(seeds)} pages return 200")


def check_daily_puzzle(base: str) -> None:
    """The daily puzzle must resolve, and must not have its answer on a page."""
    print("\nToday's puzzle")
    today = datetime.now(timezone.utc).date().isoformat()

    code, body = fetch(f"{base}/api/reveal/{today}")
    if code != 200:
        fail(f"/api/reveal/{today} returned {code}")
        return
    try:
        answer = json.loads(body)["showName"]
    except (ValueError, KeyError):
        fail(f"/api/reveal/{today} did not return a show name: {body[:120]}")
        return
    ok(f"resolves to {answer}")

    tomorrow = (datetime.now(timezone.utc).date() + timedelta(days=1)).isoformat()
    code, _ = fetch(f"{base}/api/reveal/{tomorrow}")
    ok("tomorrow's answer is not served") if code == 404 else fail(
        f"/api/reveal/{tomorrow} returned {code}, expected 404"
    )

    # The archive reveals answers, and the guard that holds today's back is one
    # comparison. If it ever inverts, streaks are decided by View Source.
    code, html = fetch(f"{base}/archive/{today}")
    if code != 200:
        fail(f"/archive/{today} returned {code}")
    elif answer.lower() in html.lower():
        fail(f"/archive/{today} leaks today's answer ({answer})")
    else:
        ok(f"/archive/{today} does not leak the answer")


def check_runway(min_days: int) -> None:
    """How long until a show repeats, and how many days of new shows are left."""
    print("\nContent runway")
    rotation = json.loads(ROTATION_FILE.read_text())
    schedule = json.loads(SCHEDULE_FILE.read_text())
    pool_size = len(rotation)
    today = (datetime.now(timezone.utc).date() - EPOCH).days

    seen = {index_for_day(schedule, pool_size, day) for day in range(today + 1)}
    fresh = 0
    for day in range(today + 1, today + 2000):
        index = index_for_day(schedule, pool_size, day)
        if index not in seen:
            seen.add(index)
            fresh += 1
        if len(seen) == pool_size:
            break

    last: dict[int, int] = {}
    soonest = None
    for day in range(0, today + 2000):
        index = index_for_day(schedule, pool_size, day)
        if index in last and day > today:
            gap = day - last[index]
            soonest = gap if soonest is None else min(soonest, gap)
        last[index] = day

    last_fresh = EPOCH + timedelta(days=today + fresh)
    print(f"        {pool_size} shows in the rotation")
    ok(f"{fresh} never-aired shows queued, through {last_fresh}")
    if soonest is None:
        fail("could not work out when a show repeats")
    elif soonest < min_days:
        fail(f"a show repeats after only {soonest} days (want >= {min_days})")
    else:
        ok(f"soonest repeat is {soonest} days away")


def submit_indexnow(urls: list[str]) -> None:
    """Tell Bing, Yandex, Seznam, Naver and Yep that the sitemap changed."""
    print("\nIndexNow")
    if not urls:
        fail("no sitemap URLs to submit")
        return

    # The bulk endpoint 403s with SiteVerificationNotCompleted until a single
    # URL has been submitted by GET, which warms the key.
    warm = (
        "https://api.indexnow.org/indexnow?"
        + urllib.parse.urlencode({"url": urls[0], "key": INDEXNOW_KEY})
    )
    fetch(warm, timeout=20)

    payload = json.dumps(
        {
            "host": "retrotv.fun",
            "key": INDEXNOW_KEY,
            "keyLocation": f"https://retrotv.fun/{INDEXNOW_KEY}.txt",
            "urlList": urls,
        }
    ).encode()
    request = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            ok(f"submitted {len(urls)} URLs (HTTP {response.status})")
    except urllib.error.HTTPError as err:
        fail(f"IndexNow returned {err.code}: {err.read().decode()[:160]}")
    except urllib.error.URLError as err:
        fail(f"IndexNow request failed: {err}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="https://retrotv.fun", help="site to check")
    parser.add_argument("--indexnow", action="store_true", help="resubmit the sitemap")
    parser.add_argument(
        "--runway-days",
        type=int,
        default=120,
        help="fail if a show would repeat sooner than this",
    )
    args = parser.parse_args()
    base = args.base.rstrip("/")

    print(f"Checking {base} at {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC\n")
    check_basics(base)
    urls = check_sitemap(base)
    check_internal_links(base)
    check_daily_puzzle(base)
    check_runway(args.runway_days)
    if args.indexnow:
        submit_indexnow(urls)

    print()
    if failures:
        print(f"{len(failures)} check(s) failed:")
        for message in failures:
            print(f"  - {message}")
        sys.exit(1)
    print("All checks passed.")


if __name__ == "__main__":
    main()
