import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProtectedPage from '../components/ProtectedPage'
import GameWrapper from '../components/GameWrapper'

// ── Floating Hearts Canvas ───────────────────────────────────────────────────
function HeartsCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight

    const hp = (cx, cy, s) => {
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.bezierCurveTo(cx, cy-s*.3, cx-s*.5, cy-s*.5, cx-s*.5, cy-s*.2)
      ctx.bezierCurveTo(cx-s*.5, cy-s*.7, cx, cy-s*.7, cx, cy-s*.4)
      ctx.bezierCurveTo(cx, cy-s*.7, cx+s*.5, cy-s*.7, cx+s*.5, cy-s*.2)
      ctx.bezierCurveTo(cx+s*.5, cy-s*.5, cx, cy-s*.3, cx, cy)
      ctx.closePath()
    }

    const hearts = Array.from({ length: 45 }, () => ({
      x: Math.random() * w, y: h + Math.random() * h,
      s: Math.random() * 20 + 8, spd: Math.random() * 0.7 + 0.25,
      op: Math.random() * 0.28 + 0.04,
      wave: Math.random() * 3, wA: Math.random() * Math.PI * 2, wS: 0.01 + Math.random() * 0.02,
      hue: 330 + Math.random() * 40,
    }))

    let id
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      hearts.forEach(h2 => {
        h2.y -= h2.spd; h2.wA += h2.wS; h2.x += Math.sin(h2.wA) * h2.wave * 0.4
        if (h2.y < -h2.s * 2) { h2.y = h + h2.s; h2.x = Math.random() * w }
        ctx.save(); ctx.globalAlpha = h2.op; ctx.fillStyle = `hsl(${h2.hue},85%,72%)`
        hp(h2.x, h2.y, h2.s); ctx.fill(); ctx.restore()
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

// ── Cat with Heart Eyes SVG ───────────────────────────────────────────────────
function LoveCat({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={style}>
      <ellipse cx="60" cy="88" rx="28" ry="22" fill="#f9a8d4"/>
      <circle cx="60" cy="52" r="26" fill="#f9a8d4"/>
      <polygon points="38,34 30,14 50,28" fill="#f9a8d4"/><polygon points="82,34 90,14 70,28" fill="#f9a8d4"/>
      <polygon points="40,33 34,18 50,27" fill="#fecdd3"/><polygon points="80,33 86,18 70,27" fill="#fecdd3"/>
      {/* Heart eyes */}
      <g transform="translate(42,43)"><path d="M5,3.5 C5,2 4,1 2.5,1 C1,1 0,2 0,3.5 C0,5.5 2.5,7.5 5,9.5 C7.5,7.5 10,5.5 10,3.5 C10,2 9,1 7.5,1 C6,1 5,2 5,3.5Z" fill="#ec4899"/></g>
      <g transform="translate(68,43)"><path d="M5,3.5 C5,2 4,1 2.5,1 C1,1 0,2 0,3.5 C0,5.5 2.5,7.5 5,9.5 C7.5,7.5 10,5.5 10,3.5 C10,2 9,1 7.5,1 C6,1 5,2 5,3.5Z" fill="#ec4899"/></g>
      <polygon points="60,57 57,61 63,61" fill="#fb7185"/>
      <path d="M57,61 Q60,65 63,61" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="35" y1="56" x2="52" y2="58" stroke="#fecdd3" strokeWidth="1.2"/><line x1="35" y1="61" x2="52" y2="61" stroke="#fecdd3" strokeWidth="1.2"/>
      <line x1="68" y1="58" x2="85" y2="56" stroke="#fecdd3" strokeWidth="1.2"/><line x1="68" y1="61" x2="85" y2="61" stroke="#fecdd3" strokeWidth="1.2"/>
      {/* blush */}
      <circle cx="44" cy="62" r="6" fill="#fb7185" opacity="0.25"/><circle cx="76" cy="62" r="6" fill="#fb7185" opacity="0.25"/>
      <path d="M82,92 Q100,80 94,64 Q89,50 79,62" fill="none" stroke="#f9a8d4" strokeWidth="9" strokeLinecap="round"/>
      <ellipse cx="45" cy="107" rx="12" ry="7" fill="#f9a8d4"/><ellipse cx="75" cy="107" rx="12" ry="7" fill="#f9a8d4"/>
      <circle cx="40" cy="110" r="2.5" fill="#fecdd3"/><circle cx="45" cy="112" r="2.5" fill="#fecdd3"/><circle cx="50" cy="110" r="2.5" fill="#fecdd3"/>
      {/* mini hearts around */}
      <g transform="translate(20,30) scale(0.5)"><path d="M5,3.5 C5,2 4,1 2.5,1 C1,1 0,2 0,3.5 C0,5.5 2.5,7.5 5,9.5 C7.5,7.5 10,5.5 10,3.5 C10,2 9,1 7.5,1 C6,1 5,2 5,3.5Z" fill="#ec4899" opacity="0.5"/></g>
      <g transform="translate(90,25) scale(0.6)"><path d="M5,3.5 C5,2 4,1 2.5,1 C1,1 0,2 0,3.5 C0,5.5 2.5,7.5 5,9.5 C7.5,7.5 10,5.5 10,3.5 C10,2 9,1 7.5,1 C6,1 5,2 5,3.5Z" fill="#fb7185" opacity="0.5"/></g>
    </svg>
  )
}

// ── Photo Gallery ─────────────────────────────────────────────────────────────
function Gallery({ images }) {
  const [lb, setLb] = useState(null)
  const [lbIdx, setLbIdx] = useState(0)
  if (!images?.length) return null
  const open = (i) => { setLbIdx(i); setLb(images[i]) }
  const nav = (d) => { const i = (lbIdx + d + images.length) % images.length; setLbIdx(i); setLb(images[i]) }
  return (
    <>
      <div style={{ columns:'3 200px', gap:12 }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => open(i)} style={{ borderRadius:16, overflow:'hidden', cursor:'zoom-in', marginBottom:12, border:'1px solid rgba(236,72,153,0.2)', transition:'all 0.3s', display:'block' }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(236,72,153,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none' }}
          >
            <img src={img.url || img} alt="" style={{ width:'100%', display:'block', borderRadius:16 }} />
          </div>
        ))}
      </div>
      {lb && (
        <div onClick={() => setLb(null)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <button onClick={e => { e.stopPropagation(); nav(-1) }} style={{ position:'absolute', left:20, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, color:'#fff', fontSize:22, cursor:'pointer' }}>‹</button>
          <img src={lb.url || lb} alt="" style={{ maxWidth:'88vw', maxHeight:'88vh', borderRadius:16, objectFit:'contain', boxShadow:'0 0 80px rgba(236,72,153,0.4)' }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); nav(1) }} style={{ position:'absolute', right:20, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:48, height:48, color:'#fff', fontSize:22, cursor:'pointer' }}>›</button>
        </div>
      )}
    </>
  )
}

// ── Interactive Heart Button ─────────────────────────────────────────────────
function HeartButton({ name }) {
  const [count, setCount] = useState(0)
  const [sparks, setSparks] = useState([])

  const click = () => {
    setCount(c => c + 1)
    const newSparks = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i, angle: (i * 60) + Math.random() * 30,
      distance: 50 + Math.random() * 40,
    }))
    setSparks(s => [...s, ...newSparks])
    setTimeout(() => setSparks(s => s.filter(sk => !newSparks.find(ns => ns.id === sk.id))), 700)
  }

  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ position:'relative', display:'inline-block' }}>
        <button onClick={click} style={{
          background: count > 0 ? 'linear-gradient(135deg,#ec4899,#be185d)' : 'rgba(236,72,153,0.1)',
          border:`2px solid ${count > 0 ? 'transparent' : 'rgba(236,72,153,0.4)'}`,
          borderRadius:'50%', width:100, height:100, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:44, transition:'all 0.2s',
          boxShadow: count > 0 ? '0 0 60px rgba(236,72,153,0.7)' : 'none',
          transform: count > 0 ? 'scale(1.08)' : 'scale(1)',
          animation: count > 0 ? 'heartBeat 0.6s ease' : 'none',
        }}>
          {count > 0 ? '❤️' : '🤍'}
        </button>
        {sparks.map(sk => (
          <div key={sk.id} style={{
            position:'absolute', top:'50%', left:'50%', fontSize:18, pointerEvents:'none',
            animation:'sparkFly 0.7s ease forwards',
            '--tx': `${Math.cos(sk.angle * Math.PI / 180) * sk.distance}px`,
            '--ty': `${Math.sin(sk.angle * Math.PI / 180) * sk.distance}px`,
          }}>💕</div>
        ))}
      </div>
      {count > 0 && (
        <p style={{ marginTop:16, fontSize:15, color:'#f9a8d4', fontWeight:600, animation:'fadeIn 0.3s ease' }}>
          {count < 3 ? `${name} nhận được ${count} trái tim 💕` : count < 8 ? `${name} đang ngập tràn tình yêu 💖` : `${name} nhận được ${count} trái tim! Quá nhiều tình cảm! 💝`}
        </p>
      )}
    </div>
  )
}

// ── Stars background ──────────────────────────────────────────────────────────
function Stars() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {Array.from({ length: 80 }, (_, i) => (
        <div key={i} style={{
          position:'absolute',
          top:`${Math.random() * 100}%`, left:`${Math.random() * 100}%`,
          width: Math.random() > 0.7 ? 3 : 1.5,
          height: Math.random() > 0.7 ? 3 : 1.5,
          borderRadius:'50%', background:'#fff',
          opacity: Math.random() * 0.4 + 0.05,
          animation:`twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay:`${Math.random() * 3}s`,
        }} />
      ))}
    </div>
  )
}

// ── Things I notice ───────────────────────────────────────────────────────────
const makeThings = (n) => [
  `Cái cách ${n} cười — không cần lý do, chỉ thấy vui là cười`,
  `${n} luôn nhớ những chi tiết nhỏ mà người khác hay quên`,
  `Giọng nói của ${n} có cái gì đó rất bình yên`,
  `${n} hay nghĩ đến người khác trước khi nghĩ đến bản thân`,
  `Ánh mắt ${n} khi tập trung vào điều gì đó — rất cuốn`,
  `${n} không ngại thừa nhận khi sai — điều đó cần rất nhiều can đảm`,
]

// ── Main Content ──────────────────────────────────────────────────────────────
function LoveContent({ link }) {
  const [opened, setOpened] = useState(false)
  const [thingVisible, setThingVisible] = useState(false)
  const thingRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setThingVisible(true) }, { threshold: 0.2 })
    if (thingRef.current) obs.observe(thingRef.current)
    return () => obs.disconnect()
  }, [])

  const things = makeThings(link.name)
  const section = { maxWidth:760, margin:'0 auto', padding:'0 24px' }

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 40% 20%, #2d0015 0%, #0d0007 50%, #1a000a 100%)', fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", color:'#f0f0ff', overflowX:'hidden' }}>
      <HeartsCanvas />
      <Stars />

      {/* ── ENVELOPE HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 60px', position:'relative', zIndex:1 }}>
        <div style={{ position:'absolute', top:'15%', left:'15%', width:450, height:450, background:'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'10%', width:350, height:350, background:'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />

        {/* Animated envelope → cat */}
        <div style={{ marginBottom:32, position:'relative' }}>
          {!opened ? (
            <div style={{ cursor:'pointer', animation:'envFloat 3s ease-in-out infinite' }} onClick={() => setOpened(true)}>
              <div style={{ fontSize:100, filter:'drop-shadow(0 0 30px rgba(236,72,153,0.5))', transition:'all 0.3s' }}>
                💌
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginTop:12, letterSpacing:'0.08em' }}>
                NHẤN ĐỂ MỞ
              </p>
            </div>
          ) : (
            <div style={{ animation:'catAppear 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
              <LoveCat size={180} style={{ filter:'drop-shadow(0 0 40px rgba(236,72,153,0.4))' }} />
            </div>
          )}
        </div>

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(236,72,153,0.1)', border:'1px solid rgba(236,72,153,0.25)', borderRadius:99, padding:'8px 22px', marginBottom:24, fontSize:13, fontWeight:600, color:'#f9a8d4', letterSpacing:'0.06em' }}>
          ✉️ Thư riêng · Gửi đến {link.name}
        </div>

        <h1 style={{
          fontFamily:'Syne, sans-serif', fontSize:'clamp(44px,9vw,88px)', fontWeight:800, lineHeight:0.95, letterSpacing:'-0.03em',
          background:'linear-gradient(135deg, #fecdd3 0%, #ec4899 40%, #be185d 80%, #fecdd3 100%)', backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          animation:'shimmer 4s linear infinite', marginBottom:16,
        }}>
          Gửi {link.name}<br/>ơi...
        </h1>

        <p style={{ fontSize:17, color:'rgba(255,255,255,0.6)', maxWidth:480, lineHeight:1.8, marginBottom:48 }}>
          Có những điều khó nói thành lời — nhưng trái tim thì không thể giữ mãi được.
        </p>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:'rgba(255,255,255,0.3)', fontSize:12, letterSpacing:'0.1em', animation:'bounce 2s ease-in-out infinite' }}>
          <span>ĐỌC TIẾP</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v16M2 12l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </section>

      {/* ── LETTER ── */}
      <section style={{ padding:'80px 0' }}>
        <div style={section}>
          <div style={{
            background:'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(190,24,93,0.05))',
            border:'1px solid rgba(236,72,153,0.2)', borderRadius:28,
            padding:'52px 48px', position:'relative', overflow:'hidden',
            boxShadow:'0 0 80px rgba(236,72,153,0.08)',
          }}>
            <div style={{ position:'absolute', top:-30, right:-30, fontSize:120, opacity:0.04, transform:'rotate(-15deg)' }}>🌹</div>
            <div style={{ position:'absolute', bottom:-30, left:-30, fontSize:100, opacity:0.04, transform:'rotate(10deg)' }}>💌</div>

            {/* Date */}
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:28, fontStyle:'italic' }}>
              {new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>

            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(22px,4vw,36px)', fontWeight:800, color:'#fecdd3', marginBottom:28 }}>
              {link.name} ơi,
            </h2>

            {[
              `Mình đã nghĩ mãi không biết phải bắt đầu như thế nào. Có lẽ không có cách nào hoàn hảo để nói điều này — nên mình cứ nói thật lòng.`,
              `Từ lần đầu tiên gặp ${link.name}, mình đã cảm thấy có điều gì đó khác. Không phải vì ${link.name} cố tình gây ấn tượng — mà chính vì ${link.name} không cần phải cố. Bạn chỉ cần là chính mình thôi.`,
              `Mình không biết ${link.name} cảm thấy thế nào khi đọc những dòng này. Có thể ngạc nhiên, có thể bối rối, có thể... không biết nên phản ứng ra sao.`,
              `Nhưng dù thế nào, mình chỉ muốn ${link.name} biết: bạn thật sự đặc biệt. Và mình may mắn vì được biết bạn. 💕`,
            ].map((text, i) => (
              <p key={i} style={{ fontSize:16, color:'rgba(255,255,255,0.75)', lineHeight:1.9, marginBottom:18 }}>{text}</p>
            ))}

            <div style={{ borderTop:'1px solid rgba(236,72,153,0.15)', paddingTop:24, marginTop:24, display:'flex', alignItems:'center', gap:16 }}>
              <LoveCat size={60} />
              <div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Gửi với tất cả tình cảm,</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#f9a8d4' }}>Người thầm thương {link.name} 🌸</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTOS ── */}
      {link.images?.length > 0 && (
        <section style={{ padding:'80px 0', background:'rgba(236,72,153,0.04)', borderTop:'1px solid rgba(236,72,153,0.08)', borderBottom:'1px solid rgba(236,72,153,0.08)' }}>
          <div style={section}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
                🌸 Khoảnh khắc đáng nhớ
              </h2>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Những hình ảnh ghi lại — và được nâng niu</p>
            </div>
            <Gallery images={link.images} />
          </div>
        </section>
      )}

      {/* ── THINGS I NOTICE ── */}
      <section ref={thingRef} style={{ padding:'80px 0' }}>
        <div style={section}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
              ✨ Những điều mình để ý...
            </h2>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Những thứ nhỏ nhặt về {link.name} mà mình nhớ mãi</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {things.map((t, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:16,
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(236,72,153,0.15)',
                borderRadius:16, padding:'20px 24px',
                opacity: thingVisible ? 1 : 0, transform: thingVisible ? 'translateX(0)' : 'translateX(-30px)',
                transition:`all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(236,72,153,0.4)'; e.currentTarget.style.background='rgba(236,72,153,0.06)'; e.currentTarget.style.transform='translateX(8px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(236,72,153,0.15)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='translateX(0)' }}
              >
                <span style={{ fontSize:22, flexShrink:0, marginTop:2 }}>💕</span>
                <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE HEART ── */}
      <section style={{ padding:'80px 0', background:'radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.07) 0%, transparent 70%)' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:800, marginBottom:12 }}>
            💝 Nhấn để gửi lại một trái tim
          </h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:40 }}>
            Mỗi lần nhấn là một trái tim được gửi đi... dù {link.name} có cảm thấy thế nào thì cũng được nhé 🥺
          </p>
          <HeartButton name={link.name} />
        </div>
      </section>

      {/* ── FINAL ── */}
      <section style={{ padding:'80px 0' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <div style={{
            background:'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(190,24,93,0.06))',
            border:'1px solid rgba(236,72,153,0.2)', borderRadius:28, padding:'52px 44px',
          }}>
            <div style={{ marginBottom:24 }}>
              <LoveCat size={110} style={{ animation:'catPulse 3s ease-in-out infinite' }} />
            </div>
            <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(20px,4vw,36px)', fontWeight:800, marginBottom:16 }}>
              Dù {link.name} có đáp lại hay không...
            </h3>
            <p style={{ fontSize:16, color:'rgba(255,255,255,0.65)', lineHeight:1.9, maxWidth:500, margin:'0 auto 28px' }}>
              Mình vẫn sẽ trân trọng từng khoảnh khắc được biết đến bạn. Hạnh phúc của {link.name} luôn là điều quan trọng nhất. 🌸
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
              {['💕','🌸','✨','💖','🌹','💫','🥺','💝'].map((e, i) => (
                <span key={i} style={{ fontSize:24, animation:`bounce ${0.8+i*0.1}s ease-in-out infinite alternate`, animationDelay:`${i*0.1}s`, display:'inline-block' }}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.2)', fontSize:13 }}>
        Được gửi đi với tất cả sự chân thành 🌸 · <a href="/" style={{ color:'rgba(236,72,153,0.5)', textDecoration:'none' }}>dotme</a>
      </div>

      <style>{`
        @keyframes envFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-16px) rotate(3deg)} }
        @keyframes catAppear { 0%{opacity:0;transform:scale(0.3) rotate(-20deg)} 60%{transform:scale(1.15) rotate(5deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes catPulse { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.08) rotate(4deg)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes bounce { 0%{transform:translateY(0)} 100%{transform:translateY(-12px)} }
        @keyframes heartBeat { 0%{transform:scale(1)} 25%{transform:scale(1.25)} 50%{transform:scale(1)} 75%{transform:scale(1.15)} 100%{transform:scale(1.08)} }
        @keyframes sparkFly { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.3)} }
        @keyframes twinkle { 0%,100%{opacity:0.05} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}

export default function Love() {
  const { id } = useParams()
  return (
    <ProtectedPage linkId={id} accent="#ec4899" bgEmoji="💌" renderPage={link => (
      <GameWrapper linkId={id} linkType="love" accent="#ec4899" difficulty={link.difficulty || 'medium'}>
        <LoveContent link={link} />
      </GameWrapper>
    )} />
  )
}
