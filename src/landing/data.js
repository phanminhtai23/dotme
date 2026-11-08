import { useEffect, useState } from 'react'
import { t } from '../i18n'

const API = import.meta.env.VITE_API_BASE_URL || '/api'

export const STATIC_JOBS = [
  { id:'tma', company:'TMA Solutions', role:'AI Engineer', period:'Jan 2026 – Present', location:'Ho Chi Minh, VN', current:true, bullets:['Architected an <strong>autonomous AI Agent</strong> to automate cross-functional task aggregation and daily reporting.','Built an LLM-driven ingestion framework with Apache SeaTunnel achieving <strong>&gt;90% accuracy</strong>.','Built a <strong>Multi-Agent</strong> system with LangChain/LangGraph for end-to-end data ingestion.','Implemented RAG for orchestration using <strong>Qdrant</strong> as vector database.','Managed <strong>Docker</strong> containerization and deployment on Ubuntu servers.'] },
  { id:'pod', company:'POD Software', role:'Contract Computer Vision Engineer', period:'Nov 2025 – Dec 2025', location:'Can Tho, VN', current:false, bullets:['Developed a <strong>real-time OCR system</strong> for garment labels using PaddleOCR.','Optimized pipeline to <strong>&lt;100ms/frame and &gt;95% accuracy</strong> on CPU-only devices.','Integrated the system within the existing WinForms application for factory deployment.'] },
  { id:'biwoco', company:'BIWOCO', role:'AI Engineer Intern', period:'Apr 2025 – Jul 2025', location:'Can Tho, VN', current:false, bullets:['Researched and built AI Agent / Multi-Agent systems using <strong>Google ADK</strong>.','Developed <strong>automated workflows</strong> with Playwright, StageHand, and AI Browser tools.','Conducted LLM evaluations using <strong>Phoenix Experiments</strong> to optimize prompts.'] },
]

export const STATIC_PROJECTS = [
  { id:1, title:'FinSight Agent', subtitle:{ vi:'Phân tích tài chính AI', en:'AI Financial Analyst' }, description:{ vi:'Hệ thống multi-agent RAG phân tích tài chính thời gian thực. Xử lý báo cáo 10-K, kết quả kinh doanh và dữ liệu thị trường để tạo ra các nhận định hữu ích.', en:'Multi-agent RAG system for real-time financial analysis. Ingests 10-K filings, earnings reports, and market data to generate actionable insights.' }, tags:['LangGraph','FastAPI','Qdrant','React','Claude'], status:'Live', year:'2026', links:{ live:'https://finsightagent.tech', github:'https://github.com/phanminhtai23/finsight-agentic-production' } },
  { id:2, title:'MammoAI', subtitle:{ vi:'Phát hiện ung thư vú AI', en:'Breast Cancer Detection' }, description:{ vi:'Hệ thống deep learning đầu cuối phân tích ảnh chụp vú (mammogram) để dự đoán BI-RADS và tư vấn sàng lọc online. Triển khai trên AWS với CI/CD tự động.', en:'End-to-end deep learning system for mammogram analysis — predicts BI-RADS scores and offers online screening. Deployed on AWS with full CI/CD.' }, tags:['Python','PyTorch','FastAPI','Docker','AWS'], status:'Research', year:'2025', links:{ live:null, github:'https://github.com/phanminhtai23/BE_MammoAI' } },
  { id:3, title:'VietLex', subtitle:{ vi:'Công cụ nghiên cứu NLP', en:'NLP Research Tool' }, description:{ vi:'Công cụ tìm kiếm văn bản pháp luật tiếng Việt dựa trên semantic embedding. Xử lý 50k+ tài liệu pháp lý với tốc độ truy xuất dưới 1 giây.', en:'Vietnamese legal document search engine powered by semantic embeddings. Processes 50k+ legal documents with sub-second retrieval.' }, tags:['Elasticsearch','FastAPI','React','Sentence Transformers'], status:'Research', year:'2024', links:{ live:null, github:'#' } },
  { id:4, title:'ScheduleAI', subtitle:{ vi:'Lịch hẹn thông minh', en:'Smart Scheduler' }, description:{ vi:'Công cụ lên lịch cuộc họp bằng ngôn ngữ tự nhiên, tích hợp Google Calendar. Xử lý các ràng buộc phức tạp như múi giờ và sở thích người tham gia.', en:'Natural language meeting scheduler that integrates with Google Calendar. Handles complex constraints like time zones and participant preferences.' }, tags:['OpenAI','Node.js','Next.js','Google API'], status:'Beta', year:'2024', links:{ live:null, github:'#' } },
  { id:5, title:'StreamDash', subtitle:{ vi:'Phân tích thời gian thực', en:'Real-time Analytics' }, description:{ vi:'Dashboard WebSocket theo dõi hiệu suất pipeline AI. Giám sát lượng token, độ trễ và tỷ lệ lỗi trên các agent.', en:'WebSocket-powered dashboard for monitoring AI pipeline performance. Tracks token usage, latency, and error rates across agents.' }, tags:['Redis','FastAPI','React','WebSocket','Recharts'], status:'In Progress', year:'2026', links:{ live:null, github:'#' } },
  { id:6, title:'dotme', subtitle:{ vi:'Trang cá nhân', en:'Personal Site' }, description:{ vi:'Chính là trang này! Portfolio pixel-perfect xây bằng React, với giao diện tối, đẹp và nhanh.', en:'This very site! A pixel-perfect portfolio built with React, inspired by taste-skill design principles. Dark, beautiful, fast.' }, tags:['React','Vite','CSS'], status:'Live', year:'2026', links:{ live:'#', github:'#' } },
]

export const SKILL_GROUPS = [
  { name:{ vi:'LLM & AI Agent', en:'LLM & AI Agent' }, skills:[['LangChain / LangGraph',90],['RAG Pipelines',88],['Multi-Agent Systems',85],['Prompt Engineering',82],['Qdrant / Vector DB',80]] },
  { name:{ vi:'ML & Deep Learning', en:'ML & Deep Learning' }, skills:[['Machine Learning',85],['Deep Learning',83],['TensorFlow / PyTorch',80],['YOLO / Computer Vision',78],['PaddleOCR / OCR',75]] },
  { name:{ vi:'Backend & DevOps', en:'Backend & DevOps' }, skills:[['Python / FastAPI',90],['Docker / GitHub Actions',80],['AWS / Ubuntu Server',75],['PostgreSQL / MongoDB',82],['Nginx / Redis',72]] },
].map(group => ({ ...group, skills: group.skills.map(([name, level]) => ({ name, level })) }))

export const TAGS = ['Python', 'LangGraph', 'LangChain', 'RAG', 'AI Agent', 'Qdrant', 'Docker', 'FastAPI', 'AWS', 'PostgreSQL', 'GitHub Actions']
export const STAT_VALUES = ['1+', '15+', '5+', '∞']
export const SOCIALS = [
  { name:'GitHub', handle:'@phanminhtai23', url:'https://github.com/phanminhtai23' },
  { name:'Email', handle:'kevinphan68.work@gmail.com', url:'mailto:kevinphan68.work@gmail.com' },
  { name:'LinkedIn', handle:'Kevin Phan', url:'#' },
]
export const GITHUB_URL = 'https://github.com/phanminhtai23'

function apiToProject(p) {
  return {
    id: p.id,
    title: p.title,
    subtitle: { vi: p.subtitleVi || '', en: p.subtitleEn || '' },
    description: { vi: p.descVi || '', en: p.descEn || '' },
    tags: Array.isArray(p.tags) ? p.tags : (p.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
    status: p.status || 'In Progress',
    year: p.year || '',
    links: { live: p.liveUrl || null, github: p.githubUrl || null },
  }
}

export function certificateThumbnailUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return url
  return `${url}${url.includes('?') ? '&' : '?'}thumbnail=webp`
}

function fetchSection(section, apply) {
  fetch(`${API}/content/${section}`).then(r => r.json()).then(data => { if (Array.isArray(data)) apply(data) }).catch(() => {})
}

/** Same content the classic landing shows: admin-managed sections from the API, with built-in fallbacks. */
export function useLandingData(lang) {
  const tr = t[lang].edupub
  const [jobs, setJobs] = useState(STATIC_JOBS)
  const [projects, setProjects] = useState(STATIC_PROJECTS)
  const [certs, setCerts] = useState(null)
  const [pubs, setPubs] = useState(null)

  useEffect(() => {
    fetchSection('experience', setJobs)
    fetchSection('projects', data => setProjects(data.map(apiToProject)))
    fetchSection('certificates', setCerts)
    fetchSection('publications', setPubs)
  }, [])

  const fallbackPub = { id:'static', title:tr.pubTitle, authors:tr.authorList, year:'2025', conference:tr.conference, link:'https://goodtechs.eai-conferences.org/2025/' }
  return {
    jobs,
    projects,
    certs: certs ?? tr.certs,
    pubs: pubs && pubs.length ? pubs : [fallbackPub],
  }
}
