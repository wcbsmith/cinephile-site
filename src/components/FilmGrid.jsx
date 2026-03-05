import { FILMS } from '../../data/films'
import { fid } from '../App'
import FilmCard from './FilmCard'

// Preserve original section order
const SECTION_ORDER = [...new Set(FILMS.map(f => f.s))]

export default function FilmGrid({ films, filtered, watched, onToggle, onSelect }) {
  const hasResults = filtered.length > 0

  if (!hasResults) {
    return (
      <main>
        <p className="no-results">No films match your search.</p>
      </main>
    )
  }

  return (
    <main>
      {SECTION_ORDER.map(section => {
        const sectionFilms = filtered.filter(f => f.s === section)
        if (!sectionFilms.length) return null
        return (
          <div key={section} className="section">
            <div className="section-header">
              <span className="section-title">{section}</span>
              <span className="section-count">
                {sectionFilms.length} film{sectionFilms.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="films-grid">
              {sectionFilms.map(f => (
                <FilmCard
                  key={fid(f)}
                  film={f}
                  isWatched={!!watched[fid(f)]}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )
      })}
    </main>
  )
}
