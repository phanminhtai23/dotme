import { useRef, useState } from 'react'
import AdminIcon from './AdminIcons'

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
      <span className="dm-uploader__label">{label} ({images.length} ảnh)</span>

      <div className="dm-uploader__grid">
        {images.map((img, i) => (
          <div key={i} className="dm-thumb" onClick={() => setLightbox(img.url)}>
            <img src={img.url} alt={img.name || ''} />
            <button type="button" aria-label={`Xóa ảnh ${img.name || i + 1}`} onClick={e => { e.stopPropagation(); remove(i) }}><AdminIcon name="close" size={12} /></button>
          </div>
        ))}

        {/* Upload button */}
        <label className={`dm-uploader__add ${uploading ? 'is-busy' : ''}`}>
          {uploading ? (
            <AdminIcon name="loader" size={20} className="dm-spin" />
          ) : (
            <>
              <AdminIcon name="upload" size={20} />
              <span>Thêm ảnh</span>
            </>
          )}
          <input ref={inputRef} type="file" multiple accept="image/*" hidden
            onChange={e => handleFiles([...e.target.files])} />
        </label>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="dm-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  )
}
