export default function Footer() {
  const onBackToTop = () => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  return (
    <footer style={{ padding: '26px 0 44px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} Your Name. Built with neon glass UI.
        </div>
        <button type="button" className="btn btnSecondary" onClick={onBackToTop} style={{ padding: '10px 14px', borderRadius: 14, fontWeight: 900 }}>
          Back to Top
        </button>
      </div>
    </footer>
  )
}

