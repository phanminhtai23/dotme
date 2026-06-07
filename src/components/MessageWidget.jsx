import { useState, useEffect } from 'react'
import { api } from '../api'
import { useLang } from '../LangContext'

const STEP = { idle: 'idle', name: 'name', message: 'message', done: 'done' }

const tr = {
  vi: {
    tooltip: 'Bạn muốn nhắn gì đến tôi không? 💌',
    title: 'Nhắn cho Kevin',
    subtitle: 'Thường trả lời trong 24h',
    askName: 'Kevin hay gọi bạn là gì? 🐾',
    namePh: 'Tên của bạn...',
    next: 'Tiếp theo →',
    greeting: (name) => <>Xin chào <strong style={{ color: '#a78bfa' }}>{name}</strong>! 👋<br/>Bạn muốn nhắn gì đến tôi?</>,
    msgPh: 'Nhắn bất cứ điều gì bạn muốn nói...',
    sending: '⏳ Đang gửi...',
    send: '📤 Gửi tin nhắn',
    doneTitle: 'Gửi rồi! 🎉',
    doneMsg: (name) => <>Cảm ơn <strong style={{ color: '#a78bfa' }}>{name}</strong>!<br/>Tôi sẽ đọc và trả lời sớm nhé! 🐾</>,
    error: 'Có lỗi xảy ra, bạn thử lại nhé! 🙏',
    btnTitle: 'Nhắn tin cho Kevin',
  },
  en: {
    tooltip: 'Want to send me a message? 💌',
    title: 'Message Kevin',
    subtitle: 'Usually replies within 24h',
    askName: 'What should I call you? 🐾',
    namePh: 'Your name...',
    next: 'Next →',
    greeting: (name) => <>Hi <strong style={{ color: '#a78bfa' }}>{name}</strong>! 👋<br/>What would you like to say?</>,
    msgPh: 'Say anything you want...',
    sending: '⏳ Sending...',
    send: '📤 Send message',
    doneTitle: 'Sent! 🎉',
    doneMsg: (name) => <>Thanks <strong style={{ color: '#a78bfa' }}>{name}</strong>!<br/>I'll read it and reply soon! 🐾</>,
    error: 'Something went wrong, please try again! 🙏',
    btnTitle: 'Message Kevin',
  },
}

export default function MessageWidget() {
  const { lang } = useLang()
  const tx = tr[lang]

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(STEP.idle)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 8000)
    return () => clearTimeout(t)
  }, [])

  const openWidget = () => { setOpen(true); setStep(STEP.name); setPulse(false); setError('') }
  const closeWidget = () => {
    setOpen(false)
    setTimeout(() => { setStep(STEP.idle); setName(''); setMessage(''); setError('') }, 300)
  }

  const handleNameSubmit = (e) => { e.preventDefault(); if (!name.trim()) return; setStep(STEP.message) }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true); setError('')
    try {
      await api.sendMessage(name.trim(), message.trim())
      setStep(STEP.done)
      setTimeout(closeWidget, 3000)
    } catch {
      try {
        const msgs = JSON.parse(localStorage.getItem('dotme_messages') || '[]')
        msgs.push({ name: name.trim(), message: message.trim(), ip: 'unknown', createdAt: new Date().toISOString() })
        localStorage.setItem('dotme_messages', JSON.stringify(msgs))
        setStep(STEP.done)
        setTimeout(closeWidget, 3000)
      } catch { setError(tx.error) }
    }
    setSending(false)
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '12px 16px', color: '#f0f0ff',
    fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'all 0.2s',
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={open ? closeWidget : openWidget}
        title={tx.btnTitle}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 500,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #ec4899)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: '0 8px 32px rgba(139,92,246,0.5)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          transform: open ? 'scale(0.9) rotate(45deg)' : 'scale(1)',
          animation: pulse && !open ? 'widgetPulse 2s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 12px 48px rgba(139,92,246,0.7)' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(139,92,246,0.5)' } }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Tooltip */}
      {!open && pulse && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 499,
          background: 'rgba(20,20,35,0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12,
          padding: '10px 16px', fontSize: 13, color: '#f0f0ff', fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap', animation: 'tooltipFadeIn 0.4s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {tx.tooltip}
          <div style={{
            position: 'absolute', bottom: -6, right: 20,
            width: 12, height: 12, background: 'rgba(20,20,35,0.95)',
            border: '1px solid rgba(139,92,246,0.3)', borderRight: 'none', borderTop: 'none',
            transform: 'rotate(-45deg)',
          }} />
        </div>
      )}

      {/* Chat panel */}
      <div style={{
        position: 'fixed', bottom: 96, right: 28, zIndex: 498,
        width: 360, maxWidth: 'calc(100vw - 56px)',
        background: 'rgba(13,13,26,0.97)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        fontFamily: 'Inter, sans-serif', overflow: 'hidden',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
        }}>
          <span style={{ fontSize: 32 }}>😸</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f0f0ff' }}>{tx.title}</div>
            <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{tx.subtitle}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {step === STEP.name && (
            <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{tx.askName}</p>
              </div>
              <input
                type="text" placeholder={tx.namePh} autoFocus
                value={name} onChange={e => setName(e.target.value)}
                required maxLength={50} style={inputStyle}
                onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.12)' }}
                onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none' }}
              />
              <button type="submit" style={{
                background: 'linear-gradient(135deg,#8B5CF6,#ec4899)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(139,92,246,0.35)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >{tx.next}</button>
            </form>
          )}

          {step === STEP.message && (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>{tx.greeting(name)}</p>
                <textarea
                  placeholder={tx.msgPh} value={message}
                  onChange={e => setMessage(e.target.value)}
                  required maxLength={2000} rows={4} autoFocus
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                  onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.12)' }}
                  onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none' }}
                />
                <div style={{ fontSize: 11, color: '#555577', marginTop: 4, textAlign: 'right' }}>{message.length}/2000</div>
              </div>
              {error && <div style={{ fontSize: 13, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px' }}>⚠️ {error}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setStep(STEP.name)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '11px', fontSize: 13, color: '#8888aa',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer', flexShrink: 0,
                }}>←</button>
                <button type="submit" disabled={sending} style={{
                  flex: 1, background: 'linear-gradient(135deg,#8B5CF6,#ec4899)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '12px', fontSize: 14, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif', cursor: sending ? 'default' : 'pointer',
                  boxShadow: '0 0 20px rgba(139,92,246,0.35)', transition: 'all 0.2s', opacity: sending ? 0.8 : 1,
                }}>{sending ? tx.sending : tx.send}</button>
              </div>
            </form>
          )}

          {step === STEP.done && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12, animation: 'catHappy 0.5s ease' }}>😸</div>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#f0f0ff' }}>{tx.doneTitle}</h3>
              <p style={{ fontSize: 14, color: '#8888aa', lineHeight: 1.6 }}>{tx.doneMsg(name)}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes widgetPulse {
          0%,100% { box-shadow: 0 8px 32px rgba(139,92,246,0.5) }
          50% { box-shadow: 0 8px 48px rgba(139,92,246,0.9), 0 0 0 12px rgba(139,92,246,0.1) }
        }
        @keyframes tooltipFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes catHappy { 0%{transform:scale(0.3) rotate(-20deg)} 60%{transform:scale(1.2) rotate(10deg)} 100%{transform:scale(1) rotate(0deg)} }
      `}</style>
    </>
  )
}
