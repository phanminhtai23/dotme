import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import WinScreen from './WinScreen'
import { getDiffConfig } from '../games/difficulty'
import { resolveGameId, GAME_OPTIONS } from '../games/catalog'

const TYPE_META = {
  birthday:   { emoji:'🎈', name:'Bắn bóng bay',        color:'#ff6b9d' },
  motivation: { emoji:'🐱', name:'Mèo vượt chướng ngại', color:'#f59e0b' },
  love:       { emoji:'💕', name:'Lật bài đôi',          color:'#ec4899' },
}

// ── Floating "Bạn muốn nhận quà?" button ────────────────────────────────────
function GiftButton({ onClick, accent }) {
  return (
    <div style={{ position:'fixed', bottom:96, right:28, zIndex:150, display:'flex', flexDirection:'column', alignItems:'center', gap:8, fontFamily:'var(--font-sans)' }}>
      {/* Wiggling tooltip */}
      <div style={{
        background:'rgba(10,5,20,0.92)', backdropFilter:'blur(16px)',
        border:`1px solid ${accent}55`,
        borderRadius:99, padding:'9px 18px',
        fontSize:13, fontWeight:700, color:'#f0f0ff',
        whiteSpace:'nowrap', letterSpacing:'0.02em',
        animation:'tooltipWiggle 2.5s ease-in-out infinite',
        boxShadow:`0 4px 24px ${accent}33`,
        position:'relative',
      }}>
        Bạn muốn nhận quà?? 🎁
        {/* Arrow */}
        <div style={{
          position:'absolute', bottom:-7, left:'50%',
          width:12, height:12,
          background:'rgba(10,5,20,0.92)',
          border:`1px solid ${accent}55`,
          borderTop:'none', borderLeft:'none',
          transform:'translateX(-50%) rotate(45deg)',
        }} />
      </div>

      {/* Gift button */}
      <button onClick={onClick} style={{
        width:60, height:60, borderRadius:'50%',
        background:`linear-gradient(135deg, ${accent}, ${accent}bb)`,
        border:'none', cursor:'pointer', fontSize:26,
        boxShadow:`0 0 32px ${accent}66`,
        transition:'all 0.25s ease',
        animation:'giftPulse 2.5s ease-in-out infinite',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.15)'; e.currentTarget.style.boxShadow=`0 0 52px ${accent}cc` }}
      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 0 32px ${accent}66` }}
      >
        🎁
      </button>

      <style>{`
        @keyframes tooltipWiggle {
          0%,100%{transform:rotate(-2deg) translateY(0)}
          25%{transform:rotate(2deg) translateY(-3px)}
          50%{transform:rotate(-1.5deg) translateY(1px)}
          75%{transform:rotate(2deg) translateY(-2px)}
        }
        @keyframes giftPulse {
          0%,100%{box-shadow:0 0 32px ${accent}66}
          50%{box-shadow:0 0 52px ${accent}cc, 0 0 0 8px ${accent}18}
        }
      `}</style>
    </div>
  )
}

// ── Difficulty badge ──────────────────────────────────────────────────────────
function DiffBadge({ level, color }) {
  const icons = { easy:'😊', medium:'😐', hard:'😤' }
  const labels = { easy:'Dễ', medium:'Vừa', hard:'Khó' }
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:`${color}18`, border:`1px solid ${color}44`,
      borderRadius:99, padding:'4px 12px',
      fontSize:12, fontWeight:700, color,
    }}>
      {icons[level]} {labels[level]}
    </span>
  )
}

// ── Intro overlay ─────────────────────────────────────────────────────────────
function IntroOverlay({ meta, diffCfg, difficulty, remaining, onStart, onClose, accent }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.78)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      fontFamily:'var(--font-sans)',
    }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background:'rgba(10,5,25,0.97)', border:`1px solid ${accent}33`,
        borderRadius:24, padding:'40px 36px', maxWidth:420, width:'100%', textAlign:'center',
        boxShadow:`0 0 80px ${accent}22`,
        position:'relative',
      }}
      onMouseDown={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:28, height:28, color:'#8888aa', cursor:'pointer', fontSize:14 }}>✕</button>

        <div style={{ fontSize:64, marginBottom:12, animation:'gameIconFloat 2.5s ease-in-out infinite' }}>{meta.emoji}</div>

        <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(20px,4vw,28px)', fontWeight:800, color:'#f0f0ff', marginBottom:8 }}>
          {meta.name}
        </h2>

        <div style={{ marginBottom:20 }}>
          <DiffBadge level={difficulty} color={accent} />
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
          <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8, letterSpacing:'0.05em', textTransform:'uppercase' }}>Thử thách</p>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.85)', marginBottom:12, fontWeight:500 }}>
            🎯 {diffCfg?.desc}
          </p>
          {[
            `🏆 Thắng → Sẽ có quà hì hì :)`,
            `📸 Nhớ chụp screenshot win để nhận quà nha`,
            `🔄 Còn ${remaining}/3 lượt chơi cho link này`,
          ].map((r, i) => (
            <p key={i} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{r}</p>
          ))}
        </div>

        <button onClick={onStart} style={{
          width:'100%', background:`linear-gradient(135deg, ${accent}, ${accent}aa)`,
          color:'#fff', border:'none', borderRadius:12, padding:'15px',
          fontSize:16, fontWeight:800, fontFamily:'var(--font-sans)', cursor:'pointer',
          boxShadow:`0 0 30px ${accent}44`, transition:'all 0.3s',
          letterSpacing:'0.05em',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 0 50px ${accent}88` }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 0 30px ${accent}44` }}
        >
          ▶ Chơi ngay!
        </button>

        <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:14 }}>
          Lượt {4 - remaining}/3
        </p>
      </div>
      <style>{`
        @keyframes gameIconFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-14px) rotate(5deg)} }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
      `}</style>
    </div>
  )
}

// ── Lose overlay ──────────────────────────────────────────────────────────────
function LoseOverlay({ remaining, onRetry, onClose, accent, loseData, apiWarning }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.88)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:'var(--font-sans)',
    }}>
      <div style={{
        background:'rgba(10,5,25,0.97)', border:'1px solid rgba(239,68,68,0.3)',
        borderRadius:24, padding:'40px 36px', maxWidth:380, width:'100%', textAlign:'center',
      }}>
        <div style={{ fontSize:64, marginBottom:16 }}>😿</div>
        <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, color:'#fca5a5', marginBottom:10 }}>
          Thất bại rồi!
        </h2>
        {loseData && (
          <div style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
            borderRadius:12, padding:'12px 20px', marginBottom:16,
            fontSize:15, color:'rgba(255,255,255,0.8)',
          }}>
            Bạn đã làm được{' '}
            <strong style={{ color:'#fca5a5', fontSize:18 }}>{loseData.score}</strong>
            {' '}/{' '}
            <strong style={{ color:'rgba(255,255,255,0.9)' }}>{loseData.total}</strong>
            {' '}{loseData.unit}
          </div>
        )}
        {apiWarning && (
          <p role="alert" style={{ color:'#fca5a5', fontSize:12, lineHeight:1.6, marginBottom:14 }}>
            {apiWarning}
          </p>
        )}
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
          {remaining > 0 ? `Đừng nản! Còn ${remaining} lượt — thử lại đi!` : 'Đã hết 3 lượt chơi. Chúc may mắn lần khác!'}
        </p>
        <div style={{ display:'flex', gap:10 }}>
          {remaining > 0 && (
            <button onClick={onRetry} style={{
              flex:2, background:'linear-gradient(135deg,#ef4444,#dc2626)',
              color:'#fff', border:'none', borderRadius:12, padding:'13px',
              fontSize:14, fontWeight:700, fontFamily:'var(--font-sans)', cursor:'pointer',
              boxShadow:'0 0 24px rgba(239,68,68,0.4)',
            }}>
              🔄 Thử lại ({remaining} lượt)
            </button>
          )}
          <button onClick={onClose} style={{
            flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:'13px', fontSize:14, fontWeight:600,
            color:'#8888aa', fontFamily:'var(--font-sans)', cursor:'pointer',
          }}>
            Đóng
          </button>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
    </div>
  )
}

// ── Max plays screen ──────────────────────────────────────────────────────────
function MaxedOverlay({ onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.88)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:'var(--font-sans)',
    }}>
      <div style={{ background:'rgba(10,5,25,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'40px 36px', maxWidth:360, textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:'#f0f0ff', marginBottom:10 }}>Hết lượt chơi</h2>
        <p style={{ color:'#8888aa', fontSize:14, lineHeight:1.7, marginBottom:24 }}>Link này đã dùng đủ 3 lượt. Liên hệ Kevin để xin thêm nhé!</p>
        <button onClick={onClose} style={{ background:'linear-gradient(135deg,#8B5CF6,#22d3ee)', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, fontFamily:'var(--font-sans)', cursor:'pointer' }}>
          OK, tôi hiểu
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
    </div>
  )
}

function StatusOverlay({ message }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:350,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.82)', color:'#f0f0ff',
      fontFamily:'var(--font-sans)', fontSize:15, fontWeight:700,
    }}>
      {message}
    </div>
  )
}

function RequestErrorOverlay({ message, onRetry }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:350,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, background:'rgba(0,0,0,0.88)', fontFamily:'var(--font-sans)',
    }}>
      <div style={{ maxWidth:380, padding:32, borderRadius:20, textAlign:'center', background:'#100c1e', border:'1px solid rgba(248,113,113,0.35)' }}>
        <div style={{ fontSize:48, marginBottom:14 }}>⚠️</div>
        <h2 style={{ color:'#f0f0ff', margin:'0 0 10px', fontSize:20 }}>Không thể xác nhận lượt chơi</h2>
        <p role="alert" style={{ color:'#fca5a5', fontSize:14, lineHeight:1.6, margin:'0 0 20px' }}>{message}</p>
        <button onClick={onRetry} style={{ border:0, borderRadius:10, padding:'11px 20px', background:'linear-gradient(135deg,#8B5CF6,#22d3ee)', color:'#fff', fontWeight:700, cursor:'pointer' }}>
          Thử lại
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GameWrapper({ linkId, linkType, gameId, children, accent, difficulty = 'medium' }) {
  const [gameState, setGameState] = useState('checking')
  const [remaining, setRemaining] = useState(0)
  const [winTime, setWinTime] = useState('')
  const [loseData, setLoseData] = useState(null)
  const [GameComponent, setGameComponent] = useState(null)
  const [gameLoadError, setGameLoadError] = useState('')
  const [apiError, setApiError] = useState('')
  const [apiWarning, setApiWarning] = useState('')
  const [checkVersion, setCheckVersion] = useState(0)
  const reservationIdRef = useRef(null)
  const activePlayIdRef = useRef(null)
  const reservationInFlightRef = useRef(false)
  const completionInFlightRef = useRef(false)
  const activeLinkIdRef = useRef(linkId)

  const effectiveGameId = resolveGameId(gameId, linkType)
  const selectedGame = GAME_OPTIONS.find((game) => game.id === effectiveGameId) || GAME_OPTIONS[0]
  const typeMeta = TYPE_META[linkType] || TYPE_META.birthday
  const effectiveAccent = accent || typeMeta.color
  const meta = { ...selectedGame, color:effectiveAccent }
  const diffCfg = getDiffConfig(effectiveGameId, difficulty)

  useEffect(() => {
    let active = true
    setGameComponent(null)
    setGameLoadError('')
    const map = {
      'balloon-pop': () => import('../games/BalloonPop.jsx'),
      'cat-runner': () => import('../games/CatRunner.jsx'),
      'heart-memory': () => import('../games/HeartMemory.jsx'),
      snake: () => import('../games/SnakeGame.jsx'),
      'goose-forage': () => import('../games/GooseForage.jsx'),
      'star-catcher': () => import('../games/StarCatcher.jsx'),
    }
    const loadGame = map[effectiveGameId]
    if (!loadGame) {
      setGameLoadError('Trò chơi này chưa được hỗ trợ.')
      return () => { active = false }
    }
    loadGame()
      .then(module => { if (active) setGameComponent(() => module.default) })
      .catch(error => {
        console.error('Không thể tải trò chơi:', error)
        if (active) setGameLoadError('Không thể tải trò chơi. Vui lòng tải lại trang.')
      })
    return () => { active = false }
  }, [effectiveGameId])

  useEffect(() => {
    let active = true
    if (activeLinkIdRef.current !== linkId) {
      activeLinkIdRef.current = linkId
      reservationIdRef.current = null
      activePlayIdRef.current = null
      completionInFlightRef.current = false
    }
    setGameState('checking')
    setApiError('')
    api.getPlays(linkId)
      .then(data => {
        if (!active) return
        setRemaining(data.remaining)
        setGameState(data.remaining <= 0 ? 'maxed' : 'idle')
      })
      .catch(error => {
        if (!active) return
        setApiError(error.message || 'Không thể tải số lượt chơi.')
        setGameState('error')
      })
    return () => { active = false }
  }, [linkId, checkVersion])

  const openIntro = () => {
    if (remaining <= 0) setGameState('maxed')
    else setGameState('intro')
  }
  const closeIntro = () => setGameState('idle')

  const startGame = async () => {
    if (reservationInFlightRef.current) return
    if (remaining <= 0) {
      setGameState('maxed')
      return
    }
    if (gameLoadError) {
      setApiError(gameLoadError)
      setGameState('error')
      return
    }

    reservationInFlightRef.current = true
    setApiError('')
    setGameState('starting')
    if (!reservationIdRef.current) {
      reservationIdRef.current = globalThis.crypto?.randomUUID?.()
        || `play-${Date.now()}-${Math.random().toString(36).slice(2)}`
    }
    try {
      const data = await api.reservePlay(linkId, reservationIdRef.current)
      reservationIdRef.current = null
      activePlayIdRef.current = data.play.id
      completionInFlightRef.current = false
      setRemaining(data.remaining)
      setGameState('playing')
    } catch (error) {
      if (error.data?.maxed) {
        setRemaining(0)
        setGameState('maxed')
      } else {
        setApiError(error.message || 'Không thể giữ lượt chơi.')
        setGameState('error')
      }
    } finally {
      reservationInFlightRef.current = false
    }
  }

  const recordGameResult = async (won, data) => {
    if (completionInFlightRef.current) return
    const playId = activePlayIdRef.current
    if (!playId) {
      setApiError('Không tìm thấy lượt chơi đã giữ trên máy chủ.')
      setGameState('error')
      return
    }
    completionInFlightRef.current = true
    setGameState('recording')
    setApiWarning('')
    if (won) {
      const now = new Date()
      setWinTime(now.toLocaleString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    } else {
      setLoseData(data || null)
    }

    try {
      const result = await api.finishPlay(linkId, playId, won)
      setRemaining(result.remaining)
      activePlayIdRef.current = null
    } catch (error) {
      console.error('Không thể lưu kết quả lượt chơi:', error)
      setApiWarning('Kết quả chưa đồng bộ được lên máy chủ; lượt chơi đã được giữ và vẫn được tính.')
    } finally {
      setGameState(won ? 'won' : 'lost')
      completionInFlightRef.current = false
    }
  }

  const retryCheck = () => {
    if (gameLoadError) {
      window.location.reload()
      return
    }
    if (reservationIdRef.current) startGame()
    else setCheckVersion((version) => version + 1)
  }

  const gameConfig = {
    'balloon-pop': { totalBalloons: diffCfg?.totalBalloons, target: diffCfg?.target, time: diffCfg?.time, balloonSpeedFactor: diffCfg?.balloonSpeedFactor, spawnBatch: diffCfg?.spawnBatch },
    'cat-runner': { surviveSecs: diffCfg?.surviveSecs, speedMult: diffCfg?.speedMult, spawnInterval: diffCfg?.spawnInterval, obstacleHeightMult: diffCfg?.obstacleHeightMult },
    'heart-memory': { pairs: diffCfg?.pairs, cols: diffCfg?.cols, time: diffCfg?.time, flipDelay: diffCfg?.flipDelay },
    snake: { tickMs: diffCfg?.tickMs, targetScore: diffCfg?.targetScore },
    'goose-forage': { targetScore: diffCfg?.targetScore },
    'star-catcher': { targetScore: diffCfg?.targetScore, duration: diffCfg?.duration, fallSpeed: diffCfg?.fallSpeed, spawnInterval: diffCfg?.spawnInterval },
  }[effectiveGameId] || {}

  return (
    <>
      {children}

      {gameState === 'idle' && (
        <GiftButton onClick={openIntro} accent={effectiveAccent} />
      )}

      {gameState === 'intro' && (
        <IntroOverlay
          meta={meta}
          diffCfg={diffCfg}
          difficulty={difficulty}
          remaining={remaining}
          onStart={startGame}
          onClose={closeIntro}
          accent={effectiveAccent}
        />
      )}

      {gameState === 'checking' && <StatusOverlay message="Đang kiểm tra lượt chơi..." />}
      {gameState === 'starting' && <StatusOverlay message="Đang giữ lượt chơi..." />}
      {gameState === 'recording' && <StatusOverlay message="Đang lưu kết quả..." />}
      {gameState === 'error' && <RequestErrorOverlay message={apiError} onRetry={retryCheck} />}

      {gameState === 'playing' && (
        <div style={{ position:'fixed', inset:0, zIndex:250, background:'#06060f' }}>
          {GameComponent && (
            <GameComponent onWin={handleWin} onLose={handleLose} config={gameConfig} />
          )}
          {!GameComponent && <StatusOverlay message="Đang tải trò chơi..." />}
        </div>
      )}

      {gameState === 'won' && (
        <WinScreen winTime={winTime} remaining={remaining} accent={effectiveAccent} apiWarning={apiWarning} />
      )}

      {gameState === 'lost' && (
        <LoseOverlay
          remaining={remaining}
          onRetry={startGame}
          onClose={() => setGameState('idle')}
          accent={effectiveAccent}
          loseData={loseData}
          apiWarning={apiWarning}
        />
      )}

      {gameState === 'maxed' && (
        <MaxedOverlay onClose={() => setGameState('idle')} />
      )}
    </>
  )
}
