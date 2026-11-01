# iusedtowatchthis.com → retrotv.fun: in-content links

Right now retrotv.fun is reachable from iusedtowatchthis.com only through the
sitewide nav menu. Google discounts sitewide boilerplate links heavily — the
same link on every page is read as navigation, not as an endorsement of the
target. One link inside the body of a real post is worth considerably more.

Two things below, both ready to paste. They are complementary: the inserts put
contextual links on six pages that already exist and already have some age, and
the post gives the site one page that is *about* RetroTV and can rank for
"classic TV guessing game" on its own.

All target URLs verified 200 on 2026-10-31.

---

## 1. One-sentence inserts for the six most recent episode posts

Drop each at the end of the post, as its own paragraph. Anchor text is
deliberately different in every one — six identical anchors across six pages
reads as a template, which is the thing being avoided.

**Columbo – Double Exposure** (post ID 5722) → anchor: *Columbo*

> If you want to find out how well you actually know this one, [Columbo](https://retrotv.fun/shows/columbo) is in the rotation over at RetroTV, the daily guess-the-show game I run. Six screenshots, one answer. The early frames are meaner than you'd expect.

**The Greatest American Hero – Captain Bellybuster and the Speed Factory** (post ID 5718) → anchor: *The Greatest American Hero*

> [The Greatest American Hero](https://retrotv.fun/shows/the-greatest-american-hero) turns up in RetroTV, my daily screenshot game. Two seasons and change, and people still know that suit from a single blurry frame.

**Starsky & Hutch – Little Girl Lost** (post ID 5711) → anchor: *guess-the-show game*

> There's a [guess-the-show game](https://retrotv.fun/shows/starsky-and-hutch) I put together where this one shows up. One frame a day, and if you miss you get another. Most people need three.

**CHiPs – Return of the Supercycle** (post ID 5706) → anchor: *CHiPs*

> [CHiPs](https://retrotv.fun/shows/chips) is one of the shows in RetroTV, a daily puzzle where you name the series from a screenshot. The freeway shots give it away faster than anything with a face in it.

**Charlie's Angels – Consenting Adults** (post ID 5702) → anchor: *RetroTV*

> [RetroTV](https://retrotv.fun/shows/charlies-angels) is a daily game I built out of frames from shows like this one. New puzzle at midnight, same one for everybody.

**The Rockford Files – The Family Hour** (post ID 5697) → anchor: *daily screenshot puzzle*

> Rockford is in the [daily screenshot puzzle](https://retrotv.fun/shows/the-rockford-files) I run. The trailer is a tell, but only if you've seen it, and the first frame almost never includes the trailer.

---

## 2. A standalone post

Title: **I Built a Daily Guessing Game Out of the Shows We Watch Here**

Suggested slug: `/retrotv-daily-guessing-game/`

A note before you paste it: the opening is an observation, not an anecdote,
because I'm not going to put words in your mouth. If you've got a real story —
somebody emailing you to say they recognized an episode from the thumbnail
alone — swap it into the first two paragraphs. It'll be better than what's there.

---

Here's something I've noticed writing episode posts for this site. The
screenshots do more work than the words do.

Somebody scrolls past a frame of a wood-paneled den with an avocado phone on
the end table, and they know. Before the title, before the show name, before
any of it. Thirty-five years and they still know.

So I built a game out of that.

It's called RetroTV. You get one screenshot from a show that aired between 1970
and 1989 and you guess. Miss, and you get another frame. Six total, each one a
little more generous than the last. The first is usually a corner of a set with
nobody in it. By the fifth you're looking at a face you've known since you were
nine.

New puzzle every day at midnight, and everybody gets the same one. That part
matters. There's no fun in a random generator — half the point is arguing with
somebody about whether today's was fair.

There are 366 shows in the rotation, which is a little over a year of play
before anything comes back around. The obvious ones are in there. [Columbo](https://retrotv.fun/shows/columbo),
[Rockford](https://retrotv.fun/shows/the-rockford-files), [Knight Rider](https://retrotv.fun/shows/knight-rider),
the ones I've written up here. But so are the shows that ran a season and a half
and disappeared, the ones where you get the frame and feel something move in the
back of your head and still can't produce the name. Those are the good days.

The order isn't hand-picked, by the way. A script scores every frame on how
much face is in it. Contrast in the middle of the picture, edge detail, how
much of the frame is skin tone. Then it sorts them hardest to easiest and that's
the order you see them in. A close-up is just a photograph of the answer. An
empty corridor isn't. The thing turned out to be better at telling those apart
than I expected it to be.

Every puzzle that's run is in the [archive](https://retrotv.fun/archive), so if
you'd rather lose an afternoon than thirty seconds, that's there too.

[Today's is up.](https://retrotv.fun/)

---

**Fact-check before publishing:** 366 shows in the rotation and six frames per
puzzle are both current as of 2026-10-31. The paragraph about frame ordering
describes what `scripts/reorder_frames.py` actually does — it scores center
contrast, edge density and skin-tone ratio, then sorts hardest to easiest. Keep
it accurate or cut it; don't swap in a different example.

---

## 3. If you want this done without copy-and-paste

The WordPress REST API on iusedtowatchthis.com answers reads (`/wp-json/wp/v2/posts`
returns 200), so writes only need credentials. Create one in WordPress under
**Users → Profile → Application Passwords**, name it something like `claude-code`,
and that's a 24-character string scoped to posting — not your login password, and
revocable from the same screen at any time.

With that in hand the six inserts and the new post are one script: `GET` each
post's content, append the paragraph, `POST` it back, then create the new post
as a draft for you to read before it goes live. Post IDs are already listed
above.

Worth knowing either way: an application password can publish, edit and delete
posts on that site. Revoke it when the job is done.

### Blocked 2026-11-01: Apache is stripping the Authorization header

An application password was issued and every authenticated request came back
`401 rest_not_logged_in`. That is not a bad-credentials error. The proof:

```sh
curl -s -u 'definitelynotauser:abcd efgh ijkl mnop qrst uvwx' \
  'https://iusedtowatchthis.com/wp-json/wp/v2/users/me?context=edit'
# {"code":"rest_not_logged_in","message":"You are not currently logged in.",...}
```

A username that does not exist returns the *identical* error to the real one, so
WordPress never evaluates the credentials — the `Authorization` header is not
reaching PHP. `Server: Apache`, which is where this normally happens: under
CGI/FastCGI, Apache drops `Authorization` instead of passing it through as
`HTTP_AUTHORIZATION`. Application passwords are enabled (the `/wp-json/` index
advertises them), and `?rest_route=` and `index.php?rest_route=` fail the same
way, so it is not a permalink-rewrite problem either.

The fix goes in the site root `.htaccess`, **above** the `# BEGIN WordPress`
block:

```apache
# Pass HTTP Basic auth through to PHP (WordPress Application Passwords)
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule ^ - [E=HTTP_AUTHORIZATION:%1]
</IfModule>
```

If that alone does not do it, add:

```apache
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

Verify with the curl above using a real login — a `200` with your user JSON
means it is through, and a different error code such as `incorrect_password`
also counts as progress, because it means WordPress is finally reading the
header.
