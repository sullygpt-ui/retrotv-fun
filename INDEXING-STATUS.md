# RetroTV.fun — Search Engine Indexing Status

**Date:** 2026-03-13

## DNS Status

- **Current A record:** `216.150.1.1` (NOT Vercel's `76.76.21.21`)
- ⚠️ DNS has NOT propagated to Vercel yet. Submissions should be re-done after DNS points to Vercel.

## Google

- **Sitemap ping:** ❌ Deprecated (404). Google retired the `/ping` endpoint in June 2023. See: https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- **Search Console API:** Not attempted — requires OAuth credentials.
- **IndexNow:** Google does not participate in IndexNow.
- **Recommended:** Submit sitemap manually via [Google Search Console](https://search.google.com/search-console) once DNS is live.

## Bing

- **Sitemap ping:** ❌ Endpoint returned 410 Gone (also deprecated).
- **IndexNow:** ✅ **Accepted (HTTP 202)** — Submitted 13 URLs via `api.indexnow.org`
  - Key: `8f794212-13e7-4c4c-848a-382bbe6cba7a`
  - Key file: `public/8f794212-13e7-4c4c-848a-382bbe6cba7a.txt`
  - URLs submitted: `/`, `/archive`, `/shows`, `/about`, `/faq`, plus 8 show pages

## Yandex

- **Sitemap ping:** ⚠️ Blocked by captcha. Could not complete programmatically.
- Yandex also supports IndexNow, so the IndexNow submission may cover it.

## IndexNow Summary

IndexNow is supported by Bing, Yandex, Seznam, and Naver. The single POST to `api.indexnow.org` distributes to all participating engines.

## TODO (after DNS propagation)

- [ ] Re-submit IndexNow (engines will need to verify the key file at the live domain)
- [ ] Add site to Google Search Console and submit sitemap there
- [ ] Add site to Bing Webmaster Tools
- [ ] Verify IndexNow key file is accessible at `https://retrotv.fun/8f794212-13e7-4c4c-848a-382bbe6cba7a.txt`
