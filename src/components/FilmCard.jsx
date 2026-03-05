import { flagMap } from '../../data/films'
import { fid } from '../App'

export default function FilmCard({ film, isWatched, onToggle, onSelect }) {
  function handleCheckbox(e) {
    e.stopPropagation()
    onToggle(film)
  }

  return (
    <div
      className={`film-card${isWatched ? ' watched' : ''}`}
      onClick={() => onSelect(film)}
    >
      <div className="checkbox" onClick={handleCheckbox}>
        <span className="checkbox-mark">✓</span>
      </div>
      <div className="film-info">
        <div className="film-title">{film.t}</div>
        <div className="film-meta">
          <span className="film-director">{film.d}</span>
          <span>{film.y}</span>
        </div>
      </div>
      <div className="film-right">
        <span className="film-flag">{flagMap[film.c] || ''}</span>
        {film.dem && <span title="Demanding watch — long or formally challenging">💀</span>}
      </div>
    </div>
  )
}
