export default function Workouts() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Workout Routines</h1>
        <button className="btn btn-primary">+ New Routine</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Placeholder Templates */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Push (Chest/Shoulders/Triceps)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>6 exercises • Last performed 2 days ago</p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>Start Routine</button>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Pull (Back/Biceps/Rear Delts)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>5 exercises • Last performed 4 days ago</p>
          <button className="btn btn-secondary" style={{ width: '100%' }}>Start Routine</button>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderStyle: 'dashed' }}>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', minHeight: '150px' }}>
            <span>Create a custom template</span>
          </div>
        </div>
      </div>
    </div>
  )
}