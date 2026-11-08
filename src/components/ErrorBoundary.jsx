import { Component } from 'react'

const box = {
  minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0b0d12', color: '#e8eaf0',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
}
const card = { maxWidth: 640, width: '100%', background: '#12151c', border: '1px solid #343b4b', borderRadius: 12, padding: 24 }
const pre = { margin: '12px 0 0', padding: 12, background: '#0b0d12', borderRadius: 8, fontSize: 12, lineHeight: 1.5, overflow: 'auto', maxHeight: 220, whiteSpace: 'pre-wrap' }
const btn = { padding: '10px 16px', borderRadius: 8, border: '1px solid #343b4b', background: '#1a1e28', color: '#e8eaf0', cursor: 'pointer', font: 'inherit' }

/** Shows what went wrong on screen instead of leaving a blank page when a component throws while rendering. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) { return { error } }

  componentDidCatch(error, info) { console.error('Render error:', error, info?.componentStack) }

  reset = () => {
    try { Object.keys(localStorage).filter(key => key.startsWith('dotme_')).forEach(key => localStorage.removeItem(key)) } catch { /* storage blocked */ }
    window.location.assign('/')
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div style={box}>
        <div style={card} role="alert">
          <h1 style={{ margin: 0, fontSize: 20 }}>Trang gặp lỗi khi hiển thị</h1>
          <p style={{ margin: '8px 0 0', color: '#b3b9c8', lineHeight: 1.5 }}>Chụp màn hình này gửi cho người quản trị. Bạn có thể thử tải lại hoặc xóa dữ liệu đã lưu của trang rồi vào lại.</p>
          <pre style={pre}>{String(error?.message || error)}{'\n\n'}{String(error?.stack || '').split('\n').slice(1, 6).join('\n')}</pre>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button type="button" style={btn} onClick={() => window.location.reload()}>Tải lại</button>
            <button type="button" style={btn} onClick={this.reset}>Xóa dữ liệu đã lưu và về trang chủ</button>
          </div>
        </div>
      </div>
    )
  }
}
