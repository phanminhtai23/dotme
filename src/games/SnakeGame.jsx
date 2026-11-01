import { useCallback, useEffect, useRef, useState } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20
const BOARD_SIZE = GRID_SIZE * CELL_SIZE
const INITIAL_SNAKE = [{ x:8, y:10 }, { x:7, y:10 }, { x:6, y:10 }]

const DIRECTIONS = {
  ArrowUp: { x:0, y:-1 },
  ArrowDown: { x:0, y:1 },
  ArrowLeft: { x:-1, y:0 },
  ArrowRight: { x:1, y:0 },
  w: { x:0, y:-1 },
  s: { x:0, y:1 },
  a: { x:-1, y:0 },
  d: { x:1, y:0 },
}

function createFood(snake) {
  const freeCells = []
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        freeCells.push({ x, y })
      }
    }
  }
  return freeCells[Math.floor(Math.random() * freeCells.length)]
}

export default function SnakeGame({ onWin, onLose, config = {} }) {
  const tickMs = config.tickMs ?? 125
  const targetScore = config.targetScore ?? 12
  const canvasRef = useRef(null)
  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef({ x:14, y:10 })
  const directionRef = useRef({ x:1, y:0 })
  const queuedDirectionRef = useRef({ x:1, y:0 })
  const scoreRef = useRef(0)
  const callbacksRef = useRef({ onWin, onLose })
  const [phase, setPhase] = useState('start')
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(foodRef.current)
  const [score, setScore] = useState(0)

  useEffect(() => {
    callbacksRef.current = { onWin, onLose }
  }, [onWin, onLose])

  const changeDirection = useCallback((direction) => {
    const queued = queuedDirectionRef.current
    if (direction.x + queued.x === 0 && direction.y + queued.y === 0) return
    queuedDirectionRef.current = direction
  }, [])

  const startGame = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE
    foodRef.current = createFood(INITIAL_SNAKE)
    directionRef.current = { x:1, y:0 }
    queuedDirectionRef.current = { x:1, y:0 }
    scoreRef.current = 0
    setSnake(INITIAL_SNAKE)
    setFood(foodRef.current)
    setScore(0)
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    const onKeyDown = (event) => {
      const direction = DIRECTIONS[event.key] || DIRECTIONS[event.key.toLowerCase()]
      if (!direction) return
      event.preventDefault()
      changeDirection(direction)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [changeDirection, phase])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    const timer = window.setInterval(() => {
      const direction = queuedDirectionRef.current
      directionRef.current = direction
      const currentSnake = snakeRef.current
      const head = {
        x: currentSnake[0].x + direction.x,
        y: currentSnake[0].y + direction.y,
      }
      const eating = head.x === foodRef.current.x && head.y === foodRef.current.y
      const body = eating ? currentSnake : currentSnake.slice(0, -1)
      const hitWall =
        head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE

      if (hitWall || body.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setPhase('ended')
        callbacksRef.current.onLose?.({
          score: scoreRef.current,
          total: targetScore,
          unit: 'mồi',
        })
        return
      }

      const nextSnake = [head, ...body]
      snakeRef.current = nextSnake
      setSnake(nextSnake)

      if (eating) {
        const nextScore = scoreRef.current + 1
        scoreRef.current = nextScore
        setScore(nextScore)
        const nextFood = createFood(nextSnake)
        foodRef.current = nextFood
        setFood(nextFood)

        if (nextScore >= targetScore) {
          setPhase('ended')
          callbacksRef.current.onWin?.()
        }
      }
    }, tickMs)

    return () => window.clearInterval(timer)
  }, [phase, targetScore, tickMs])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.fillStyle = '#07131a'
    context.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE)
    context.strokeStyle = 'rgba(125, 211, 190, 0.08)'
    context.lineWidth = 1
    for (let cell = 0; cell <= GRID_SIZE; cell += 1) {
      const offset = cell * CELL_SIZE
      context.beginPath()
      context.moveTo(offset, 0)
      context.lineTo(offset, BOARD_SIZE)
      context.stroke()
      context.beginPath()
      context.moveTo(0, offset)
      context.lineTo(BOARD_SIZE, offset)
      context.stroke()
    }

    context.fillStyle = '#fb7185'
    context.beginPath()
    context.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE * 0.34,
      0,
      Math.PI * 2,
    )
    context.fill()

    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? '#a7f3d0' : '#34d399'
      context.beginPath()
      context.roundRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        6,
      )
      context.fill()
    })
  }, [food, snake])

  const controlButton = (key, label, style = {}) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      onClick={() => changeDirection(DIRECTIONS[key])}
      style={{
        width:48,
        height:44,
        border:'1px solid rgba(167,243,208,0.28)',
        borderRadius:12,
        background:'rgba(52,211,153,0.12)',
        color:'#a7f3d0',
        fontSize:18,
        cursor:'pointer',
        ...style,
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
      minHeight:480,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      overflow:'auto',
      padding:20,
      boxSizing:'border-box',
      background:'radial-gradient(circle at 50% 30%, #14342f, #071018 72%)',
      color:'#ecfdf5',
      fontFamily:'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, maxWidth:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'min(84vw, 400px)' }}>
          <strong style={{ color:'#a7f3d0', fontSize:14 }}>RẮN SĂN MỒI</strong>
          <span style={{ color:'#d1fae5', fontSize:14 }}>🍓 {score}/{targetScore}</span>
        </div>
        <div style={{ position:'relative', width:'min(84vw, 400px)', aspectRatio:'1' }}>
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            aria-label={`Rắn săn mồi, điểm ${score} trên ${targetScore}`}
            style={{
              display:'block',
              width:'100%',
              height:'100%',
              border:'1px solid rgba(167,243,208,0.25)',
              borderRadius:16,
              boxShadow:'0 20px 70px rgba(0,0,0,0.35)',
            }}
          />
          {phase === 'start' && (
            <div style={overlayStyle}>
              <div style={{ fontSize:46 }}>🐍</div>
              <strong style={{ fontSize:22 }}>Sẵn sàng chưa?</strong>
              <p style={messageStyle}>Ăn {targetScore} mồi. Dùng phím mũi tên hoặc WASD để di chuyển.</p>
              <button type="button" onClick={startGame} style={buttonStyle}>Bắt đầu</button>
            </div>
          )}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 48px)', gridTemplateRows:'repeat(2, 44px)', gap:6 }}>
          <span />
          {controlButton('ArrowUp', 'Đi lên')}
          <span />
          {controlButton('ArrowLeft', 'Đi sang trái')}
          {controlButton('ArrowDown', 'Đi xuống')}
          {controlButton('ArrowRight', 'Đi sang phải')}
        </div>
        <p style={{ margin:0, color:'rgba(209,250,229,0.55)', fontSize:12, textAlign:'center' }}>
          Tránh tường và thân rắn. Trên điện thoại, dùng các nút điều hướng.
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
  background:'rgba(4,12,16,0.86)',
}

const messageStyle = {
  maxWidth:260,
  margin:0,
  color:'rgba(236,253,245,0.72)',
  fontSize:13,
  lineHeight:1.6,
}

const buttonStyle = {
  border:0,
  borderRadius:10,
  padding:'11px 22px',
  color:'#052e26',
  background:'#a7f3d0',
  fontSize:14,
  fontWeight:800,
  cursor:'pointer',
}
