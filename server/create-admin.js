#!/usr/bin/env node
// Usage: node --env-file=.env server/create-admin.js <username> <password> [displayName] [role]
// role: superadmin | admin | user  (default: admin)

import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const ACCOUNTS_FILE = join(DATA_DIR, 'accounts.json')

try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}

function rj(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return [] }
}
function wj(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
}

const [,, username, password, displayName, role = 'admin'] = process.argv

if (!username || !password) {
  console.error('Usage: node --env-file=.env server/create-admin.js <username> <password> [displayName] [role]')
  console.error('  role: superadmin | admin | user  (default: admin)')
  process.exit(1)
}

const validRoles = ['superadmin', 'admin', 'user']
if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role "${role}". Must be one of: ${validRoles.join(', ')}`)
  process.exit(1)
}

const accounts = rj(ACCOUNTS_FILE)
if (accounts.find(a => a.username === username)) {
  console.error(`❌ Username "${username}" already exists`)
  process.exit(1)
}

const hash = await bcrypt.hash(password, 10)
accounts.push({
  username,
  passwordHash: hash,
  role,
  displayName: displayName || username,
  created: new Date().toISOString().slice(0, 10),
  expiresAt: null,
})
wj(ACCOUNTS_FILE, accounts)

console.log(`✅ Created account:`)
console.log(`   username    : ${username}`)
console.log(`   displayName : ${displayName || username}`)
console.log(`   role        : ${role}`)
