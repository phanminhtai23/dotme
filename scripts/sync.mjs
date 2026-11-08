#!/usr/bin/env node
// Sync the SQLite database (content, accounts, links, messages, visits and uploaded images) between this
// machine and the server.
//   npm run sync:up     local  -> server   (overwrites the server's data)
//   npm run sync:down   server -> local    (overwrites your local data)
// Both take a consistent snapshot, keep a backup of what they are about to overwrite, and ask first.
// Pass `-- --yes` to skip the question. Settings come from .env:
//   SSH_SERVER       ssh config host name (required, e.g. oracle)
//   SSH_REMOTE_DIR   project folder on the server   (default /home/opc/projects/dotme)
//   SSH_PM2_APP      pm2 app name on the server      (default dotme-api)
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const snapshotScript = join(root, 'scripts', 'sqlite-snapshot.cjs')

const direction = process.argv[2]
const assumeYes = process.argv.includes('--yes')
const host = process.env.SSH_SERVER
const remoteDir = (process.env.SSH_REMOTE_DIR || '/home/opc/projects/dotme').replace(/\/+$/, '')
const pm2App = process.env.SSH_PM2_APP || 'dotme-api'
const remotePort = process.env.SSH_REMOTE_PORT || '3002'
const localDb = resolve(root, process.env.SQLITE_PATH || 'server/data/dotme.sqlite')
const remoteDb = `${remoteDir}/server/data/dotme.sqlite`
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
const work = mkdtempSync(join(tmpdir(), 'dotme-sync-'))

function fail(message) {
  console.error(`\nLỗi: ${message}`)
  process.exitCode = 1
  throw new Error(message)
}

const ssh = (script, options = {}) => execFileSync('ssh', ['-o', 'BatchMode=yes', host, 'bash', '-se'], { input: script, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'], ...options })
const scp = (from, to) => execFileSync('scp', ['-q', '-o', 'BatchMode=yes', from, to], { stdio: 'inherit' })
const snapshotLocal = (source, destination) => JSON.parse(execFileSync(process.execPath, [snapshotScript, source, destination].filter(Boolean), { cwd: root, encoding: 'utf8' }))
// The remote snapshot script is uploaded fresh each time, so the server needs no copy of it in git.
function snapshotRemote(source, destination) {
  const output = ssh(`cd '${remoteDir}' && node /tmp/dotme-sqlite-snapshot.cjs '${source}' ${destination ? `'${destination}'` : ''}`)
  return JSON.parse(output.trim().split('\n').at(-1))
}

function describe(label, info) {
  const kb = (info.bytes / 1024).toFixed(1)
  const items = Object.entries(info.collections).map(([name, n]) => `${name.replace(/^content:/, '')} ${n}`).join(', ') || 'không có collection'
  console.log(`  ${label}: ${kb} KB, integrity ${info.integrity}, ${items}, visits ${info.visits}, uploads ${info.uploads}`)
  if (info.integrity !== 'ok') fail(`${label} không qua kiểm tra integrity_check, dừng lại.`)
}

async function confirm(question) {
  if (assumeYes) return
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await rl.question(`\n${question} Gõ "yes" để tiếp tục: `)).trim().toLowerCase()
  rl.close()
  if (answer !== 'yes') fail('Đã hủy, chưa thay đổi gì.')
}

async function localServerRunning() {
  const port = process.env.PORT || '8001'
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch { return false }
}

async function up() {
  console.log(`Đẩy dữ liệu local lên server (${host}:${remoteDb})`)
  if (!existsSync(localDb)) fail(`Không thấy database local: ${localDb}`)
  const local = snapshotLocal(localDb, join(work, 'local.sqlite'))
  scp(snapshotScript, `${host}:/tmp/dotme-sqlite-snapshot.cjs`)
  const backup = `${remoteDir}/server/data/backups/dotme-${stamp}-before-up.sqlite`
  ssh(`mkdir -p '${remoteDir}/server/data/backups'`)
  const remote = snapshotRemote(remoteDb, backup)
  console.log('So sánh:')
  describe('local (sẽ ghi lên)', local)
  describe('server (hiện tại)', remote)
  console.log(`  Bản sao lưu của server: ${backup}`)
  await confirm('Dữ liệu trên server sẽ bị thay bằng bản local.')

  const incoming = `/tmp/dotme-incoming-${stamp}.sqlite`
  scp(join(work, 'local.sqlite'), `${host}:${incoming}`)
  const out = ssh(`
cd '${remoteDir}'
pm2 stop '${pm2App}' >/dev/null
rm -f server/data/dotme.sqlite-wal server/data/dotme.sqlite-shm
mv '${incoming}' server/data/dotme.sqlite
chmod 600 server/data/dotme.sqlite
pm2 restart '${pm2App}' --update-env >/dev/null
for i in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:${remotePort}/api/health >/dev/null; then echo healthy; exit 0; fi
  sleep 1
done
echo unhealthy
`)
  if (!out.includes('healthy') || out.includes('unhealthy')) fail(`Server không phản hồi sau khi thay dữ liệu. Khôi phục bằng: ${backup}`)
  console.log('\nXong: server đã dùng dữ liệu local và đang chạy bình thường.')
}

async function down() {
  console.log(`Kéo dữ liệu từ server (${host}:${remoteDb}) về local`)
  if (await localServerRunning()) fail('Server local đang chạy (npm run dev hoặc npm run server). Hãy tắt nó rồi chạy lại để tránh hỏng database.')
  scp(snapshotScript, `${host}:/tmp/dotme-sqlite-snapshot.cjs`)
  const outgoing = `/tmp/dotme-outgoing-${stamp}.sqlite`
  const remote = snapshotRemote(remoteDb, outgoing)
  scp(`${host}:${outgoing}`, join(work, 'remote.sqlite'))
  ssh(`rm -f '${outgoing}'`)

  console.log('So sánh:')
  describe('server (sẽ kéo về)', remote)
  let backup = null
  if (existsSync(localDb)) {
    mkdirSync(join(dirname(localDb), 'backups'), { recursive: true })
    backup = join(dirname(localDb), 'backups', `dotme-${stamp}-before-down.sqlite`)
    describe('local (hiện tại)', snapshotLocal(localDb, backup))
    console.log(`  Bản sao lưu của local: ${backup}`)
  }
  await confirm('Dữ liệu local sẽ bị thay bằng bản từ server.')

  mkdirSync(dirname(localDb), { recursive: true })
  for (const suffix of ['-wal', '-shm']) rmSync(localDb + suffix, { force: true })
  try { copyFileSync(join(work, 'remote.sqlite'), localDb) } catch (error) {
    fail(`Không ghi được ${localDb} (${error.code}). Tắt các tiến trình đang mở database rồi thử lại.${backup ? ` Bản sao lưu: ${backup}` : ''}`)
  }
  console.log('\nXong: dữ liệu local giờ giống server. Chạy lại npm run dev để dùng.')
}

try {
  if (!['up', 'down'].includes(direction)) fail('Dùng: node scripts/sync.mjs <up|down> [--yes]')
  if (!host) fail('Thiếu SSH_SERVER trong .env (tên host trong ~/.ssh/config, ví dụ SSH_SERVER=oracle).')
  await (direction === 'up' ? up() : down())
} catch (error) {
  if (!process.exitCode) { console.error(`\nLỗi: ${error.message}`); process.exitCode = 1 }
} finally {
  rmSync(work, { recursive: true, force: true })
}
