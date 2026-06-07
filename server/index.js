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
