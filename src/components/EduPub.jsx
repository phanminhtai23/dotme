import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

export default function EduPub() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [certs, setCerts] = useState(null)
  const [pubs, setPubs] = useState(null)
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].edupub

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api'
    fetch(`${base}/content/certificates`).then(r => r.json()).then(setCerts).catch(() => {})
    fetch(`${base}/content/publications`).then(r => r.json()).then(setPubs).catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const certList = certs ?? tr.certs
  const pubList = pubs ?? tr.authorList ? [{ id:'static', title: tr.pubTitle, authors: tr.authorList, year:'2025', conference: tr.conference, link:'https://goodtechs.eai-conferences.org/2025/' }] : []

  return (
    <section id="edupub" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px', background:'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.02) 50%, transparent 100%)' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
          <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {tr.sectionLabel}
          </span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '40px' }}>

          {/* Education */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition:'all 0.6s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '22px' : '28px', fontWeight:800, letterSpacing:'-0.02em', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#8B5CF6,#22D3EE)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(139,92,246,0.35)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 1.67 8.67 1.67 12 0v-5"/>
                </svg>
              </span>
              {tr.eduHeading}
            </h2>

            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '24px' : '28px', position:'relative', overflow:'hidden', flex:1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.35)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(139,92,246,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ position:'absolute', top:0, right:0, width:160, height:160, background:'radial-gradient(circle at top right, rgba(139,92,246,0.1), transparent 70%)', pointerEvents:'none' }} />

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                <div>
                  <h3 style={{ fontWeight:700, fontSize:17, letterSpacing:'-0.01em', marginBottom:4 }}>
                    {tr.uniName}
                  </h3>
                  <p style={{ fontSize:14, color:'#a78bfa', fontWeight:500 }}>{tr.major}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:'#22d3ee', background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)', borderRadius:99, padding:'3px 12px', whiteSpace:'nowrap' }}>
                  {tr.eduYear}
                </span>
              </div>

              <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
                <div style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:10, padding:'8px 16px' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:2 }}>GPA</span>
                  <span style={{ fontSize:16, fontWeight:800, color:'#a78bfa' }}>3.69 / 4.0</span>
                </div>
                <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'8px 16px' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:2 }}>{tr.thesisGrade}</span>
                  <span style={{ fontSize:16, fontWeight:800, color:'#10b981' }}>9.5 / 10</span>
                </div>
              </div>

              <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
                <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{tr.thesisLabel}</p>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{tr.thesis}</p>
              </div>
            </div>
          </div>

          {/* Publications */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition:'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s', display:'flex', flexDirection:'column' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '22px' : '28px', fontWeight:800, letterSpacing:'-0.02em', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#22D3EE,#EC4899)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(34,211,238,0.3)' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              {tr.pubHeading}
            </h2>

            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '24px' : '28px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', gap:16, flex:1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(34,211,238,0.35)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(34,211,238,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ position:'absolute', top:0, right:0, width:160, height:160, background:'radial-gradient(circle at top right, rgba(34,211,238,0.08), transparent 70%)', pointerEvents:'none' }} />

              {pubList.length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Chưa có công bố nào.</p>
              ) : pubList.map((pub, pi) => (
                <div key={pub.id || pi} style={{ display:'flex', flexDirection:'column', gap:12, borderBottom: pi < pubList.length-1 ? '1px solid var(--border)' : 'none', paddingBottom: pi < pubList.length-1 ? 16 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'#10b981', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:99, padding:'3px 12px' }}>
                      {tr.accepted}
                    </span>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)' }}>{pub.year}</span>
                  </div>
                  <h3 style={{ fontWeight:700, fontSize:15, lineHeight:1.6, letterSpacing:'-0.01em', color:'var(--text-primary)' }}>{pub.title}</h3>
                  <div>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:5 }}>{tr.authors}</p>
                    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
                      {(pub.authors || []).map((a, i) => (
                        <span key={i}>
                          {a.highlight ? <strong style={{ color:'#a78bfa', fontWeight:700 }}>{a.name}</strong> : a.name}
                          {i < pub.authors.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div style={{ borderTop:'1px solid var(--border)', paddingTop:12 }}>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:5 }}>{tr.venue}</p>
                    {pub.link ? (
                      <a href={pub.link} target="_blank" rel="noreferrer"
                        style={{ fontSize:13, color:'#22d3ee', lineHeight:1.7, textDecoration:'none', fontWeight:500, transition:'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}
                      >{pub.conference} ↗</a>
                    ) : (
                      <p style={{ fontSize:13, color:'var(--text-secondary)' }}>{pub.conference}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Certificates */}
        <div style={{ marginTop: isMobile ? 40 : 56, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition:'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '22px' : '28px', fontWeight:800, letterSpacing:'-0.02em', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#F59E0B,#EC4899)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(245,158,11,0.3)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </span>
            {tr.certHeading}
          </h2>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? '12px' : '16px' }}>
            {certList.map((cert, i) => (
              <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'20px 18px', display:'flex', flexDirection:'column', gap:10, transition:'all 0.2s ease', cursor:'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=cert.color+'55'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${cert.color}18` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ width:38, height:38, borderRadius:10, background:`${cert.color}18`, border:`1px solid ${cert.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  {cert.icon}
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', lineHeight:1.4, marginBottom:3 }}>{cert.name}</p>
                  <p style={{ fontSize:11, color:cert.color, fontWeight:600 }}>{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
