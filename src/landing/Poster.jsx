import { useRef } from 'react'
import { useLang } from '../LangContext'
import { t } from '../i18n'
import { useLandingData, SKILL_GROUPS, TAGS, STAT_VALUES, SOCIALS, GITHUB_URL } from './data'
import { useRotatingRole, useContactForm, useLandingEffects, ScrollProgress, CertShot, LangSwitch, Bullets } from './shared'
import './poster.css'

const SECTIONS = ['about', 'experience', 'skills', 'edu', 'projects', 'contact']
const FX = {
  reveal: [
    ['.pz-title--statement', 'wipe-up'], ['.pz-bio p', 'fade'], ['.pz-stats > div', 'pop'],
    ['#experience .pz-title', 'wipe'], ['.pz-job:nth-child(odd)', 'left'], ['.pz-job:nth-child(even)', 'right'], ['.pz-job__list li', 'left-s'],
    ['#skills .pz-title', 'wipe'], ['.pz-skillgroup', 'flip'],
    ['.pz-card.is-ink', 'left'], ['.pz-card.is-blue', 'right'], ['.pz-sub', 'wipe'], ['.pz-cert', 'drop'],
    ['#projects .pz-title', 'wipe'], ['.pz-project', 'tilt'],
    ['.pz-title--huge', 'wipe-up'], ['.pz-contact__info > p, .pz-contact__info > a', 'fade'], ['.pz-form', 'right'],
  ],
  count: ['.pz-stats dt'],
  drift: [['.pz-title', 140], ['.pz-stats dt', -50], ['.pz-job:nth-child(odd) h3', 60], ['.pz-job:nth-child(even) h3', -60]],
}
const COVERS = ['is-blue', 'is-ink', 'is-lilac', 'is-paper', 'is-night', 'is-blue']

export default function Poster() {
  const { lang, setLang } = useLang()
  const tr = t[lang]
  const data = useLandingData(lang)
  const role = useRotatingRole(tr.hero.roles, lang)
  const contact = useContactForm()
  const nav = tr.nav.links
  const edu = tr.edupub
  const root = useRef(null)
  useLandingEffects(root, { ...FX, spy: { links: '.pz-nav nav a', ids: SECTIONS } })

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
          {[0, 1].map(copy => <ul key={copy} className="pz-track">{TAGS.map(tag => <li key={tag}>{tag}</li>)}</ul>)}
        </div>
      </section>

      <section id="about" className="pz-sec">
        <div className="pz-wrap">
          <h2 className="pz-title pz-title--statement">{tr.about.heading}</h2>
          <div className="pz-split">
            <div className="pz-bio">{tr.about.bio.map((text, i) => <p key={i}>{text}</p>)}</div>
            <dl className="pz-stats">
              {STAT_VALUES.map((value, i) => <div key={i}><dt>{value}</dt><dd>{tr.about.stats[i]}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>

      <section id="experience" className="pz-sec is-ink">
        <div className="pz-wrap">
          <h2 className="pz-title">{nav[1]}</h2>
          <div className="pz-jobs">
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
        <div className="pz-wrap">
          <h2 className="pz-title">{nav[2]}</h2>
          <div className="pz-skills">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={gi} className="pz-skillgroup">
                <h3>{group.name[lang]}</h3>
                {group.skills.map(skill => (
                  <div key={skill.name} className="pz-skill">
                    <p><span>{skill.name}</span><b>{skill.level}%</b></p>
                    <div className="pz-bar"><div style={{ '--lv': skill.level / 100 }} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="edu" className="pz-sec pz-sec--tight">
        <div className="pz-wrap">
          <div className="pz-cards">
            <article className="pz-card is-ink">
              <p className="pz-card__tag">{edu.eduHeading}</p>
              <h3>{edu.uniName}</h3>
              <p>{edu.major}</p>
              <p className="pz-mono">{edu.eduYear}</p>
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
          <h3 className="pz-sub">{edu.certHeading}</h3>
          <div className="pz-certs">
            {data.certs.map((cert, i) => (
              <div key={i} className="pz-cert">
                <p className="pz-cert__name">{cert.name}</p>
                <p className="pz-cert__issuer">{cert.issuer}{cert.file?.url && <> <a href={cert.file.url} target="_blank" rel="noreferrer">PDF</a></>}</p>
                <CertShot cert={cert} className="pz-cert__shot" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="pz-sec is-lilac">
        <div className="pz-wrap">
          <h2 className="pz-title">{nav[4]}</h2>
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
          <a className="pz-pill is-dark" href={GITHUB_URL} target="_blank" rel="noreferrer">{tr.projects.viewAll}</a>
        </div>
      </section>

      <section id="contact" className="pz-sec is-blue pz-contact">
        <div className="pz-wrap">
          <h2 className="pz-title pz-title--huge">{tr.contact.heading}</h2>
          <div className="pz-split">
            <div className="pz-contact__info">
              <p>{tr.contact.sub}</p>
              {SOCIALS.map(s => (
                <a key={s.name} href={s.url} className={s.name === 'Email' ? 'pz-contact__mail' : 'pz-contact__link'} {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {s.name === 'Email' ? s.handle : `${s.name} ${s.handle}`}
                </a>
              ))}
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
