import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function Navbar() {
  return (
    <header style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(5, 5, 5, 0.6)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4.5rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.25rem' }}>
          <Activity color="var(--accent-red)" size={28} />
          <span>Gymmaxxify</span>
        </Link>
        
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
          <Link to="/workouts" style={{ color: 'var(--text-secondary)' }}>Workouts</Link>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
        </nav>
      </div>
    </header>
  )
}