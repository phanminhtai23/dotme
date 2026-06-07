import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

const skillGroups = [
  {
    category: { vi: 'LLM & AI Agent', en: 'LLM & AI Agent' }, icon: '🤖', color: '#8B5CF6',
    skills: [
      { name: 'LangChain / LangGraph', level: 90 },
      { name: 'RAG Pipelines', level: 88 },
      { name: 'Multi-Agent Systems', level: 85 },
      { name: 'Prompt Engineering', level: 82 },
      { name: 'Qdrant / Vector DB', level: 80 },
    ],
  },
  {
    category: { vi: 'ML & Deep Learning', en: 'ML & Deep Learning' }, icon: '🧠', color: '#22D3EE',
    skills: [
      { name: 'Machine Learning', level: 85 },
      { name: 'Deep Learning', level: 83 },
      { name: 'TensorFlow / PyTorch', level: 80 },
      { name: 'YOLO / Computer Vision', level: 78 },
      { name: 'PaddleOCR / OCR', level: 75 },
    ],
  },
  {
    category: { vi: 'Backend & DevOps', en: 'Backend & DevOps' }, icon: '⚙️', color: '#EC4899',
    skills: [
      { name: 'Python / FastAPI', level: 90 },
      { name: 'Docker / GitHub Actions', level: 80 },
      { name: 'AWS / Ubuntu Server', level: 75 },
      { name: 'PostgreSQL / MongoDB', level: 82 },
      { name: 'Nginx / Redis', level: 72 },
    ],
  },
]

function SkillBar({ name, level, color, delay }) {
  const [w, setW] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(level), delay); obs.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [level, delay])
  return (
    <div ref={ref} style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{name}</span>
        <span style={{ fontSize:12, color:color, fontWeight:600 }}>{level}%</span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${w}%`, background:`linear-gradient(90deg, ${color}aa, ${color})`, borderRadius:2, transition:'width 1s cubic-bezier(0.16,1,0.3,1)', boxShadow:`0 0 8px ${color}88` }} />
      </div>
    </div>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].skills

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const cols = isMobile ? 1 : isTablet ? 2 : 3

  return (
    <section id="skills" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px', background:'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.03) 50%, transparent 100%)' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
          <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {tr.label}
          </span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:12, textAlign:'center' }}>
          {tr.heading}
        </h2>
        <p style={{ color:'var(--text-secondary)', textAlign:'center', fontSize:15, maxWidth:480, margin:'0 auto', lineHeight:1.7, marginBottom: isMobile ? 40 : 64 }}>
          {tr.sub}
        </p>

        <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap: isMobile ? '16px' : '20px' }}>
          {skillGroups.map((group, gi) => (
            <div key={gi} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '24px' : '28px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition:`all 0.6s cubic-bezier(0.16,1,0.3,1) ${gi * 0.1}s`, position:'relative', overflow:'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=group.color+'55'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 20px 60px ${group.color}18` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ position:'absolute', top:0, right:0, width:150, height:150, background:`radial-gradient(circle at top right, ${group.color}15, transparent 70%)`, pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`${group.color}18`, border:`1px solid ${group.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{group.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{group.category[lang]}</div>
                  <div style={{ fontSize:11, color:group.color, fontWeight:500, marginTop:2 }}>{group.skills.length} {tr.unit}</div>
                </div>
              </div>
              {group.skills.map((skill, si) => (
                <SkillBar key={si} name={skill.name} level={skill.level} color={group.color} delay={gi * 100 + si * 80} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
