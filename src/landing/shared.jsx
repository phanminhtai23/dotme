import { useEffect, useLayoutEffect, useState } from 'react'
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

/** Certificate picture that opens a full-size overlay. */
export function CertShot({ cert, className }) {
  const [open, setOpen] = useState(false)
  if (!cert.image?.url) return null
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-label={cert.name}>
        <img src={certificateThumbnailUrl(cert.image.url)} alt="" loading="lazy" decoding="async" />
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={cert.name} onClick={() => setOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out' }}>
          <img src={cert.image.url} alt={cert.name} style={{ maxWidth:'92vw', maxHeight:'92vh', objectFit:'contain', borderRadius:12 }} />
        </div>
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

export function ScrollProgress() {
  return <div className="fx-progress" aria-hidden="true" />
}
