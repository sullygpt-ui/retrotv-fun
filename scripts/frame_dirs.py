#!/usr/bin/env python3
"""
Shared frame-directory naming.

Frames live in opaque directories instead of /frames/<slug>/, because the image
URL is the easiest place to leak the answer: a player who opens DevTools on
/frames/battlestar-galactica/1.jpg has solved the puzzle. The token is a stable
hash of the slug, so frames stay plain static files on the CDN.

This is obfuscation, not security — the salt is committed. It stops casual
peeking at the page source, which is all a daily guessing game needs.
"""

import hashlib

SALT = "retrotv-frames-v1"


def frame_dir(slug: str) -> str:
    """Opaque, stable directory name for a show's frames."""
    return hashlib.sha256(f"{SALT}:{slug}".encode()).hexdigest()[:16]
