#!/usr/bin/env python3
import json, time, urllib.request, ssl

ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = "ee8104219d773db7087562e0433f2e93"

with open("scripts/shows.json") as f:
    shows = json.load(f)

results = []
batch = shows[134:201]  # index 134-200 inclusive

for i, show in enumerate(batch):
    tmdb_id = show["tmdbId"]
    url = f"https://api.themoviedb.org/3/tv/{tmdb_id}?api_key={API_KEY}"
    print(f"[{i+1}/{len(batch)}] Fetching {show['name']} (ID: {tmdb_id})", flush=True)
    
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read())
    
    results.append({
        "name": data.get("name"),
        "slug": show["slug"],
        "tmdbId": tmdb_id,
        "overview": data.get("overview"),
        "first_air_date": data.get("first_air_date"),
        "last_air_date": data.get("last_air_date"),
        "number_of_seasons": data.get("number_of_seasons"),
        "number_of_episodes": data.get("number_of_episodes"),
        "genres": [g["name"] for g in data.get("genres", [])],
        "networks": [n["name"] for n in data.get("networks", [])],
        "vote_average": data.get("vote_average"),
        "poster_path": data.get("poster_path"),
        "backdrop_path": data.get("backdrop_path"),
        "created_by": [c["name"] for c in data.get("created_by", [])],
        "tagline": data.get("tagline"),
    })
    
    if i < len(batch) - 1:
        time.sleep(0.3)

with open("src/data/shows-detail-batch3.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone! Saved {len(results)} shows to src/data/shows-detail-batch3.json")
