import express from 'express'
import cors from 'cors'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR    = join(__dirname, 'data')
const UPLOADS_DIR = join(__dirname, 'uploads')
try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}
try { mkdirSync(UPLOADS_DIR, { recursive: true }) } catch {}

const ACCOUNTS_FILE = join(DATA_DIR, 'accounts.json')
const LINKS_FILE    = join(DATA_DIR, 'links.json')
const MESSAGES_FILE = join(DATA_DIR, 'messages.json')

const CONTENT_SECTIONS = ['experience', 'projects', 'certificates', 'publications']
const CONTENT_FILES = Object.fromEntries(CONTENT_SECTIONS.map(s => [s, join(DATA_DIR, `${s}.json`)]))

const INITIAL_CONTENT = {
  experience: [
    { id:'tma', company:'TMA Solutions', role:'AI Engineer', period:'Jan 2026 – Present', location:'Ho Chi Minh, VN', current:true, bullets:[
      'Architected an <strong>autonomous AI Agent</strong> to automate cross-functional task aggregation and daily reporting.',
      'Built an LLM-driven ingestion framework with Apache SeaTunnel achieving <strong>&gt;90% accuracy</strong> across diverse enterprise sources.',
      'Built a <strong>Multi-Agent</strong> system with LangChain/LangGraph for end-to-end data ingestion from natural language requests.',
      'Implemented RAG for orchestration using <strong>Qdrant</strong> as vector database.',
      'Managed <strong>Docker</strong> containerization and deployment of production services on Ubuntu servers.',
    ]},
    { id:'pod', company:'POD Software', role:'Contract Computer Vision Engineer', period:'Nov 2025 – Dec 2025', location:'Can Tho, VN', current:false, bullets:[
      'Developed a <strong>real-time OCR system</strong> for extracting text from garment labels using PaddleOCR.',
      'Optimized pipeline to <strong>&lt;100ms/frame and &gt;95% accuracy</strong> on CPU-only devices.',
      'Integrated and tested the system within the existing WinForms application for factory deployment.',
    ]},
    { id:'biwoco', company:'BIWOCO', role:'AI Engineer Intern', period:'Apr 2025 – Jul 2025', location:'Can Tho, VN', current:false, bullets:[
      'Researched and built AI Agent / Multi-Agent systems using <strong>Google ADK</strong> to automate processing tasks.',
      'Developed <strong>automated workflows</strong> with Playwright, StageHand, and AI Browser tools.',
      'Conducted LLM evaluations using <strong>Phoenix Experiments</strong> to track metrics and optimize prompts.',
    ]},
  ],
  projects: [
    { id:'finsight', title:'FinSight Agent', subtitleVi:'Phân tích tài chính AI', subtitleEn:'AI Financial Analyst', descVi:'Hệ thống multi-agent RAG phân tích tài chính thời gian thực. Xử lý báo cáo 10-K, kết quả kinh doanh và dữ liệu thị trường để tạo ra các nhận định hữu ích.', descEn:'Multi-agent RAG system for real-time financial analysis. Ingests 10-K filings, earnings reports, and market data to generate actionable insights.', tags:['LangGraph','FastAPI','Qdrant','React','Claude'], color:'#8B5CF6', icon:'📈', status:'Live', year:'2026', liveUrl:'https://finsightagent.tech', githubUrl:'https://github.com/phanminhtai23/finsight-agentic-production' },
    { id:'mammoai', title:'MammoAI', subtitleVi:'Phát hiện ung thư vú AI', subtitleEn:'Breast Cancer Detection', descVi:'Hệ thống deep learning đầu cuối phân tích ảnh chụp vú (mammogram) để dự đoán BI-RADS và tư vấn sàng lọc online. Triển khai trên AWS với CI/CD tự động.', descEn:'End-to-end deep learning system for mammogram analysis — predicts BI-RADS scores and offers online screening. Deployed on AWS with full CI/CD.', tags:['Python','PyTorch','FastAPI','Docker','AWS'], color:'#22D3EE', icon:'🔬', status:'Research', year:'2025', liveUrl:'', githubUrl:'https://github.com/phanminhtai23/BE_MammoAI' },
    { id:'vietlex', title:'VietLex', subtitleVi:'Công cụ nghiên cứu NLP', subtitleEn:'NLP Research Tool', descVi:'Công cụ tìm kiếm văn bản pháp luật tiếng Việt dựa trên semantic embedding. Xử lý 50k+ tài liệu pháp lý với tốc độ truy xuất dưới 1 giây.', descEn:'Vietnamese legal document search engine powered by semantic embeddings. Processes 50k+ legal documents with sub-second retrieval.', tags:['Elasticsearch','FastAPI','React','Sentence Transformers'], color:'#10B981', icon:'⚖️', status:'Research', year:'2024', liveUrl:'', githubUrl:'' },
    { id:'scheduleai', title:'ScheduleAI', subtitleVi:'Lịch hẹn thông minh', subtitleEn:'Smart Scheduler', descVi:'Công cụ lên lịch cuộc họp bằng ngôn ngữ tự nhiên, tích hợp Google Calendar. Xử lý các ràng buộc phức tạp như múi giờ và sở thích người tham gia.', descEn:'Natural language meeting scheduler that integrates with Google Calendar. Handles complex constraints like time zones and participant preferences.', tags:['OpenAI','Node.js','Next.js','Google API'], color:'#F59E0B', icon:'📅', status:'Beta', year:'2024', liveUrl:'', githubUrl:'' },
    { id:'streamdash', title:'StreamDash', subtitleVi:'Phân tích thời gian thực', subtitleEn:'Real-time Analytics', descVi:'Dashboard WebSocket theo dõi hiệu suất pipeline AI. Giám sát lượng token, độ trễ và tỷ lệ lỗi trên các agent.', descEn:'WebSocket-powered dashboard for monitoring AI pipeline performance. Tracks token usage, latency, and error rates across agents.', tags:['Redis','FastAPI','React','WebSocket','Recharts'], color:'#EC4899', icon:'📊', status:'In Progress', year:'2026', liveUrl:'', githubUrl:'' },
    { id:'dotme', title:'dotme', subtitleVi:'Trang cá nhân', subtitleEn:'Personal Site', descVi:'Chính là trang này! Portfolio pixel-perfect xây bằng React, với giao diện tối, đẹp và nhanh.', descEn:'This very site! A pixel-perfect portfolio built with React, inspired by taste-skill design principles. Dark, beautiful, fast.', tags:['React','Vite','CSS'], color:'#8B5CF6', icon:'✨', status:'Live', year:'2026', liveUrl:'#', githubUrl:'#' },
  ],
  certificates: [
    { id:'toeic', name:'TOEIC 740', issuer:'ETS', icon:'🌐', color:'#22D3EE' },
    { id:'googleai', name:'Google AI Essentials', issuer:'Google', icon:'🤖', color:'#10B981' },
    { id:'aws', name:'AWS for Beginners', issuer:'Udemy', icon:'☁️', color:'#F59E0B' },
    { id:'rag', name:'RAG Systems Expert', issuer:'Ready Tensor', icon:'🧠', color:'#8B5CF6' },
  ],
  publications: [
    { id:'goodtechs2025', title:'Design and Implementation of an Intelligent System for Drug-Drug Interaction Management and Retrieval', authors:[{name:'Tien Dao Luu',highlight:false},{name:'Minh Tai Phan',highlight:true},{name:'Hoang Dien Nguyen',highlight:false},{name:'Hieu Duong Trung',highlight:false},{name:'Thien Vu Nguyen',highlight:false}], year:'2025', conference:'11th EAI International Conference on Smart Objects and Technologies for Social Good (GOODTECHS 2025)', link:'https://goodtechs.eai-conferences.org/2025/' },
  ],
}

const app    = express()
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM || 'inbox-resume@finsightagent.tech'
const TO     = process.env.RESEND_TO   || 'phanminhtai23@gmail.com'

app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174','http://localhost:5175'], credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// ── JSON helpers ─────────────────────────────────────────────────────────────
function rj(file, fallback = []) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}
function wj(file, data) { writeFileSync(file, JSON.stringify(data, null, 2), 'utf8') }

function genId() {
  const c = 'abcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < 9; i++) id += c[Math.floor(Math.random() * c.length)]
  return id
}

// ── Init default data ────────────────────────────────────────────────────────
async function initData() {
  if (!existsSync(ACCOUNTS_FILE)) {
    const defaultPass = process.env.ADMIN_DEFAULT_PASS
    if (!defaultPass) { console.error('❌ ADMIN_DEFAULT_PASS not set in .env'); process.exit(1) }
    const hash = await bcrypt.hash(defaultPass, 10)
    wj(ACCOUNTS_FILE, [{
      username: 'admin', passwordHash: hash, role: 'superadmin',
      displayName: 'Administrator', created: new Date().toISOString().slice(0,10), expiresAt: null,
    }])
    console.log(`✅ Created default admin — username: admin`)
    console.log(`   ⚠️  Đổi mật khẩu sau khi đăng nhập lần đầu!`)
  }
  if (!existsSync(LINKS_FILE))    wj(LINKS_FILE, [])
  if (!existsSync(MESSAGES_FILE)) wj(MESSAGES_FILE, [])
  for (const s of CONTENT_SECTIONS) {
    if (!existsSync(CONTENT_FILES[s])) wj(CONTENT_FILES[s], INITIAL_CONTENT[s])
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const accounts = rj(ACCOUNTS_FILE)
  const acc = accounts.find(a => a.username === username)
  if (!acc) return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' })
  const ok = await bcrypt.compare(password, acc.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' })
  if (acc.expiresAt && new Date(acc.expiresAt) < new Date()) return res.status(401).json({ error: 'Tài khoản đã hết hạn' })
  res.json({ username: acc.username, role: acc.role, displayName: acc.displayName })
})

// ── Accounts ──────────────────────────────────────────────────────────────────
app.get('/api/accounts', (req, res) => {
  const accounts = rj(ACCOUNTS_FILE).map(({ passwordHash, ...rest }) => rest)
  res.json(accounts)
})

app.post('/api/accounts', async (req, res) => {
  const { username, password, displayName, role, expiresAt } = req.body
  const accounts = rj(ACCOUNTS_FILE)
  if (accounts.find(a => a.username === username)) return res.status(400).json({ error: 'Username đã tồn tại' })
  if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin' })
  const passwordHash = await bcrypt.hash(password, 10)
  const newAcc = { username, passwordHash, displayName: displayName || username, role: role || 'user', created: new Date().toISOString().slice(0,10), expiresAt: expiresAt || null }
  wj(ACCOUNTS_FILE, [...accounts, newAcc])
  const { passwordHash: _, ...safe } = newAcc
  res.json(safe)
})

app.put('/api/accounts/:username', async (req, res) => {
  const { password, displayName, role, expiresAt } = req.body
  const accounts = rj(ACCOUNTS_FILE)
  const idx = accounts.findIndex(a => a.username === req.params.username)
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' })
  if (password) accounts[idx].passwordHash = await bcrypt.hash(password, 10)
  if (displayName !== undefined) accounts[idx].displayName = displayName
  if (role !== undefined) accounts[idx].role = role
  if (expiresAt !== undefined) accounts[idx].expiresAt = expiresAt || null
  wj(ACCOUNTS_FILE, accounts)
  const { passwordHash: _, ...safe } = accounts[idx]
  res.json(safe)
})

app.delete('/api/accounts/:username', (req, res) => {
  if (req.params.username === 'admin') return res.status(403).json({ error: 'Không thể xóa admin gốc' })
  const accounts = rj(ACCOUNTS_FILE).filter(a => a.username !== req.params.username)
  wj(ACCOUNTS_FILE, accounts)
  const links = rj(LINKS_FILE).filter(l => l.ownerUsername !== req.params.username)
  wj(LINKS_FILE, links)
  res.json({ ok: true })
})

// ── Links ─────────────────────────────────────────────────────────────────────
app.get('/api/links', (req, res) => res.json(rj(LINKS_FILE)))

app.post('/api/links', (req, res) => {
  const { ownerUsername, type, name, expiresAt, images = [], difficulty = 'medium' } = req.body
  if (!ownerUsername || !type || !name) return res.status(400).json({ error: 'Thiếu thông tin' })
  const id = genId()
  const link = { id, ownerUsername, type, name, path: `/${type}/${id}`, created: new Date().toISOString().slice(0,10), expiresAt: expiresAt || null, images, difficulty, plays: [] }
  const links = rj(LINKS_FILE)
  wj(LINKS_FILE, [...links, link])
  res.json(link)
})

app.put('/api/links/:id', (req, res) => {
  const links = rj(LINKS_FILE)
  const idx = links.findIndex(l => l.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' })
  links[idx] = { ...links[idx], ...req.body, id: links[idx].id }
  wj(LINKS_FILE, links)
  res.json(links[idx])
})

app.delete('/api/links/:id', (req, res) => {
  wj(LINKS_FILE, rj(LINKS_FILE).filter(l => l.id !== req.params.id))
  res.json({ ok: true })
})

app.get('/api/links/:id', (req, res) => {
  const link = rj(LINKS_FILE).find(l => l.id === req.params.id)
  if (!link) return res.status(404).json({ error: 'Không tìm thấy' })
  res.json(link)
})

// ── Game Plays ────────────────────────────────────────────────────────────────
const MAX_PLAYS = 3

app.get('/api/links/:id/plays', (req, res) => {
  const link = rj(LINKS_FILE).find(l => l.id === req.params.id)
  if (!link) return res.status(404).json({ error: 'Không tìm thấy' })
  const plays = link.plays || []
  res.json({ count: plays.length, remaining: Math.max(0, MAX_PLAYS - plays.length), plays })
})

app.post('/api/links/:id/play', (req, res) => {
  const links = rj(LINKS_FILE)
  const idx = links.findIndex(l => l.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' })
  const plays = links[idx].plays || []
  if (plays.length >= MAX_PLAYS) return res.status(403).json({ error: 'Đã hết lượt chơi', maxed: true })
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  const play = { ip, won: req.body.won || false, at: new Date().toISOString() }
  links[idx].plays = [...plays, play]
  wj(LINKS_FILE, links)
  res.json({ ok: true, remaining: Math.max(0, MAX_PLAYS - links[idx].plays.length), play })
})

// ── Image Upload ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only')) })

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename })
})
app.delete('/api/upload/:filename', (req, res) => {
  try { unlinkSync(join(UPLOADS_DIR, req.params.filename)) } catch {}
  res.json({ ok: true })
})

// ── Messages ──────────────────────────────────────────────────────────────────
app.post('/api/messages', async (req, res) => {
  const { name, message } = req.body
  if (!name?.trim() || !message?.trim()) return res.status(400).json({ error: 'Thiếu nội dung' })
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  const entry = { name: name.trim(), message: message.trim(), ip, createdAt: new Date().toISOString() }
  const msgs = rj(MESSAGES_FILE)
  wj(MESSAGES_FILE, [...msgs, entry])
  try {
    await resend.emails.send({
      from: FROM, to: TO,
      subject: `💬 Tin nhắn mới từ ${entry.name} — dotme`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;background:#06060f;color:#f0f0ff;padding:40px;border-radius:16px;"><h2 style="background:linear-gradient(135deg,#8B5CF6,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">.me — Tin nhắn mới</h2><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin:20px 0;"><b>${entry.name}</b><p style="color:#555577;font-size:13px;">📍 ${ip} · ${new Date(entry.createdAt).toLocaleString('vi-VN')}</p><hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0;"/><p style="white-space:pre-wrap;">${entry.message}</p></div></div>`,
    })
  } catch (err) { console.error('Resend:', err.message) }
  res.json({ ok: true })
})

app.get('/api/messages', (_, res) => res.json(rj(MESSAGES_FILE)))

app.delete('/api/messages/:idx', (req, res) => {
  const msgs = rj(MESSAGES_FILE)
  msgs.splice(Number(req.params.idx), 1)
  wj(MESSAGES_FILE, msgs)
  res.json({ ok: true })
})

app.delete('/api/messages', (_, res) => { wj(MESSAGES_FILE, []); res.json({ ok: true }) })

// ── Content CRUD ──────────────────────────────────────────────────────────────
app.get('/api/content/:section', (req, res) => {
  if (!CONTENT_SECTIONS.includes(req.params.section)) return res.status(400).json({ error: 'Invalid section' })
  res.json(rj(CONTENT_FILES[req.params.section]))
})

app.post('/api/content/:section', (req, res) => {
  if (!CONTENT_SECTIONS.includes(req.params.section)) return res.status(400).json({ error: 'Invalid section' })
  const items = rj(CONTENT_FILES[req.params.section])
  const item = { ...req.body, id: genId() }
  wj(CONTENT_FILES[req.params.section], [...items, item])
  res.json(item)
})

app.put('/api/content/:section/:id', (req, res) => {
  if (!CONTENT_SECTIONS.includes(req.params.section)) return res.status(400).json({ error: 'Invalid section' })
  const items = rj(CONTENT_FILES[req.params.section])
  const idx = items.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  items[idx] = { ...items[idx], ...req.body, id: req.params.id }
  wj(CONTENT_FILES[req.params.section], items)
  res.json(items[idx])
})

app.delete('/api/content/:section/:id', (req, res) => {
  if (!CONTENT_SECTIONS.includes(req.params.section)) return res.status(400).json({ error: 'Invalid section' })
  const remaining = rj(CONTENT_FILES[req.params.section]).filter(i => i.id !== req.params.id)
  wj(CONTENT_FILES[req.params.section], remaining)
  res.json({ ok: true })
})

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.get('/api/storage', (_, res) => {
  try {
    const accounts = rj(ACCOUNTS_FILE)
    const links    = rj(LINKS_FILE)
    const messages = rj(MESSAGES_FILE)

    let uploadBytes = 0, uploadCount = 0
    try {
      const files = readdirSync(UPLOADS_DIR)
      uploadCount = files.length
      files.forEach(f => { try { uploadBytes += statSync(join(UPLOADS_DIR, f)).size } catch {} })
    } catch {}

    const jsonBytes =
      Buffer.byteLength(JSON.stringify(accounts)) +
      Buffer.byteLength(JSON.stringify(links)) +
      Buffer.byteLength(JSON.stringify(messages))

    const totalBytes = uploadBytes + jsonBytes
    const fmt = b => b > 1024*1024 ? `${(b/1024/1024).toFixed(2)} MB`
                   : b > 1024       ? `${(b/1024).toFixed(1)} KB`
                   :                  `${b} B`
    res.json({
      accounts: accounts.length,
      links: links.length,
      messages: messages.length,
      uploads: { count: uploadCount, size: fmt(uploadBytes) },
      json: { size: fmt(jsonBytes) },
      total: { size: fmt(totalBytes), bytes: totalBytes },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

const PORT = process.env.PORT || 3001
initData().then(() => app.listen(PORT, () => console.log(`✅ dotme API → http://localhost:${PORT}`)))
