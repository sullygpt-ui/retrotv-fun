#!/usr/bin/env python3
"""
Discover popular 70s/80s TV shows from TMDB that we don't already have.
Fetches shows, checks for stills availability, adds to shows.json.
"""
import json, time, ssl, urllib.request, urllib.parse
from pathlib import Path

API_KEY = 'ee8104219d773db7087562e0433f2e93'
BASE = 'https://api.themoviedb.org/3'
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

SHOWS_FILE = Path(__file__).parent / 'shows.json'

def api_get(path, params={}):
    params['api_key'] = API_KEY
    url = f"{BASE}{path}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, context=CTX) as r:
        return json.loads(r.read())

def make_slug(name):
    import re
    s = name.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s

def has_enough_stills(tmdb_id):
    """Check if a show has at least 6 episode stills."""
    try:
        data = api_get(f'/tv/{tmdb_id}')
        seasons = data.get('seasons', [])
        stills = 0
        for s in seasons[:5]:
            sn = s.get('season_number', 0)
            if sn == 0:
                continue
            try:
                sdata = api_get(f'/tv/{tmdb_id}/season/{sn}')
                for ep in sdata.get('episodes', [])[:10]:
                    if ep.get('still_path'):
                        stills += 1
                        if stills >= 6:
                            return True
            except:
                pass
            time.sleep(0.15)
    except:
        pass
    return stills >= 6

# Load existing shows
existing = json.load(open(SHOWS_FILE))
existing_ids = {s['tmdbId'] for s in existing}
existing_names = {s['name'].lower() for s in existing}

print(f"Currently have {len(existing)} shows. Searching for more...\n")

new_shows = []

# Search TMDB discover for popular TV shows from 1970-1989
for year in range(1970, 1990):
    for page in range(1, 4):  # 3 pages per year
        try:
            data = api_get('/discover/tv', {
                'first_air_date.gte': f'{year}-01-01',
                'first_air_date.lte': f'{year}-12-31',
                'sort_by': 'vote_count.desc',
                'with_original_language': 'en',
                'vote_count.gte': '10',
                'page': str(page)
            })
            
            for show in data.get('results', []):
                tid = show['id']
                name = show['name']
                
                if tid in existing_ids or name.lower() in existing_names:
                    continue
                if tid in {s['tmdbId'] for s in new_shows}:
                    continue
                    
                # Skip non-English or news/talk shows
                genres = show.get('genre_ids', [])
                if 10763 in genres or 10767 in genres:  # News, Talk
                    continue
                
                new_shows.append({
                    'name': name,
                    'tmdbId': tid,
                    'slug': make_slug(name),
                    'year': show.get('first_air_date', '')[:4],
                    'popularity': show.get('vote_count', 0)
                })
                existing_ids.add(tid)
            
            time.sleep(0.2)
        except Exception as e:
            print(f"  Error on {year} page {page}: {e}")

print(f"Found {len(new_shows)} candidate shows. Checking for stills...\n")

# Sort by popularity and check top candidates for stills
new_shows.sort(key=lambda x: x['popularity'], reverse=True)

added = 0
for show in new_shows:
    print(f"Checking: {show['name']} ({show['year']}, {show['popularity']} votes)...", end=' ', flush=True)
    
    if has_enough_stills(show['tmdbId']):
        print("✅ has stills")
        existing.append({
            'name': show['name'],
            'tmdbId': show['tmdbId'],
            'slug': show['slug']
        })
        added += 1
    else:
        print("❌ not enough stills")
    
    time.sleep(0.3)
    
    # Stop after checking enough
    if added >= 100:
        break

# Save updated shows.json
json.dump(existing, open(SHOWS_FILE, 'w'), indent=2)
print(f"\n✅ Added {added} new shows. Total: {len(existing)}")
