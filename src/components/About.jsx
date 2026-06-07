import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

const statValues = ['1+', '15+', '5+', '∞']

export default function About() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].about

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px', maxWidth:'1100px', margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
        <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          {tr.label}
        </span>
        <div style={{ flex:1, height:1, background:'var(--border)' }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr', gap: isMobile ? '48px' : '80px', alignItems:'flex-start' }}>
        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:24, alignItems: isMobile ? 'center' : 'flex-start', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-40px)', transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* Portrait image — transparent bg, rim light */}
          <div style={{ position:'relative', width:'100%', maxWidth: isMobile ? 280 : '100%' }}>
            {/* Soft ambient light behind subject so black clothes stand out */}
            <div style={{
              position:'absolute', bottom:0, left:'10%', right:'10%', height:'85%',
              background:'radial-gradient(ellipse at 50% 60%, rgba(180,170,220,0.13) 0%, rgba(139,92,246,0.07) 50%, transparent 75%)',
              filter:'blur(24px)', zIndex:0, pointerEvents:'none',
            }} />

            <div style={{ position:'relative', zIndex:1 }}>
              {imgError ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:96, padding:'40px 0' }}>👨‍💻</div>
              ) : (
                <img
                  src="/avatar.png"
                  alt="Kevin Phan"
                  onError={() => setImgError(true)}
                  style={{
                    width:'100%', height:'auto', display:'block',
                    filter:
                      'drop-shadow(0 0 1px rgba(255,255,255,0.55)) ' +
                      'drop-shadow(0 0 8px rgba(255,255,255,0.18)) ' +
                      'drop-shadow(0 24px 48px rgba(80,40,160,0.35))',
                  }}
                />
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'100%' }}>
            {statValues.map((val, i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'16px', textAlign:'center', transition:'all 0.2s ease', cursor:'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-accent)'; e.currentTarget.style.background='var(--bg-card-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-card)' }}
              >
                <div style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, background:'var(--gradient-text)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1, marginBottom:4 }}>{val}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, lineHeight:1.3 }}>{tr.stats[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : `translateX(${isMobile ? '0' : '40px'})`, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s', textAlign: isMobile ? 'center' : 'left' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 48px)', fontWeight:800, lineHeight:1.15, letterSpacing:'-0.02em', marginBottom:24 }}>
            {tr.heading.split(tr.headingAccent)[0]}
            <span style={{ background:'var(--gradient-text)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{tr.headingAccent}</span>
            {tr.heading.split(tr.headingAccent)[1] || ''}
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {tr.bio.map((text, i) => (
              <p key={i} style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.8 }}>{text}</p>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:28, justifyContent: isMobile ? 'center' : 'flex-start' }}>
            {['Python', 'LangGraph', 'LangChain', 'RAG', 'AI Agent', 'Qdrant', 'Docker', 'FastAPI', 'AWS', 'PostgreSQL', 'GitHub Actions'].map(tag => (
              <span key={tag} style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', color:'#a78bfa', borderRadius:'var(--radius-full)', padding:'5px 14px', fontSize:13, fontWeight:500 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
