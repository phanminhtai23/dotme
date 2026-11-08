import { useRef } from 'react'
import { useLang } from '../LangContext'
import { t } from '../i18n'
import { useLandingData, SKILL_GROUPS, TAGS, STAT_VALUES, SOCIALS, GITHUB_URL } from './data'
import { useRotatingRole, useContactForm, useLandingEffects, usePageScroll, ScrollProgress, CertShot, LangSwitch, Bullets } from './shared'
import { TEAR_FIBRE, TEAR_PAPER } from './tear'
import { STREAKS, PIXELS } from './poster-fx'
import './poster.css'
import './poster-slides.css'

const SECTIONS = ['about', 'experience', 'skills', 'edu', 'projects', 'contact']
const FX = {
  reveal: [
    ['.pz-mark b', 'left-s'], ['.pz-mark span', 'right-s'],
    ['.pz-title--statement', 'wipe-up'], ['.pz-bio p', 'fade'], ['.pz-stats > div', 'pop'],
    ['#experience .pz-title', 'wipe'], ['.pz-job:nth-child(odd)', 'left'], ['.pz-job:nth-child(even)', 'right'], ['.pz-job__list li', 'left-s'],
    ['#skills .pz-title', 'wipe'], ['.pz-skillgroup', 'flip'],
    ['.pz-card.is-ink', 'left'], ['.pz-card.is-blue', 'right'], ['.pz-sub', 'wipe'], ['.pz-cert', 'drop'],
    ['#projects .pz-title', 'wipe'], ['.pz-project', 'tilt'],
    ['.pz-title--huge', 'wipe-up'], ['.pz-contact__info > *', 'fade'], ['.pz-form', 'right'],
  ],
  count: ['.pz-stats dt'],
  drift: [['.pz-title', 140], ['.pz-stats dt', -50], ['.pz-job:nth-child(odd) h3', 60], ['.pz-job:nth-child(even) h3', -60]],
}
// One copy of the tags is narrower than a wide window, so the strip repeats enough times that the right edge never shows a gap while it scrolls.
const COPIES = [0, 1, 2, 3, 4, 5]
// Solid colours only, ordered so no colour sits directly above or below itself in the three-column grid.
const COVERS = ['is-blue', 'is-ink', 'is-lilac', 'is-ink', 'is-lilac', 'is-blue']

/** The small "02 / 07 — About" bar at the top of every section after the hero. */
const Mark = ({ n, label }) => (
  <div className="pz-mark" aria-hidden="true"><b>.ME</b><span>{n} / 07 — {label}</span></div>
)

export default function Poster() {
  const { lang, setLang } = useLang()
  const tr = t[lang]
  const data = useLandingData(lang)
  const role = useRotatingRole(tr.hero.roles, lang)
  const contact = useContactForm()
  const nav = tr.nav.links
  const edu = tr.edupub
  const aboutHead = tr.about.heading.split(tr.about.headingAccent)
  const root = useRef(null)
  useLandingEffects(root, { ...FX, spy: { links: '.pz-nav nav a', ids: SECTIONS } })
  usePageScroll(root, '.pz-hero, .pz-sec')

  return (
    <div className="pz" id="top" ref={root}>
      <ScrollProgress />
      <section className="pz-hero">
        <header className="pz-nav">
          <a className="pz-logo" href="#top">.ME</a>
          <nav aria-label="Sections">{nav.map((label, i) => <a key={label} href={`#${SECTIONS[i]}`}>{label}</a>)}</nav>
          <LangSwitch lang={lang} setLang={setLang} className="pz-lang" />
          <a className="pz-pill" href="#contact">{tr.nav.hire}</a>
        </header>
        <div className="pz-fx" aria-hidden="true">
          <i className="pz-grid" />
          <div className="pz-fx__seam">
            {STREAKS.map((streak, i) => <i key={i} className="pz-streak" style={{ '--y': `${streak.y}%`, '--w': `${streak.w}%`, '--h': `${streak.h}px`, '--d': `${streak.d}s`, '--delay': `${streak.delay}s` }} />)}
            {PIXELS.map((px, i) => <i key={i} className={`pz-px${px.hot ? ' is-hot' : ''}`} style={{ '--x': `${px.x}%`, '--y': `${px.y}%`, '--s': `${px.s}px`, '--d': `${px.d}s`, '--delay': `${px.delay}s` }} />)}
            <svg className="pz-badge" viewBox="0 0 120 120">
              <defs><path id="pz-ring" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" /></defs>
              <text><textPath href="#pz-ring" textLength="280" lengthAdjust="spacing">{`${tr.hero.available} · ${tr.hero.available} · `.toUpperCase()}</textPath></text>
              <path className="pz-badge__arrow" d="M50 50h20v20M50 70l20-20" />
            </svg>
          </div>
        </div>
        <svg className="pz-tear" viewBox="0 0 400 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="pz-rough" x="-15%" y="-3%" width="130%" height="106%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03 0.018" numOctaves="3" seed="4" result="wide" />
              <feDisplacementMap in="SourceGraphic" in2="wide" scale="16" xChannelSelector="R" yChannelSelector="G" result="bent" />
              <feTurbulence type="fractalNoise" baseFrequency="0.4 0.25" numOctaves="2" seed="9" result="fine" />
              <feDisplacementMap in="bent" in2="fine" scale="5" xChannelSelector="G" yChannelSelector="R" />
            </filter>
            <filter id="pz-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 .25  0 0 0 0 .28  0 0 0 0 .45  1.3 0 0 0 -.4" />
            </filter>
            <filter id="pz-soft" x="-30%" y="-5%" width="160%" height="110%"><feGaussianBlur stdDeviation="7" /></filter>
            <linearGradient id="pz-sheen" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#d3d8ee" /><stop offset=".35" stopColor="#eef0f8" /><stop offset=".7" stopColor="#e6e9f4" /><stop offset="1" stopColor="#cfd4ec" />
            </linearGradient>
            <path id="pz-paper" d={TEAR_PAPER} />
            <clipPath id="pz-clip"><use href="#pz-paper" /></clipPath>
            <mask id="pz-outside"><rect x="-100" y="-60" width="600" height="1120" fill="#fff" /><use href="#pz-paper" fill="#000" /></mask>
          </defs>
          <g filter="url(#pz-rough)">
            <path d={TEAR_FIBRE} fill="#c4cbef" />
            <use href="#pz-paper" fill="url(#pz-sheen)" />
            <g clipPath="url(#pz-clip)"><rect x="-100" y="-60" width="600" height="1120" filter="url(#pz-grain)" opacity=".4" /></g>
            <g clipPath="url(#pz-clip)"><g filter="url(#pz-soft)"><rect x="-100" y="-60" width="600" height="1120" fill="#0a1180" opacity=".38" mask="url(#pz-outside)" /></g></g>
          </g>
        </svg>
        <h1 className="pz-name" data-parallax="0.16"><span>Kevin</span><span>Phan</span></h1>
        <img className="pz-portrait" data-parallax="0.08" src="/avatar.webp" width="1024" height="1024" alt="Kevin Phan" fetchpriority="high" />
        <div className="pz-intro">
          <span className="pz-chip">{tr.hero.available}</span>
          <p className="pz-role" aria-label={tr.hero.roles.join(', ')}>{role}<i aria-hidden="true" /></p>
          <p className="pz-desc">{tr.hero.desc}</p>
          <div className="pz-actions">
            <a className="pz-pill is-solid" href="#projects">{tr.hero.viewWork}</a>
            <a className="pz-pill is-line" href="#contact">{tr.hero.talk}</a>
          </div>
        </div>
        <div className="pz-ticker" aria-hidden="true">
          {COPIES.map(copy => <ul key={copy} className="pz-track">{TAGS.map(tag => <li key={tag}>{tag}</li>)}</ul>)}
        </div>
      </section>

      <section id="about" className="pz-sec">
        <Mark n="02" label={nav[0]} />
        <div className="pz-wrap">
          <div className="pz-about">
            <h2 className="pz-title pz-title--statement">{aboutHead[0]}{aboutHead.length > 1 && <span>{tr.about.headingAccent}</span>}{aboutHead[1]}</h2>
            <div className="pz-bio">{tr.about.bio.map((text, i) => <p key={i}>{text}</p>)}</div>
          </div>
          <dl className="pz-stats">
            {STAT_VALUES.map((value, i) => <div key={i}><dt>{value}</dt><dd>{tr.about.stats[i]}</dd></div>)}
          </dl>
        </div>
      </section>

      <section id="experience" className="pz-sec is-ink">
        <Mark n="03" label={nav[1]} />
        <div className="pz-wrap">
          <h2 className="pz-title">{nav[1]}</h2>
          <div className="pz-jobs" style={{ '--cols': Math.min(Math.max(data.jobs.length, 1), 3) }}>
            {data.jobs.map((job, i) => (
              <article key={job.id || i} className="pz-job">
                <p className="pz-job__when">{job.period}<br />{job.location}{job.current && <><br /><b>{tr.experience.current}</b></>}</p>
                <div>
                  <h3>{job.company}</h3>
                  <p className="pz-job__role">{job.role}</p>
                  <Bullets items={job.bullets} className="pz-job__list" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="pz-sec">
        <Mark n="04" label={nav[2]} />
        <div className="pz-wrap">
          <h2 className="pz-title">{nav[2]}</h2>
          <div className="pz-skills">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={gi} className="pz-skillgroup">
                <h3>{group.name[lang]}</h3>
                <div className="pz-skilllist">
                  {group.skills.map(skill => (
                    <div key={skill.name} className="pz-skill">
                      <p><span>{skill.name}</span><b>{skill.level}%</b></p>
                      <div className="pz-bar"><div style={{ '--lv': skill.level / 100 }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="edu" className="pz-sec">
        <Mark n="05" label={nav[3]} />
        <div className="pz-wrap">
          <div className="pz-cards">
            <article className="pz-card is-ink">
              <p className="pz-card__tag">{edu.eduHeading}</p>
              <div>
                <h3>{edu.uniName}</h3>
                <p className="pz-card__major">{edu.major}</p>
                <p className="pz-mono">{edu.eduYear}</p>
              </div>
              <div className="pz-reads">
                <div><b>3.69</b><span>GPA / 4.0</span></div>
                <div><b>9.5</b><span>{edu.thesisGrade} / 10</span></div>
              </div>
              <p className="pz-card__note"><strong>{edu.thesisLabel}:</strong> {edu.thesis}</p>
            </article>
            {data.pubs.map((pub, i) => (
              <article key={pub.id || i} className="pz-card is-blue">
                <p className="pz-card__tag">{edu.pubHeading} <em>{edu.accepted}, {pub.year}</em></p>
                <h3 className="pz-card__pub">{pub.title}</h3>
                <p>{(pub.authors || []).map((a, k) => <span key={k}>{a.highlight ? <strong>{a.name}</strong> : a.name}{k < pub.authors.length - 1 ? ', ' : ''}</span>)}</p>
                {pub.link ? <a href={pub.link} target="_blank" rel="noreferrer">{pub.conference}</a> : <p>{pub.conference}</p>}
              </article>
            ))}
          </div>
          <div className="pz-certblock">
            <h3 className="pz-sub">{edu.certHeading}</h3>
            <div className="pz-certs">
              {data.certs.map((cert, i) => (
                <div key={i} className="pz-cert">
                  <div className="pz-cert__text">
                    <p className="pz-cert__name">{cert.name}</p>
                    <p className="pz-cert__issuer">{cert.issuer}{cert.file?.url && <> <a href={cert.file.url} target="_blank" rel="noreferrer">PDF</a></>}</p>
                  </div>
                  <CertShot cert={cert} className="pz-cert__shot" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="pz-sec is-lilac">
        <Mark n="06" label={nav[4]} />
        <div className="pz-wrap">
          <div className="pz-head">
            <h2 className="pz-title">{nav[4]}</h2>
            <a className="pz-pill is-dark" href={GITHUB_URL} target="_blank" rel="noreferrer">{tr.projects.viewAll}</a>
          </div>
          <div className="pz-projects">
            {data.projects.map((project, i) => (
              <article key={project.id ?? i} className="pz-project">
                <div className={`pz-project__cover ${COVERS[i % COVERS.length]}`}>
                  <p><span>{tr.projects.statusMap[project.status] || project.status}</span><b>{project.year}</b></p>
                  <h3>{project.title}</h3>
                </div>
                <div className="pz-project__body">
                  <p className="pz-project__sub">{project.subtitle[lang]}</p>
                  <p className="pz-project__desc">{project.description[lang]}</p>
                  <p className="pz-mono">{project.tags.join(', ')}</p>
                  <p className="pz-project__links">
                    {project.links.github && <a href={project.links.github} target="_blank" rel="noreferrer">{tr.projects.code}</a>}
                    {project.links.live && <a href={project.links.live} target="_blank" rel="noreferrer">{tr.projects.live}</a>}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="pz-sec is-blue pz-contact">
        <Mark n="07" label={nav[5]} />
        <div className="pz-wrap">
          <div className="pz-contact__row">
            <div className="pz-contact__main">
              <h2 className="pz-title pz-title--huge">{tr.contact.heading}</h2>
              <div className="pz-contact__info">
                <p>{tr.contact.sub}</p>
                {SOCIALS.filter(s => s.name === 'Email').map(s => <a key={s.name} href={s.url} className="pz-contact__mail">{s.handle}</a>)}
                <div className="pz-contact__links">
                  {SOCIALS.filter(s => s.name !== 'Email').map(s => (
                    <a key={s.name} href={s.url} className="pz-contact__link" {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{`${s.name} ${s.handle}`}</a>
                  ))}
                </div>
              </div>
            </div>
            <form className="pz-form" onSubmit={contact.submit}>
              <h3>{tr.contact.formTitle}</h3>
              <label htmlFor="pz-name">{tr.contact.name}</label>
              <input id="pz-name" type="text" required placeholder={tr.contact.namePh} value={contact.form.name} onChange={contact.setField('name')} />
              <label htmlFor="pz-email">{tr.contact.email}</label>
              <input id="pz-email" type="email" required placeholder={tr.contact.emailPh} value={contact.form.email} onChange={contact.setField('email')} />
              <label htmlFor="pz-msg">{tr.contact.message}</label>
              <textarea id="pz-msg" rows={4} required placeholder={tr.contact.msgPh} value={contact.form.message} onChange={contact.setField('message')} />
              <button type="submit" disabled={contact.sending || contact.sent}>{contact.sending ? tr.contact.sending : contact.sent ? tr.contact.sent : tr.contact.send}</button>
            </form>
          </div>
          <footer className="pz-foot"><span>© 2026 Kevin Phan. {tr.footer.credit}</span><a href="#top">{tr.footer.backTop}</a></footer>
        </div>
      </section>
    </div>
  )
}
