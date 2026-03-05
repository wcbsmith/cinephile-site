import { useState, useMemo } from 'react'
import { FILMS } from '../data/films'
import Nav from './components/Nav'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import Controls from './components/Controls'
import FilmGrid from './components/FilmGrid'
import FilmModal from './components/FilmModal'

// Deduplicate by title+year, keeping first occurrence
const seenKeys = new Set()
const films = FILMS.filter(f => {
  const k = f.t + f.y
  if (seenKeys.has(k)) return false
  seenKeys.add(k)
  return true
})

export function fid(f) {
  return (f.t + f.y).replace(/[^a-zA-Z0-9]/g, '')
}

export default function App() {
  const [watched, setWatched] = useState(() => {
    try { return JSON.parse(localStorage.getItem('canon_v3') || '{}') } catch { return {} }
  })
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilm, setSelectedFilm] = useState(null)

  function toggle(f) {
    const id = fid(f)
    const next = { ...watched, [id]: !watched[id] }
    setWatched(next)
    try { localStorage.setItem('canon_v3', JSON.stringify(next)) } catch {}
  }

  const filtered = useMemo(() => {
    return films.filter(f => {
      const id = fid(f)
      if (filter === 'unseen' && watched[id]) return false
      if (filter === 'watched' && !watched[id]) return false
      if (filter === 'french' && !f.tags.includes('french')) return false
      if (filter === 'demanding' && !f.dem) return false
      if (filter === 'silent' && !f.tags.includes('silent')) return false
      if (filter === 'blockbuster' && !f.tags.includes('blockbuster')) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!f.t.toLowerCase().includes(q) && !f.d.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [filter, searchQuery, watched])

  const watchedCount = useMemo(
    () => films.filter(f => watched[fid(f)]).length,
    [watched]
  )

  return (
    <>
      <Nav />
      <Header />
      <StatsBar total={films.length} watchedCount={watchedCount} />
      <Controls filter={filter} onFilterChange={setFilter} onSearch={setSearchQuery} />
      <FilmGrid
        films={films}
        filtered={filtered}
        watched={watched}
        onToggle={toggle}
        onSelect={setSelectedFilm}
      />
      <div className="progress-bar-wrap">
        <div
          className="progress-bar"
          style={{ width: `${(watchedCount / films.length) * 100}%` }}
        />
      </div>
      {selectedFilm && (
        <FilmModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />
      )}
    </>
  )
}
