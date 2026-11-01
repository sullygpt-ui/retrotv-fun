#!/usr/bin/env python3
"""
Shared TMDB credential lookup.

The key comes from the environment only, so there is nothing to commit:

    export TMDB_API_KEY=your_key        # or put it in .env.local (gitignored)
    set -a; . ./.env.local; set +a
"""

import os
import sys


def require_api_key() -> str:
    key = os.environ.get("TMDB_API_KEY")
    if not key:
        sys.exit(
            "Error: TMDB_API_KEY is not set.\n"
            "Get a free v3 key at https://www.themoviedb.org/settings/api, then:\n"
            "  export TMDB_API_KEY=your_key\n"
            "or add it to .env.local and run: set -a; . ./.env.local; set +a"
        )
    return key
