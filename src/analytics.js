// Lightweight in-memory analytics (resets on refresh — no backend needed)
const KEY = 'dotme_analytics'

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function save(store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function trackVisit() {
  const store = getStore()
  const today = new Date().toISOString().slice(0, 10)
  if (!store.visits) store.visits = {}
  store.visits[today] = (store.visits[today] || 0) + 1

  const page = window.location.pathname
  if (!store.pages) store.pages = {}
  store.pages[page] = (store.pages[page] || 0) + 1

  store.total = (store.total || 0) + 1
  store.lastVisit = new Date().toISOString()
  save(store)
}

export function getAnalytics() {
  const store = getStore()
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
