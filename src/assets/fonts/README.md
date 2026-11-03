# Vendored fonts

The two fonts the site already uses, kept here as TrueType for `next/og`.

`next/font` downloads woff2, which Satori (the renderer behind `ImageResponse`)
cannot parse, and the share card has to be drawn at build time with no network.
So the `.ttf` originals live in the repo and are read with `fs.readFile`.

- `PressStart2P-Regular.ttf` — Press Start 2P, © 2012 The Press Start 2P Project
  Authors. SIL Open Font License 1.1.
- `VT323-Regular.ttf` — VT323, © 2011 The VT323 Project Authors. SIL Open Font
  License 1.1.

Both licences permit redistribution bundled with other software. Source:
<https://github.com/google/fonts>.
