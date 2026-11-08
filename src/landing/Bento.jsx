import { useRef } from 'react'
import { useLang } from '../LangContext'
import { t } from '../i18n'
import { useLandingData, SKILL_GROUPS, TAGS, STAT_VALUES, SOCIALS, GITHUB_URL } from './data'
import { useRotatingRole, useContactForm, useLandingEffects, ScrollProgress, CertShot, LangSwitch, Bullets } from './shared'
import './bento.css'
import './bento-slides.css'

const SECTIONS = ['about', 'experience', 'skills', 'edu', 'projects', 'contact']
const STATUS_TONE = { 'Live': 'is-sky', 'Research': 'is-peach', 'Open Source': 'is-sky', 'Beta': 'is-peach', 'In Progress': 'is-dim' }
const FX = {
  reveal: [
    ['.bn-mark b', 'left-s'], ['.bn-mark span', 'right-s'],
    ['.bn-hero', 'left'], ['.bn-photo', 'right'], ['.bn-stat', 'pop'],
    ['.bn-abouttitle', 'left'], ['.bn-aboutbio', 'right'], ['.bn-now', 'drop'], ['.bn-stack', 'right'],
    ['#experience .bn-title', 'wipe'], ['.bn-job:nth-child(odd)', 'left'], ['.bn-job:nth-child(even)', 'right'],
    ['#skills .bn-title', 'wipe'], ['.bn-skills', 'flip'],
    ['#edu .bn-title', 'wipe'], ['.bn-edu', 'left'], ['.bn-pubs', 'right'], ['.bn-cert', 'drop'],
    ['#projects .bn-title', 'wipe'], ['.bn-project', 'tilt'],
    ['.bn-contact', 'left'], ['.bn-form', 'right'],
  ],
  count: ['.bn-stat b'],
  drift: [['.bn-title', 120]],
}

/** The small "02 / 07 — About" bar at the top of every section after the hero. */
const Mark = ({ n, label }) => (
  <div className="bn-mark" aria-hidden="true"><b>.me</b><span>{n} / 07 — {label}</span></div>
)

export default function Bento() {
  const { lang, setLang } = useLang()
  const tr = t[lang]
  const data = useLandingData(lang)
  const role = useRotatingRole(tr.hero.roles, lang)
  const contact = useContactForm()
  const nav = tr.nav.links
  const edu = tr.edupub
  const aboutHead = tr.about.heading.split(tr.about.headingAccent)
  const current = data.jobs.find(job => job.current) || data.jobs[0]
  const root = useRef(null)
  useLandingEffects(root, { ...FX, spy: { links: '.bn-nav nav a', ids: SECTIONS } })

  return (
    <div className="bn" id="top" ref={root}>
      <ScrollProgress />
      <div className="bn-page">
        <section className="bn-sec bn-screen">
          <header className="bn-nav">
            <a className="bn-logo" href="#top">.me</a>
            <nav aria-label="Sections">{nav.map((label, i) => <a key={label} href={`#${SECTIONS[i]}`}>{label}</a>)}</nav>
            <LangSwitch lang={lang} setLang={setLang} className="bn-lang" />
            <a className="bn-btn" href="#contact">{tr.nav.hire}</a>
          </header>

          <div className="bn-grid bn-grid--hero">
            <div className="bn-tile s7 bn-hero">
              <span className="bn-chip is-peach">{tr.hero.available}</span>
              <div className="bn-hero__main">
                <h1>Kevin<br />Phan</h1>
                <p className="bn-role" aria-label={tr.hero.roles.join(', ')}>{role}<i aria-hidden="true" /></p>
                <p className="bn-lead">{tr.hero.desc}</p>
              </div>
              <div className="bn-actions">
                <a className="bn-btn" href="#projects">{tr.hero.viewWork}</a>
                <a className="bn-btn is-ghost" href="#contact">{tr.hero.talk}</a>
              </div>
            </div>
            <div className="bn-tile s5 bn-photo">
              <img src="/avatar.webp" width="1024" height="1024" alt="Kevin Phan" fetchpriority="high" />
              {current?.location && <span className="bn-tag">{current.location}</span>}
            </div>
            {STAT_VALUES.map((value, i) => (
              <div key={i} className="bn-tile s3 bn-stat">
                <b className={i % 2 ? 'is-peach' : 'is-sky'}>{value}</b>
                <span>{tr.about.stats[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="bn-sec">
          <Mark n="02" label={nav[0]} />
          <div className="bn-grid bn-grid--about1">
            <div className="bn-tile s7 bn-abouttitle">
              <h2 className="bn-title">{aboutHead[0]}{aboutHead.length > 1 && <span>{tr.about.headingAccent}</span>}{aboutHead[1]}</h2>
            </div>
            <div className="bn-tile s5 bn-aboutbio">{tr.about.bio.map((text, i) => <p key={i}>{text}</p>)}</div>
          </div>
          <div className="bn-grid bn-grid--about2">
            {current && (
              <div className="bn-tile s5 bn-now">
                <p className="bn-label is-sky">{tr.experience.current}</p>
                <h3>{current.role} · {current.company}</h3>
                <p className="bn-mono">{current.period}{current.location ? `, ${current.location}` : ''}</p>
              </div>
            )}
            <div className="bn-tile s7 bn-stack">
              <p className="bn-label is-peach">Stack</p>
              <ul>{TAGS.map(tag => <li key={tag}>{tag}</li>)}</ul>
            </div>
          </div>
        </section>

        <section id="experience" className="bn-sec">
          <Mark n="03" label={nav[1]} />
          <h2 className="bn-title">{nav[1]}</h2>
          <div className="bn-jobs" style={{ '--cols': Math.min(Math.max(data.jobs.length, 1), 3) }}>
            {data.jobs.map((job, i) => (
              <article key={job.id || i} className={`bn-tile bn-job ${job.current ? 'is-current' : ''}`}>
                <div className="bn-job__when"><span>{job.period}</span><span>{job.location}</span></div>
                <div className="bn-job__body">
                  <h3>{job.company}</h3>
                  <p className="bn-job__role">{job.role}</p>
                  <Bullets items={job.bullets} className="bn-job__list" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="bn-sec">
          <Mark n="04" label={nav[2]} />
          <h2 className="bn-title">{nav[2]}</h2>
          <div className="bn-grid bn-grid--skills">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={gi} className="bn-tile s4 bn-skills">
                <h3>{group.name[lang]}</h3>
                <div className="bn-skilllist">
                  {group.skills.map(skill => (
                    <div key={skill.name} className="bn-skill">
                      <p><span>{skill.name}</span><b>{skill.level}%</b></p>
                      <div className="bn-pips" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--k': i }} className={i < Math.round(skill.level / 10) ? 'is-on' : ''} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="edu" className="bn-sec">
          <Mark n="05" label={nav[3]} />
          <h2 className="bn-title">{edu.sectionLabel.replace(/^\d+\.\s*/, '')}</h2>
          <div className="bn-grid bn-grid--edu">
            <div className="bn-tile s5 bn-edu">
              <p className="bn-label is-sky">{edu.eduHeading}</p>
              <div>
                <h3>{edu.uniName}</h3>
                <p className="bn-edu__major">{edu.major}</p>
                <p className="bn-mono">{edu.eduYear}</p>
              </div>
              <div className="bn-reads">
                <div><b className="is-sky">3.69</b><span>GPA / 4.0</span></div>
                <div><b className="is-peach">9.5</b><span>{edu.thesisGrade} / 10</span></div>
              </div>
              <p className="bn-note"><strong>{edu.thesisLabel}:</strong> {edu.thesis}</p>
            </div>
            <div className="bn-tile s7 bn-pubs">
              {data.pubs.map((pub, i) => (
                <article key={pub.id || i}>
                  <p className="bn-pubs__head"><span className="bn-label is-peach">{edu.pubHeading}</span><span className="bn-chip is-sky">{edu.accepted}, {pub.year}</span></p>
                  <h3>{pub.title}</h3>
                  <p className="bn-pubs__authors">{(pub.authors || []).map((a, k) => <span key={k}>{a.highlight ? <strong>{a.name}</strong> : a.name}{k < pub.authors.length - 1 ? ', ' : ''}</span>)}</p>
                  {pub.link ? <a href={pub.link} target="_blank" rel="noreferrer">{pub.conference}</a> : <p>{pub.conference}</p>}
                </article>
              ))}
            </div>
            {data.certs.map((cert, i) => (
              <div key={i} className="bn-tile s3 bn-cert">
                <div className="bn-cert__text">
                  <p className="bn-label">{edu.certHeading}</p>
                  <h3>{cert.name}</h3>
                  <p>{cert.issuer}{cert.file?.url && <> <a href={cert.file.url} target="_blank" rel="noreferrer">PDF</a></>}</p>
                </div>
                <CertShot cert={cert} className="bn-cert__shot" />
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="bn-sec">
          <Mark n="06" label={nav[4]} />
          <div className="bn-head">
            <h2 className="bn-title">{nav[4]}</h2>
            <a className="bn-btn is-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">{tr.projects.viewAll}</a>
          </div>
          <div className="bn-projects">
            {data.projects.map((project, i) => (
              <article key={project.id ?? i} className={`bn-tile bn-project ${i === 0 ? 'is-lead' : ''}`}>
                <p className="bn-project__top"><span className={`bn-chip ${STATUS_TONE[project.status] || 'is-dim'}`}>{tr.projects.statusMap[project.status] || project.status}</span><b>{project.year}</b></p>
                <div><h3>{project.title}</h3><p className="bn-project__sub">{project.subtitle[lang]}</p></div>
                <p className="bn-project__desc">{project.description[lang]}</p>
                <p className="bn-mono">{project.tags.join(', ')}</p>
                <p className="bn-project__links">
                  {project.links.github && <a href={project.links.github} target="_blank" rel="noreferrer">{tr.projects.code}</a>}
                  {project.links.live && <a href={project.links.live} target="_blank" rel="noreferrer">{tr.projects.live}</a>}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="bn-sec">
          <Mark n="07" label={nav[5]} />
          <div className="bn-grid bn-grid--contact">
            <div className="bn-tile s7 bn-contact">
              <h2 className="bn-title bn-title--contact">{tr.contact.heading}</h2>
              <div className="bn-contact__info">
                <p>{tr.contact.sub}</p>
                {SOCIALS.filter(s => s.name === 'Email').map(s => <a key={s.name} href={s.url} className="bn-contact__mail">{s.handle}</a>)}
                <div className="bn-contact__links">
                  {SOCIALS.filter(s => s.name !== 'Email').map(s => (
                    <a key={s.name} href={s.url} className="bn-contact__link" {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{`${s.name} ${s.handle}`}</a>
                  ))}
                </div>
              </div>
            </div>
            <form className="bn-tile s5 bn-form" onSubmit={contact.submit}>
              <h3>{tr.contact.formTitle}</h3>
              <label htmlFor="bn-name">{tr.contact.name}</label>
              <input id="bn-name" type="text" required placeholder={tr.contact.namePh} value={contact.form.name} onChange={contact.setField('name')} />
              <label htmlFor="bn-email">{tr.contact.email}</label>
              <input id="bn-email" type="email" required placeholder={tr.contact.emailPh} value={contact.form.email} onChange={contact.setField('email')} />
              <label htmlFor="bn-msg">{tr.contact.message}</label>
              <textarea id="bn-msg" rows={4} required placeholder={tr.contact.msgPh} value={contact.form.message} onChange={contact.setField('message')} />
              <button type="submit" disabled={contact.sending || contact.sent}>{contact.sending ? tr.contact.sending : contact.sent ? tr.contact.sent : tr.contact.send}</button>
            </form>
          </div>
          <footer className="bn-foot"><span>© 2026 Kevin Phan. {tr.footer.credit}</span><a href="#top">{tr.footer.backTop}</a></footer>
        </section>
      </div>
    </div>
  )
}
