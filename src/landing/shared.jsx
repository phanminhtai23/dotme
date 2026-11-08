import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../api'
import { certificateThumbnailUrl } from './data'
import './fx.css'

// Motion is always on for visitors. `?motion=off` turns it off (for people who need a still page, and for testing).
const motionOff = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('motion') === 'off'

/** Typewriter over a list of roles; reduced motion shows the whole list at once. */
export function useRotatingRole(roles, resetKey) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(true)
  const still = motionOff()

  useEffect(() => { setIdx(0); setText(''); setTyping(true) }, [resetKey])

  useEffect(() => {
    if (still) return undefined
    const role = roles[idx] || ''
    let i = typing ? 0 : role.length
    let timer
    const step = () => {
      if (typing) {
        if (i <= role.length) { setText(role.slice(0, i)); i += 1; timer = setTimeout(step, 60) }
        else timer = setTimeout(() => setTyping(false), 2000)
      } else if (i >= 0) {
        setText(role.slice(0, i)); i -= 1; timer = setTimeout(step, 35)
      } else {
        setIdx(prev => (prev + 1) % roles.length); setTyping(true)
      }
    }
    timer = setTimeout(step, typing ? 400 : 300)
    return () => clearTimeout(timer)
  }, [idx, typing, roles, still])

  return still ? roles.join(', ') : text
}

/** Same behaviour as the classic contact form: only name and message are sent. */
export function useContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const setField = key => event => setForm(prev => ({ ...prev, [key]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setSending(true)
    try { await api.sendMessage(form.name, form.message) } catch { /* the classic form also ignores send errors */ }
    setSending(false)
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }
  return { form, setField, submit, sending, sent }
}

/** Certificate picture that opens a full-size overlay. The overlay is rendered on <body>: inside a card it would be positioned and clipped
 *  by the card's reveal animation (transform / clip-path make a fixed element relative to that card). */
export function CertShot({ cert, className }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (!cert.image?.url) return null
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-label={cert.name} style={{ WebkitTapHighlightColor: 'transparent' }}>
        <img src={certificateThumbnailUrl(cert.image.url)} alt="" loading="lazy" decoding="async" />
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={cert.name} onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(236,238,248,0.9)', WebkitBackdropFilter:'blur(14px)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out', overscrollBehavior:'contain' }}>
          <button type="button" autoFocus aria-label="Đóng / Close" title="Đóng / Close" onClick={() => setOpen(false)}
            style={{ position:'fixed', top:'max(16px, env(safe-area-inset-top))', right:'max(16px, env(safe-area-inset-right))', width:52, height:52, borderRadius:'50%', border:'2px solid #fff', background:'#0b0d12', color:'#fff', display:'grid', placeItems:'center', cursor:'pointer', padding:0, boxShadow:'0 6px 24px rgba(10,20,90,0.45)', WebkitTapHighlightColor:'transparent' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" /></svg>
          </button>
          <img src={cert.image.url} alt={cert.name} style={{ maxWidth:'92vw', maxHeight:'92dvh', objectFit:'contain', borderRadius:12, boxShadow:'0 20px 60px rgba(10,20,90,0.35)' }} />
        </div>,
        document.body,
      )}
    </>
  )
}

export function LangSwitch({ lang, setLang, className }) {
  return (
    <button type="button" className={className} onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      aria-label={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
      <span aria-current={lang === 'vi'}>VI</span> / <span aria-current={lang === 'en'}>EN</span>
    </button>
  )
}

/** Wraps the admin-managed bullets, which are stored as small HTML snippets. */
export function Bullets({ items, className }) {
  return (
    <ul className={className}>
      {(items || []).map((html, i) => <li key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
    </ul>
  )
}

export const projectLinks = project => ({ code: project.links.github, live: project.links.live })

function runCount(el) {
  const match = /^(\d+)(.*)$/.exec(el.dataset.fxFinal || '')
  if (!match) return
  const target = Number(match[1])
  const suffix = match[2]
  const start = performance.now()
  const tick = now => {
    const t = Math.min(1, (now - start) / 1100)
    el.textContent = `${Math.round(target * (1 - Math.pow(1 - t, 3)))}${suffix}`
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/**
 * Scroll effects for a landing version, all driven from CSS classes so the markup stays plain:
 *  - reveal: elements matching these selectors fade and rise in once, staggered among their siblings
 *  - count: numbers that count up when they come into view
 *  - spy: `links` get aria-current while the section with the matching #id is on screen
 *  - [data-parallax] elements drift with the scroll; `.fx-progress` shows how far down the page you are
 * With prefers-reduced-motion nothing is applied and the page is simply static.
 */
function markReveal(root, reveal) {
  const marked = []
  reveal.forEach(entry => {
    const [selector, variant = 'up'] = Array.isArray(entry) ? entry : [entry]
    root.querySelectorAll(selector).forEach(el => {
      el.setAttribute('data-reveal', variant)
      const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(child => child.matches(selector)) : [el]
      el.style.setProperty('--i', Math.min(siblings.indexOf(el), 6))
      marked.push(el)
    })
  })
  return marked
}

export function useLandingEffects(ref, { reveal = [], count = [], drift = [], spy = null } = {}) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || motionOff()) return undefined
    root.classList.add('fx')
    markReveal(root, reveal) // hidden before the first paint, so the hero can animate in too
    return () => root.classList.remove('fx')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])

  useEffect(() => {
    const root = ref.current
    if (!root || motionOff()) return undefined

    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        el.classList.add('is-in')
        io.unobserve(el)
        if (el.dataset.fxFinal !== undefined) runCount(el)
      }
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })

    // Per run, not per element: React StrictMode runs this effect twice in development.
    const seen = new WeakSet()
    const scan = () => {
      markReveal(root, reveal).forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })
      count.forEach(selector => root.querySelectorAll(selector).forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        const final = el.dataset.fxFinal ?? el.textContent
        if (!/^\d/.test(final)) return
        el.dataset.fxFinal = final
        io.observe(el)
      }))
    }
    scan()
    let pending = false
    const mutations = new MutationObserver(() => {
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; scan() })
    })
    mutations.observe(root, { childList: true, subtree: true })

    let spyObserver = null
    if (spy) {
      const links = Array.from(root.querySelectorAll(spy.links))
      spyObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          links.forEach(a => a.removeAttribute('aria-current'))
          links.find(a => a.getAttribute('href') === `#${entry.target.id}`)?.setAttribute('aria-current', 'true')
        }
      }, { rootMargin: '-35% 0px -60% 0px' })
      spy.ids.forEach(id => { const section = root.querySelector(`#${id}`); if (section) spyObserver.observe(section) })
    }

    const bar = root.querySelector('.fx-progress')
    const drifting = Array.from(root.querySelectorAll('[data-parallax]'))
    // Scroll-linked sideways drift: the element slides as it crosses the screen, centred when mid-screen.
    const sliding = []
    drift.forEach(([selector, factor]) => root.querySelectorAll(selector).forEach(el => sliding.push([el, factor])))
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const y = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
        sliding.forEach(([el, factor]) => {
          const rect = el.getBoundingClientRect()
          if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
          el.style.translate = `${Math.round(-offset * factor)}px 0`
        })
        if (y < window.innerHeight * 1.5) drifting.forEach(el => { el.style.translate = `0 ${Math.round(y * Number(el.dataset.parallax))}px` })
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io.disconnect(); mutations.disconnect(); spyObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  // The selector lists are constants per version, so the effect only needs to run once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}

/** One wheel turn glides to the next (or previous) screen and stops exactly on it. A section taller than the window scrolls normally
 *  until the end is close, then the next turn snaps. Touch, keyboard, the scrollbar and anchor links keep their native behavior,
 *  and so does everything below 901px where sections are stacked rather than screens. */
export function usePageScroll(ref, selector) {
  useEffect(() => {
    const root = ref.current
    if (!root || motionOff()) return undefined
    const wide = window.matchMedia('(min-width: 901px)')
    const DURATION = 850
    const SETTLE = 140
    let busy = false
    let lastWheel = 0
    let animEnd = 0
    let frame = 0

    const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2)
    const glide = to => {
      const from = window.scrollY
      const start = performance.now()
      busy = true
      animEnd = start + DURATION
      cancelAnimationFrame(frame)
      const step = now => {
        const k = Math.min((now - start) / DURATION, 1)
        window.scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' })
        if (k < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const inScrollable = el => {
      for (let node = el instanceof Element ? el : null; node && node !== document.body; node = node.parentElement) {
        if (node.matches?.('textarea, select, [contenteditable="true"]')) return true
        const { overflowY } = getComputedStyle(node)
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1) return true
      }
      return false
    }

    const onWheel = e => {
      if (!wide.matches || e.ctrlKey || e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const now = performance.now()
      const gap = now - lastWheel
      lastWheel = now
      if (busy) {
        if (now > animEnd && gap > SETTLE) busy = false
        else { e.preventDefault(); return }
      }
      if (e.target instanceof Element && e.target.closest('[aria-modal="true"]')) { e.preventDefault(); return }
      if (inScrollable(e.target)) return
      const vh = window.innerHeight
      const y = window.scrollY
      const tops = [...root.querySelectorAll(selector)].map(el => ({ top: Math.round(el.getBoundingClientRect().top + y), h: el.offsetHeight }))
      if (!tops.length) return
      let cur = 0
      tops.forEach((s, i) => { if (s.top <= y + 2) cur = i })
      const { top, h } = tops[cur]
      let target = null
      if (e.deltaY > 0) {
        const below = top + h - (y + vh)
        if (below > vh * 0.35) return
        if (tops[cur + 1]) target = tops[cur + 1].top
      } else if (y > top + 2) {
        if (y - top > vh) return
        target = top
      } else if (tops[cur - 1]) target = tops[cur - 1].top
      if (target === null || Math.abs(target - y) < 2) return
      e.preventDefault()
      glide(target)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => { window.removeEventListener('wheel', onWheel); cancelAnimationFrame(frame) }
  }, [ref, selector])
}

export function ScrollProgress() {
  return <div className="fx-progress" aria-hidden="true" />
}
