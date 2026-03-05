# The Canon — Cinephile Site

## Project Purpose

A personal film watchlist that doubles as a resource for anyone looking to get serious about cinema. The site tracks watched/unwatched status across ~300 canonical films and explains the curation philosophy behind the list.

**Long-term vision:** Curated paths, film detail pages, context for why films matter, and eventually community features.

## Current Architecture

**Stack:** React + Vite, deployed to GitHub Pages via GitHub Actions.
- Push to `master` → Actions runs `npm run build` → deploys `dist/` to `gh-pages` branch automatically.
- Local dev: `PATH="/opt/homebrew/bin:$PATH" npm run dev` → `http://localhost:5173/cinephile-site/`
- Build: `PATH="/opt/homebrew/bin:$PATH" npm run build`
- Note: System has old Node v14 at `/usr/local/bin/node`. Always use Homebrew Node at `/opt/homebrew/bin/node`.

## File Structure

```
src/
  main.jsx                  — React entry point
  App.jsx                   — Root component; holds all state (watched, filter, search, selectedFilm)
  index.css                 — All styles (design tokens, nav, header, stats, grid, cards, modal)
  components/
    Nav.jsx                 — Sticky nav (links to watchlist + framework.html)
    Header.jsx              — Title/subtitle/skull legend
    StatsBar.jsx            — Seen/remaining/% complete stats
    Controls.jsx            — Filter buttons + search input
    FilmGrid.jsx            — Sections + film card grid
    FilmCard.jsx            — Individual film card (checkbox toggle, opens modal on click)
    FilmModal.jsx           — Modal — currently a placeholder, Phase 4 is to build this out fully
data/
  films.js                  — ES module (export const FILMS, export const flagMap)
scripts/
  fetch-film-data.js        — Node.js enrichment script (OMDB + TMDB)
.github/workflows/
  deploy.yml                — Auto-deploy on push to master
index.html                  — Vite entry point (minimal shell)
framework.html              — Static curation philosophy page (vanilla HTML, not migrated to React)
styles.css                  — Legacy file, kept for framework.html reference only
vite.config.js              — base: '/cinephile-site/' for GitHub Pages
```

## Design System

Editorial aesthetic — think a film journal, not an app.

### Color Palette (CSS variables)
```css
--cream:      #f5f0e8   /* page background */
--dark:       #1a1410   /* headings, nav bar bg */
--ink:        #2c2318   /* body text */
--gold:       #b8914a   /* primary accent — links, active states, section titles */
--gold-light: #d4a96a   /* stats bar numbers */
--red:        #8b2020   /* progress bar gradient start */
--muted:      #7a6e5f   /* secondary text, metadata */
--border:     rgba(184,145,74,0.25)  /* subtle gold border */
```

### Typography
- **Headings:** Cormorant Garamond (serif, weight 300/400/600, italic used heavily)
- **UI / Labels:** Josefin Sans (sans-serif, weight 200/300/400, ALL CAPS with wide letter-spacing)
- Both loaded from Google Fonts in index.html

### Design Principles
- Spacing is generous — sections breathe
- Labels use `font-size: 9–11px`, `letter-spacing: 0.25–0.4em`, `text-transform: uppercase`
- Cards use `rgba(255,255,255,0.4–0.5)` backgrounds with `1px solid var(--border)`
- Grid layouts use `gap: 2px` between cards (tight, newspaper-like)
- No shadows — borders only
- Italic serif text for any quote-like or descriptive copy

## Film Data Structure

Each film object in `data/films.js`:
```js
{
  // Core fields (always populated)
  t: "Film Title",
  y: 1972,
  d: "Director Name",
  c: "us",              // country code → flagMap emoji
  s: "Section Name",    // must match exactly or new section is created
  tags: ["french"],     // filter tags: "silent" | "french" | "blockbuster"
  dem: false,           // true = 💀 demanding watch

  // Enriched fields — populated by scripts/fetch-film-data.js
  // OMDB fields (plot, runtime, ratings, language) — DONE, all 261 films enriched
  plot:      "Plot summary string",
  runtime:   119,                          // minutes
  ratings:   { imdb: "8.2", rt: "99%", meta: 100 },
  language:  "English",

  // TMDB fields (poster, trailer, dop, streaming) — PENDING (awaiting TMDB API key)
  poster:    null,       // full https URL, e.g. "https://image.tmdb.org/t/p/w500/..."
  trailer:   null,       // YouTube video ID string
  dop:       null,       // "Gordon Willis"
  streaming: null,       // ["Max", "Criterion Channel"] — US flatrate only

  // Manually curated by you — edit directly in films.js
  why: "",              // "Why this film matters" — editorial text
}
```

Watched state is persisted in `localStorage` under key `canon_v3`.
Film ID function: `(f.t + f.y).replace(/[^a-zA-Z0-9]/g, '')` — defined in `src/App.jsx` and exported as `fid`.

## Data Enrichment Script

```bash
# Run with both keys (full enrichment):
OMDB_KEY=xxx TMDB_KEY=xxx PATH="/opt/homebrew/bin:$PATH" node scripts/fetch-film-data.js

# Run with OMDB only (plot, runtime, ratings, language):
OMDB_KEY=xxx PATH="/opt/homebrew/bin:$PATH" node scripts/fetch-film-data.js

# Run with TMDB only (poster, trailer, dop, streaming) — useful once TMDB key arrives:
TMDB_KEY=xxx PATH="/opt/homebrew/bin:$PATH" node scripts/fetch-film-data.js
```

- Safe to re-run — skips films where the relevant fields are already populated
- Writes progress after every film (crash-safe)
- To force re-fetch a film: set `poster: null` and/or `plot: null` for that film in films.js

**Status:** OMDB enrichment complete (261 films have plot, runtime, ratings, language).
TMDB enrichment pending — waiting on TMDB API key approval.
OMDB key: stored in your password manager (do not commit to repo).

## Phase 4 — FilmModal (NEXT UP)

The modal shell exists at `src/components/FilmModal.jsx` but only shows a placeholder.
Build it out fully with this layout:

```
┌─────────────────────────────────────────────────────┐
│  [Poster img]   CITIZEN KANE                       ×│
│                 1941 · Orson Welles · 🇺🇸            │
│                 DoP: Gregg Toland · 119 min · English│
│                                                      │
│  [──── YouTube Trailer iframe embed ────]            │
│                                                      │
│  PLOT                                                │
│  Following the death of publishing tycoon…           │
│                                                      │
│  WHY THIS FILM MATTERS           ← only if why !== ""│
│  Citizen Kane invented the grammar…                  │
│                                                      │
│  RATINGS                                             │
│  IMDb 8.2  ·  RT 99%  ·  Metacritic 100             │
│                                                      │
│  WHERE TO WATCH                  ← only if streaming │
│  Max  ·  Criterion Channel                           │
└─────────────────────────────────────────────────────┘
```

### Implementation notes for FilmModal:
- All sections are **conditional** — omit gracefully if the field is null/empty
- Poster: `<img>` on the left at ~160px wide, floated or in a flex row with the title block
- Trailer: `<iframe>` embed using `https://www.youtube.com/embed/{film.trailer}`; only render if `film.trailer` is not null
- Ratings: render each of IMDb / RT / Metacritic only if non-null
- Streaming: render as pill-style spans, only if `film.streaming` is non-null
- "Why this film matters" section: only render if `film.why !== ""`
- Close on: ✕ button, Escape key, clicking the overlay (all already wired in current placeholder)
- Modal CSS classes already exist in `src/index.css` under `/* MODAL */`
- The checkbox toggle (mark as watched) should also be accessible from within the modal

### Modal CSS to add to src/index.css:
The existing modal base styles cover overlay, container, close button, title, meta, section tag.
Still need to add styles for: poster image, trailer iframe wrapper, plot text, ratings row, streaming pills, "why" section header + body, and the watched toggle inside the modal.

## Roadmap

### Completed
- [x] Migrate to React + Vite
- [x] GitHub Actions auto-deploy on push to master
- [x] Extract film data to `data/films.js` as ES module
- [x] Enrich all films with OMDB data (plot, runtime, ratings, language)
- [x] Modal shell with open/close/Escape/overlay-click

### Next
- [ ] **Phase 4:** Build out FilmModal component fully (see above)
- [ ] Run TMDB enrichment once API key is approved (poster, trailer, dop, streaming)
- [ ] Commit enriched films.js after TMDB run

### Medium-term
- [ ] "Start here" onboarding paths for new cinephiles
- [ ] Better mobile experience
- [ ] Add watched toggle inside modal

### Long-term
- [ ] Backend for cross-device sync (Supabase or similar)
- [ ] Community features (shared lists, recommendations)
- [ ] CMS for maintaining film data without editing code

## Conventions

- Keep the aesthetic restrained — resist adding color, animation, or visual noise
- Film data additions must follow the existing object schema exactly
- Section names in film data must match existing section names exactly
- The 💀 demanding flag is for: 3+ hour runtime, unconventional/slow structure, or intense subject matter
- Do not commit API keys or `.env` files
- `why` field is manually curated — the enrichment script never overwrites it
