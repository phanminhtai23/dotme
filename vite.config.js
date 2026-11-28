import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function inlineSmallEntryCss() {
  return {
    name: 'inline-small-entry-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const htmlAsset = bundle['index.html']
      if (!htmlAsset || htmlAsset.type !== 'asset') return

      let html = Buffer.isBuffer(htmlAsset.source)
        ? htmlAsset.source.toString('utf8')
        : String(htmlAsset.source)

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !fileName.endsWith('.css')) continue
        const css = Buffer.isBuffer(asset.source)
          ? asset.source.toString('utf8')
          : String(asset.source)
        // The global entry stylesheet is ~23 KB raw but ~1.6 KB gzipped; inlining
        // removes its extra render-blocking round trip on the first visit.
        if (Buffer.byteLength(css, 'utf8') > 32768) continue

        const href = `href="/${fileName}"`
        if (!html.includes(href)) continue
        let replaced = false
        html = html.replace(/<link\b[^>]*>/g, tag => {
          if (!replaced && tag.includes('stylesheet') && tag.includes(href)) {
            replaced = true
            return `<style>${css}</style>`
          }
          return tag
        })
        // Keep the emitted CSS asset: Vite's lazy-route preload maps still refer
        // to it even though the entry HTML uses the inline copy.
      }

      htmlAsset.source = html
    },
  }
}

export default defineConfig({
  plugins: [react(), inlineSmallEntryCss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
