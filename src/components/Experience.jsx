import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

const STATIC_JOBS = [
  { id:'tma', company:'TMA Solutions', role:'AI Engineer', period:'Jan 2026 – Present', location:'Ho Chi Minh, VN', current:true, bullets:['Architected an <strong>autonomous AI Agent</strong> to automate cross-functional task aggregation and daily reporting.','Built an LLM-driven ingestion framework with Apache SeaTunnel achieving <strong>&gt;90% accuracy</strong>.','Built a <strong>Multi-Agent</strong> system with LangChain/LangGraph for end-to-end data ingestion.','Implemented RAG for orchestration using <strong>Qdrant</strong> as vector database.','Managed <strong>Docker</strong> containerization and deployment on Ubuntu servers.'] },
  { id:'pod', company:'POD Software', role:'Contract Computer Vision Engineer', period:'Nov 2025 – Dec 2025', location:'Can Tho, VN', current:false, bullets:['Developed a <strong>real-time OCR system</strong> for garment labels using PaddleOCR.','Optimized pipeline to <strong>&lt;100ms/frame and &gt;95% accuracy</strong> on CPU-only devices.','Integrated the system within the existing WinForms application for factory deployment.'] },
  { id:'biwoco', company:'BIWOCO', role:'AI Engineer Intern', period:'Apr 2025 – Jul 2025', location:'Can Tho, VN', current:false, bullets:['Researched and built AI Agent / Multi-Agent systems using <strong>Google ADK</strong>.','Developed <strong>automated workflows</strong> with Playwright, StageHand, and AI Browser tools.','Conducted LLM evaluations using <strong>Phoenix Experiments</strong> to optimize prompts.'] },
]

export default function Experience() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [jobs, setJobs] = useState(STATIC_JOBS)
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].experience

  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/content/experience').then(r => r.json()).then(setJobs).catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="experience" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
          <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {tr.sectionLabel}
          </span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '28px' : 'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:12, textAlign:'center' }}>
          {tr.heading}
        </h2>
        <p style={{ color:'var(--text-secondary)', textAlign:'center', fontSize:15, maxWidth:480, margin:`0 auto ${isMobile ? '40px' : '56px'}`, lineHeight:1.7 }}>
          {tr.sub}
        </p>

        {/* Timeline */}
        <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:0 }}>
          {/* Vertical line */}
          {!isMobile && (
            <div style={{ position:'absolute', left:180, top:24, bottom:24, width:1, background:'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(34,211,238,0.2), transparent)' }} />
          )}

          {jobs.map((job, i) => (
            <div key={i} style={{
              display:'flex', flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 12 : 32, marginBottom:32,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
            }}>
              {/* Date column */}
              <div style={{ minWidth:180, textAlign: isMobile ? 'left' : 'right', paddingTop: isMobile ? 0 : 20, paddingRight: isMobile ? 0 : 12 }}>
                <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, whiteSpace:'nowrap' }}>{job.period}</span>
                {job.current && (
                  <span style={{ display:'block', fontSize:11, color:'#10b981', fontWeight:700, marginTop:4, letterSpacing:'0.06em' }}>
                    {tr.current}
                  </span>
                )}
              </div>

              {/* Dot */}
              {!isMobile && (
                <div style={{ position:'relative', display:'flex', alignItems:'flex-start', paddingTop:24 }}>
                  <div style={{
                    width:12, height:12, borderRadius:'50%', flexShrink:0,
                    background: job.current ? '#10b981' : 'linear-gradient(135deg,#8B5CF6,#22D3EE)',
                    boxShadow: job.current ? '0 0 12px rgba(16,185,129,0.6)' : '0 0 10px rgba(139,92,246,0.5)',
                    border:'2px solid var(--bg-primary)',
                    zIndex:1,
                  }} />
                </div>
              )}

              {/* Card */}
              <div style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '20px' : '24px 28px', transition:'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,92,246,0.35)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(139,92,246,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:4 }}>
                  <div>
                    <h3 style={{ fontWeight:700, fontSize:16, letterSpacing:'-0.01em', marginBottom:3 }}>{job.company}</h3>
                    <p style={{ fontSize:13, color:'#a78bfa', fontWeight:500 }}>{job.role}</p>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-muted)', background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:99, padding:'3px 10px', whiteSpace:'nowrap' }}>
                    {job.location}
                  </span>
                </div>

                <ul style={{ margin:'14px 0 0', padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:7 }}>
                  {job.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}
                      dangerouslySetInnerHTML={{ __html: b }}
                    />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
