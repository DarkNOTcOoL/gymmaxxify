import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Dumbbell, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }}>
        <div style={{ display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '999px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.2)', color: 'var(--accent-red)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 500 }}>
          Version 1.0 is now live
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          <span className="dot-heading" data-text="Master your physique." style={{ display: 'block' }}>
            Master your physique.
          </span>
          <span className="text-gradient-red">Zero guesswork.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
          The elegant, data-driven way to track progressive overload. Built for lifters who treat their body like an engineering project.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            Start Tracking <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Dumbbell color="var(--accent-red)" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Intelligent Logging</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Frictionless workout entry. Automatically pull data from your last session to ensure progressive overload.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <BarChart3 color="var(--accent-red)" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Analytics Engine</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Visualize volume, 1RM trends, and body metrics with beautiful, high-performance charts.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Zap color="var(--accent-red)" size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Tactile Experience</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Keyboard-first design and blazing fast state management so you spend less time on your phone at the gym.</p>
        </div>
      </section>
    </div>
  )
}
