# The Canon — Cinephile Site

## Project Purpose

A personal film watchlist that doubles as a resource for anyone looking to get serious about cinema. The site tracks watched/unwatched status across ~300 canonical films and explains the curation philosophy behind the list.

**Long-term vision:** Grow into a genuinely useful starting point for cinephiles — curated paths, film detail pages, context for why films matter, and eventually community features.

## Current Files

| File | Role |
|------|------|
| `cinephile-watchlist.html` | Main watchlist — ~300 films, localStorage tracking, filter/search |
| `framework.html` | Curation philosophy — tiered inclusion system, qualifiers, section guide |

> **Planned rename:** `cinephile-watchlist.html` → `index.html` when deploying to GitHub Pages.

## Design System

The site has a deliberate editorial aesthetic — think a film journal, not an app.

### Color Palette (CSS variables)
```css
--cream:      #f5f0e8   /* page background */
--dark:       #1a1410   /* headings, nav bar bg */
--ink:        #2c2318   /* body text */
--gold:       #b8914a   /* primary accent — links, active states, section titles */
--gold-light: #d4a96a   /* stats bar numbers, CTA link color */
--red:        #8b2020   /* progress bar gradient start */
--muted:      #7a6e5f   /* secondary text, metadata */
--border:     rgba(184,145,74,0.25)  /* subtle gold border */
```

### Typography
- **Headings:** Cormorant Garamond (serif, weight 300/400/600, italic used heavily)
- **UI / Labels:** Josefin Sans (sans-serif, weight 200/300/400, ALL CAPS with wide letter-spacing)
- Both loaded from Google Fonts

### Design Principles
- Spacing is generous — sections breathe
- Labels use `font-size: 9–11px`, `letter-spacing: 0.25–0.4em`, `text-transform: uppercase`
- Cards use `rgba(255,255,255,0.4–0.5)` backgrounds with `1px solid var(--border)`
- Grid layouts use `gap: 2px` between cards (tight, newspaper-like)
- No shadows — borders only
- Italic serif text for any quote-like or descriptive copy

## Film Data Structure

Each film object in the `FILMS` array:
```js
{
  t: "Film Title",       // title
  y: 1972,               // year
  d: "Director Name",    // director
  c: "us",               // country code (maps to flag emoji via flagMap)
  s: "Section Name",     // display section (e.g. "Hollywood Golden Age")
  tags: ["french"],      // filter tags: "silent", "french", "blockbuster"
  dem: false             // true = 💀 demanding watch flag
}
```

Country codes → emoji flags are handled by `flagMap` object at top of script.

Watched state is persisted in `localStorage` under key `canon_v3`.

## Architecture Notes

- **Currently:** Pure vanilla HTML/CSS/JS — no build step, no dependencies beyond Google Fonts
- **Shared CSS** is duplicated in both HTML files — candidate for extraction to `styles.css`
- **Film data** is embedded in `cinephile-watchlist.html` — candidate for extraction to `data/films.js`
- **No backend** — all state is localStorage (personal use only at this stage)

## Deployment

- **Target host:** GitHub Pages (repo: `wcbsmith/cinephile-site`)
- **URL pattern:** `https://wcbsmith.github.io/cinephile-site/`
- Static files only — no build step required currently

## Roadmap

### Near-term
- [ ] Rename `cinephile-watchlist.html` to `index.html`
- [ ] Extract shared CSS to `styles.css`
- [ ] Extract film data to `data/films.js`
- [ ] Deploy to GitHub Pages

### Medium-term
- [ ] Individual film detail pages (synopsis, why it matters, where to stream)
- [ ] "Start here" onboarding paths for new cinephiles
- [ ] Better mobile experience
- [ ] Add ratings/notes capability per film

### Long-term
- [ ] Backend for cross-device sync (Supabase or similar)
- [ ] Community features (shared lists, recommendations)
- [ ] CMS for maintaining film data without editing code

## Conventions

- Keep the aesthetic restrained — resist adding color, animation, or visual noise
- Film data additions should follow the existing object schema exactly
- Section names in film data must exactly match existing section names or a new section will be created
- The 💀 demanding flag is for: 3+ hour runtime, unconventional/slow structure, or intense subject matter
