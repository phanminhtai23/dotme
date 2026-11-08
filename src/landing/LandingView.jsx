import { Suspense, useEffect } from 'react'
import { LangProvider } from '../LangContext'
import { trackVisit } from '../analytics'
import { LANDING_VERSIONS, DEFAULT_VERSION, isLandingVersion } from './versions'

/** Renders one landing version. `track` is off for admin previews so they do not count as visits. */
export default function LandingView({ version, track = true }) {
  const id = isLandingVersion(version) ? version : DEFAULT_VERSION
  const Version = LANDING_VERSIONS.find(item => item.id === id).load

  useEffect(() => { if (track) trackVisit() }, [track])

  return (
    <LangProvider>
      <Suspense fallback={null}><Version /></Suspense>
    </LangProvider>
  )
}
