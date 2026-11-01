import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import sharp from 'sharp'
import { getWebpThumbnail, invalidateThumbnail } from '../image-thumbnails.js'

test('WebP thumbnails are bounded, cached, and preserve the original buffer', async () => {
  const original = await sharp({ create:{ width:1200, height:800, channels:4, background:{ r:40, g:60, b:90, alpha:.5 } } }).png().toBuffer()
  const thumbnail = await getWebpThumbnail('test-unit.png', original)
  const metadata = await sharp(thumbnail).metadata()
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 600)
  assert.equal(metadata.height, 400)
  assert.equal(metadata.hasAlpha, true)
  assert.strictEqual(await getWebpThumbnail('test-unit.png', original), thumbnail)
  assert.equal((await sharp(original).metadata()).width, 1200)
  invalidateThumbnail('test-unit.png')
  const replacement = await sharp({ create:{ width:100, height:50, channels:3, background:'#123456' } }).png().toBuffer()
  const refreshed = await getWebpThumbnail('test-unit.png', replacement)
  assert.equal((await sharp(refreshed).metadata()).width, 100)
  invalidateThumbnail('test-unit.png')
})

test('upload endpoint serves WebP thumbnails and preserves original images', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dotme-image-api-'))
  const probe = createServer()
  await new Promise(resolveListen => probe.listen(0, '127.0.0.1', resolveListen))
  const port = probe.address().port
  await new Promise(resolveClose => probe.close(resolveClose))
  const server = spawn(process.execPath, [resolve('server/index.js')], {
    env:{ ...process.env, PORT:String(port), SQLITE_PATH:join(dir, 'test.sqlite'), ADMIN_DEFAULT_PASS:'test-only', RESEND_API_KEY:'test-only' },
    stdio:'ignore',
  })
  const base = `http://127.0.0.1:${port}`
  try {
    let ready = false
    for (let attempt = 0; attempt < 80; attempt++) {
      try { ready = (await fetch(`${base}/api/health`)).ok } catch { /* server is starting */ }
      if (ready) break
      await new Promise(resolveWait => setTimeout(resolveWait, 100))
    }
    assert.ok(ready, 'test API did not start')
    const original = await sharp({ create:{ width:1200, height:800, channels:3, background:'#336699' } }).png().toBuffer()
    const form = new FormData()
    form.append('image', new Blob([original], { type:'image/png' }), 'sample.png')
    const uploaded = await fetch(`${base}/api/upload`, { method:'POST', body:form })
    assert.equal(uploaded.status, 200)
    const { url } = await uploaded.json()
    const thumbnail = await fetch(`${base}${url}?thumbnail=webp`)
    assert.equal(thumbnail.status, 200)
    assert.match(thumbnail.headers.get('content-type'), /^image\/webp/)
    const meta = await sharp(Buffer.from(await thumbnail.arrayBuffer())).metadata()
    assert.equal(meta.width, 600)
    assert.equal(meta.height, 400)
    const full = await fetch(`${base}${url}`)
    assert.match(full.headers.get('content-type'), /^image\/png/)
    assert.deepEqual(Buffer.from(await full.arrayBuffer()), original)

    const invalidForm = new FormData()
    invalidForm.append('image', new Blob(['not-an-image'], { type:'image/png' }), 'invalid.png')
    const invalidUpload = await fetch(`${base}/api/upload`, { method:'POST', body:invalidForm })
    const invalidUrl = (await invalidUpload.json()).url
    const fallback = await fetch(`${base}${invalidUrl}?thumbnail=webp`)
    assert.equal(fallback.status, 200)
    assert.match(fallback.headers.get('content-type'), /^image\/png/)
    assert.equal(await fallback.text(), 'not-an-image')
  } finally {
    if (server.exitCode === null) {
      server.kill()
      await once(server, 'exit')
    }
    rmSync(dir, { recursive:true, force:true })
  }
})
