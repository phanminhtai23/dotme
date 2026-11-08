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
  const [version, setVersion] = useState(cachedVersion)

  useEffect(() => {
    let cancelled = false
    // Without a cached choice, wait briefly for the server so visitors do not see the wrong version first.
    const fallback = setTimeout(() => { if (!cancelled) setVersion(current => current ?? DEFAULT_VERSION) }, 1500)
    api.getLandingVersion()
      .then(({ version: next }) => {
        if (cancelled || !isLandingVersion(next)) return
        setVersion(next)
        try { localStorage.setItem(CACHE_KEY, next) } catch { /* storage blocked */ }
      })
      .catch(() => { if (!cancelled) setVersion(current => current ?? DEFAULT_VERSION) })
    return () => { cancelled = true; clearTimeout(fallback) }
  }, [])

  if (!version) return null
  return <LandingView version={version} />
}
