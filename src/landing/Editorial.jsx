import { useRef } from 'react'
import { useLang } from '../LangContext'
import { t } from '../i18n'
import { useLandingData, SKILL_GROUPS, STAT_VALUES, SOCIALS, GITHUB_URL } from './data'
import { useRotatingRole, useContactForm, useLandingEffects, ScrollProgress, CertShot, LangSwitch, Bullets } from './shared'
import './editorial.css'

const SECTIONS = ['about', 'experience', 'skills', 'edu', 'projects', 'contact']

const FX = {
  reveal: [
    ['.ed-photo', 'zoom'], ['.ed-who', 'fade'], ['.ed-hero', 'wipe-up'], ['.ed-lede', 'fade'], ['.ed-stats > div', 'drop'], ['.ed-bio p', 'fade'],
    ['#experience .ed-title', 'wipe'], ['.ed-job', 'right-s'], ['.ed-job__list li', 'left-s'],
    ['#skills .ed-title', 'wipe'], ['.ed-skills > div', 'flip'],
    ['#edu .ed-title', 'wipe'], ['.ed-edu__school', 'left'], ['.ed-pub', 'right'], ['.ed-certs', 'fade'],
    ['#projects .ed-title', 'wipe'], ['.ed-project', 'right-s'],
    ['.ed-contact', 'zoom'],
  ],
  count: ['.ed-stats dt'],
  drift: [['.ed-title', 100]],
}
const yearOf = period => (String(period || '').match(/\d{4}/) || [''])[0]

export default function Editorial() {
  const { lang, setLang } = useLang()
  const tr = t[lang]
  const data = useLandingData(lang)
  const role = useRotatingRole(tr.hero.roles, lang)
  const contact = useContactForm()
  const nav = tr.nav.links
  const edu = tr.edupub
  const root = useRef(null)
  useLandingEffects(root, { ...FX, spy: { links: '.ed-menu a', ids: SECTIONS } })

  return (
    <div className="ed" id="top" ref={root}>
      <ScrollProgress />
      <aside className="ed-rail">
        <a className="ed-logo" href="#top">.me</a>
        <div className="ed-photo"><img src="/avatar.webp" width="1024" height="1024" alt="Kevin Phan" fetchpriority="high" /></div>
        <div className="ed-who">
          <p className="ed-who__name">Kevin Phan</p>
          <p className="ed-who__role" aria-label={tr.hero.roles.join(', ')}>{role}<i aria-hidden="true" /></p>
          <span className="ed-chip">{tr.hero.available}</span>
        </div>
        <nav className="ed-menu" aria-label="Sections">{nav.map((label, i) => <a key={label} href={`#${SECTIONS[i]}`}>{label}</a>)}</nav>
        <div className="ed-rail__foot">
          <a className="ed-btn" href="#contact">{tr.nav.hire}</a>
          <LangSwitch lang={lang} setLang={setLang} className="ed-lang" />
        </div>
      </aside>

      <main className="ed-main">
        <section id="about" className="ed-sec ed-intro">
          <h1 className="ed-hero">{tr.about.heading}</h1>
          <div className="ed-lede">
            <p>{tr.hero.desc}</p>
            <div className="ed-actions">
              <a className="ed-btn" href="#projects">{tr.hero.viewWork}</a>
              <a className="ed-btn is-ghost" href="#contact">{tr.hero.talk}</a>
            </div>
          </div>
          <dl className="ed-stats">
            {STAT_VALUES.map((value, i) => <div key={i}><dt>{value}</dt><dd>{tr.about.stats[i]}</dd></div>)}
          </dl>
          <div className="ed-bio">{tr.about.bio.map((text, i) => <p key={i}>{text}</p>)}</div>
        </section>

        <section id="experience" className="ed-sec">
          <h2 className="ed-title">{nav[1]}</h2>
          <div className="ed-rows">
            {data.jobs.map((job, i) => (
              <article key={job.id || i} className="ed-job">
                <div className="ed-job__when"><b>{yearOf(job.period)}</b><p>{job.period}<br />{job.location}{job.current && <><br />{tr.experience.current}</>}</p></div>
                <div className="ed-job__body">
                  <h3>{job.company}</h3>
                  <p className="ed-job__role">{job.role}</p>
                  <Bullets items={job.bullets} className="ed-job__list" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="ed-sec">
          <h2 className="ed-title">{nav[2]}</h2>
          <div className="ed-skills">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={gi}>
                <h3>{group.name[lang]}</h3>
                {group.skills.map(skill => (
                  <p key={skill.name} className="ed-skill"><span>{skill.name}</span><i aria-hidden="true" /><b>{skill.level}</b></p>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="edu" className="ed-sec">
          <h2 className="ed-title">{edu.sectionLabel.replace(/^\d+\.\s*/, '')}</h2>
          <div className="ed-edu">
            <div className="ed-edu__school">
              <h3>{edu.uniName}</h3>
              <p className="ed-edu__major">{edu.major}</p>
              <p className="ed-mono">{edu.eduYear}</p>
              <div className="ed-reads">
                <div><b>3.69</b><span>GPA / 4.0</span></div>
                <div><b>9.5</b><span>{edu.thesisGrade} / 10</span></div>
              </div>
              <p>{edu.thesisLabel}: {edu.thesis}</p>
            </div>
            {data.pubs.map((pub, i) => (
              <div key={pub.id || i} className="ed-pub">
                <p className="ed-pub__head"><span>{edu.pubHeading}</span><span>{edu.accepted}, {pub.year}</span></p>
                <h3>{pub.title}</h3>
                <p>{(pub.authors || []).map((a, k) => <span key={k}>{a.highlight ? <strong>{a.name}</strong> : a.name}{k < pub.authors.length - 1 ? ', ' : ''}</span>)}</p>
                {pub.link ? <a href={pub.link} target="_blank" rel="noreferrer">{pub.conference}</a> : <p>{pub.conference}</p>}
              </div>
            ))}
          </div>
          <div className="ed-certs">
            <h3>{edu.certHeading}</h3>
            {data.certs.map((cert, i) => (
              <div key={i} className="ed-cert">
                <p><span>{cert.name}</span><span>{cert.issuer}{cert.file?.url && <> <a href={cert.file.url} target="_blank" rel="noreferrer">PDF</a></>}</span></p>
                <CertShot cert={cert} className="ed-cert__shot" />
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="ed-sec">
          <h2 className="ed-title">{nav[4]}</h2>
          <div className="ed-rows">
            {data.projects.map((project, i) => (
              <article key={project.id ?? i} className="ed-project">
                <div className="ed-project__name"><h3>{project.title}</h3><p>{project.subtitle[lang]}</p></div>
                <div className="ed-project__body">
                  <p>{project.description[lang]}</p>
                  <p className="ed-mono">{project.tags.join(', ')}</p>
                  <p className="ed-project__links">
                    {project.links.github && <a href={project.links.github} target="_blank" rel="noreferrer">{tr.projects.code}</a>}
                    {project.links.live && <a href={project.links.live} target="_blank" rel="noreferrer">{tr.projects.live}</a>}
                  </p>
                </div>
                <div className="ed-project__meta"><span className="ed-chip">{tr.projects.statusMap[project.status] || project.status}</span><b>{project.year}</b></div>
              </article>
            ))}
          </div>
          <a className="ed-btn is-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">{tr.projects.viewAll}</a>
        </section>

        <section id="contact" className="ed-contact">
          <div className="ed-contact__info">
            <h2 className="ed-title ed-title--light">{tr.contact.heading}</h2>
            <p>{tr.contact.sub}</p>
            {SOCIALS.map(s => (
              <a key={s.name} href={s.url} className={s.name === 'Email' ? 'ed-contact__mail' : 'ed-contact__link'} {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {s.name === 'Email' ? s.handle : `${s.name} ${s.handle}`}
              </a>
            ))}
          </div>
          <form className="ed-form" onSubmit={contact.submit}>
            <h3>{tr.contact.formTitle}</h3>
            <label htmlFor="ed-name">{tr.contact.name}</label>
            <input id="ed-name" type="text" required placeholder={tr.contact.namePh} value={contact.form.name} onChange={contact.setField('name')} />
            <label htmlFor="ed-email">{tr.contact.email}</label>
            <input id="ed-email" type="email" required placeholder={tr.contact.emailPh} value={contact.form.email} onChange={contact.setField('email')} />
            <label htmlFor="ed-msg">{tr.contact.message}</label>
            <textarea id="ed-msg" rows={4} required placeholder={tr.contact.msgPh} value={contact.form.message} onChange={contact.setField('message')} />
            <button type="submit" disabled={contact.sending || contact.sent}>{contact.sending ? tr.contact.sending : contact.sent ? tr.contact.sent : tr.contact.send}</button>
          </form>
        </section>

        <footer className="ed-foot"><span>© 2026 Kevin Phan. {tr.footer.credit}</span><a href="#top">{tr.footer.backTop}</a></footer>
      </main>
    </div>
  )
}
