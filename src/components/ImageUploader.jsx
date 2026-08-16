import { useRef, useState } from 'react'

export default function ImageUploader({ images = [], onChange, label = 'Album ảnh' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const handleFiles = async (files) => {
    if (!files.length) return
    setUploading(true)
    const added = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) added.push({ url: data.url, filename: data.filename, name: file.name })
      } catch {
        // fallback: read as base64 for local preview
        const base64 = await new Promise(r => {
          const reader = new FileReader()
          reader.onload = e => r(e.target.result)
          reader.readAsDataURL(file)
        })
        added.push({ url: base64, filename: null, name: file.name })
      }
    }
    onChange([...images, ...added])
    setUploading(false)
  }

  const remove = (i) => {
    const img = images[i]
    if (img.filename) {
      fetch(`${(import.meta.env.VITE_API_BASE_URL || '/api')}/upload/${img.filename}`, { method: 'DELETE' }).catch(() => {})
    }
    onChange(images.filter((_, j) => j !== i))
  }

  return (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#8888aa', marginBottom:10, letterSpacing:'0.05em', textTransform:'uppercase' }}>
        {label} ({images.length} ảnh)
      </label>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position:'relative', width:80, height:80, borderRadius:10, overflow:'hidden', cursor:'pointer' }}
            onClick={() => setLightbox(img.url)}
          >
            <img src={img.url} alt={img.name || ''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <button onClick={e => { e.stopPropagation(); remove(i) }} style={{
              position:'absolute', top:3, right:3, background:'rgba(0,0,0,0.7)',
              border:'none', borderRadius:'50%', width:20, height:20,
              color:'#fff', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>
        ))}

        {/* Upload button */}
        <label style={{
          width:80, height:80, borderRadius:10,
          background: uploading ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
          border:'2px dashed rgba(139,92,246,0.3)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', gap:4, transition:'all 0.2s',
          color: uploading ? '#a78bfa' : '#555577', fontSize:11,
        }}
        onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor='rgba(139,92,246,0.6)'; e.currentTarget.style.color='#a78bfa' } }}
        onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'; e.currentTarget.style.color='#555577' } }}
        >
          {uploading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round"/>
            </svg>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Thêm ảnh</span>
            </>
          )}
          <input ref={inputRef} type="file" multiple accept="image/*" hidden
            onChange={e => handleFiles([...e.target.files])} />
        </label>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.92)', backdropFilter:'blur(12px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'zoom-out',
        }}>
          <img src={lightbox} style={{ maxWidth:'92vw', maxHeight:'92vh', borderRadius:14, objectFit:'contain' }} />
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
