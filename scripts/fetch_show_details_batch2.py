import json, time, urllib.request, ssl

ssl._create_default_https_context = ssl._create_unverified_context

with open("scripts/shows.json") as f:
    shows = json.load(f)

API_KEY = "ee8104219d773db7087562e0433f2e93"
results = []

for show in shows[67:134]:  # index 67-133 inclusive
    url = f"https://api.themoviedb.org/3/tv/{show['tmdbId']}?api_key={API_KEY}"
    print(f"Fetching {show['name']} (ID: {show['tmdbId']})...", flush=True)
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read())
    results.append({
        "name": data.get("name"),
        "slug": show["slug"],
        "tmdbId": show["tmdbId"],
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
    time.sleep(0.3)

with open("src/data/shows-detail-batch2.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone! Saved {len(results)} shows.")
