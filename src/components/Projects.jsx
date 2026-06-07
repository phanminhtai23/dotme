import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

const projects = [
  {
    id: 1, title: 'FinSight Agent', subtitle: { vi: 'Phân tích tài chính AI', en: 'AI Financial Analyst' },
    description: {
      vi: 'Hệ thống multi-agent RAG phân tích tài chính thời gian thực. Xử lý báo cáo 10-K, kết quả kinh doanh và dữ liệu thị trường để tạo ra các nhận định hữu ích.',
      en: 'Multi-agent RAG system for real-time financial analysis. Ingests 10-K filings, earnings reports, and market data to generate actionable insights.',
    },
    tags: ['LangGraph', 'FastAPI', 'Qdrant', 'React', 'Claude'],
    color: '#8B5CF6', icon: '📈', status: 'Live', year: '2026',
    links: { live: 'https://finsightagent.tech', github: 'https://github.com/phanminhtai23/finsight-agentic-production' },
  },
  {
    id: 2, title: 'MammoAI', subtitle: { vi: 'Phát hiện ung thư vú AI', en: 'Breast Cancer Detection' },
    description: {
      vi: 'Hệ thống deep learning đầu cuối phân tích ảnh chụp vú (mammogram) để dự đoán BI-RADS và tư vấn sàng lọc online. Triển khai trên AWS với CI/CD tự động.',
      en: 'End-to-end deep learning system for mammogram analysis — predicts BI-RADS scores and offers online screening. Deployed on AWS with full CI/CD.',
    },
    tags: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'AWS'],
    color: '#22D3EE', icon: '🔬', status: 'Research', year: '2025',
    links: { live: null, github: 'https://github.com/phanminhtai23/BE_MammoAI' },
  },
  {
    id: 3, title: 'VietLex', subtitle: { vi: 'Công cụ nghiên cứu NLP', en: 'NLP Research Tool' },
    description: {
      vi: 'Công cụ tìm kiếm văn bản pháp luật tiếng Việt dựa trên semantic embedding. Xử lý 50k+ tài liệu pháp lý với tốc độ truy xuất dưới 1 giây.',
      en: 'Vietnamese legal document search engine powered by semantic embeddings. Processes 50k+ legal documents with sub-second retrieval.',
    },
    tags: ['Elasticsearch', 'FastAPI', 'React', 'Sentence Transformers'],
    color: '#10B981', icon: '⚖️', status: 'Research', year: '2024',
    links: { live: null, github: '#' },
  },
  {
    id: 4, title: 'ScheduleAI', subtitle: { vi: 'Lịch hẹn thông minh', en: 'Smart Scheduler' },
    description: {
      vi: 'Công cụ lên lịch cuộc họp bằng ngôn ngữ tự nhiên, tích hợp Google Calendar. Xử lý các ràng buộc phức tạp như múi giờ và sở thích người tham gia.',
      en: 'Natural language meeting scheduler that integrates with Google Calendar. Handles complex constraints like time zones and participant preferences.',
    },
    tags: ['OpenAI', 'Node.js', 'Next.js', 'Google API'],
    color: '#F59E0B', icon: '📅', status: 'Beta', year: '2024',
    links: { live: null, github: '#' },
  },
  {
    id: 5, title: 'StreamDash', subtitle: { vi: 'Phân tích thời gian thực', en: 'Real-time Analytics' },
    description: {
      vi: 'Dashboard WebSocket theo dõi hiệu suất pipeline AI. Giám sát lượng token, độ trễ và tỷ lệ lỗi trên các agent.',
      en: 'WebSocket-powered dashboard for monitoring AI pipeline performance. Tracks token usage, latency, and error rates across agents.',
    },
    tags: ['Redis', 'FastAPI', 'React', 'WebSocket', 'Recharts'],
    color: '#EC4899', icon: '📊', status: 'In Progress', year: '2026',
    links: { live: null, github: '#' },
  },
  {
    id: 6, title: 'dotme', subtitle: { vi: 'Trang cá nhân', en: 'Personal Site' },
    description: {
      vi: 'Chính là trang này! Portfolio pixel-perfect xây bằng React, với giao diện tối, đẹp và nhanh.',
      en: 'This very site! A pixel-perfect portfolio built with React, inspired by taste-skill design principles. Dark, beautiful, fast.',
    },
    tags: ['React', 'Vite', 'CSS'],
    color: '#8B5CF6', icon: '✨', status: 'Live', year: '2026',
    links: { live: '#', github: '#' },
  },
]

const statusColors = {
  'Live': '#10B981', 'Open Source': '#22D3EE', 'Research': '#8B5CF6',
  'Beta': '#F59E0B', 'In Progress': '#EC4899',
}

function ProjectCard({ project, index, visible, tr, lang }) {
  const statusLabel = tr.statusMap[project.status] || project.status
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24, display:'flex', flexDirection:'column', gap:14, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition:`all 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s`, position:'relative', overflow:'hidden' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor=project.color+'55'; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 24px 80px ${project.color}18` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ position:'absolute', top:0, right:0, width:160, height:160, background:`radial-gradient(circle at top right, ${project.color}12, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <div style={{ width:46, height:46, borderRadius:13, background:`${project.color}18`, border:`1px solid ${project.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{project.icon}</div>
        <span style={{ fontSize:11, fontWeight:600, color:statusColors[project.status]||'#888', background:`${statusColors[project.status]||'#888'}18`, border:`1px solid ${statusColors[project.status]||'#888'}30`, borderRadius:99, padding:'3px 10px', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
          {statusLabel}
        </span>
      </div>
      <div>
        <h3 style={{ fontWeight:700, fontSize:17, letterSpacing:'-0.01em', marginBottom:3 }}>{project.title}</h3>
        <p style={{ fontSize:13, color:project.color, fontWeight:500 }}>{project.subtitle[lang]}</p>
      </div>
      <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, flex:1 }}>{project.description[lang]}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {project.tags.map(tag => (
          <span key={tag} style={{ fontSize:11, fontWeight:500, color:'var(--text-muted)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:99, padding:'3px 9px' }}>{tag}</span>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:4 }}>
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500, color:'var(--text-secondary)', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            {tr.code}
          </a>
        )}
        {project.links.live && (
          <a href={project.links.live} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500, color:project.color, textDecoration:'none', transition:'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V10M9 1h6v6M15 1 7 9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {tr.live}
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const { isMobile, isTablet } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].projects

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const cols = isMobile ? 1 : isTablet ? 2 : 3

  return (
    <section id="projects" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
          <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {tr.label}
          </span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.02em', textAlign:'center', marginBottom:12 }}>
          {tr.heading}
        </h2>
        <p style={{ color:'var(--text-secondary)', textAlign:'center', fontSize:15, maxWidth:480, margin:`0 auto ${isMobile ? '40px' : '56px'}`, lineHeight:1.7 }}>
          {tr.sub}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap: isMobile ? '14px' : '18px' }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} visible={visible} tr={tr} lang={lang} />
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <a href="https://github.com/phanminhtai23" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--accent-purple)', textDecoration:'none', fontSize:14, fontWeight:600, padding:'11px 24px', borderRadius:'var(--radius-full)', border:'1px solid rgba(139,92,246,0.3)', transition:'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.1)'; e.currentTarget.style.transform='translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)' }}
          >
            {tr.viewAll}
          </a>
        </div>
      </div>
    </section>
  )
}
