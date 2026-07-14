import { Activity, Flame, Trophy } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Welcome back, Athlete</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's your training summary for this week.</p>
        </div>
        <button className="btn btn-primary">Log Workout</button>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(225, 29, 72, 0.1)', borderRadius: '12px' }}>
            <Activity color="var(--accent-red)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Workouts this week</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>4</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(225, 29, 72, 0.1)', borderRadius: '12px' }}>
            <Flame color="var(--accent-red)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Volume</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>24,500 kg</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(225, 29, 72, 0.1)', borderRadius: '12px' }}>
            <Trophy color="var(--accent-red)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PRs broken</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>2</p>
          </div>
        </div>
      </div>

      {/* Recent Workouts Shell */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1.5rem' }}>Recent Activity</h2>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No recent workouts found. Time to hit the iron.</p>
        </div>
      </section>
    </div>
  )
}