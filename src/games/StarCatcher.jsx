import { useCallback, useEffect, useRef, useState } from 'react'

const WIDTH = 400
const HEIGHT = 560
const BASKET_Y = 500
const BASKET_WIDTH = 86
const STAR_RADIUS = 12

function drawScene(ctx, stars, basketX, score, misses, targetScore) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#111936')
  sky.addColorStop(1, '#46215d')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  for (let i = 0; i < 36; i += 1) {
    const x = (i * 97 + 31) % WIDTH
    const y = (i * 61 + 17) % HEIGHT
    ctx.fillStyle = `rgba(255,255,255,${0.25 + (i % 5) * 0.12})`
    ctx.beginPath()
    ctx.arc(x, y, i % 7 === 0 ? 2 : 1, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#fff2b2'
  ctx.beginPath()
  ctx.arc(326, 90, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#111936'
  ctx.beginPath()
  ctx.arc(340, 79, 32, 0, Math.PI * 2)
  ctx.fill()

  stars.forEach((star) => {
    ctx.save()
    ctx.translate(star.x, star.y)
    ctx.rotate(star.rotation)
    ctx.shadowColor = '#ffe27a'
    ctx.shadowBlur = 16
    ctx.fillStyle = '#ffe27a'
    ctx.beginPath()
    for (let point = 0; point < 10; point += 1) {
      const angle = (point * Math.PI) / 5 - Math.PI / 2
      const radius = point % 2 === 0 ? STAR_RADIUS : STAR_RADIUS * 0.44
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (point === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(0, BASKET_Y + 18, WIDTH, 2)
  ctx.save()
  ctx.translate(basketX, BASKET_Y)
  ctx.shadowColor = '#f9a8d4'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#f9a8d4'
  ctx.beginPath()
  ctx.moveTo(-BASKET_WIDTH / 2, 0)
  ctx.lineTo(BASKET_WIDTH / 2, 0)
  ctx.lineTo(BASKET_WIDTH / 2 - 12, 31)
  ctx.quadraticCurveTo(0, 43, -BASKET_WIDTH / 2 + 12, 31)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#ffe6f2'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(-BASKET_WIDTH / 2 - 4, 0)
  ctx.lineTo(BASKET_WIDTH / 2 + 4, 0)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.fillText(`✨ ${score}/${targetScore}`, 18, 30)
  ctx.fillText(`🌧️ ${misses}/5`, WIDTH - 90, 30)
}

export default function StarCatcher({ onWin, onLose, config = {} }) {
  const targetScore = config.targetScore ?? 12
  const duration = config.duration ?? 35
  const fallSpeed = config.fallSpeed ?? 180
  const spawnInterval = config.spawnInterval ?? 850
  const canvasRef = useRef(null)
  const starsRef = useRef([])
  const basketXRef = useRef(WIDTH / 2)
  const scoreRef = useRef(0)
  const missesRef = useRef(0)
  const endedRef = useRef(false)
  const callbacksRef = useRef({ onWin, onLose })
  const [phase, setPhase] = useState('start')
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    callbacksRef.current = { onWin, onLose }
  }, [onWin, onLose])

  const finish = useCallback((won) => {
    if (endedRef.current) return
    endedRef.current = true
    setPhase('ended')
    if (won) callbacksRef.current.onWin?.()
    else {
      callbacksRef.current.onLose?.({
        score: scoreRef.current,
        total: targetScore,
        unit: 'sao',
      })
    }
  }, [targetScore])

  const startGame = useCallback(() => {
    starsRef.current = []
    basketXRef.current = WIDTH / 2
    scoreRef.current = 0
    missesRef.current = 0
    endedRef.current = false
    setScore(0)
    setMisses(0)
    setTimeLeft(duration)
    setPhase('playing')
  }, [duration])

  const moveBasket = useCallback((direction) => {
    basketXRef.current = Math.max(
      BASKET_WIDTH / 2,
      Math.min(WIDTH - BASKET_WIDTH / 2, basketXRef.current + direction * 34),
    )
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    let frameId
    let previousTime = 0
    let elapsed = 0
    let lastSpawn = 0
    let lastHudUpdate = 0

    const tick = (timestamp) => {
      if (!previousTime) previousTime = timestamp
      const elapsedDelta = Math.max(0, (timestamp - previousTime) / 1000)
      const delta = Math.min(elapsedDelta, 0.05)
      previousTime = timestamp
      elapsed += elapsedDelta

      if (elapsed - lastSpawn >= spawnInterval / 1000) {
        starsRef.current.push({
          x: STAR_RADIUS + Math.random() * (WIDTH - STAR_RADIUS * 2),
          y: -STAR_RADIUS,
          rotation: Math.random() * Math.PI,
        })
        lastSpawn = elapsed
      }

      starsRef.current = starsRef.current.filter((star) => {
        star.y += fallSpeed * delta
        star.rotation += delta
        const caught = star.y + STAR_RADIUS >= BASKET_Y
          && star.y - STAR_RADIUS <= BASKET_Y + 30
          && Math.abs(star.x - basketXRef.current) <= BASKET_WIDTH / 2
        if (caught) {
          scoreRef.current += 1
          setScore(scoreRef.current)
          if (scoreRef.current >= targetScore) finish(true)
          return false
        }
        if (star.y - STAR_RADIUS > HEIGHT) {
          missesRef.current += 1
          setMisses(missesRef.current)
          if (missesRef.current >= 5) finish(false)
          return false
        }
        return true
      })

      const remaining = Math.max(0, Math.ceil(duration - elapsed))
      if (timestamp - lastHudUpdate >= 200) {
        setTimeLeft(remaining)
        lastHudUpdate = timestamp
      }

      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) drawScene(ctx, starsRef.current, basketXRef.current, scoreRef.current, missesRef.current, targetScore)

      if (elapsed >= duration) {
        finish(false)
        return
      }
      if (!endedRef.current) frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [duration, fallSpeed, finish, phase, spawnInterval, targetScore])

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault()
        moveBasket(-1)
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault()
        moveBasket(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moveBasket, phase])

  const trackPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const scale = WIDTH / bounds.width
    basketXRef.current = Math.max(
      BASKET_WIDTH / 2,
      Math.min(WIDTH - BASKET_WIDTH / 2, (event.clientX - bounds.left) * scale),
    )
  }

  return (
    <div style={{
      position:'relative',
      width:'100%',
      height:'100%',
      minHeight:520,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      overflow:'auto',
      padding:20,
      boxSizing:'border-box',
      background:'radial-gradient(circle at 50% 20%, #41305f, #100e24 80%)',
      color:'#fff',
      fontFamily:'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, maxWidth:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', width:'min(84vw, 400px)', color:'#ffe6f2', fontSize:14, fontWeight:700 }}>
          <span>🌠 HỨNG SAO</span>
          <span>{score}/{targetScore} · {timeLeft}s</span>
        </div>
        <div style={{ position:'relative', width:'min(84vw, 400px)', aspectRatio:`${WIDTH}/${HEIGHT}` }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onPointerDown={trackPointer}
            onPointerMove={(event) => { if (event.buttons > 0) trackPointer(event) }}
            aria-label={`Hứng sao, ${score} trên ${targetScore}, còn ${timeLeft} giây`}
            style={{ display:'block', width:'100%', height:'100%', border:'2px solid rgba(255,255,255,0.2)', borderRadius:18, touchAction:'none' }}
          />
          {phase !== 'playing' && (
            <div style={overlayStyle}>
              <span style={{ fontSize:46 }}>{phase === 'ended' ? '🌙' : '🌠'}</span>
              <strong style={{ fontSize:22 }}>{phase === 'ended' ? 'Đêm ngắm sao kết thúc' : 'Sẵn sàng hứng sao?'}</strong>
              <p style={messageStyle}>
                {phase === 'ended'
                  ? `Bạn đã hứng được ${score}/${targetScore} ngôi sao.`
                  : `Hứng ${targetScore} ngôi sao trong ${duration} giây và đừng để rơi quá 5 ngôi.`}
              </p>
              {phase === 'start' && <button type="button" onClick={startGame} style={buttonStyle}>Bắt đầu</button>}
            </div>
          )}
        </div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'44px minmax(0, 1fr) 44px',
          alignItems:'center',
          gap:12,
          width:'min(84vw, 400px)',
        }}>
          <button type="button" aria-label="Di chuyển giỏ sang trái" onClick={() => moveBasket(-1)} style={controlStyle}>←</button>
          <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>← → / A D · Kéo giỏ để di chuyển</span>
          <button type="button" aria-label="Di chuyển giỏ sang phải" onClick={() => moveBasket(1)} style={controlStyle}>→</button>
        </div>
      </div>
    </div>
  )
}

const controlStyle = {
  width:44,
  minWidth:44,
  height:44,
  boxSizing:'border-box',
  border:'1px solid rgba(255,255,255,0.24)',
  borderRadius:12,
  background:'rgba(255,255,255,0.1)',
  color:'#fff',
  fontSize:22,
  fontWeight:800,
  cursor:'pointer',
  touchAction:'manipulation',
}

const overlayStyle = {
  position:'absolute',
  inset:0,
  display:'flex',
  flexDirection:'column',
  alignItems:'center',
  justifyContent:'center',
  gap:12,
  padding:24,
  borderRadius:18,
  background:'rgba(12,10,30,0.84)',
  textAlign:'center',
}

const messageStyle = {
  maxWidth:290,
  margin:0,
  color:'rgba(255,255,255,0.72)',
  fontSize:14,
  lineHeight:1.7,
}

const buttonStyle = {
  border:0,
  borderRadius:99,
  padding:'12px 26px',
  background:'linear-gradient(135deg,#f9a8d4,#c084fc)',
  color:'#21132c',
  fontSize:15,
  fontWeight:800,
  cursor:'pointer',
}
