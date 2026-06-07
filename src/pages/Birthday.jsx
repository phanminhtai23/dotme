import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProtectedPage from '../components/ProtectedPage'
import GameWrapper from '../components/GameWrapper'

// ── Confetti Canvas ──────────────────────────────────────────────────────────
function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight
    const colors = ['#ff6b9d','#c44dff','#ffb347','#ffd700','#7bed9f','#70a1ff','#ff9ff3','#54a0ff','#ffeaa7']
    const pieces = Array.from({ length: 250 }, () => ({
      x: Math.random() * w, y: Math.random() * h - h,
      w: Math.random() * 13 + 5, h: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 0.8, angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 9, wave: Math.random() * 4,
      waveA: Math.random() * Math.PI * 2, waveS: 0.02 + Math.random() * 0.04,
      shape: ['rect','rect','circle','star'][Math.floor(Math.random() * 4)],
    }))
    let id
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      pieces.forEach(p => {
        p.y += p.speed; p.angle += p.spin; p.waveA += p.waveS; p.x += Math.sin(p.waveA) * p.wave * 0.4
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle * Math.PI / 180)
        ctx.fillStyle = p.color; ctx.globalAlpha = 0.85
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill() }
        else if (p.shape === 'star') {
          ctx.beginPath()
          for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2; const r = i % 2 ? p.w / 4 : p.w / 2; i ? ctx.lineTo(r * Math.cos(a), r * Math.sin(a)) : ctx.moveTo(r * Math.cos(a), r * Math.sin(a)) }
          ctx.closePath(); ctx.fill()
        } else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h) }
        ctx.restore()
      })
      id = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} />
}

// ── Photo Gallery with Lightbox ──────────────────────────────────────────────
function Gallery({ images, accent }) {
  const [lb, setLb] = useState(null)
  const [lbIdx, setLbIdx] = useState(0)
  if (!images?.length) return null
  const open = (i) => { setLbIdx(i); setLb(images[i]) }
  const prev = () => { const i = (lbIdx - 1 + images.length) % images.length; setLbIdx(i); setLb(images[i]) }
  const next = () => { const i = (lbIdx + 1) % images.length; setLbIdx(i); setLb(images[i]) }
  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => open(i)} style={{
            borderRadius:16, overflow:'hidden', cursor:'zoom-in',
            aspectRatio:'1', position:'relative',
            border:`1px solid ${accent}33`,
            boxShadow:`0 8px 32px ${accent}18`,
            transition:'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow=`0 16px 48px ${accent}44` }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 8px 32px ${accent}18` }}
          >
            <img src={img.url || img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${accent}44, transparent)`, opacity:0, transition:'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='1'}
              onMouseLeave={e => e.currentTarget.style.opacity='0'}
            />
          </div>
        ))}
      </div>
      {lb && (
        <div onClick={() => setLb(null)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <button onClick={e => { e.stopPropagation(); prev() }} style={{ position:'absolute', left:24, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, color:'#fff', fontSize:22, cursor:'pointer' }}>‹</button>
          <img src={lb.url || lb} alt="" style={{ maxWidth:'88vw', maxHeight:'88vh', borderRadius:16, objectFit:'contain', boxShadow:`0 0 80px ${accent}44` }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next() }} style={{ position:'absolute', right:24, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, color:'#fff', fontSize:22, cursor:'pointer' }}>›</button>
          <div style={{ position:'absolute', bottom:24, color:'rgba(255,255,255,0.5)', fontSize:13 }}>{lbIdx + 1} / {images.length}</div>
        </div>
      )}
    </>
  )
}

// ── Cat SVG ──────────────────────────────────────────────────────────────────
function CatSVG({ size = 140, color = '#ff9fbf', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={style}>
      <ellipse cx="60" cy="88" rx="28" ry="22" fill={color}/>
      <circle cx="60" cy="52" r="26" fill={color}/>
      <polygon points="38,34 30,14 50,28" fill={color}/><polygon points="82,34 90,14 70,28" fill={color}/>
      <polygon points="40,33 34,18 50,27" fill="#ffb3c6"/><polygon points="80,33 86,18 70,27" fill="#ffb3c6"/>
      <ellipse cx="52" cy="50" rx="5" ry="6" fill="#1a0a2e"/><ellipse cx="68" cy="50" rx="5" ry="6" fill="#1a0a2e"/>
      <circle cx="53" cy="48" r="1.5" fill="white"/><circle cx="69" cy="48" r="1.5" fill="white"/>
      <circle cx="55" cy="52" r="2" fill="#7c3aed" opacity="0.5"/><circle cx="71" cy="52" r="2" fill="#7c3aed" opacity="0.5"/>
      <polygon points="60,57 57,61 63,61" fill="#ff85a1"/>
      <path d="M57,61 Q60,65 63,61" fill="none" stroke="#ff85a1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="35" y1="56" x2="52" y2="58" stroke="#ddd" strokeWidth="1.2"/><line x1="35" y1="61" x2="52" y2="61" stroke="#ddd" strokeWidth="1.2"/>
      <line x1="68" y1="58" x2="85" y2="56" stroke="#ddd" strokeWidth="1.2"/><line x1="68" y1="61" x2="85" y2="61" stroke="#ddd" strokeWidth="1.2"/>
      <path d="M82,92 Q100,80 94,64 Q89,50 79,62" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"/>
      <ellipse cx="45" cy="107" rx="12" ry="7" fill={color}/><ellipse cx="75" cy="107" rx="12" ry="7" fill={color}/>
      <circle cx="40" cy="110" r="2.5" fill="#ffb3c6"/><circle cx="45" cy="112" r="2.5" fill="#ffb3c6"/><circle cx="50" cy="110" r="2.5" fill="#ffb3c6"/>
      <circle cx="70" cy="110" r="2.5" fill="#ffb3c6"/><circle cx="75" cy="112" r="2.5" fill="#ffb3c6"/><circle cx="80" cy="110" r="2.5" fill="#ffb3c6"/>
    </svg>
  )
}

// ── Candle Section ───────────────────────────────────────────────────────────
function Candles({ name }) {
  const [blown, setBlown] = useState(false)
  const [blowing, setBlowing] = useState(false)
  const count = 5

  const blow = () => {
    setBlowing(true)
    setTimeout(() => { setBlown(true); setBlowing(false) }, 1200)
  }

  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:24 }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, animationDelay:`${i * 0.1}s` }}>
            {/* Flame */}
            <div style={{
              width:10, height: blown ? 0 : blowing ? 6 : 18,
              background:'linear-gradient(to top, #ffd700, #ff6b00)',
              borderRadius:'50% 50% 50% 50% / 60% 60% 40% 40%',
              transition:`height ${0.2 + i * 0.15}s ease`,
              boxShadow: blown ? 'none' : '0 0 12px #ffd700aa',
              opacity: blown ? 0 : 1,
            }} />
            {/* Wick */}
            <div style={{ width:2, height:6, background:'#555', borderRadius:1 }} />
            {/* Candle body */}
            <div style={{
              width:16, height:60 + (i % 3) * 10,
              background:`linear-gradient(135deg, hsl(${i*50},80%,70%), hsl(${i*50},80%,55%))`,
              borderRadius:'4px 4px 2px 2px',
              boxShadow: blown ? 'none' : `0 0 20px hsl(${i*50},80%,60%)44`,
              transition:'box-shadow 0.5s',
            }} />
          </div>
        ))}
      </div>
      {!blown ? (
        <button onClick={blow} style={{
          background:'linear-gradient(135deg,#ff6b9d,#c44dff)',
          color:'#fff', border:'none', borderRadius:99,
          padding:'13px 32px', fontSize:15, fontWeight:700,
          fontFamily:'Inter, sans-serif', cursor:'pointer',
          boxShadow:'0 0 30px rgba(255,107,157,0.5)', transition:'all 0.3s',
          animation: blowing ? 'none' : 'candlePulse 2s ease-in-out infinite',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.05)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1)' }}
        >
          {blowing ? '💨 Fhuuuuu...' : '🎂 Thổi nến nào!'}
        </button>
      ) : (
        <div style={{ animation:'popIn 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <p style={{ fontSize:28, marginBottom:8 }}>🎉🎊✨</p>
          <p style={{ fontSize:18, fontWeight:700, color:'#ffd700' }}>Ước gì đi, {name}!</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', marginTop:6 }}>Hy vọng điều ước của bạn thành hiện thực nhé! 🌟</p>
        </div>
      )}
    </div>
  )
}

// ── Wish Cards ───────────────────────────────────────────────────────────────
const wishes = [
  { emoji:'🌟', title:'Sức khỏe', text:'Mong bạn luôn khỏe mạnh, tràn đầy năng lượng mỗi ngày.' },
  { emoji:'💫', title:'Hạnh phúc', text:'Chúc bạn luôn tìm thấy niềm vui trong những điều nhỏ nhặt nhất.' },
  { emoji:'🚀', title:'Thành công', text:'Ước mơ của bạn không xa — hãy cứ tiến bước thật tự tin.' },
  { emoji:'💖', title:'Tình yêu', text:'Xung quanh bạn là những người yêu thương bạn thật lòng.' },
  { emoji:'🎯', title:'Ước mơ', text:'Sinh nhật này là cột mốc mới — hãy đặt ra những mục tiêu thật lớn!' },
  { emoji:'🌈', title:'May mắn', text:'Mọi thứ tốt đẹp đều đang trên đường đến với bạn.' },
]

// ── Main Birthday Content ────────────────────────────────────────────────────
function BirthdayContent({ link }) {
  const [wishVisible, setWishVisible] = useState(false)
  const wishRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setWishVisible(true) }, { threshold: 0.2 })
    if (wishRef.current) obs.observe(wishRef.current)
    return () => obs.disconnect()
  }, [])

  const section = { maxWidth:900, margin:'0 auto', padding:'0 24px' }

  return (
    <div style={{
      minHeight:'100vh', background:'radial-gradient(ellipse at 30% 10%, #2d0545 0%, #0d0118 45%, #1a0030 100%)',
      fontFamily:'Inter, sans-serif', color:'#f0f0ff', overflowX:'hidden',
    }}>
      <Confetti />

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 60px', position:'relative', zIndex:1 }}>
        <div style={{ position:'absolute', top:'15%', left:'10%', width:500, height:500, background:'radial-gradient(circle, rgba(255,107,157,0.18) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'8%', width:400, height:400, background:'radial-gradient(circle, rgba(196,77,255,0.14) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />

        {/* Floating cats */}
        {[{ e:'😸', top:'12%', left:'5%', d:0 }, { e:'🎉', top:'20%', right:'6%', d:0.3 }, { e:'😸', bottom:'25%', left:'3%', d:0.6 }, { e:'🎊', bottom:'20%', right:'5%', d:0.2 }].map((c, i) => (
          <span key={i} style={{ position:'absolute', fontSize:40, opacity:0.2, animation:`floatCat ${2+i*0.4}s ease-in-out infinite alternate`, animationDelay:`${c.d}s`, top:c.top, bottom:c.bottom, left:c.left, right:c.right, pointerEvents:'none' }}>{c.e}</span>
        ))}

        {/* Animated cat */}
        <div style={{ marginBottom:24, animation:'heroCat 3s ease-in-out infinite' }}>
          <CatSVG size={160} color="#ff9fbf" />
        </div>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,107,157,0.12)', border:'1px solid rgba(255,107,157,0.3)', borderRadius:99, padding:'8px 22px', marginBottom:28, fontSize:13, fontWeight:600, color:'#ff9fbf', letterSpacing:'0.05em' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff9fbf', animation:'pulse 2s infinite', display:'inline-block' }} />
          Sinh nhật đặc biệt · {new Date().getFullYear()}
        </div>

        {/* Main heading */}
        <h1 style={{
          fontFamily:'Syne, sans-serif',
          fontSize:'clamp(52px, 11vw, 108px)',
          fontWeight:800, lineHeight:0.95, letterSpacing:'-0.03em',
          background:'linear-gradient(135deg, #ff6b9d 0%, #c44dff 40%, #ffd700 80%, #ff6b9d 100%)',
          backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          animation:'shimmer 4s linear infinite',
          marginBottom:16,
        }}>
          Happy<br/>Birthday!
        </h1>

        {/* Name */}
        <p style={{ fontSize:'clamp(28px, 6vw, 58px)', fontWeight:800, color:'#fff', marginBottom:28, letterSpacing:'-0.02em' }}>
          🌟 {link.name} 🌟
        </p>

        <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', maxWidth:520, lineHeight:1.8, marginBottom:48 }}>
          Hôm nay là ngày thật đặc biệt — ngày mà cả thế giới vui mừng vì bạn đã xuất hiện! 🎂
        </p>

        {/* Scroll cue */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:'rgba(255,255,255,0.3)', fontSize:12, letterSpacing:'0.1em', animation:'bounce 2s ease-in-out infinite' }}>
          <span>SCROLL</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v16M2 12l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </section>

      {/* ── PHOTOS ── */}
      {link.images?.length > 0 && (
        <section style={{ padding:'80px 0', background:'rgba(255,107,157,0.04)', borderTop:'1px solid rgba(255,107,157,0.1)', borderBottom:'1px solid rgba(255,107,157,0.1)' }}>
          <div style={section}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:800, marginBottom:12 }}>
                📸 Khoảnh khắc đáng nhớ
              </h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15 }}>Những hình ảnh ghi lại kỷ niệm của {link.name}</p>
            </div>
            <Gallery images={link.images} accent="#ff6b9d" />
          </div>
        </section>
      )}

      {/* ── CANDLE SECTION ── */}
      <section style={{ padding:'100px 0' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.25)', borderRadius:99, padding:'8px 22px', marginBottom:40, fontSize:13, fontWeight:600, color:'#ffd700' }}>
            🕯️ Thổi nến sinh nhật
          </div>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(26px,4vw,44px)', fontWeight:800, marginBottom:14 }}>
            Sẵn sàng thổi chưa, {link.name}?
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, marginBottom:48 }}>Hít thở thật sâu và thổi thật mạnh nhé!</p>
          <Candles name={link.name} />
        </div>
      </section>

      {/* ── WISHES ── */}
      <section ref={wishRef} style={{ padding:'80px 0', background:'radial-gradient(ellipse at 50% 50%, rgba(196,77,255,0.06) 0%, transparent 70%)' }}>
        <div style={section}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(26px,4vw,48px)', fontWeight:800, marginBottom:12 }}>
              🎁 Những điều chúc tốt lành
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15 }}>Gửi đến {link.name} với tất cả tình cảm chân thành</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:18 }}>
            {wishes.map((w, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.05)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(255,107,157,0.2)', borderRadius:20,
                padding:'28px 24px', textAlign:'center',
                opacity: wishVisible ? 1 : 0,
                transform: wishVisible ? 'translateY(0)' : 'translateY(30px)',
                transition:`all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.09}s`,
                position:'relative', overflow:'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,107,157,0.5)'; e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 24px 60px rgba(255,107,157,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,107,157,0.2)'; e.currentTarget.style.transform=wishVisible ? 'translateY(0)' : 'translateY(30px)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:'radial-gradient(circle at top right, rgba(255,107,157,0.12), transparent 70%)', pointerEvents:'none' }} />
                <div style={{ fontSize:44, marginBottom:14 }}>{w.emoji}</div>
                <h3 style={{ fontWeight:700, fontSize:17, marginBottom:10, color:'#ff9fbf' }}>{w.title}</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL MESSAGE ── */}
      <section style={{ padding:'100px 0' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <div style={{
            background:'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(196,77,255,0.08))',
            border:'1px solid rgba(255,107,157,0.25)', borderRadius:28,
            padding:'52px 48px', position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-40, left:-40, fontSize:120, opacity:0.06, transform:'rotate(-20deg)' }}>🎂</div>
            <div style={{ position:'absolute', bottom:-40, right:-40, fontSize:120, opacity:0.06, transform:'rotate(20deg)' }}>🎉</div>
            <div style={{ marginBottom:24 }}>
              <CatSVG size={100} color="#ff9fbf" style={{ animation:'catWiggle 3s ease-in-out infinite' }} />
            </div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:800, marginBottom:16 }}>
              {link.name} ơi, chúc mừng sinh nhật! 🎊
            </h2>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', lineHeight:1.9, maxWidth:560, margin:'0 auto 28px' }}>
              Mỗi năm qua là một hành trình đáng tự hào. Bạn đã lớn lên, trưởng thành hơn và trở nên đặc biệt hơn trong mắt tất cả mọi người. Hãy tận hưởng ngày hôm nay thật trọn vẹn nhé!
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
              {['🎂','🥳','🎊','🎉','✨','💫','🌟','🎈'].map((e, i) => (
                <span key={i} style={{ fontSize:28, animation:`bounce ${0.8 + i * 0.1}s ease-in-out infinite alternate`, animationDelay:`${i * 0.1}s`, display:'inline-block' }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
        Được gửi với tất cả tình cảm ✨ · <a href="/" style={{ color:'rgba(255,107,157,0.5)', textDecoration:'none' }}>dotme</a>
      </div>

      <style>{`
        @keyframes heroCat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-16px) rotate(3deg)} }
        @keyframes catWiggle { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes floatCat { 0%{transform:translateY(0) rotate(-8deg)} 100%{transform:translateY(-24px) rotate(8deg)} }
        @keyframes candlePulse { 0%,100%{box-shadow:0 0 30px rgba(255,107,157,0.5)} 50%{box-shadow:0 0 60px rgba(255,107,157,0.9)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
        @keyframes bounce { 0%{transform:translateY(0)} 100%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}

export default function Birthday() {
  const { id } = useParams()
  return (
    <ProtectedPage linkId={id} accent="#ff6b9d" bgEmoji="🎂" renderPage={link => (
      <GameWrapper linkId={id} linkType="birthday" accent="#ff6b9d" difficulty={link.difficulty || 'medium'}>
        <BirthdayContent link={link} />
      </GameWrapper>
    )} />
  )
}
