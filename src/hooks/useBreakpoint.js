import { useEffect, useState } from 'react'

export function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return {
    isMobile: width < 768,
    isTablet: width < 1024,
    width,
  }
}
