import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'
import { api } from '../api'

const socials = [
  {
    name: 'GitHub', handle: '@phanminhtai23', url: 'https://github.com/phanminhtai23',
    color: '#f0f0ff',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>,
  },
  {
    name: 'Email', handle: 'phanminhtai23@gmail.com', url: 'mailto:phanminhtai23@gmail.com',
    color: '#EC4899',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7" strokeLinecap="round"/></svg>,
  },
  {
    name: 'LinkedIn', handle: 'Minh Tài Phan', url: '#',
    color: '#22D3EE',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
]

export default function Contact() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].contact

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSending(true)
    try { await api.sendMessage(form.name, form.message) } catch {}
    setSending(false); setSent(true); setForm({ name:'', email:'', message:'' })
    setTimeout(() => setSent(false), 4000)
  }

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)',
    borderRadius:'var(--radius-md)', padding:'13px 16px', color:'var(--text-primary)',
    fontSize:15, fontFamily:'var(--font-sans)', outline:'none', transition:'all 0.2s ease', boxSizing:'border-box',
  }

  return (
    <section id="contact" ref={ref} style={{ padding: isMobile ? '80px 20px' : '120px 40px', background:'linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.04) 50%, transparent 100%)' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom: isMobile ? 40 : 64 }}>
          <span style={{ color:'var(--accent-purple)', fontWeight:600, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {tr.label}
          </span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '80px', alignItems:'start' }}>
          {/* Left */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-30px)', transition:'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 52px)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:16 }}>
              {tr.heading.replace(tr.headingAccent, '')}{' '}
              <span style={{ background:'var(--gradient-text)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{tr.headingAccent}</span>
            </h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.8, marginBottom:36 }}>{tr.sub}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {socials.map(social => (
                <a key={social.name} href={social.url} style={{ display:'flex', alignItems:'center', gap:14, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 18px', textDecoration:'none', color:'var(--text-primary)', transition:'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=social.color+'44'; e.currentTarget.style.transform='translateX(6px)'; e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateX(0)'; e.currentTarget.style.background='var(--bg-card)' }}
                >
                  <div style={{ width:40, height:40, borderRadius:12, background:`${social.color}15`, border:`1px solid ${social.color}25`, display:'flex', alignItems:'center', justifyContent:'center', color:social.color, flexShrink:0 }}>{social.icon}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{social.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{social.handle}</div>
                  </div>
                  <div style={{ marginLeft:'auto', color:'var(--text-muted)', flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : `translateX(${isMobile ? '0' : '30px'})`, transition:'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>
            <form onSubmit={handleSubmit} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding: isMobile ? '24px' : '36px', display:'flex', flexDirection:'column', gap:18 }}>
              <h3 style={{ fontWeight:700, fontSize:18, marginBottom:0 }}>{tr.formTitle}</h3>
              {[
                { key:'name', label:tr.name, type:'text', placeholder:tr.namePh },
                { key:'email', label:tr.email, type:'email', placeholder:tr.emailPh },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))} required style={inputStyle}
                    onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.5)'; e.target.style.background='rgba(139,92,246,0.06)' }}
                    onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.background='rgba(255,255,255,0.04)' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-secondary)', marginBottom:7, letterSpacing:'0.05em', textTransform:'uppercase' }}>{tr.message}</label>
                <textarea placeholder={tr.msgPh} value={form.message}
                  onChange={e => setForm(p => ({ ...p, message:e.target.value }))} required rows={4}
                  style={{ ...inputStyle, resize:'vertical', minHeight:100 }}
                  onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.5)'; e.target.style.background='rgba(139,92,246,0.06)' }}
                  onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.background='rgba(255,255,255,0.04)' }}
                />
              </div>
              <button type="submit" disabled={sending||sent} style={{
                background: sent ? 'linear-gradient(135deg,#10B981,#22D3EE)' : 'linear-gradient(135deg,#8B5CF6,#EC4899)',
                color:'#fff', border:'none', borderRadius:'var(--radius-full)',
                padding:'14px 28px', fontSize:15, fontWeight:700, fontFamily:'var(--font-sans)',
                cursor: sending||sent ? 'default' : 'pointer', transition:'all 0.3s ease',
                boxShadow: sent ? '0 0 30px rgba(16,185,129,0.4)' : '0 0 30px rgba(139,92,246,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              }}>
                {sending ? tr.sending : sent ? tr.sent : tr.send}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
