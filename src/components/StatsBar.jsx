export default function StatsBar({ total, watchedCount }) {
  const remaining = total - watchedCount
  const pct = total > 0 ? Math.round((watchedCount / total) * 100) : 0

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-num">{total}</span>
        <span className="stat-label">Total Films</span>
      </div>
      <div className="stat">
        <span className="stat-num">{watchedCount}</span>
        <span className="stat-label">Seen</span>
      </div>
      <div className="stat">
        <span className="stat-num">{remaining}</span>
        <span className="stat-label">Remaining</span>
      </div>
      <div className="stat">
        <span className="stat-num">{pct}%</span>
        <span className="stat-label">Complete</span>
      </div>
    </div>
  )
}
