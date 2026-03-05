import { useEffect } from 'react'
import { flagMap } from '../../data/films'

export default function FilmModal({ film, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <p className="modal-section-tag">{film.s}</p>
          <h2 className="modal-title">{film.t}</h2>
          <p className="modal-meta">
            {film.y} · {film.d} · {flagMap[film.c] || ''}
            {film.dem && <span className="modal-demanding"> · 💀 Demanding</span>}
          </p>
          <p className="modal-coming-soon">
            Full details coming soon — poster, trailer, ratings, and streaming info
            will appear here once the data enrichment script has been run.
          </p>
        </div>
      </div>
    </div>
  )
}
