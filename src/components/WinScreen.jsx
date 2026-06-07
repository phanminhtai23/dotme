export default function WinScreen({ winTime, remaining, accent = '#8B5CF6' }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(0,0,0,0.92)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:'Inter, sans-serif',
    }}>
      {/* Confetti */}
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{
          position:'absolute',
          top: '-10px',
          left: `${Math.random() * 100}%`,
          width: 8 + Math.random() * 6,
          height: 8 + Math.random() * 6,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          background: ['#ff6b9d','#c44dff','#ffd700','#22d3ee','#10b981'][Math.floor(Math.random() * 5)],
          animation: `winConfetti ${2 + Math.random() * 2}s ease-in forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
        }} />
      ))}

      <div style={{
        background:'linear-gradient(135deg, rgba(20,10,40,0.98), rgba(10,5,20,0.98))',
        border:`1px solid ${accent}44`,
        borderRadius:28, padding:'48px 40px', maxWidth:480, width:'100%',
        textAlign:'center', position:'relative', overflow:'hidden',
        boxShadow:`0 0 100px ${accent}33`,
      }}>
        {/* Glow top */}
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:200, height:200, background:`radial-gradient(circle, ${accent}30, transparent 70%)`, pointerEvents:'none' }} />

        {/* Trophy */}
        <div style={{ fontSize:72, marginBottom:16, animation:'trophyBounce 1s cubic-bezier(0.16,1,0.3,1)' }}>
          🏆
        </div>

        <h2 style={{
          fontFamily:'Syne, sans-serif', fontSize:'clamp(28px,6vw,44px)', fontWeight:800,
          background:`linear-gradient(135deg, ${accent}, #ffd700)`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          marginBottom:8, lineHeight:1.1,
        }}>
          Chúc mừng!<br/>Bạn đã thắng! 🎉
        </h2>

        {/* Win timestamp */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:99, padding:'8px 20px', margin:'16px 0 24px',
          fontSize:14, color:'rgba(255,255,255,0.7)',
        }}>
          <span>📅</span>
          <span style={{ fontFamily:'monospace', fontWeight:600 }}>{winTime}</span>
        </div>

        {/* Instructions */}
        <div style={{
          background:`${accent}10`, border:`1px solid ${accent}30`,
          borderRadius:16, padding:'20px 24px', marginBottom:28,
        }}>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.85)', lineHeight:1.7, marginBottom:12 }}>
            📸 <strong>Chụp màn hình này lại</strong> và liên hệ <strong style={{ color:'#ffd700' }}>Minh Tài</strong> để nhận quà nhé!
          </p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>
            Màn hình win có ghi ngày giờ — đây là bằng chứng chiến thắng của bạn 🌟
          </p>
        </div>

        {remaining > 0 && (
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
            Link này còn {remaining} lượt chơi
          </p>
        )}
      </div>

      <style>{`
        @keyframes trophyBounce { 0%{transform:scale(0) rotate(-20deg)} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes winConfetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(110vh) rotate(720deg); opacity:0} }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
      `}</style>
    </div>
  )
}
