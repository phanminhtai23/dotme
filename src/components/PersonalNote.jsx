export default function PersonalNote({ message, accent = '#8B5CF6', label = 'Lời nhắn riêng' }) {
  if (!message?.trim()) return null

  return (
    <section aria-label={label} style={{
      maxWidth:760,
      margin:'0 auto',
      padding:'0 24px 64px',
    }}>
      <div style={{
        padding:'28px clamp(22px, 5vw, 42px)',
        border:`1px solid ${accent}44`,
        borderRadius:24,
        background:`linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.035))`,
        boxShadow:`0 18px 60px ${accent}12`,
      }}>
        <p style={{
          margin:'0 0 12px',
          color:accent,
          fontSize:12,
          fontWeight:800,
          letterSpacing:'0.12em',
          textTransform:'uppercase',
        }}>
          ✉️ {label}
        </p>
        <p style={{
          margin:0,
          color:'rgba(255,255,255,0.86)',
          fontSize:'clamp(16px, 2.4vw, 19px)',
          lineHeight:1.9,
          whiteSpace:'pre-wrap',
        }}>
          {message}
        </p>
      </div>
    </section>
  )
}
