import { useEffect, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useLang } from '../LangContext'
import { t } from '../i18n'

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 'var(--radius-full)', padding: '6px 12px',
        color: '#a78bfa', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s ease', letterSpacing: '0.04em',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.2)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.6)' }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.3)' }}
    >
      {lang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
    </button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].nav

  const anchors = ['about', 'skills', 'projects', 'contact']

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        padding: isMobile ? '14px 20px' : '16px 40px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        transition:'all 0.3s ease',
        background: scrolled || menuOpen ? 'rgba(6,6,15,0.92)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || menuOpen ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration:'none' }}>
          <span style={{
            fontFamily:'var(--font-display)', fontSize:22, fontWeight:800,
            background:'var(--gradient-text)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            letterSpacing:'-0.5px',
          }}>
            .me
          </span>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {tr.links.map((label, i) => (
              <a key={i} href={`#${anchors[i]}`} style={{
                color:'var(--text-secondary)', textDecoration:'none',
                fontSize:14, fontWeight:500, padding:'8px 16px',
                borderRadius:'var(--radius-full)', transition:'all 0.2s ease',
                letterSpacing:'0.02em',
              }}
              onMouseEnter={e => { e.target.style.color='var(--text-primary)'; e.target.style.background='rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.target.style.color='var(--text-secondary)'; e.target.style.background='transparent' }}
              >{label}</a>
            ))}
            <LangToggle />
            <a href="#contact" style={{
              background:'var(--gradient-hero)', color:'#fff', textDecoration:'none',
              fontSize:14, fontWeight:600, padding:'9px 22px',
              borderRadius:'var(--radius-full)', transition:'all 0.2s ease',
              boxShadow:'0 0 20px rgba(139,92,246,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 0 30px rgba(139,92,246,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 20px rgba(139,92,246,0.3)' }}
            >{tr.hire}</a>
          </div>
        )}

        {/* Mobile: lang toggle + hamburger */}
        {isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <LangToggle />
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--text-primary)', padding:8, display:'flex', flexDirection:'column', gap:5,
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:22, height:2, background:'var(--text-primary)', borderRadius:1,
                  transition:'all 0.3s ease',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                    : i === 1 ? 'opacity(0)'
                    : 'rotate(-45deg) translate(5px, -5px)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && (
        <div style={{
          position:'fixed', top:52, left:0, right:0, zIndex:99,
          background:'rgba(6,6,15,0.97)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          padding:'16px 20px 24px',
          display:'flex', flexDirection:'column', gap:4,
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition:'all 0.25s ease',
        }}>
          {tr.links.map((label, i) => (
            <a key={i} href={`#${anchors[i]}`}
              onClick={() => setMenuOpen(false)}
              style={{
                color:'var(--text-secondary)', textDecoration:'none',
                fontSize:16, fontWeight:500, padding:'14px 16px',
                borderRadius:12, transition:'all 0.2s',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='transparent' }}
            >{label}</a>
          ))}
          <a href="#contact" onClick={() => setMenuOpen(false)} style={{
            marginTop:8, background:'var(--gradient-hero)', color:'#fff',
            textDecoration:'none', fontSize:15, fontWeight:700, padding:'13px 20px',
            borderRadius:12, textAlign:'center', boxShadow:'0 0 20px rgba(139,92,246,0.3)',
          }}>{tr.hire} 🚀</a>
        </div>
      )}
    </>
  )
}
