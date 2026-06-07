import { useEffect, useState } from 'react'

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    let animId
    let current = { x: -100, y: -100 }

    const onMove = (e) => {
      current = { x: e.clientX, y: e.clientY }
      setPos(current)
    }
    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    const onEnter = (e) => {
      if (e.target.matches('a, button, [data-hover]')) setHovering(true)
    }
    const onLeave = (e) => {
      if (e.target.matches('a, button, [data-hover]')) setHovering(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)

    let trailPos = { x: -100, y: -100 }
    const animate = () => {
      trailPos.x += (current.x - trailPos.x) * 0.12
      trailPos.y += (current.y - trailPos.y) * 0.12
      setTrail({ x: trailPos.x, y: trailPos.y })
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: clicking ? 6 : 8,
        height: clicking ? 6 : 8,
        background: '#8B5CF6',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'width 0.1s, height 0.1s',
        boxShadow: '0 0 10px #8B5CF6',
      }} />
      <div style={{
        position: 'fixed',
        left: trail.x,
        top: trail.y,
        width: hovering ? 48 : 32,
        height: hovering ? 48 : 32,
        border: `1.5px solid ${hovering ? '#22D3EE' : 'rgba(139,92,246,0.5)'}`,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'width 0.2s, height 0.2s, border-color 0.2s',
        mixBlendMode: 'difference',
      }} />
    </>
  )
}
