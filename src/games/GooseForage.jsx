import { useCallback, useEffect, useRef, useState } from 'react'

const CELLS = 16
const SIZE = 400
const CELL = SIZE / CELLS
const START = { x:2, y:2 }
const HEDGES = [
  { x:5, y:2 }, { x:5, y:3 }, { x:5, y:4 },
  { x:10, y:4 }, { x:11, y:4 }, { x:12, y:4 },
  { x:3, y:8 }, { x:4, y:8 }, { x:5, y:8 },
  { x:10, y:9 }, { x:10, y:10 }, { x:10, y:11 },
  { x:6, y:13 }, { x:7, y:13 }, { x:8, y:13 },
]
const MOVES = {
  ArrowUp: { x:0, y:-1 },
  ArrowDown: { x:0, y:1 },
  ArrowLeft: { x:-1, y:0 },
  ArrowRight: { x:1, y:0 },
  w: { x:0, y:-1 },
  s: { x:0, y:1 },
  a: { x:-1, y:0 },
  d: { x:1, y:0 },
}

function chooseSeed(goose) {
  const free = []
  for (let y = 0; y < CELLS; y += 1) {
    for (let x = 0; x < CELLS; x += 1) {
      if (
        (x !== goose.x || y !== goose.y) &&
        !HEDGES.some((hedge) => hedge.x === x && hedge.y === y)
      ) free.push({ x, y })
    }
  }
  return free[Math.floor(Math.random() * free.length)]
}

function drawGoose(ctx, x, y) {
  const cx = x * CELL + CELL / 2
  const cy = y * CELL + CELL / 2
  ctx.save()
  ctx.translate(cx, cy)

  // Original baby-goose design: fluffy cheeks, a tiny neckerchief, and bright eyes.
  ctx.fillStyle = 'rgba(24, 50, 37, 0.18)'
  ctx.beginPath()
  ctx.ellipse(0, 9, 10, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fffdf5'
  ctx.strokeStyle = '#e9e2ca'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.ellipse(-1, 2, 10, 7.5, -0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f6f0dc'
  ctx.beginPath()
  ctx.ellipse(-3, 1, 5, 4, -0.25, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fffdf5'
  ctx.beginPath()
  ctx.ellipse(3, -5, 6, 6.5, 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#fffdf5'
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.quadraticCurveTo(-3, -15, 1, -13)
  ctx.quadraticCurveTo(3, -16, 4, -11)
  ctx.quadraticCurveTo(7, -14, 7, -9)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#30453a'
  ctx.beginPath()
  ctx.arc(5, -6, 1.65, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(5.5, -6.6, 0.58, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f6a8a0'
  ctx.beginPath()
  ctx.ellipse(8, -2.5, 2.2, 1.3, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.moveTo(8, -5)
  ctx.quadraticCurveTo(14, -5, 15, -3)
  ctx.quadraticCurveTo(13, -1.5, 8, -2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#78c6bd'
  ctx.beginPath()
  ctx.moveTo(-2, -0.5)
  ctx.quadraticCurveTo(3, 1, 8, -0.5)
  ctx.lineTo(7, 2)
  ctx.quadraticCurveTo(3, 4, -1, 2.5)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(3, 2.5)
  ctx.lineTo(6, 3)
  ctx.lineTo(4, 6)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#e98618'
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-4, 7)
  ctx.lineTo(-5, 9)
  ctx.moveTo(2, 7)
  ctx.lineTo(3, 9)
  ctx.stroke()
  ctx.restore()
}

export default function GooseForage({ onWin, onLose, config = {} }) {
  const targetScore = config.targetScore ?? 9
  const canvasRef = useRef(null)
  const gooseRef = useRef(START)
  const seedRef = useRef({ x:12, y:12 })
  const scoreRef = useRef(0)
  const endedRef = useRef(false)
  const callbacksRef = useRef({ onWin, onLose })
  const [phase, setPhase] = useState('start')
  const [goose, setGoose] = useState(START)
  const [seed, setSeed] = useState(seedRef.current)
  const [score, setScore] = useState(0)

  useEffect(() => {
    callbacksRef.current = { onWin, onLose }
  }, [onWin, onLose])

  const startGame = useCallback(() => {
    gooseRef.current = START
    seedRef.current = chooseSeed(START)
    scoreRef.current = 0
    endedRef.current = false
    setGoose(START)
    setSeed(seedRef.current)
    setScore(0)
    setPhase('playing')
  }, [])

  const move = useCallback((direction) => {
    if (phase !== 'playing' || endedRef.current) return
    const next = {
      x: gooseRef.current.x + direction.x,
      y: gooseRef.current.y + direction.y,
    }
    const hitEdge = next.x < 0 || next.x >= CELLS || next.y < 0 || next.y >= CELLS
    const hitHedge = HEDGES.some((hedge) => hedge.x === next.x && hedge.y === next.y)
    if (hitEdge || hitHedge) {
      endedRef.current = true
      setPhase('ended')
      callbacksRef.current.onLose?.({
        score: scoreRef.current,
        total: targetScore,
        unit: 'hạt',
      })
      return
    }

    gooseRef.current = next
    setGoose(next)
    if (next.x === seedRef.current.x && next.y === seedRef.current.y) {
      const nextScore = scoreRef.current + 1
      scoreRef.current = nextScore
      setScore(nextScore)
      if (nextScore >= targetScore) {
        endedRef.current = true
        setPhase('ended')
        callbacksRef.current.onWin?.()
        return
      }
      seedRef.current = chooseSeed(next)
      setSeed(seedRef.current)
    }
  }, [phase, targetScore])

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const onKeyDown = (event) => {
      const direction = MOVES[event.key] || MOVES[event.key.toLowerCase()]
      if (!direction) return
      event.preventDefault()
      move(direction)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [move, phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#d9edc9'
    ctx.fillRect(0, 0, SIZE, SIZE)
    for (let y = 0; y < CELLS; y += 1) {
      for (let x = 0; x < CELLS; x += 1) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.12)'
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
        }
      }
    }

    HEDGES.forEach(({ x, y }) => {
      ctx.fillStyle = '#4d8b54'
      ctx.beginPath()
      ctx.roundRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4, 6)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.beginPath()
      ctx.arc(x * CELL + 8, y * CELL + 7, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    const seedX = seed.x * CELL + CELL / 2
    const seedY = seed.y * CELL + CELL / 2
    ctx.fillStyle = '#b7791f'
    ctx.beginPath()
    ctx.ellipse(seedX, seedY, 4, 6, -0.55, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f6c453'
    ctx.beginPath()
    ctx.ellipse(seedX - 1, seedY - 1, 1.4, 2.4, -0.55, 0, Math.PI * 2)
    ctx.fill()

    drawGoose(ctx, goose.x, goose.y)
  }, [goose, seed])

  const control = (key, label) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      onClick={() => move(MOVES[key])}
      style={{
        width:48,
        height:44,
        border:'1px solid rgba(255,255,255,0.34)',
        borderRadius:12,
        background:'rgba(255,255,255,0.74)',
        color:'#365b43',
        fontSize:19,
        fontWeight:800,
        cursor:'pointer',
        touchAction:'manipulation',
      }}
    >
      {key === 'ArrowUp' ? '↑' : key === 'ArrowDown' ? '↓' : key === 'ArrowLeft' ? '←' : '→'}
    </button>
  )

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
      background:'radial-gradient(circle at 50% 20%, #edf8da, #9fc79c 75%)',
      color:'#263d2e',
      fontFamily:'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, maxWidth:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'min(84vw, 400px)' }}>
          <strong style={{ color:'#365b43', fontSize:13, letterSpacing:'0.08em' }}>NGỖNG NHẶT HẠT</strong>
          <span style={{ color:'#365b43', fontSize:14 }}>🌾 {score}/{targetScore}</span>
        </div>
        <div style={{ position:'relative', width:'min(84vw, 400px)', aspectRatio:'1' }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            aria-label={`Ngỗng nhặt hạt, điểm ${score} trên ${targetScore}`}
            style={{ display:'block', width:'100%', height:'100%', border:'3px solid rgba(255,255,255,0.75)', borderRadius:18, boxShadow:'0 18px 48px rgba(37,76,45,0.18)' }}
          />
          {phase !== 'playing' && (
            <div style={overlayStyle}>
              <span style={{ fontSize:48 }}>{phase === 'ended' ? '🌿' : '🪿'}</span>
              <strong style={{ fontSize:22 }}>{phase === 'ended' ? 'Chuyến dạo vườn kết thúc' : 'Một vòng dạo vườn nhé?'}</strong>
              <p style={messageStyle}>
                {phase === 'ended'
                  ? `Ngỗng đã nhặt được ${score}/${targetScore} hạt.`
                  : `Dẫn bạn ngỗng nhặt ${targetScore} hạt, nhớ tránh các bụi cây nhé.`}
              </p>
              {phase === 'start' && (
                <button type="button" onClick={startGame} style={buttonStyle}>Bắt đầu</button>
              )}
            </div>
          )}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 48px)', gridTemplateRows:'repeat(2, 44px)', gap:6 }}>
          <span />
          {control('ArrowUp', 'Đi lên')}
          <span />
          {control('ArrowLeft', 'Đi sang trái')}
          {control('ArrowDown', 'Đi xuống')}
          {control('ArrowRight', 'Đi sang phải')}
        </div>
        <p style={{ maxWidth:350, margin:0, color:'rgba(38,61,46,0.7)', fontSize:12, textAlign:'center', lineHeight:1.6 }}>
          Dùng phím mũi tên, WASD hoặc các nút trên màn hình để di chuyển.
        </p>
      </div>
    </div>
  )
}

const overlayStyle = {
  position:'absolute',
  inset:0,
  display:'flex',
  flexDirection:'column',
  alignItems:'center',
  justifyContent:'center',
  gap:10,
  padding:24,
  boxSizing:'border-box',
  borderRadius:16,
  textAlign:'center',
  background:'rgba(238,248,225,0.92)',
}

const messageStyle = {
  maxWidth:270,
  margin:0,
  color:'rgba(38,61,46,0.76)',
  fontSize:13,
  lineHeight:1.6,
}

const buttonStyle = {
  border:0,
  borderRadius:10,
  padding:'11px 22px',
  color:'#fff',
  background:'#4d8b54',
  fontSize:14,
  fontWeight:800,
  cursor:'pointer',
}
