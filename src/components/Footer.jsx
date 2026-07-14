export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-glass)',
      padding: '2rem 0',
      marginTop: 'auto',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem'
    }}>
      <p>© {new Date().getFullYear()} Gymmaxxify. Track with precision.</p>
    </footer>
  )
}