// Visitor analytics — lưu ở backend hoặc Supabase (nếu đã cấu hình)
import { isAdmin } from './auth'
import { api } from './api'

const VISITOR_ID_KEY = 'dotme_visitor_id'

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

function buildDays(history) {
  if (!history.length) return []

  const counts = new Map()
  let first = null
  let last = null

  for (const item of history) {
    const day = new Date(item.createdAt).toISOString().slice(0, 10)
    counts.set(day, (counts.get(day) || 0) + 1)
    if (!first || day < first) first = day
    if (!last || day > last) last = day
  }

  const days = []
  const cursor = new Date(`${first}T00:00:00`)
  const end = new Date(`${last}T00:00:00`)

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    days.push({
      date: key,
      label: cursor.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
      visits: counts.get(key) || 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export async function trackVisit() {
  // Đừng đếm lượt truy cập của admin/superadmin
  if (isAdmin()) return
  try {
    await api.recordVisit({
      page: window.location.pathname,
      visitorId: getVisitorId(),
      referrer: document.referrer || '',
    })
  } catch {}
}

export async function getAnalytics() {
  let store = { visits: {}, pages: {}, history: [], total: 0, lastVisit: null }
  try { store = await api.getAnalytics() } catch {}

  const history = Array.isArray(store.history) ? [...store.history] : []
  history.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const today = new Date().toISOString().slice(0, 10)
  const uniqueVisitors = new Set(history.map(item => item.visitorId || item.ip || item.userAgent || item.createdAt)).size

  const days = buildDays(history)
  const historyRows = [...history].reverse()

  return {
    total: store.total || history.length || 0,
    today: store.visits?.[today] || 0,
    uniqueVisitors,
    pages: store.pages || {},
    days,
    history: historyRows,
    firstVisit: history[0]?.createdAt || null,
    lastVisit: store.lastVisit || history.at(-1)?.createdAt || null,
  }
}
