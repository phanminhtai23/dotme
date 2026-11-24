import { useEffect, useState } from 'react'
import { api } from './api'
import LandingView from './landing/LandingView'
import { DEFAULT_VERSION, isLandingVersion } from './landing/versions'

const CACHE_KEY = 'dotme_landing_version'

function cachedVersion() {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    return isLandingVersion(saved) ? saved : null
  } catch { return null }
}

export default function App() {
  // Render the current public design immediately; fetch the admin-selected version in parallel.
  const [version, setVersion] = useState(() => cachedVersion() || DEFAULT_VERSION)

  useEffect(() => {
    let cancelled = false
    api.getLandingVersion()
      .then(({ version: next }) => {
        if (cancelled || !isLandingVersion(next)) return
        setVersion(next)
        try { localStorage.setItem(CACHE_KEY, next) } catch { /* storage blocked */ }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return <LandingView version={version} />
}
