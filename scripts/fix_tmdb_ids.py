#!/usr/bin/env python3
"""Look up correct TMDB IDs for all shows by searching the API."""
import json, time, urllib.request, urllib.parse, os, ssl

API_KEY = os.environ.get('TMDB_API_KEY', 'ee8104219d773db7087562e0433f2e93')
BASE = 'https://api.themoviedb.org/3'
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def api_get(path, params={}):
    params['api_key'] = API_KEY
    url = f"{BASE}{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, context=CTX) as r:
        return json.loads(r.read())

shows = json.load(open('scripts/shows.json'))
fixed = 0
for s in shows:
    name = s['name']
    try:
        data = api_get('/search/tv', {'query': name, 'first_air_date_year': '', 'include_adult': 'false'})
        results = data.get('results', [])
        # Filter for shows from 70s/80s
        matches = []
        for r in results:
            fad = r.get('first_air_date', '')
            year = int(fad[:4]) if fad and len(fad) >= 4 else 0
            if 1969 <= year <= 1990:
                matches.append(r)
        
        if not matches:
            matches = results[:1]  # fallback to first result
        
        if matches:
            best = matches[0]
            old_id = s['tmdbId']
            new_id = best['id']
            if old_id != new_id:
                print(f"✅ {name}: {old_id} → {new_id} ({best.get('first_air_date','')})")
                s['tmdbId'] = new_id
                fixed += 1
            else:
                print(f"✓ {name}: {old_id} (correct)")
        else:
            print(f"❌ {name}: no results")
        
        time.sleep(0.25)  # rate limit
    except Exception as e:
        print(f"❌ {name}: {e}")

json.dump(shows, open('scripts/shows.json', 'w'), indent=2)
print(f"\nFixed {fixed}/{len(shows)} IDs")
