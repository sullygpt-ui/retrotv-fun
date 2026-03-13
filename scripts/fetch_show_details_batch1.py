#!/usr/bin/env python3
"""Fetch TMDB details for shows 0-66 and save to shows-detail-batch1.json"""
import json, time, subprocess, os

API_KEY = "ee8104219d773db7087562e0433f2e93"
BASE = "https://api.themoviedb.org/3/tv"

with open(os.path.join(os.path.dirname(__file__), "shows.json")) as f:
    shows = json.load(f)

results = {}
for i, show in enumerate(shows[:67]):
    tmdb_id = show["tmdbId"]
    slug = show["slug"]
    url = f"{BASE}/{tmdb_id}?api_key={API_KEY}"
    print(f"[{i+1}/67] Fetching {show['name']} (tmdb:{tmdb_id})...", flush=True)
    try:
        r = subprocess.run(["curl", "-s", url], capture_output=True, text=True, timeout=15)
        data = json.loads(r.stdout)
        results[slug] = {
            "name": data.get("name", show["name"]),
            "slug": slug,
            "tmdbId": tmdb_id,
            "overview": data.get("overview", ""),
            "first_air_date": data.get("first_air_date", ""),
            "last_air_date": data.get("last_air_date", ""),
            "number_of_seasons": data.get("number_of_seasons", 0),
            "number_of_episodes": data.get("number_of_episodes", 0),
            "genres": [g["name"] for g in data.get("genres", [])],
            "networks": [n["name"] for n in data.get("networks", [])],
            "vote_average": data.get("vote_average", 0),
            "poster_path": data.get("poster_path", ""),
            "backdrop_path": data.get("backdrop_path", ""),
            "created_by": [c["name"] for c in data.get("created_by", [])],
            "tagline": data.get("tagline", ""),
        }
        print(f"  OK: {results[slug]['name']}", flush=True)
    except Exception as e:
        print(f"  ERROR: {e}", flush=True)
        results[slug] = {"name": show["name"], "slug": slug, "tmdbId": tmdb_id, "error": str(e)}
    time.sleep(0.25)

out_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "shows-detail-batch1.json")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nSaved {len(results)} shows to {out_path}")
