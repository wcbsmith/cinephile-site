const FILTERS = [
  { key: 'all',        label: 'All Films' },
  { key: 'unseen',     label: 'Unseen' },
  { key: 'watched',    label: 'Watched' },
  { key: 'french',     label: '🇫🇷 French' },
  { key: 'demanding',  label: '💀 Demanding' },
  { key: 'silent',     label: 'Silent Era' },
  { key: 'blockbuster',label: 'Culture Definers' },
]

export default function Controls({ filter, onFilterChange, onSearch }) {
  return (
    <>
      <div className="controls">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Search by title or director…"
          onChange={e => onSearch(e.target.value)}
        />
      </div>
    </>
  )
}
