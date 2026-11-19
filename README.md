[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mietrea519-cyber/vice-coast-cover-studio-2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mietrea519-cyber/vice-coast-cover-studio-2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Coast Cover Studio

A cover art maker in the style of a sun-soaked crime-city poster: your photos go in, a five-panel poster comes out. One big hero panel and four smaller ones, a bold caption in heavy Anton lettering across the foot, and a neon or sunset colour grade washing over the whole thing. Everything runs in the browser from the files in this repo — no account, no upload, no network.

## How it works

The editor has four steps, top to bottom on the left of the screen, with a live preview of the poster on the right:

1. **Photos** — Add your own photos from your machine, or try the two built-in samples, *neon driver* and *sunset pier*. You can also drag photos from anywhere and drop them onto the page. Click a photo in the tray to drop it into the panel that is currently selected.
2. **Frame the panel** — Click a panel in the preview to select it, then drag it on the poster to move the photo and scroll to zoom. The Zoom, Shift across, and Shift up/down sliders do the same thing precisely. Reset framing puts the photo back to its cover fit, and *Fill every panel with this photo* spreads the selected panel's photo (with its framing) across all five panels.
3. **Caption** — Type a Title and a Tagline; both update live on the poster. Pick a colour grade: **Neon Nights** (magenta and cyan), **Sunset Gold** (orange and pink), or **Pastel Vice** (soft pink and teal).
4. **Export** — One click saves the poster as a PNG in a post-ready size: **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**. The preview size buttons switch what the preview shows; the export buttons each save their own size.

## Screenshots

- `1-cover.jpg` — the NEON COAST poster on its own (landscape).
- `2-editor.jpg` — the editor at work on the SUNSET KING poster.
- `3-cover.jpg` — the SUNSET KING poster on its own (portrait).
- `4-editor.jpg` — the editor at work on the NEON COAST poster.

The demo scenes behind them are built into the app: `?shot=cover` shows the poster alone and `?shot=editor` shows the editor with a photo loaded (see `shots.json` for the exact queries).

## Run it offline

The app is plain static files under `app/` with no build step and no network requests — every script, font, and sample image is a file in this repo, and your photos are read on your own machine, never uploaded.

```sh
node serve.ts
```

Then open the address it prints (port 8080) in desktop Chrome. Or serve `app/` with any static file server.

## What is in this repo

- `app/` — the app: `index.html`, `style.css`, `src/main.js` (wiring), `src/cover.js` (the poster renderer), `src/shots.js` (demo scenes), the Anton font under `fonts/`, and the two sample photos under `samples/`.
- `screenshots/` — the four screenshots above.
- `main.ts` — the hand-in program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`). Run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
- `serve.ts` — the little static server for trying the app locally.
- `shots.json` — the `?shot=` queries that reproduce the screenshots.
- `LICENSE` — MIT.

## Credits and originality

The two sample photos (`app/samples/neon-driver.jpg` and `app/samples/sunset-pier.jpg`) are AI-generated stand-ins made for this project — they are not Rockstar artwork, and the app uses no Rockstar logo, wordmark, artwork, or font. The lettering is Anton, an open font by Vernon Adams shipped under the SIL Open Font License (`app/fonts/OFL.txt`).
