import { useEffect, useState } from 'react'
import { api } from '../api'
import WinScreen from './WinScreen'
import { DIFFICULTY, getDiffConfig } from '../games/difficulty'

const TYPE_META = {
  birthday:   { emoji:'🎈', name:'Bắn bóng bay',        color:'#ff6b9d' },
  motivation: { emoji:'🐱', name:'Mèo vượt chướng ngại', color:'#f59e0b' },
  love:       { emoji:'💕', name:'Lật bài đôi',          color:'#ec4899' },
}

// ── Floating "Bạn muốn nhận quà?" button ────────────────────────────────────
function GiftButton({ onClick, accent }) {
  return (
    <div style={{ position:'fixed', bottom:96, right:28, zIndex:150, display:'flex', flexDirection:'column', alignItems:'center', gap:8, fontFamily:'Inter, sans-serif' }}>
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
          position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)',
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
      fontFamily:'Inter, sans-serif',
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
          fontSize:16, fontWeight:800, fontFamily:'Inter, sans-serif', cursor:'pointer',
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
function LoseOverlay({ remaining, onRetry, onClose, accent, loseData }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.88)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:'Inter, sans-serif',
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
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
          {remaining > 0 ? `Đừng nản! Còn ${remaining} lượt — thử lại đi!` : 'Đã hết 3 lượt chơi. Chúc may mắn lần khác!'}
        </p>
        <div style={{ display:'flex', gap:10 }}>
          {remaining > 0 && (
            <button onClick={onRetry} style={{
              flex:2, background:'linear-gradient(135deg,#ef4444,#dc2626)',
              color:'#fff', border:'none', borderRadius:12, padding:'13px',
              fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', cursor:'pointer',
              boxShadow:'0 0 24px rgba(239,68,68,0.4)',
            }}>
              🔄 Thử lại ({remaining} lượt)
            </button>
          )}
          <button onClick={onClose} style={{
            flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:'13px', fontSize:14, fontWeight:600,
            color:'#8888aa', fontFamily:'Inter, sans-serif', cursor:'pointer',
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
      padding:24, fontFamily:'Inter, sans-serif',
    }}>
      <div style={{ background:'rgba(10,5,25,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'40px 36px', maxWidth:360, textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:'#f0f0ff', marginBottom:10 }}>Hết lượt chơi</h2>
        <p style={{ color:'#8888aa', fontSize:14, lineHeight:1.7, marginBottom:24 }}>Link này đã dùng đủ 3 lượt. Liên hệ Minh Tài để xin thêm nhé!</p>
        <button onClick={onClose} style={{ background:'linear-gradient(135deg,#8B5CF6,#22d3ee)', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
          OK, tôi hiểu
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GameWrapper({ linkId, linkType, children, accent, difficulty = 'medium' }) {
  const [gameState, setGameState] = useState('idle') // idle | intro | playing | won | lost | maxed
  const [remaining, setRemaining] = useState(3)
  const [winTime, setWinTime] = useState('')
  const [loseData, setLoseData] = useState(null)
  const [GameComponent, setGameComponent] = useState(null)

  const meta = TYPE_META[linkType] || TYPE_META.birthday
  const effectiveAccent = accent || meta.color
  const diffCfg = getDiffConfig(linkType, difficulty)

  // Dynamic import game
  useEffect(() => {
    const map = {
      birthday:   () => import('../games/BalloonPop.jsx'),
      motivation: () => import('../games/CatRunner.jsx'),
      love:       () => import('../games/HeartMemory.jsx'),
    }
    map[linkType]?.().then(m => setGameComponent(() => m.default))
  }, [linkType])

  // Check remaining plays
  useEffect(() => {
    api.getPlays(linkId)
      .then(d => { if (d.remaining <= 0) setGameState('maxed'); else setRemaining(d.remaining) })
      .catch(() => setRemaining(3))
  }, [linkId])

  const openIntro  = () => remaining <= 0 ? setGameState('maxed') : setGameState('intro')
  const closeIntro = () => setGameState('idle')
  const startGame  = () => remaining <= 0 ? setGameState('maxed') : setGameState('playing')

  const handleWin = async () => {
    const now = new Date()
    setWinTime(now.toLocaleString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    try { const d = await api.recordPlay(linkId, true); setRemaining(d.remaining || 0) } catch {}
    setGameState('won')
  }

  const handleLose = async (data) => {
    setLoseData(data || null)
    try { const d = await api.recordPlay(linkId, false); setRemaining(d.remaining || 0) } catch {}
    setGameState('lost')
  }

  // Build the game config from difficulty
  const gameConfig = {
    birthday:   { totalBalloons: diffCfg?.totalBalloons, target: diffCfg?.target, time: diffCfg?.time, balloonSpeedFactor: diffCfg?.balloonSpeedFactor, spawnBatch: diffCfg?.spawnBatch },
    motivation: { surviveSecs: diffCfg?.surviveSecs, speedMult: diffCfg?.speedMult, spawnInterval: diffCfg?.spawnInterval, obstacleHeightMult: diffCfg?.obstacleHeightMult },
    love:       { pairs: diffCfg?.pairs, cols: diffCfg?.cols, time: diffCfg?.time, flipDelay: diffCfg?.flipDelay },
  }[linkType] || {}

  return (
    <>
      {/* Always show the page content */}
      {children}

      {/* Floating gift button — visible when idle */}
      {(gameState === 'idle') && (
        <GiftButton onClick={openIntro} accent={effectiveAccent} />
      )}

      {/* Intro overlay */}
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

      {/* Full-screen game */}
      {gameState === 'playing' && (
        <div style={{ position:'fixed', inset:0, zIndex:250, background:'#06060f' }}>
          {GameComponent && (
            <GameComponent onWin={handleWin} onLose={handleLose} config={gameConfig} />
          )}
        </div>
      )}

      {/* Win screen */}
      {gameState === 'won' && (
        <WinScreen winTime={winTime} remaining={remaining} accent={effectiveAccent} />
      )}

      {/* Lose overlay */}
      {gameState === 'lost' && (
        <LoseOverlay
          remaining={remaining}
          onRetry={() => setGameState('playing')}
          onClose={() => setGameState('idle')}
          accent={effectiveAccent}
          loseData={loseData}
        />
      )}

      {/* Maxed overlay */}
      {gameState === 'maxed' && (
        <MaxedOverlay onClose={() => setGameState('idle')} />
      )}
    </>
  )
}
