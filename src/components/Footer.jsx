import { useLang } from '../LangContext'
import { t } from '../i18n'

export default function Footer() {
  const { lang } = useLang()
  const tr = t[lang].footer
  const year = 2026

  return (
    <footer style={{ borderTop:'1px solid var(--border)', padding:'40px', textAlign:'center' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:800, background:'var(--gradient-text)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            .me
          </span>
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>
            © {year} Kevin Phan. {tr.credit}
          </p>
          <a href="#" style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'13px', textDecoration:'none', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--accent-purple)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
          >
            {tr.backTop}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 10V2M2 6l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
