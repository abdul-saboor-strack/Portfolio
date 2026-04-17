import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, message }
  }

  componentDidCatch(error, info) {
    console.error('Portfolio crashed:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="container" style={{ padding: '120px 22px 60px' }}>
        <div className="glass" style={{ padding: 18 }}>
          <div className="kicker">Runtime Error</div>
          <div className="h2" style={{ marginTop: 6 }}>
            The app failed to render.
          </div>
          <div style={{ color: 'var(--muted)', lineHeight: 1.8, marginTop: 10, whiteSpace: 'pre-wrap' }}>
            {this.state.message || 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }
}

