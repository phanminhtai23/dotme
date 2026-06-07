import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ProtectedPage from '../components/ProtectedPage'
import GameWrapper from '../components/GameWrapper'

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
  { text:`Ê ${n} ơi! Con mèo nhà tao ngủ 16 tiếng/ngày mà vẫn đầy năng lượng. Mày thì mày làm gì với 24 tiếng còn lại? 🐱`, cat:'😎', color:'#f59e0b' },
  { text:`${n} ơi, thất bại là mẹ thành công. Mày đã thất bại nhiều chưa? Thất bại nhiều vào — rồi có nhiều mẹ hơn! 💪`, cat:'😹', color:'#8b5cf6' },
  { text:`Nghe đây ${n}! Einstein từng nói: "Sự điên rồ là làm đi làm lại một việc nhưng mong đợi kết quả khác". Thôi thì thôi làm lại đi! 🧠`, cat:'🤓', color:'#06b6d4' },
  { text:`${n}, hôm nay trời đẹp. Hoặc mưa. Dù thế nào mày vẫn phải thức dậy thôi. Con mèo tao còn dậy mà! 😤`, cat:'😾', color:'#10b981' },
  { text:`Bí quyết thành công: 1% cảm hứng + 99% vẫn ngồi cố dù không có cảm hứng. Áp dụng đi ${n}! 🔥`, cat:'😸', color:'#ec4899' },
  { text:`${n} ơi, mày biết con mèo không? Nó rơi từ đâu cũng đứng dậy được. Mày rớt môn thì đứng dậy học tiếp! 🐾`, cat:'😼', color:'#f59e0b' },
  { text:`Hỡi ${n}! Nếu Plan A fail thì còn 25 chữ cái nữa. Mà thật ra tao nghĩ mày nên thử Plan B đi vì A mày đã fail rồi 🤭`, cat:'😻', color:'#8b5cf6' },
  { text:`${n}, uống nước đi. Đây là lời khuyên khoa học. Thật ra tao là mèo, tao không biết khoa học nhưng nghe có vẻ đúng! 💧`, cat:'😺', color:'#06b6d4' },
  { text:`Giữa mày và thành công là gì, ${n}? Cái ghế mày đang ngồi. Đứng dậy đi làm việc! Hoặc... đặt laptop xuống sàn cho lạ. 💻`, cat:'🙀', color:'#10b981' },
  { text:`${n} ơi, tao tin mày làm được! Lý do: tao là mèo, tao không có lý do gì để nói dối. (Trừ khi có cá!) 😇`, cat:'🐱', color:'#ec4899' },
]

// ── Fake Stats ───────────────────────────────────────────────────────────────
const makeStats = (n) => [
  { label:'Tiềm năng của ' + n, val:9001, max:9001, color:'#f59e0b', unit:'%', note:'Off the charts!' },
  { label:'Độ game thủ', val:98, max:100, color:'#8b5cf6', unit:'%', note:'Cần 2% nữa là pro' },
  { label:'Khả năng ăn cơm', val:100, max:100, color:'#10b981', unit:'%', note:'Siêu đẳng' },
  { label:'Sự lười biếng hôm nay', val:12, max:100, color:'#ec4899', unit:'%', note:'Thấp kỷ lục!' },
]

function StatBar({ stat, delay }) {
  const [w, setW] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(Math.min((stat.val / stat.max) * 100, 100)), delay); obs.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:8 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{stat.label}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{stat.note}</div>
        </div>
        <span style={{ fontSize:18, fontWeight:800, color:stat.color }}>{stat.val.toLocaleString()}{stat.unit}</span>
      </div>
      <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${w}%`, background:`linear-gradient(90deg, ${stat.color}88, ${stat.color})`, borderRadius:4, transition:'width 1.2s cubic-bezier(0.16,1,0.3,1)', boxShadow:`0 0 12px ${stat.color}88` }} />
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
function MotivationContent({ link }) {
  const quotes = makeQuotes(link.name)
  const stats  = makeStats(link.name)
  const [qi, setQi] = useState(() => Math.floor(Math.random() * quotes.length))
  const [anim, setAnim] = useState(false)
  const [planDone, setPlanDone] = useState({})

  const nextQ = () => { setAnim(true); setTimeout(() => { setQi(i => (i + 1) % quotes.length); setAnim(false) }, 280) }
  const q = quotes[qi]

  const section = { maxWidth:880, margin:'0 auto', padding:'0 24px' }

  const plan = [
    { icon:'☀️', text:`Dậy sớm và nhớ mặt trời vẫn mọc kể cả khi ${link.name} chưa ready` },
    { icon:'🧴', text:'Rửa mặt. Nghiêm túc đó. Rửa mặt đi.' },
    { icon:'☕', text:'Pha cà phê / trà / nước mắm — cái gì cho tỉnh thì uống' },
    { icon:'📱', text:'Tắt app mạng xã hội trong... 5 phút thôi, thực tế thôi' },
    { icon:'🎯', text:`Làm 1 việc nhỏ có ích. 1 thôi. ${link.name} làm được!` },
    { icon:'🐱', text:'Cưng mèo (hoặc nhìn ảnh mèo) để lấy thêm năng lượng' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 20% 10%, #1a0f00 0%, #0a0f1e 50%, #0f0a00 100%)', fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", color:'#f0f0ff', overflowX:'hidden' }}>
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
          💪 Chuyên gia tạo động lực — Cat Edition
        </div>

        <h1 style={{
          fontFamily:'Syne, sans-serif', fontSize:'clamp(48px,10vw,96px)', fontWeight:800, lineHeight:0.95, letterSpacing:'-0.03em',
          background:'linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #ef4444 80%, #fbbf24 100%)', backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          animation:'shimmer 4s linear infinite', marginBottom:16,
        }}>
          Dậy lên!<br/>{link.name}!
        </h1>

        <p style={{ fontSize:18, color:'rgba(255,255,255,0.6)', marginBottom:48, maxWidth:500, lineHeight:1.7 }}>
          Hôm nay là ngày mới. Một trang giấy trắng. Và tao — con mèo này — sẽ làm mày phải nghiêm túc. 😤
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
            ⚡ Nhận động lực ngay
          </a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:'80px 0', background:'rgba(251,191,36,0.03)', borderTop:'1px solid rgba(251,191,36,0.08)', borderBottom:'1px solid rgba(251,191,36,0.08)' }}>
        <div style={section}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:10 }}>
              📊 Chỉ số của {link.name} hôm nay
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Dữ liệu 100% chính xác. (Tao là mèo, tao không biết làm số liệu giả.)</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:24, padding:'36px 40px' }}>
            {stats.map((s, i) => <StatBar key={i} stat={s} delay={i * 150} />)}
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
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Những khoảnh khắc để nhớ — và để tiếp tục cố gắng!</p>
            </div>
            <Gallery images={link.images} />
          </div>
        </section>
      )}

      {/* ── QUOTE GENERATOR ── */}
      <section id="quote" style={{ padding:'100px 0', background:'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)' }}>
        <div style={{ ...section, textAlign:'center' }}>
          <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'clamp(24px,4vw,44px)', fontWeight:800, marginBottom:12 }}>
            💬 Lời khuyên từ Life Coach Mèo
          </h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:48 }}>Mỗi lần nhấn là một câu mới. Nhấn cho đến khi bạn ổn.</p>

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
              <div key={i} onClick={() => setQi(i)} style={{ width: i===qi ? 20 : 6, height:6, borderRadius:3, background: i===qi ? q.color : 'rgba(255,255,255,0.15)', transition:'all 0.3s', cursor:'pointer' }} />
            ))}
          </div>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={nextQ} style={{
              background:`linear-gradient(135deg, ${q.color}, ${q.color}bb)`, color:'#000',
              border:'none', borderRadius:99, padding:'14px 36px', fontSize:15, fontWeight:800,
              fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", cursor:'pointer', boxShadow:`0 0 30px ${q.color}44`, transition:'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow=`0 0 50px ${q.color}88` }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 0 30px ${q.color}44` }}
            >
              🎲 Câu khác!
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(q.text) }} style={{
              background:'transparent', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:99, padding:'14px 28px', fontSize:14, fontWeight:600,
              fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", cursor:'pointer', transition:'all 0.2s',
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
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14 }}>Tick từng bước đi. Tao tin mày làm được!</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {plan.map((step, i) => (
              <div key={i} onClick={() => setPlanDone(d => ({ ...d, [i]: !d[i] }))} style={{
                display:'flex', alignItems:'center', gap:18,
                background: planDone[i] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${planDone[i] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:16, padding:'18px 24px', cursor:'pointer', transition:'all 0.25s',
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
              </div>
            ))}
          </div>
          {Object.values(planDone).filter(Boolean).length === plan.length && (
            <div style={{ textAlign:'center', marginTop:40, animation:'popIn 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
              <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:28, fontWeight:800, color:'#fbbf24', marginBottom:8 }}>Xong hết rồi! 🎉</h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:15 }}>Tao tự hào về mày lắm, {link.name}! 🐾</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign:'center', padding:'32px 24px', borderTop:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
        Được trao với tình cảm và một chút xỉa 😹 · <a href="/" style={{ color:'rgba(251,191,36,0.5)', textDecoration:'none' }}>dotme</a>
      </div>

      <style>{`
        @keyframes coachBounce { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes floatDeco { 0%{transform:translateY(0) rotate(-10deg)} 100%{transform:translateY(-24px) rotate(10deg)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}

export default function Motivation() {
  const { id } = useParams()
  return (
    <ProtectedPage linkId={id} accent="#f59e0b" bgEmoji="💪" renderPage={link => (
      <GameWrapper linkId={id} linkType="motivation" accent="#f59e0b" difficulty={link.difficulty || 'medium'}>
        <MotivationContent link={link} />
      </GameWrapper>
    )} />
  )
}
