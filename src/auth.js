import { api } from './api'

const SESSION_KEY = 'dotme_session'

export async function login(username, password) {
  try {
    const session = await api.login(username, password)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { ok: true, session }
  } catch (err) {
    return { error: err.message }
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}

export function isAuthenticated() {
  return getSession() !== null
}

export function isAdmin() {
  const s = getSession()
  return s?.role === 'superadmin' || s?.role === 'admin'
}
