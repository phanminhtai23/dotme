import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ProtectedPage from '../components/ProtectedPage'
import GameWrapper from '../components/GameWrapper'
import PersonalNote from '../components/PersonalNote'

// ── Cat SVG (coach pose) ─────────────────────────────────────────────────────
function CoachCat({ size = 160, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={style}>
      <ellipse cx="60" cy="85" rx="28" ry="22" fill="#fbbf24"/>
      <circle cx="60" cy="50" r="26" fill="#fbbf24"/>
      <polygon points="38,32 30,12 50,26" fill="#fbbf24"/><polygon points="82,32 90,12 70,26" fill="#fbbf24"/>
      <polygon points="40,31 34,16 50,25" fill="#fde68a"/><polygon points="80,31 86,16 70,25" fill="#fde68a"/>
      {/* sunglasses */}
      <rect x="38" y="43" width="16" height="12" rx="5" fill="#1a1a2e"/><rect x="66" y="43" width="16" height="12" rx="5" fill="#1a1a2e"/>
      <line x1="54" y1="49" x2="66" y2="49" stroke="#1a1a2e" strokeWidth="2"/>
      <circle cx="43" cy="46" r="2" fill="#fbbf24" opacity="0.3"/><circle cx="71" cy="46" r="2" fill="#fbbf24" opacity="0.3"/>
      <polygon points="60,57 57,61 63,61" fill="#f97316"/>
      <path d="M57,61 Q60,66 63,61" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="35" y1="56" x2="52" y2="58" stroke="#eee" strokeWidth="1.2"/><line x1="35" y1="61" x2="52" y2="61" stroke="#eee" strokeWidth="1.2"/>
      <line x1="68" y1="58" x2="85" y2="56" stroke="#eee" strokeWidth="1.2"/><line x1="68" y1="61" x2="85" y2="61" stroke="#eee" strokeWidth="1.2"/>
      {/* raised arm */}
      <path d="M82,70 Q98,55 104,40" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round"/>
      <circle cx="107" cy="36" r="7" fill="#fbbf24"/>
      <path d="M82,92 Q100,80 94,64 Q89,50 79,62" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
      <ellipse cx="45" cy="104" rx="12" ry="7" fill="#fbbf24"/><ellipse cx="75" cy="104" rx="12" ry="7" fill="#fbbf24"/>
      <circle cx="40" cy="107" r="2.5" fill="#fde68a"/><circle cx="45" cy="109" r="2.5" fill="#fde68a"/><circle cx="50" cy="107" r="2.5" fill="#fde68a"/>
    </svg>
  )
}

// ── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ images }) {
  const [lb, setLb] = useState(null)
  const [lbIdx, setLbIdx] = useState(0)
  if (!images?.length) return null
  const open = (i) => { setLbIdx(i); setLb(images[i]) }
  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10 }}>
        {images.map((img, i) => (
          <div key={i} onClick={() => open(i)} style={{
            borderRadius:14, overflow:'hidden', cursor:'zoom-in', aspectRatio:'1',
            border:'1px solid rgba(251,191,36,0.25)', transition:'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(251,191,36,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none' }}
          >
            <img src={img.url || img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ))}
      </div>
      {lb && (
        <div onClick={() => setLb(null)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={lb.url || lb} alt="" style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:14, objectFit:'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

// ── Quotes ───────────────────────────────────────────────────────────────────
const makeQuotes = (n) => [
  { text:`${n} không cần giải quyết hết mọi thứ hôm nay. Chỉ cần chọn một việc nhỏ và bắt đầu từ đó.`, cat:'🌱', color:'#f59e0b' },
  { text:`Nghỉ ngơi không làm bạn tụt lại. Đôi khi, đó chính là bước giúp mình đi tiếp bền hơn.`, cat:'☁️', color:'#8b5cf6' },
  { text:`Tiến bộ có thể chậm và không hoàn hảo. Một bước nhỏ vẫn là một bước tiến.`, cat:'🐾', color:'#06b6d4' },
  { text:`Nếu hôm nay khó khăn, hãy thử thu nhỏ mục tiêu thay vì trách bản thân.`, cat:'🧩', color:'#10b981' },
  { text:`${n} đã đi qua nhiều ngày không dễ dàng. Hôm nay cũng chỉ cần thêm một bước vừa sức thôi.`, cat:'✨', color:'#ec4899' },
  { text:`Không cần chờ có động lực mới bắt đầu. Hãy bắt đầu thật nhỏ, rồi động lực có thể đến sau.`, cat:'🌤️', color:'#f59e0b' },
]

const focusCards = [
  { icon:'🪴', title:'Bắt đầu nhỏ', text:'Chọn một việc có thể hoàn thành trong 10 phút.' },
  { icon:'💧', title:'Chăm sóc mình', text:'Uống nước, ăn đúng bữa và nghỉ khi cần.' },
  { icon:'🤝', title:'Nhờ giúp đỡ', text:'Chia sẻ với người bạn tin tưởng khi thấy quá tải.' },
]

// ── Main ─────────────────────────────────────────────────────────────────────
function MotivationContent({ link }) {
  const quotes = makeQuotes(link.name)
  const [qi, setQi] = useState(() => Math.floor(Math.random() * quotes.length))
  const [anim, setAnim] = useState(false)
  const [planDone, setPlanDone] = useState({})

  const nextQ = () => { setAnim(true); setTimeout(() => { setQi(i => (i + 1) % quotes.length); setAnim(false) }, 280) }
  const q = quotes[qi]

  const section = { maxWidth:880, margin:'0 auto', padding:'0 24px' }

  const plan = [
    { icon:'🌤️', text:'Dành một phút để hít thở và nhận ra mình đang cảm thấy thế nào.' },
    { icon:'💧', text:'Uống một cốc nước hoặc đứng dậy duỗi người một chút.' },
    { icon:'🧭', text:'Chọn một việc quan trọng nhất — chưa cần làm tất cả cùng lúc.' },
    { icon:'⏳', text:'Thử tập trung 10 phút, sau đó tự cho mình một khoảng nghỉ.' },
    { icon:'💬', text:'Nếu thấy khó, nhắn cho một người bạn tin tưởng.' },
  ]
  const completedSteps = Object.values(planDone).filter(Boolean).length
  const progress = Math.round((completedSteps / plan.length) * 100)

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 20% 10%, #1a0f00 0%, #0a0f1e 50%, #0f0a00 100%)', fontFamily:'var(--font-sans)', color:'#f0f0ff', overflowX:'hidden' }}>
      {/* Floating decorations */}
      {['💪','🔥','⚡','🎯','🚀','😸'].map((e, i) => (
        <span key={i} style={{ position:'fixed', fontSize:32+i*4, opacity:0.06, pointerEvents:'none', top:`${10+i*14}%`, left: i % 2 ? `${3+i*2}%` : undefined, right: i % 2 === 0 ? `${3+i*2}%` : undefined, animation:`floatDeco ${2.5+i*0.3}s ease-in-out infinite alternate`, animationDelay:`${i*0.3}s`, userSelect:'none' }}>{e}</span>
      ))}

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 60px', position:'relative', zIndex:1 }}>
        <div style={{ position:'absolute', top:'15%', left:'15%', width:450, height:450, background:'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'10%', width:350, height:350, background:'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />

        <div style={{ marginBottom:20, animation:'coachBounce 2.5s ease-in-out infinite' }}>
          <CoachCat size={170} />
        </div>

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:99, padding:'8px 22px', marginBottom:24, fontSize:13, fontWeight:600, color:'#fbbf24', letterSpacing:'0.05em' }}>
          💛 Một lời nhắc dịu dàng dành cho {link.name}
        </div>

        <h1 style={{
          fontFamily:'Syne, sans-serif', fontSize:'clamp(48px,10vw,96px)', fontWeight:800, lineHeight:0.95, letterSpacing:'-0.03em',
          background:'linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #ef4444 80%, #fbbf24 100%)', backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          animation:'shimmer 4s linear infinite', marginBottom:16,
        }}>
          Từng bước<br/>một thôi.
        </h1>

        <p style={{ fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:48, maxWidth:500, lineHeight:1.7 }}>
          Bạn không cần phải hoàn hảo hay làm tất cả ngay hôm nay. Chọn một điều nhỏ vừa sức — vậy là đủ để bắt đầu.
        </p>

        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
          <a href="#quote" onClick={e => { e.preventDefault(); document.getElementById('quote')?.scrollIntoView({ behavior:'smooth' }) }} style={{
            background:'linear-gradient(135deg,#fbbf24,#f97316)', color:'#000', textDecoration:'none',
            borderRadius:99, padding:'14px 32px', fontSize:15, fontWeight:800, cursor:'pointer',
            boxShadow:'0 0 40px rgba(251,191,36,0.4)', transition:'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 0 60px rgba(251,191,36,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 40px rgba(251,191,36,0.4)' }}
          >
            🌱 Chọn một bước nhỏ
          </a>
        </div>
      </section>

      <PersonalNote message={link.message} accent="#fbbf24" label={`Lời nhắn dành cho ${link.name}`} />

      {/* ── GENTLE REMINDERS ── */}
      <section style={{ padding:'76px 0', background:'rgba(251,191,36,0.03)', borderTop:'1px solid rgba(251,191,36,0.08)', borderBottom:'1px solid rgba(251,191,36,0.08)' }}>
        <div style={section}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
              ✨ Nhắc mình những điều quan trọng
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Không phải bảng điểm — chỉ là vài gợi ý để ngày hôm nay nhẹ nhàng hơn.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:14 }}>
            {focusCards.map((card) => (
              <article key={card.title} style={{ background:'rgba(255,255,255,0.045)', border:'1px solid rgba(251,191,36,0.14)', borderRadius:20, padding:'24px 22px' }}>
                <div style={{ fontSize:30, marginBottom:14 }}>{card.icon}</div>
                <h3 style={{ fontSize:16, color:'#fbbf24', margin:'0 0 8px' }}>{card.title}</h3>
                <p style={{ color:'rgba(255,255,255,0.63)', fontSize:14, lineHeight:1.75, margin:0 }}>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTOS ── */}
      {link.images?.length > 0 && (
        <section style={{ padding:'80px 0' }}>
          <div style={section}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
                📸 Gallery của {link.name}
              </h2>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Một góc nhỏ để lưu giữ những khoảnh khắc bạn trân quý.</p>
            </div>
            <Gallery images={link.images} />
          </div>
        </section>
      )}

      {/* ── QUOTE GENERATOR ── */}
      <section id="quote" style={{ padding:'100px 0', background:'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:12 }}>
            💬 Một lời nhắc cho lúc này
          </h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:48 }}>Một vài lời nhắc để đọc chậm lại — không cần phải ổn ngay lập tức.</p>

          <div style={{
            background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)',
            border:`1px solid ${q.color}33`, borderRadius:24, padding:'40px 44px', marginBottom:32,
            boxShadow:`0 0 60px ${q.color}15`, minHeight:140,
            opacity: anim ? 0 : 1, transform: anim ? 'translateY(12px)' : 'translateY(0)',
            transition:'all 0.28s ease', position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-20, right:-20, fontSize:100, opacity:0.06 }}>{q.cat}</div>
            <div style={{ fontSize:52, marginBottom:16 }}>{q.cat}</div>
            <p style={{ fontSize:'clamp(16px,2.2vw,20px)', lineHeight:1.8, color:'rgba(255,255,255,0.88)', fontWeight:500 }}>
              {q.text}
            </p>
          </div>

          {/* Dot nav */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:28 }}>
            {quotes.map((_, i) => (
              <button key={i} type="button" aria-label={`Xem lời nhắc ${i + 1}`} aria-pressed={i === qi} onClick={() => setQi(i)} style={{ width: i===qi ? 20 : 6, height:6, padding:0, border:0, borderRadius:3, background: i===qi ? q.color : 'rgba(255,255,255,0.15)', transition:'all 0.3s', cursor:'pointer' }} />
            ))}
          </div>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={nextQ} style={{
              background:`linear-gradient(135deg, ${q.color}, ${q.color}bb)`, color:'#000',
              border:'none', borderRadius:99, padding:'14px 36px', fontSize:15, fontWeight:800,
              fontFamily:'var(--font-sans)', cursor:'pointer', boxShadow:`0 0 30px ${q.color}44`, transition:'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow=`0 0 50px ${q.color}88` }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 0 30px ${q.color}44` }}
            >
              🎲 Câu khác!
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(q.text) }} style={{
              background:'transparent', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:99, padding:'14px 28px', fontSize:14, fontWeight:600,
              fontFamily:'var(--font-sans)', cursor:'pointer', transition:'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)' }}
            >
              📋 Copy
            </button>
          </div>
        </div>
      </section>

      {/* ── ACTION PLAN ── */}
      <section style={{ padding:'80px 0', background:'rgba(249,115,22,0.03)', borderTop:'1px solid rgba(249,115,22,0.08)' }}>
        <div style={section}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
              📋 Kế hoạch hành động của {link.name}
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Chỉ chọn những bước phù hợp với bạn hôm nay.</p>
          </div>
          <div style={{ marginBottom:22, padding:18, borderRadius:16, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(251,191,36,0.14)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:10, color:'rgba(255,255,255,0.72)', fontSize:13 }}>
              <span>Tiến độ hôm nay</span><strong style={{ color:'#fbbf24' }}>{completedSteps}/{plan.length} · {progress}%</strong>
            </div>
            <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ các bước hôm nay" style={{ height:8, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#fbbf24,#34d399)', transition:'width 0.3s ease' }} />
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {plan.map((step, i) => (
              <button key={i} type="button" aria-pressed={Boolean(planDone[i])} onClick={() => setPlanDone(d => ({ ...d, [i]: !d[i] }))} style={{
                display:'flex', alignItems:'center', gap:18,
                background: planDone[i] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${planDone[i] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:16, padding:'18px 24px', cursor:'pointer', transition:'all 0.25s',
                textAlign:'left', color:'inherit', font:'inherit',
              }}
              onMouseEnter={e => { if (!planDone[i]) { e.currentTarget.style.borderColor='rgba(251,191,36,0.3)'; e.currentTarget.style.background='rgba(255,255,255,0.06)' } }}
              onMouseLeave={e => { if (!planDone[i]) { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.04)' } }}
              >
                <div style={{ width:32, height:32, borderRadius:'50%', background: planDone[i] ? '#10b981' : 'rgba(255,255,255,0.08)', border:`2px solid ${planDone[i] ? '#10b981' : 'rgba(255,255,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15, transition:'all 0.25s' }}>
                  {planDone[i] ? '✓' : i + 1}
                </div>
                <span style={{ fontSize:24 }}>{step.icon}</span>
                <span style={{ fontSize:15, color: planDone[i] ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)', textDecoration: planDone[i] ? 'line-through' : 'none', transition:'all 0.25s' }}>
                  {step.text}
                </span>
              </button>
            ))}
          </div>
          {Object.values(planDone).filter(Boolean).length === plan.length && (
            <div style={{ textAlign:'center', marginTop:40, animation:'popIn 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:28, fontWeight:800, color:'#fbbf24', marginBottom:8 }}>Xong hết rồi! 🎉</h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:15 }}>Bạn đã chăm sóc bản thân bằng những bước nhỏ — như vậy đã rất đáng quý rồi, {link.name}. 🐾</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
        Một lời nhắc dịu dàng dành cho bạn · <a href="/" style={{ color:'rgba(251,191,36,0.5)', textDecoration:'none' }}>dotme</a>
      </div>

      <style>{`
        @keyframes coachBounce { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes floatDeco { 0%{transform:translateY(0) rotate(-10deg)} 100%{transform:translateY(-24px) rotate(10deg)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        `}</style>
    </div>
  )
}

export default function Motivation() {
  const { id } = useParams()
  return (
    <ProtectedPage linkId={id} accent="#f59e0b" bgEmoji="💪" renderPage={link => (
      <GameWrapper linkId={id} linkType="motivation" gameId={link.gameId} accent="#f59e0b" difficulty={link.difficulty || 'medium'}>
        <MotivationContent link={link} />
      </GameWrapper>
    )} />
  )
}
