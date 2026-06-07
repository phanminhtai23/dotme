import { useEffect, useRef, useState } from 'react'
import { useLang } from '../LangContext'
import { t } from '../i18n'

export default function Hero() {
  const { lang } = useLang()
  const tr = t[lang].hero

  const [roleIdx, setRoleIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)
  const canvasRef = useRef(null)

  // Reset typewriter when language changes
  useEffect(() => {
    setRoleIdx(0)
    setDisplayed('')
    setTyping(true)
  }, [lang])

  useEffect(() => {
    const role = tr.roles[roleIdx]
    let i = 0
    let timeout

    if (typing) {
      const type = () => {
        if (i <= role.length) {
          setDisplayed(role.slice(0, i))
          i++
          timeout = setTimeout(type, 60)
        } else {
          timeout = setTimeout(() => setTyping(false), 2000)
        }
      }
      timeout = setTimeout(type, 400)
    } else {
      const erase = () => {
        if (i >= 0) {
          setDisplayed(role.slice(0, i))
          i--
          timeout = setTimeout(erase, 35)
        } else {
          setRoleIdx(prev => (prev + 1) % tr.roles.length)
          setTyping(true)
        }
      }
      i = role.length
      timeout = setTimeout(erase, 300)
    }

    return () => clearTimeout(timeout)
  }, [roleIdx, typing, lang])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'15%', left:'10%', width:500, height:500, background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'8%', width:400, height:400, background:'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', right:'25%', width:300, height:300, background:'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', maxWidth:'900px', padding:'0 24px', zIndex:1 }}>
        {/* Badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)',
          borderRadius:'var(--radius-full)', padding:'8px 20px', marginBottom:'32px',
          fontSize:'13px', color:'#a78bfa', fontWeight:500, letterSpacing:'0.05em',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#a78bfa', display:'inline-block', animation:'pulse 2s infinite' }} />
          {tr.available}
        </div>

        <h1 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(52px, 9vw, 100px)',
          fontWeight:800, lineHeight:1.0, letterSpacing:'-0.03em', marginBottom:'24px',
        }}>
          <span style={{ color:'var(--text-primary)' }}>Kevin</span>
          <br />
          <span style={{ background:'var(--gradient-text)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Phan
          </span>
        </h1>

        <div style={{
          fontSize:'clamp(18px, 3vw, 28px)', color:'var(--text-secondary)', fontWeight:400,
          marginBottom:'40px', minHeight:'40px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        }}>
          <span style={{ color:'var(--accent-cyan)', fontWeight:500 }}>{'>'}</span>
          <span style={{ fontFamily:'monospace' }}>{displayed}</span>
          <span style={{ display:'inline-block', width:2, height:'1em', background:'var(--accent-purple)', animation:'blink 1s step-end infinite' }} />
        </div>

        <p style={{ fontSize:'17px', color:'var(--text-secondary)', maxWidth:'560px', margin:'0 auto 52px', lineHeight:1.8 }}>
          {tr.desc}
        </p>

        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="#projects" style={{
            display:'inline-flex', alignItems:'center', gap:'10px',
            background:'linear-gradient(135deg, #8B5CF6, #EC4899)', color:'#fff',
            textDecoration:'none', fontSize:'15px', fontWeight:600, padding:'14px 32px',
            borderRadius:'var(--radius-full)', transition:'all 0.3s ease',
            boxShadow:'0 0 30px rgba(139,92,246,0.4)', letterSpacing:'0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 0 50px rgba(139,92,246,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 30px rgba(139,92,246,0.4)' }}
          >
            {tr.viewWork}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#contact" style={{
            display:'inline-flex', alignItems:'center', gap:'10px',
            background:'transparent', color:'var(--text-primary)', textDecoration:'none',
            fontSize:'15px', fontWeight:600, padding:'14px 32px',
            borderRadius:'var(--radius-full)', border:'1px solid rgba(255,255,255,0.15)',
            transition:'all 0.3s ease', letterSpacing:'0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.6)'; e.currentTarget.style.background='rgba(139,92,246,0.08)'; e.currentTarget.style.transform='translateY(-3px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)' }}
          >
            {tr.talk}
          </a>
        </div>

        <div style={{
          position:'absolute', bottom:'-120px', left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
          color:'var(--text-muted)', fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase',
        }}>
          <span>{tr.scroll}</span>
          <div style={{ width:1, height:50, background:'linear-gradient(to bottom, rgba(139,92,246,0.6), transparent)', animation:'scrollDown 2s ease infinite' }} />
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scrollDown { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
      `}</style>
    </section>
  )
}
