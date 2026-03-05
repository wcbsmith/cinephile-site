#!/usr/bin/env node
/**
 * THE CANON — Film Data Enrichment Script
 *
 * Fetches poster, trailer, runtime, DoP, plot, ratings, language, and
 * streaming availability for each film and writes back to data/films.js.
 *
 * Usage:
 *   OMDB_KEY=your_key TMDB_KEY=your_key node scripts/fetch-film-data.js
 *
 * Both keys are optional — the script only runs the sources whose keys are provided.
 * Safe to re-run — skips sources that are already populated for each film.
 * To force a re-fetch of a specific film, null out the relevant fields in films.js.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OMDB_KEY = process.env.OMDB_KEY
const TMDB_KEY = process.env.TMDB_KEY

if (!OMDB_KEY && !TMDB_KEY) {
  console.error('Error: Provide at least one API key.')
  console.error('Usage: OMDB_KEY=xxx TMDB_KEY=xxx node scripts/fetch-film-data.js')
  process.exit(1)
}

console.log(`Running with: ${[OMDB_KEY && 'OMDB', TMDB_KEY && 'TMDB'].filter(Boolean).join(' + ')}`)

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500'

const { FILMS } = await import('../data/films.js')

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── OMDB ─────────────────────────────────────────────────────────────────────
async function fetchOMDB(title, year) {
  if (!OMDB_KEY) return null
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${OMDB_KEY}`
    const data = await fetchJSON(url)
    if (data.Response === 'False') return null

    const ratings = { imdb: null, rt: null, meta: null }
    if (data.imdbRating && data.imdbRating !== 'N/A') ratings.imdb = data.imdbRating
    for (const r of (data.Ratings || [])) {
      if (r.Source === 'Rotten Tomatoes') ratings.rt = r.Value
      if (r.Source === 'Metacritic') ratings.meta = parseInt(r.Value) || null
    }

    return {
      plot:     data.Plot    !== 'N/A' ? data.Plot : null,
      runtime:  data.Runtime !== 'N/A' ? (parseInt(data.Runtime) || null) : null,
      language: data.Language && data.Language !== 'N/A'
                  ? data.Language.split(',')[0].trim()
                  : null,
      ratings,
    }
  } catch (e) {
    console.warn(`    OMDB failed: ${e.message}`)
    return null
  }
}

// ── TMDB ─────────────────────────────────────────────────────────────────────
async function fetchTMDB(title, year) {
  if (!TMDB_KEY) return null
  try {
    const search = await fetchJSON(
      `${TMDB_BASE}/search/movie?query=${encodeURIComponent(title)}&year=${year}&api_key=${TMDB_KEY}`
    )

    // Fall back to searching without year if no results
    let movie = search.results?.[0]
    if (!movie) {
      const fallback = await fetchJSON(
        `${TMDB_BASE}/search/movie?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}`
      )
      movie = fallback.results?.[0]
    }
    if (!movie) return null

    const id = movie.id

    // Fetch videos, credits, and watch providers in parallel
    const [videos, credits, providers] = await Promise.all([
      fetchJSON(`${TMDB_BASE}/movie/${id}/videos?api_key=${TMDB_KEY}`),
      fetchJSON(`${TMDB_BASE}/movie/${id}/credits?api_key=${TMDB_KEY}`),
      fetchJSON(`${TMDB_BASE}/movie/${id}/watch/providers?api_key=${TMDB_KEY}`),
    ])

    // YouTube trailer — prefer official trailers
    const trailer =
      videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official)?.key ||
      videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key ||
      null

    // Director of Photography
    const dop = credits.crew?.find(c => c.job === 'Director of Photography')?.name || null

    // US subscription streaming (flatrate only — not rental/purchase)
    const flatrate = providers.results?.US?.flatrate || []
    const streaming = flatrate.length ? flatrate.map(p => p.provider_name) : null

    return {
      poster:    movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
      trailer,
      dop,
      streaming,
    }
  } catch (e) {
    console.warn(`    TMDB failed: ${e.message}`)
    return null
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
const enriched = []
let fetched = 0
let skipped = 0

console.log(`\nThe Canon — Film Data Enrichment`)
console.log(`${'─'.repeat(40)}`)
console.log(`Total films: ${FILMS.length}\n`)

for (const film of FILMS) {
  // Determine what still needs fetching for this film
  const needsOMDB = OMDB_KEY && film.plot === null
  const needsTMDB = TMDB_KEY && film.poster === null

  if (!needsOMDB && !needsTMDB) {
    process.stdout.write(`⏭  ${film.t} (${film.y}) — already enriched\n`)
    enriched.push(film)
    skipped++
    continue
  }

  process.stdout.write(`↓  ${film.t} (${film.y})… `)

  const [omdb, tmdb] = await Promise.all([
    needsOMDB ? fetchOMDB(film.t, film.y) : null,
    needsTMDB ? fetchTMDB(film.t, film.y) : null,
  ])

  const updated = {
    ...film,
    // Only overwrite TMDB fields if we fetched TMDB this run
    poster:    needsTMDB ? (tmdb?.poster    ?? null) : film.poster,
    trailer:   needsTMDB ? (tmdb?.trailer   ?? null) : film.trailer,
    dop:       needsTMDB ? (tmdb?.dop       ?? null) : film.dop,
    streaming: needsTMDB ? (tmdb?.streaming ?? null) : film.streaming,
    // Only overwrite OMDB fields if we fetched OMDB this run
    runtime:   needsOMDB ? (omdb?.runtime   ?? null) : film.runtime,
    plot:      needsOMDB ? (omdb?.plot      ?? null) : film.plot,
    ratings:   needsOMDB ? (omdb?.ratings   ?? { imdb: null, rt: null, meta: null }) : film.ratings,
    language:  needsOMDB ? (omdb?.language  ?? null) : film.language,
    // Always preserve curated 'why' text
    why: film.why || '',
  }

  enriched.push(updated)
  fetched++

  const flags = [
    updated.poster    ? '🖼'  : (needsTMDB ? '✗poster' : ''),
    updated.trailer   ? '▶'   : (needsTMDB ? '✗trailer' : ''),
    updated.runtime   ? `${updated.runtime}m` : (needsOMDB ? '✗runtime' : ''),
    updated.dop       ? `DoP:${updated.dop.split(' ').pop()}` : '',
    updated.ratings?.imdb ? `IMDb:${updated.ratings.imdb}` : '',
    updated.streaming ? `[${updated.streaming.slice(0,2).join(', ')}]` : (needsTMDB ? '✗streaming' : ''),
  ].filter(Boolean).join(' ')

  console.log(flags || 'no data found')

  // Write progress after each film so a crash does not lose work
  writeFilmsJS(enriched, FILMS.length)

  // Respect TMDB rate limit (40 req/10s). ~4 req/film so 300ms gap is safe.
  if (needsTMDB) await sleep(300)
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`Done. Fetched: ${fetched}  Skipped: ${skipped}`)
console.log(`Output: data/films.js`)

// ── FILE WRITER ───────────────────────────────────────────────────────────────
function filmToLine(f) {
  const r = f.ratings || { imdb: null, rt: null, meta: null }
  return (
    `  {t:${j(f.t)},y:${f.y},d:${j(f.d)},c:${j(f.c)},s:${j(f.s)},` +
    `tags:${JSON.stringify(f.tags)},dem:${f.dem},` +
    `poster:${j(f.poster)},trailer:${j(f.trailer)},runtime:${j(f.runtime)},` +
    `dop:${j(f.dop)},plot:${j(f.plot)},` +
    `ratings:{imdb:${j(r.imdb)},rt:${j(r.rt)},meta:${j(r.meta)}},` +
    `language:${j(f.language)},streaming:${JSON.stringify(f.streaming)},why:${j(f.why)}}`
  )
}

function j(v) { return JSON.stringify(v) }

function writeFilmsJS(films, total) {
  const filmsPath = join(__dirname, '../data/films.js')
  const original  = readFileSync(filmsPath, 'utf8')

  // Preserve everything before "export const FILMS"
  const headerEnd = original.indexOf('export const FILMS')
  const header    = original.slice(0, headerEnd)

  // Group films back into sections with comments
  let body = ''
  let currentSection = null
  for (const f of films) {
    if (f.s !== currentSection) {
      currentSection = f.s
      body += `\n  // ${f.s.toUpperCase()}\n`
    }
    body += filmToLine(f) + ',\n'
  }

  // If we have not processed all films yet, pad with remaining originals
  if (films.length < total) {
    const remaining = FILMS.slice(films.length)
    for (const f of remaining) {
      if (f.s !== currentSection) {
        currentSection = f.s
        body += `\n  // ${f.s.toUpperCase()}\n`
      }
      body += filmToLine(f) + ',\n'
    }
  }

  writeFileSync(filmsPath, `${header}export const FILMS = [${body}];\n`)
}
