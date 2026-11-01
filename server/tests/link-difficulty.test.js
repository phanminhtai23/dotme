import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

test('link difficulty is saved, validated, and kept when changing the game', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dotme-link-api-'))
  const probe = createServer()
  await new Promise(resolveListen => probe.listen(0, '127.0.0.1', resolveListen))
  const port = probe.address().port
  await new Promise(resolveClose => probe.close(resolveClose))

  const server = spawn(process.execPath, [resolve('server/index.js')], {
    env: { ...process.env, PORT:String(port), SQLITE_PATH:join(dir, 'test.sqlite'), ADMIN_DEFAULT_PASS:'test-only', RESEND_API_KEY:'test-only' },
    stdio:'ignore',
  })
  const base = `http://127.0.0.1:${port}/api`
  const request = (method, path, body) => fetch(base + path, {
    method, headers:{ 'Content-Type':'application/json' }, body:body ? JSON.stringify(body) : undefined,
  })

  try {
    let ready = false
    for (let attempt = 0; attempt < 80; attempt++) {
      try { ready = (await fetch(`${base}/health`)).ok } catch { /* server is starting */ }
      if (ready) break
      await new Promise(resolveWait => setTimeout(resolveWait, 100))
    }
    assert.ok(ready, 'test API did not start')

    const created = await request('POST', '/links', { ownerUsername:'test', type:'birthday', name:'Test', difficulty:'easy' })
    assert.equal(created.status, 200)
    const { id } = await created.json()
    const changed = await request('PUT', `/links/${id}`, { difficulty:'hard' })
    assert.equal(changed.status, 200)
    assert.equal((await changed.json()).difficulty, 'hard')
    const switched = await request('PUT', `/links/${id}`, { gameId:'cat-runner' })
    assert.equal((await switched.json()).difficulty, 'hard')
    assert.equal((await request('PUT', `/links/${id}`, { difficulty:'invalid' })).status, 400)
    assert.equal((await request('POST', '/links', { ownerUsername:'test', type:'birthday', name:'Invalid', difficulty:'invalid' })).status, 400)
    const reloaded = await request('GET', `/links/${id}`)
    assert.equal((await reloaded.json()).difficulty, 'hard')
  } finally {
    if (server.exitCode === null) {
      server.kill()
      await once(server, 'exit')
    }
    rmSync(dir, { recursive:true, force:true })
  }
})
