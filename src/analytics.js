// Visitor analytics — lưu ở backend (server/data/analytics.json)
import { isAdmin } from './auth'
import { api } from './api'

export async function trackVisit() {
  // Đừng đếm lượt truy cập của admin/superadmin
  if (isAdmin()) return
  try { await api.recordVisit(window.location.pathname) } catch {}
}

export async function getAnalytics() {
  let store = { visits: {}, pages: {}, total: 0, lastVisit: null }
  try { store = await api.getAnalytics() } catch {}

  const today = new Date().toISOString().slice(0, 10)

  // Build last 7 days
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({
      date: key,
      label: d.toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      visits: (store.visits?.[key] || 0),
    })
  }

  return {
    total: store.total || 0,
    today: store.visits?.[today] || 0,
    pages: store.pages || {},
    days,
    lastVisit: store.lastVisit || null,
  }
}
