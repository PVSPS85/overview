import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { Session } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

type IconName =
  | "arrow"
  | "award"
  | "book"
  | "briefcase"
  | "check"
  | "chevron"
  | "code"
  | "download"
  | "external"
  | "github"
  | "grid"
  | "linkedin"
  | "lock"
  | "mail"
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "upload"
  | "user"
  | "x"

const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  award: <><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2 4.5 2-1-9" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V4h8v3M3 12h18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" /></>,
  external: <><path d="M15 4h5v5M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  github: <path d="M15 22v-4c.14-1.27-.35-2.5-1.2-3.4 4 0 8.2-2 8.2-8.2A6.4 6.4 0 0 0 20.3 2 6 6 0 0 0 20.1 0S18.8-.4 15 1.7a15.4 15.4 0 0 0-6 0C5.2-.4 3.9 0 3.9 0a6 6 0 0 0-.2 2A6.4 6.4 0 0 0 2 6.4c0 6.2 4.2 8.2 8.2 8.2-.7.7-1 1.5-1.2 2.4-3.4 1.5-4-1.5-4-1.5-.6-1.5-1.5-1.9-1.5-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 1.3 2 1.3 1.1 2 2.9 1.4 3.4 1.1" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  linkedin: <><rect x="3" y="9" width="4" height="12" /><path d="M5 3v.01M11 21V9h4v2c1-2 6-3 6 3v7" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  spark: <><path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8zM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7zM19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z" /></>,
  upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" /></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Button({ children, variant = "primary", icon, onClick, type = "button" }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; icon?: IconName; onClick?: () => void; type?: "button" | "submit" }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick}>{children}{icon && <Icon name={icon} />}</button>
}

/* ── Motion hooks ── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  return reduced
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) { setVisible(true); return }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, reduced])
  return [ref, visible] as const
}

function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > offset)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [offset])
  return scrolled
}

/* ── Toast system ── */
type ToastData = { id: number; type: "success" | "info" | "error"; title: string; msg?: string }
let _tid = 0

function ToastNote({ item, onDismiss }: { item: ToastData; onDismiss: (id: number) => void }) {
  const [out, setOut] = useState(false)
  const dismiss = useCallback(() => { setOut(true); setTimeout(() => onDismiss(item.id), 350) }, [item.id, onDismiss])
  useEffect(() => { const t = setTimeout(dismiss, 3800); return () => clearTimeout(t) }, [dismiss])
  return (
    <div className={`toast t-${item.type}${out ? " exiting" : ""}`} role="status">
      <Icon name={item.type === "success" ? "check" : item.type === "error" ? "x" : "spark"} size={15} />
      <div style={{ flex: 1 }}>
        <span style={{ display: "block" }}>{item.title}</span>
        {item.msg && <span className="toast-msg">{item.msg}</span>}
      </div>
      <button className="toast-dismiss" onClick={dismiss} aria-label="Dismiss"><Icon name="x" size={13} /></button>
    </div>
  )
}

function Toasts({ items, dismiss }: { items: ToastData[]; dismiss: (id: number) => void }) {
  return (
    <div className="toast-container" aria-live="polite">
      {items.map(t => <ToastNote key={t.id} item={t} onDismiss={dismiss} />)}
    </div>
  )
}

type Project = {
  id: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  cover_image_url: string | null
  project_date: string | null
  github_url: string | null
  live_demo_url: string | null
  organization: string | null
  other_url: string | null
  visibility: string
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}


function isValidProjectUrl(value?: string | null): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function openProjectUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

type Certification = {
  id: string
  title: string
  issuer: string
  issue_date: string
  category: string
  mark: string
  certificate_url: string | null
  credential_url: string | null
  visibility: string
  published_at: string | null
  created_at: string | null
  updated_at: string | null
  signedUrl?: string | null // For frontend rendering
}

type Hackathon = {
  id: string
  event_name: string
  event_year: string
  project_name: string
  role: string
  result: string | null
  tech_stack: string
  description: string | null
  event_link: string | null
  project_link: string | null
  visibility: string
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}

type Achievement = {
  id: string
  title: string
  description: string | null
  achievement_date: string
  category: string
  visibility: string
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}

type Profile = {
  id: string
  full_name: string
  headline: string
  short_bio: string
  availability_status: string | null
  profile_photo_url: string | null
  github_url: string | null
  linkedin_url: string | null
  email: string | null
  resume_url: string | null
  about_title: string | null
  about_lead: string | null
  about_body: string | null
  technologies: string | null
  interests: string | null
}

type Resume = {
  id: string
  title: string
  resume_url: string
  visibility: string
  published_at: string | null
}

function formatAutoTimestamp(): string {
  const now = new Date()
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const d = String(now.getDate()).padStart(2, "0")
  const m = months[now.getMonth()]
  const y = now.getFullYear()
  let h = now.getHours()
  const min = String(now.getMinutes()).padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${d} ${m} ${y} · ${h}:${min} ${ampm} IST`
}

function formatWelcomeDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="section-heading"><div className="eyebrow"><span />{eyebrow}</div><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    let raf = 0
    const update = () => {
      const bar = barRef.current
      if (!bar) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = max > 0 ? `scaleX(${window.scrollY / max})` : "scaleX(0)"
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [reduced])
  if (reduced) return null
  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />
}

function Header() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled()
  return (
    <div className={`sticky-nav${scrolled ? " scrolled" : ""}`}>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Pranav home">P<span>.</span></a>
        <nav className={open ? "nav open" : "nav"}>
          {["About", "Certifications"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)}>{item}</a>
          ))}
          <a className="nav-admin-link" href="/admin" onClick={() => setOpen(false)}>
            <Icon name="lock" size={13} /> Admin Login
          </a>
        </nav>
        <div className="header-actions">
          <a className="availability" href="mailto:pranav@example.com"><i />Available to collaborate</a>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </header>
    </div>
  )
}

function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const portraitContainerRef = useRef<HTMLDivElement>(null)
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile`)
        if (!res.ok) return
        const data = await res.json()
        if (data && data.full_name) {
          setProfile(data)
          if (data.profile_photo_url) {
            const sRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/storage/signed-url?bucket=profile-media&path=${data.profile_photo_url}`)
            if (sRes.ok) {
              const { signedUrl } = await sRes.json()
              setPhotoUrl(signedUrl)
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    const fetchResume = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/resume/current`)
        if (!res.ok) return
        const data = await res.json()
        if (data && data.resume_url) {
          const sRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/storage/signed-url?bucket=resumes&path=${data.resume_url}`)
          if (sRes.ok) {
            const { signedUrl } = await sRes.json()
            setResumeUrl(signedUrl)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchProfile()
    fetchResume()
  }, [])

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 10,
      y: ((e.clientY - r.top) / r.height - 0.5) * -8,
    })
  }

  /* Scroll-driven parallax layers */
  useEffect(() => {
    if (reduced) return
    let raf = 0
    const update = () => {
      const y = window.scrollY
      const heroH = heroRef.current?.offsetHeight || window.innerHeight
      const p = Math.min(1, y / heroH)
      /* Layer 1 – background (slowest, drifts behind) */
      if (bgRef.current) bgRef.current.style.transform = `translateY(${y * 0.18}px)`
      /* Layer 2 – main content (fades + lifts slightly faster) */
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translateY(${-y * 0.09}px)`
        wrapperRef.current.style.opacity = String(Math.max(0, 1 - p * 1.6))
      }
      /* Layer 3 – portrait (scales gently toward viewer) */
      if (portraitContainerRef.current) {
        portraitContainerRef.current.style.transform = `scale(${1 + p * 0.045})`
      }
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [reduced])

  const settling = Math.abs(tilt.x) + Math.abs(tilt.y) < 0.05
  const portraitStyle: React.CSSProperties = reduced ? {} : {
    transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
    transition: settling ? "transform 0.9s var(--ease-out)" : "transform 0.12s ease-out",
    willChange: "transform",
  }
  
  const name = profile?.full_name || "Pranav"
  const firstName = name.split(' ')[0]
  const headline = profile?.headline || "CSE Student • Developer • AI/ML"
  const bio = profile?.short_bio || "I build intelligent systems that solve real problems—learning deeply, then turning ideas into software people actually use."
  const status = profile?.availability_status || "Available to collaborate"

  return (
    <section ref={heroRef} className="hero" id="top" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div ref={bgRef} className="hero-bg-shapes">
        <div className="hero-glow one" />
        <div className="hero-glow two" />
        <div className="hero-glow three" />
      </div>

      <div ref={wrapperRef} className="hero-wrapper">
        <div className="hero-content">
          <div className="status-pill ha-pill">
            <Icon name="spark" size={14} /> {headline.split('•')[0] || "Applied AI"}
          </div>
          <h1 className="ha-h1">Hi, I'm {firstName}.</h1>
          <h1 className="gradient-text ha-h2">Building myself, one project at a time.</h1>
          <p className="hero-sub ha-sub">
            {headline}
          </p>
          <p className="hero-desc ha-desc">
            {bio}
          </p>
          <div className="hero-actions ha-actions">
            <a className="button primary" href="#projects">
              Explore My Work <Icon name="arrow" />
            </a>
            <a 
              className="button secondary" 
              href={resumeUrl || "#"} 
              target={resumeUrl ? "_blank" : undefined} 
              rel="noopener noreferrer"
              onClick={e => {
                if (!resumeUrl) {
                  e.preventDefault()
                  alert("No resume has been uploaded yet. Please log into the Admin panel and upload your Resume PDF in the Profile section.")
                }
              }}
            >
              Download Resume <Icon name="download" />
            </a>
          </div>
        </div>

        <div ref={portraitContainerRef} className="hero-portrait-container">
          <div className="portrait-frame-wrap ha-portrait" style={portraitStyle}>
            <div className="portrait-frame-decor-1" />
            <div className="portrait-frame-decor-2" />
            <div className="portrait-frame">
              <div className="portrait-img-inner">
                {photoUrl ? (
                  <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="portrait-placeholder-avatar">{firstName[0]}</div>
                )}
                <div className="portrait-placeholder-info" style={photoUrl ? { display: 'none' } : undefined}>
                  <b>{name}</b>
                  <small>{headline.split('•')[0]}</small>
                </div>
              </div>
              <div className="portrait-badge">
                <i /> {status}
              </div>
            </div>
          </div>
          <div className="hero-social-row ha-social">
            {(profile?.linkedin_url || profile === null) && (
              <a href={profile?.linkedin_url || "#"} target={profile?.linkedin_url ? "_blank" : undefined} rel="noopener noreferrer" className="hero-social-btn" aria-label="LinkedIn">
                <Icon name="linkedin" size={14} /><span>LinkedIn</span>
              </a>
            )}
            {(profile?.github_url || profile === null) && (
              <a href={profile?.github_url || "#"} target={profile?.github_url ? "_blank" : undefined} rel="noopener noreferrer" className="hero-social-btn" aria-label="GitHub">
                <Icon name="github" size={14} /><span>GitHub</span>
              </a>
            )}
            {(profile?.email || profile === null) && (
              <a href={profile?.email ? `mailto:${profile.email}` : "mailto:pranav@example.com"} className="hero-social-btn" aria-label="Email">
                <Icon name="mail" size={14} /><span>Email</span>
              </a>
            )}
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="hero-social-btn hero-social-resume" aria-label="Resume">
                <Icon name="download" size={14} /><span>Resume</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="scroll-hint ha-scroll"><span />Scroll to explore</div>
    </section>
  )
}

function Currently() {
  const [ref, visible] = useReveal(0.05)
  const items = [
    ["Learning", "Advanced deep learning", "Transformers & multimodal models", "01"],
    ["Building", "NeuraNotes v2", "AI-powered research workspace", "02"],
    ["Exploring", "Edge AI systems", "On-device intelligence & efficiency", "03"],
    ["Reading", "Human–AI interaction", "Designing technology with empathy", "04"],
  ]
  return (
    <section ref={ref} className="currently wrap">
      <div className="currently-label">
        <span>Currently</span>
        <p>A snapshot of what has my attention right now.</p>
      </div>
      <div className={`currently-grid${visible ? " visible" : ""}`}>
        {items.map(([label, title, sub, no]) => (
          <article key={label}>
            <div className="card-no">{no}</div>
            <div className="mini-label">{label}</div>
            <h3>{title}</h3>
            <p>{sub}</p>
            <div className="card-arrow"><Icon name="arrow" /></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function About({ profile }: { profile: Profile | null }) {
  const [ref, visible] = useReveal(0.1)
  const technologies = profile?.technologies ? profile.technologies.split(',').map(s => s.trim()).filter(Boolean) : ["Python", "TypeScript", "React", "Node.js", "PyTorch", "FastAPI", "PostgreSQL", "Next.js", "OpenCV", "Docker"]
  const interests = profile?.interests ? profile.interests.split(',').map(s => s.trim()).filter(Boolean) : ["Applied AI", "Computer Vision", "Developer Tools", "Human–AI Interaction", "Open Source"]

  const title = profile?.about_title || "Curious by nature. Intentional by design."
  const lead = profile?.about_lead || "I'm a computer science student interested in building intelligent systems that solve meaningful, human problems."
  const bodyText = profile?.about_body || "I enjoy moving between learning and building—understanding the theory deeply, then turning it into software people can actually use. I'm especially drawn to applied AI and the intersection of deep learning and product engineering.\n\nWhen I'm not coding, I'm reading about ML architectures, exploring how technology can be designed with more intention, or working on something new."
  
  const paragraphs = bodyText.split('\n').filter(p => p.trim() !== '')

  return (
    <section ref={ref} className="section wrap about" id="about">
      <div className="about-depth-blob" style={{ width: 320, height: 320, background: "#D9E4F0", top: -60, right: -80 }} />
      <div className="about-depth-blob" style={{ width: 220, height: 220, background: "#EAE3D2", bottom: 40, left: -60 }} />
      <div className={`reveal${visible ? " visible" : ""}`}>
        <SectionTitle eyebrow="About me" title={title} />
      </div>
      <div className="about-grid">
        <div className={`about-copy reveal sd-1${visible ? " visible" : ""}`}>
          <p className="lead">{lead}</p>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className={`about-side reveal sd-2${visible ? " visible" : ""}`}>
          <div className="about-side-block">
            <span className="about-side-label">Technologies I work with</span>
            <div className="interest-list">
              {technologies.map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          <div className="about-side-block">
            <span className="about-side-label">Areas of interest</span>
            <div className="interest-list">
              {interests.map(i => <span key={i}>{i}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Projects() {
  const [ref, visible] = useReveal(0.08)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState("All")
  const [selected, setSelected] = useState<Project | null>(null)
  const [unavailableDemo, setUnavailableDemo] = useState<Project | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data)
        } else {
          setProjects([])
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const categories = Array.from(new Set(projects.map(p => p.category)))
  const filters = ["All", ...categories]
  const shown = filter === "All" ? projects : projects.filter(p => p.category === filter)
  
  const showDemo = (project: Project) => {
    if (isValidProjectUrl(project.live_demo_url)) {
      openProjectUrl(project.live_demo_url)
    } else if (isValidProjectUrl(project.github_url)) {
      setUnavailableDemo(project)
    }
  }

  const projectActions = (project: Project, compact = false) => {
    const hasGithub = isValidProjectUrl(project.github_url)
    const hasDemo = isValidProjectUrl(project.live_demo_url)
    if (!hasGithub && !hasDemo) return null
    return <div className={compact ? "project-card-actions" : "project-link-actions"}>
      {hasGithub && <Button variant={compact ? "secondary" : "primary"} icon="github" onClick={() => openProjectUrl(project.github_url!)}>{compact ? "View GitHub" : "GitHub Repository"}</Button>}
      {(hasDemo || hasGithub) && <Button variant="secondary" icon="external" onClick={() => showDemo(project)}>Live Demo</Button>}
    </div>
  }

  const getYear = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).getFullYear().toString()
  }

  return <section ref={ref} className="section wrap" id="projects">
    <div className={`section-row reveal${visible ? " visible" : ""}`}>
      <SectionTitle eyebrow="Selected work" title="Projects built to learn, solve & explore." text="A curated collection of things I've designed, engineered and learned from." />
      <div className="filters">
        {filters.map(f => <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
    </div>

    {loading ? (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>Loading projects...</div>
    ) : error ? (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "#d9534f" }}>Failed to load projects.</div>
    ) : projects.length === 0 ? (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
        <p>No projects published yet.</p>
      </div>
    ) : (
      <div className={`project-grid-scene${visible ? " visible" : ""}`}>
        <div className="project-grid">
          {shown.map((project, index) => (
            <article className={`project-card ${index === 0 && filter === "All" ? "featured" : ""}`} key={project.id} onClick={() => setSelected(project)}>
              <div className={`project-art ${project.cover_image_url || 'neural'}`}>
                <span className="project-index">0{projects.indexOf(project) + 1}</span>
                <div className="art-window">
                  <i /><i /><i />
                  <div className="art-lines"><b /><b /><b /><b /></div>
                </div>
              </div>
              <div className="project-body">
                <div className="project-meta"><span>{project.category}</span><span>{getYear(project.project_date) || "Present"}</span></div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tech-list">{project.tech_stack?.map((t: string) => <span key={t}>{t}</span>)}</div>
                {project.organization && <div className="project-organization"><span>Built with / For</span><b>{project.organization}</b></div>}
                <div onClick={e => e.stopPropagation()}>{projectActions(project, true)}</div>
                <button className="text-link">View case study <Icon name="arrow" /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    )}

    {selected && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
      <div className="project-modal" onMouseDown={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><Icon name="x" /></button>
        <div className={`modal-art ${selected.cover_image_url || 'neural'}`}>
          <div className="eyebrow"><span />Case study · {getYear(selected.project_date) || "Present"}</div>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
        </div>
        <div className="case-grid">
          <div>
            <div className="case-section"><span>01 / Overview</span><h3>{selected.title}</h3><p>{selected.description}</p></div>
          </div>
          <div>
            <div className="case-section"><span>Tech Stack</span><ul>{selected.tech_stack?.map(t => <li key={t}>{t}</li>)}</ul></div>
            {selected.organization && <div className="case-section organization-detail"><span>Built with / For</span><h3>{selected.organization}</h3></div>}
            <div className="project-links-detail">
              <span>Project links</span>
              {projectActions(selected)}
              {isValidProjectUrl(selected.other_url) && <button className="other-project-link" onClick={() => openProjectUrl(selected.other_url!)}>Other project resource <Icon name="arrow" size={15} /></button>}
            </div>
          </div>
        </div>
      </div>
    </div>}
    
    {unavailableDemo && <div className="modal-backdrop demo-unavailable-wrap" onMouseDown={() => setUnavailableDemo(null)}>
      <div className="demo-unavailable" role="dialog" aria-modal="true" aria-labelledby="demo-unavailable-title" onMouseDown={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setUnavailableDemo(null)} aria-label="Close"><Icon name="x" /></button>
        <div className="demo-unavailable-icon"><Icon name="external" /></div>
        <span className="mini-label">Project preview</span>
        <h2 id="demo-unavailable-title">Live Demo Unavailable</h2>
        <p>This project isn't currently hosted. You can explore the source code on GitHub instead.</p>
        {isValidProjectUrl(unavailableDemo.github_url) && <Button icon="github" onClick={() => openProjectUrl(unavailableDemo.github_url!)}>Go to GitHub</Button>}
      </div>
    </div>}
  </section>
}

function Certifications() {
  const [ref, visible] = useReveal(0.1)
  const [active, setActive] = useState<Certification | null>(null)
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/certifications`)
        let data: Certification[] = await res.json()
        
        // Fetch signed URLs for certificates
        data = await Promise.all(data.map(async (cert) => {
          if (cert.certificate_url) {
            try {
              const urlRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/storage/signed-url?bucket=certificates&path=${encodeURIComponent(cert.certificate_url)}`)
              if (urlRes.ok) {
                const urlData = await urlRes.json()
                cert.signedUrl = urlData.signedUrl
              }
            } catch (e) {
              console.error("Failed to fetch signed URL for cert", cert.id)
            }
          }
          return cert
        }))
        
        setCerts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  return (
    <section ref={ref} className="section wrap" id="certifications">
      <div className={`reveal${visible ? " visible" : ""}`}>
        <SectionTitle eyebrow="Credentials" title="Proof of consistent learning." text="Selected certifications that have shaped the way I think and build." />
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading certifications...</div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Certifications will appear here as they are published.</div>
      ) : (
        <div className={`certificate-grid${visible ? " visible" : ""}`}>
        {certs.map((cert, index) => (
          <article className="certificate-card" key={cert.id}>
            <div className="certificate-preview">
              {cert.signedUrl ? (
                !cert.signedUrl.toLowerCase().includes('.pdf') && !cert.signedUrl.includes('pdf?') ? (
                  <img 
                    src={cert.signedUrl} 
                    loading="lazy"
                    alt={cert.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                  />
                ) : (
                  <iframe 
                    src={`${cert.signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', pointerEvents: 'none' }} 
                    tabIndex={-1} 
                    title={cert.title}
                  />
                )
              ) : (
                <div className="cert-sheet">
                  <span className="cert-mark">{cert.mark || cert.title.substring(0, 2).toUpperCase()}</span>
                  <small>Certificate of completion</small>
                  <b>{cert.title}</b>
                  <i />
                  <p>Presented to Pranav</p>
                </div>
              )}
              <span>0{index + 1}</span>
            </div>
            <div className="certificate-body">
              <span className="category">{cert.category}</span>
              <h3>{cert.title}</h3>
              <p>{cert.issuer}</p>
              <div>
                <time>{new Date(cert.issue_date).getFullYear()}</time>
                <button className="text-link" onClick={() => setActive(cert)}>View certificate <Icon name="external" size={15} /></button>
              </div>
            </div>
          </article>
        ))}
        </div>
      )}
      
      {active && <div className="modal-backdrop certificate-modal-wrap" onMouseDown={() => setActive(null)}>
        <div className="certificate-modal" onMouseDown={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setActive(null)}><Icon name="x" /></button>
          {active.signedUrl ? (
            active.signedUrl.toLowerCase().endsWith('.pdf') || active.signedUrl.includes('pdf?') ? (
              <iframe src={`${active.signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} loading="lazy" className="big-certificate" style={{ border: 'none', height: 'auto', aspectRatio: '1.414', padding: 0 }} title={active.title} />
            ) : (
              <img src={active.signedUrl} alt={active.title} className="big-certificate" style={{ padding: 0, objectFit: 'contain' }} />
            )
          ) : (
            <div className="big-certificate">
              <div className="cert-seal"><Icon name="award" size={38} /></div>
              <small>CERTIFICATE OF COMPLETION</small>
              <h2>{active.title}</h2>
              <p>This certificate is proudly presented to</p>
              <h3>Pranav</h3>
              <div className="cert-rule" />
              <p>For successful completion of the professional learning program.</p>
              <footer><span>{active.issuer}</span><span>{new Date(active.issue_date).toLocaleDateString()}</span></footer>
            </div>
          )}
        </div>
      </div>}

    </section>
  )
}

function Hackathons() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()
  
  const [hacks, setHacks] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHacks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/hackathons`)
        const data = await res.json()
        setHacks(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchHacks()
  }, [])

  /* IntersectionObserver for section heading entrance */
  useEffect(() => {
    if (reduced) { setVisible(true); return }
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduced])

  /* Scroll-driven timeline line draw */
  useEffect(() => {
    if (reduced || loading || hacks.length === 0) return
    let raf = 0
    const update = () => {
      const section = sectionRef.current
      const line = lineRef.current
      if (!section || !line) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const timelineEl = section.querySelector(".timeline") as HTMLElement
      if (!timelineEl) return
      /* Progress 0→1 as timeline scrolls through viewport */
      const p = Math.max(0, Math.min(1, (vh * 0.82 - rect.top) / (rect.height * 0.88)))
      line.style.height = `${p * timelineEl.clientHeight}px`
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    // Trigger an initial update in case it's already in view after load
    setTimeout(update, 100)
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [reduced, loading, hacks.length])

  return (
    <section ref={sectionRef} className="section wrap" id="hackathons">
      <div className={`reveal${visible ? " visible" : ""}`}>
        <SectionTitle eyebrow="Under pressure" title="Hackathons & rapid experiments." />
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading hackathons...</div>
      ) : hacks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Hackathons will appear here as they are published.</div>
      ) : (
        <div className={`timeline${visible ? " visible" : ""}`}>
          <div className="timeline-line" ref={lineRef} />
          {hacks.map((h, i) => (
            <article key={h.id}>
              <div className="timeline-year">{h.event_year}</div>
              <div className="timeline-dot"><span /></div>
              <div className="timeline-content">
                <span>0{i + 1}</span>
                <div><p>{h.event_name}</p><h3>{h.project_name}</h3></div>
                <div><p>Role & result</p><h4>{h.role}{h.result ? ` · ${h.result}` : ""}</h4></div>
                <div><p>Built with</p><h4>{h.tech_stack}</h4></div>
                {(h.event_link || h.project_link) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {h.project_link && <a href={h.project_link} target="_blank" rel="noopener noreferrer" className="text-link">Project <Icon name="external" size={14} /></a>}
                    {h.event_link && <a href={h.event_link} target="_blank" rel="noopener noreferrer" className="text-link">Event <Icon name="external" size={14} /></a>}
                  </div>
                )}
                {!h.event_link && !h.project_link && <Icon name="chevron" />}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Journey() {
  const [ref, visible] = useReveal(0.1)
  
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/achievements`)
        const data = await res.json()
        setAchievements(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAchievements()
  }, [])
  
  const categories = Array.from(new Set(achievements.map(a => a.category)))
  const filtered = filter === "All" ? achievements : achievements.filter(a => a.category === filter)

  return (
    <section ref={ref} className="section wrap" id="achievements">
      <div className={`reveal${visible ? " visible" : ""}`}>
        <SectionTitle eyebrow="The journey" title="A timeline of becoming." text="The milestones matter, but the curiosity between them matters more." />
      </div>
      
      {categories.length > 0 && (
        <div className="filter-row" style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
          <button className={`filter-btn ${filter === "All" ? "active" : ""}`} onClick={() => setFilter("All")}>All</button>
          {categories.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Achievements will appear here as they are published.</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>No achievements found for this category.</div>
      ) : (
        <div className={`journey${visible ? " visible" : ""}`}>
          {filtered.map((m, i) => (
            <article key={m.id}>
              <div className="journey-line"><i className={i === 0 && filter === "All" ? "active" : ""} /></div>
              <time>{new Date(m.achievement_date).getFullYear()}</time>
              <div>
                <span className="mini-label" style={{ marginBottom: '8px', display: 'inline-block' }}>{m.category}</span>
                <h3>{m.title}</h3>
                {m.description && <p>{m.description}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function AskPranav() {
  const [ref, visible] = useReveal(0.1)
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hi — I'm Pranav's portfolio assistant. Ask me about his projects, skills, or experience." }
  ])
  const [input, setInput] = useState("")
  const ask = (text: string) => {
    if (!text.trim()) return
    setMessages(m => [...m, { role: "user", text }, { role: "bot", text: text.toLowerCase().includes("project") ? "Pranav's current flagship project is NeuraNotes, an AI-powered research workspace built with React, PyTorch and FastAPI." : "Pranav focuses on applied AI, computer vision and thoughtful product engineering. He's especially interested in efficient models and human–AI interaction." }])
    setInput("")
  }
  return <section ref={ref} className="section ask-section">
    <div className="wrap ask-grid">
      <div>
        <div className={`reveal${visible ? " visible" : ""}`}>
          <SectionTitle eyebrow="Ask Pranav" title="Curious about something?" text="Chat with my portfolio assistant for a quick answer—or scroll down to send a message directly." />
        </div>
        <div className="ask-suggestions">
          <span>Try asking</span>
          {["What is Pranav building?", "Tell me about his AI work", "What are his strongest skills?"].map(q => (
            <button key={q} onClick={() => ask(q)}>{q}<Icon name="arrow" size={15} /></button>
          ))}
        </div>
      </div>
      <div className="chat">
        <div className="chat-top">
          <div className="avatar">P</div>
          <div><strong>Pranav AI</strong><span><i />Online</span></div>
          <Icon name="spark" />
        </div>
        <div className="chat-messages">
          {messages.slice(-4).map((m, i) => <div className={`message ${m.role}`} key={i}>{m.text}</div>)}
        </div>
        <form className="chat-input" onSubmit={e => { e.preventDefault(); ask(input) }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." aria-label="Ask Pranav" />
          <button aria-label="Send message"><Icon name="arrow" /></button>
        </form>
        <small>AI responses are based on portfolio content.</small>
      </div>
    </div>
  </section>
}

function ContactForm() {
  const [ref, visible] = useReveal(0.1)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }
      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  return <section ref={ref} className="section contact-section" id="contact">
    <div className={`wrap reveal${visible ? " visible" : ""}`} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <SectionTitle eyebrow="Get in touch" title="Send a message." text="Have a question or want to work together? Leave your details and I'll get back to you." />
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
            Name
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }} disabled={status === 'submitting'} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
            Email
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }} disabled={status === 'submitting'} />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
          Message
          <textarea rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', resize: 'vertical' }} disabled={status === 'submitting'} />
        </label>
        
        {status === 'error' && <div style={{ color: 'red', fontSize: '0.9rem' }}>{errorMessage}</div>}
        {status === 'success' && <div style={{ color: 'green', fontSize: '0.9rem' }}>Thanks! Your message has been sent successfully.</div>}
        
        <Button icon="arrow" disabled={status === 'submitting'} onClick={() => {}} style={{ alignSelf: 'flex-start' }}>
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  </section>
}

function Footer() {
  return <footer className="site-footer wrap">
      <a className="logo" href="#top">P<span>.</span></a>
      <span>Designed & built with intention by Pranav.</span>
      <span>© 2026 · India</span>
    </footer>
}

function PublicPortfolio() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile`)
      .then(res => res.json())
      .then(data => {
        if (data && data.full_name) setProfile(data)
      })
      .catch(console.error)
  }, [])

  return <div className="public-site">
    <ScrollProgress />
    <Header />
    <main><Hero /><About profile={profile} /><Certifications /><AskPranav /><ContactForm /></main>
    <Footer />
  </div>
}

const adminSections = [
  ["Overview", "grid"], ["Certifications", "award"], ["Profile & Photo", "user"], ["Resume", "download"], ["Messages", "mail"], ["Settings", "settings"],
] as [string, IconName][]

function AdminLogin() {
  const [email, setEmail] = useState("pvsaipranav2007@gmail.com")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) {
      setError(authError.message)
    }
    setLoading(false)
  }

  return <div className="login-page">
    <div className="login-glow" />
    <a className="logo admin-logo" href="/">P<span>.</span></a>
    <div className="login-card">
      <div className="login-icon"><Icon name="lock" /></div>
      <p className="mini-label">Private workspace</p>
      <h1>Welcome back, Pranav.</h1>
      <p>Sign in to manage your digital portfolio.</p>
      <form onSubmit={handleLogin}>
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></label>
        {error && <div style={{ color: "#d9534f", fontSize: "0.85rem", marginTop: "-10px", marginBottom: "15px" }}>{error}</div>}
        <div className="login-options">
          <label className="check-label"><input type="checkbox" defaultChecked />Remember me</label>
          <a href="#">Forgot password?</a>
        </div>
        <Button type="submit" icon="arrow" variant="primary">
          {loading ? "Signing in..." : "Sign in securely"}
        </Button>
      </form>
      <div className="secure-note"><Icon name="check" size={14} />Protected admin access</div>
    </div>
    <a className="back-link" href="/"><Icon name="arrow" />Back to public portfolio</a>
  </div>
}

function ProfileEditor({ session, addToast }: { session: Session | null; addToast: (type: any, title: string, msg?: string) => void }) {
  const [profile, setProfile] = useState<any>({ full_name: 'Pranav', headline: 'CSE Student • Developer • AI/ML', short_bio: "I'm a computer science student interested in building intelligent systems that solve meaningful, human problems.", availability_status: 'Available to collaborate', github_url: '', linkedin_url: '', email: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile`)
      .then(res => res.json())
      .then(data => { if (data && data.full_name) setProfile(data) })
      .catch(console.error)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(profile)
      })
      if (!res.ok) throw new Error("Failed to save profile text")

      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        const photoRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/photo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
          body: formData
        })
        if (!photoRes.ok) throw new Error("Failed to upload photo")
      }
      addToast("success", "Profile saved", "Your profile changes have been published.")
    } catch (err: any) {
      alert(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="management">
      <div className="management-top">
        <div>
          <h2>Manage Profile & Hero Photo</h2>
          <p>Update your personal brand information, biography, and public profile photo.</p>
        </div>
        <Button icon="check" onClick={handleSave as any}>{loading ? "Saving..." : "Save changes"}</Button>
      </div>
      <div className="admin-form" style={{ width: "100%", margin: "30px 0", boxShadow: "none" }}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <label>Full Name<input value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} required /></label>
            <label>Title / Headline<input value={profile.headline || ''} onChange={e => setProfile({ ...profile, headline: e.target.value })} required /></label>
          </div>
          <div className="form-grid">
            <label>Availability Status<input value={profile.availability_status || ''} onChange={e => setProfile({ ...profile, availability_status: e.target.value })} /></label>
            <label>Email<input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label>
          </div>
          <div className="form-grid">
            <label>GitHub URL<input type="url" value={profile.github_url || ''} onChange={e => setProfile({ ...profile, github_url: e.target.value })} /></label>
            <label>LinkedIn URL<input type="url" value={profile.linkedin_url || ''} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} /></label>
          </div>
          <label>Hero Profile Photo
            <div className="upload-zone" style={{ minHeight: "150px", position: "relative", cursor: "pointer" }}>
              <input type="file" onChange={e => e.target.files && setFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept=".jpg,.jpeg,.png,.webp" />
              <Icon name="upload" size={24} />
              <span><b>{file ? file.name : "Click to upload new profile photo"}</b> {file ? "" : "or drag and drop"}</span>
              <small>PNG or JPG up to 5MB (Recommended size: 800x1000px)</small>
            </div>
          </label>
          <label>Short Bio<textarea value={profile.short_bio || ''} onChange={e => setProfile({ ...profile, short_bio: e.target.value })} rows={3} /></label>

          <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <h3>About Me Section</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>Update the content shown in the 'About Me' section of your portfolio.</p>

          <div className="form-grid">
            <label>About Title (Max 60 chars)
              <input value={profile.about_title || ''} maxLength={60} onChange={e => setProfile({ ...profile, about_title: e.target.value })} placeholder="Curious by nature. Intentional by design." />
            </label>
            <label>Technologies (Comma separated)
              <input value={profile.technologies || ''} onChange={e => setProfile({ ...profile, technologies: e.target.value })} placeholder="Python, TypeScript, React" />
            </label>
          </div>

          <label>About Lead Paragraph (Max 150 chars)
            <textarea value={profile.about_lead || ''} maxLength={150} onChange={e => setProfile({ ...profile, about_lead: e.target.value })} rows={2} placeholder="I'm a computer science student..." />
          </label>

          <label>About Body (Paragraphs)
            <textarea value={profile.about_body || ''} onChange={e => setProfile({ ...profile, about_body: e.target.value })} rows={6} placeholder="I enjoy moving between learning and building..." />
          </label>

          <label>Areas of Interest (Comma separated)
            <input value={profile.interests || ''} onChange={e => setProfile({ ...profile, interests: e.target.value })} placeholder="Applied AI, Computer Vision, Open Source" />
          </label>
        </form>
      </div>
    </div>
  )
}

function MessagesAdmin({ session, addToast }: { session: Session | null; addToast: (type: any, title: string, msg?: string) => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<any>(null)

  const fetchMessages = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/messages`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const toggleRead = async (id: string, current: boolean) => {
    if (!session) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ is_read: !current })
      })
      fetchMessages()
    } catch (e) { console.error(e) }
  }

  const deleteMessage = async (id: string) => {
    if (!session || !confirm("Delete this message?")) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      addToast('success', 'Message deleted')
      setViewing(null)
      fetchMessages()
    } catch (e) { console.error(e) }
  }

  return <div className="management">
    <div className="management-top">
      <div><h2>Messages</h2><p>View contact messages and inquiries.</p></div>
    </div>
    
    {viewing ? (
      <div className="admin-form" style={{ width: "100%", margin: "30px 0", boxShadow: "none", background: "var(--bg-card)", padding: "30px", borderRadius: "12px" }}>
        <button onClick={() => setViewing(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Back to messages
        </button>
        <h3>{viewing.sender_name}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{viewing.sender_email} • {new Date(viewing.created_at).toLocaleString()}</p>
        <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {viewing.message}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <Button icon="check" onClick={() => { toggleRead(viewing.id, viewing.is_read); setViewing(null) }}>Mark as {viewing.is_read ? 'unread' : 'handled'}</Button>
          <button onClick={() => deleteMessage(viewing.id)} style={{ padding: '10px 20px', color: 'red', border: '1px solid red', borderRadius: '30px', background: 'transparent', cursor: 'pointer' }}>Delete</button>
        </div>
        <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Delivery Status: {viewing.delivery_status} {viewing.delivery_error && `(${viewing.delivery_error})`}
        </div>
      </div>
    ) : (
      <div className="data-table" style={{ marginTop: '20px' }}>
        <div className="table-head">
          <span>Sender</span>
          <span>Message</span>
          <span>Date</span>
          <span>Status</span>
          <span />
        </div>
        {loading ? <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div> : messages.length === 0 ? <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>No messages yet.</div> : messages.map((m) => (
          <div className="table-row" key={m.id} style={{ opacity: m.is_read ? 0.6 : 1, cursor: 'pointer' }} onClick={() => setViewing(m)}>
            <div className="row-title">
              <div className={`row-thumb thumb-0`} style={{ background: m.is_read ? 'transparent' : 'var(--accent)' }}><Icon name="mail" /></div>
              <span><b>{m.sender_name}</b><small>{m.sender_email}</small></span>
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{m.message}</span>
            <span className="table-ts">{new Date(m.created_at).toLocaleDateString()}</span>
            <span><i className={m.is_read ? "published-dot" : "draft-dot"} />{m.is_read ? 'Handled' : 'New'}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={(e) => { e.stopPropagation(); deleteMessage(m.id) }} style={{ color: 'red' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
}

function AdminDashboard({ session }: { session: Session | null }) {
  const [section, setSection] = useState("Overview")
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Project | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const addToast = useCallback((type: ToastData["type"], title: string, msg?: string) => {
    setToasts(t => [...t, { id: ++_tid, type, title, msg }])
  }, [])
  const dismissToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), [])
  const openNewEntry = () => {
    setEditingEntry(null)
    setShowForm(true)
  }
  const [overviewCounts, setOverviewCounts] = useState<Record<string, number>>({ projects: 0, certifications: 0, hackathons: 0, achievements: 0 })
  useEffect(() => {
    if (!session) return
    const headers = { 'Authorization': `Bearer ${session.access_token}` }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    Promise.all([
      fetch(`${base}/api/admin/projects`, { headers }).then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
      fetch(`${base}/api/admin/certifications`, { headers }).then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
      fetch(`${base}/api/admin/hackathons`, { headers }).then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
      fetch(`${base}/api/admin/achievements`, { headers }).then(r => r.json()).then(d => Array.isArray(d) ? d.length : 0).catch(() => 0),
    ]).then(([p, c, h, a]) => setOverviewCounts({ projects: p, certifications: c, hackathons: h, achievements: a }))
  }, [session, section])
  const cards = [
    ["Certifications", String(overviewCounts.certifications).padStart(2, '0'), "Total entries", "award"]
  ] as [string, string, string, IconName][]

  return <div className="admin">
    <aside>
      <a className="logo" href="/">P<span>.</span></a>
      <div className="admin-profile">
        <div className="avatar">P</div>
        <div><b>Pranav</b><span>Portfolio admin</span></div>
      </div>
      <nav>
        {adminSections.map(([label, icon]) => (
          <button className={section === label ? "active" : ""} onClick={() => setSection(label)} key={label}>
            <Icon name={icon} />{label}
          </button>
        ))}
      </nav>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
        <a className="view-site" href="/"><Icon name="external" />View public site</a>
        <button className="view-site" style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }} onClick={() => supabase.auth.signOut()}>
          <Icon name="x" size={14} /> Sign out
        </button>
      </div>
    </aside>

    <main>
      <header>
        <div>
          <span className="mini-label">Private workspace</span>
          <h1>{section}</h1>
        </div>
        <div className="admin-header-actions">
          <button className="icon-button" aria-label="Search"><Icon name="search" /></button>
          <Button icon="plus" onClick={openNewEntry}>Add new</Button>
          <div className="avatar">P</div>
        </div>
      </header>

      {section === "Overview" ? (
        <>
          <div className="welcome-strip">
            <div>
              <span>{formatWelcomeDate()}</span>
              <h2>Good morning, Pranav.</h2>
              <p>Here's what's happening with your portfolio today.</p>
            </div>
            <div className="live-status"><i />Portfolio is live</div>
          </div>

          <div className="stat-grid">
            {cards.map(([label, count, detail, icon]) => (
              <article key={label}>
                <div><span>{label}</span><div className="stat-icon"><Icon name={icon} /></div></div>
                <strong>{count}</strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>

          <div className="admin-columns">
            <section className="activity-panel">
              <div className="panel-title">
                <div><h3>Recent activity</h3><p>Latest updates across your portfolio</p></div>
                <button>View all <Icon name="arrow" size={14} /></button>
              </div>
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Activity will appear here as you manage your portfolio.</p>
              </div>
            </section>

            <section className="quick-panel">
              <div className="panel-title"><div><h3>Quick actions</h3><p>Fast management</p></div></div>
              <button onClick={() => setSection("Profile & Photo")}>
                <div className="activity-icon"><Icon name="user" /></div>
                <span><b>Update profile photo</b><small>Replace main hero portrait</small></span>
                <Icon name="chevron" size={14} />
              </button>
              <button onClick={openNewEntry}>
                <div className="activity-icon"><Icon name="upload" /></div>
                <span><b>Replace resume PDF</b><small>Upload latest resume version</small></span>
                <Icon name="chevron" size={14} />
              </button>
            </section>
          </div>
        </>
      ) : section === "Profile & Photo" ? (
        <ProfileEditor session={session} addToast={addToast} />
      ) : section === "Messages" ? (
        <MessagesAdmin session={session} addToast={addToast} />
      ) : (
        <ManagementPage section={section} session={session} onAdd={openNewEntry} onEdit={(project) => { setEditingEntry(project); setShowForm(true) }} />
      )}

      {showForm && <AdminForm section={section} session={session} entry={editingEntry} onClose={() => { setShowForm(false); setEditingEntry(null) }} onSave={() => addToast("success", editingEntry ? "Changes saved" : "Entry published", editingEntry ? "Your updates are now live." : "New entry has been published.")} />}
    </main>
    <Toasts items={toasts} dismiss={dismissToast} />
  </div>
}

function ManagementPage({ section, session, onAdd, onEdit }: { section: string; session: Session | null; onAdd: () => void; onEdit: (project: Project) => void }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!["Projects", "Certifications", "Hackathons", "Achievements", "Resume"].includes(section) || !session) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      let endpoint = section === "Resume" ? '/api/admin/resumes' : `/api/admin/${section.toLowerCase()}`
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const result = await res.json()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [section, session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!session || !confirm(`Are you sure you want to delete this ${section === "Resume" ? "resume" : section.slice(0, -1).toLowerCase()}?`)) return
    try {
      let endpoint = section === "Resume" ? `/api/resumes/${id}` : `/api/${section.toLowerCase()}/${id}`
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  return <div className="management">
    <div className="management-top">
      <div>
        <h2>Manage {section.toLowerCase()}</h2>
        <p>Create, edit, organize, and control what appears publicly on your portfolio.</p>
      </div>
      <Button icon="plus" onClick={onAdd}>Add {section.replace(/s$/, "")}</Button>
    </div>
    <div className="management-tools">
      <div className="search-box">
        <Icon name="search" size={16} />
        <input placeholder={`Search ${section.toLowerCase()}...`} />
      </div>
      <button>Visibility <Icon name="chevron" size={14} /></button>
    </div>
    <div className="data-table">
      <div className="table-head">
        <span>Title</span>
        <span>Category</span>
        <span>Updated</span>
        <span>Status</span>
        <span />
      </div>
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
          No {section.toLowerCase()} found.
        </div>
      ) : data.map((row) => (
        <div className="table-row" key={row.id}>
          <div className="row-title">
            <div className={`row-thumb thumb-0`}><Icon name={section === "Projects" ? "code" : section === "Certifications" ? "award" : section === "Hackathons" ? "briefcase" : section === "Resume" ? "download" : "spark"} /></div>
            <span><b>{row.title || row.event_name || 'Resume'}</b><small>Portfolio item</small></span>
          </div>
          <span>{row.category || section}</span>
          <span className="table-ts">{new Date(row.updated_at).toLocaleDateString()}</span>
          <span><i className={row.visibility === "Published" ? "published-dot" : "draft-dot"} />{row.visibility || 'Draft'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onEdit(row)} aria-label={`Edit ${row.title}`}>Edit</button>
            <button onClick={() => handleDelete(row.id)} aria-label={`Delete ${row.title}`} style={{ color: 'red' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
}

function AdminForm({ section, session, entry, onClose, onSave }: { section: string; session: Session | null; entry?: any; onClose: () => void; onSave?: () => void }) {
  const isProject = section === "Projects"
  const isCert = section === "Certifications"
  const isHackathon = section === "Hackathons"
  const isAchievement = section === "Achievements"
  const isResume = section === "Resume"
  
  const [formData, setFormData] = useState<any>(entry || {
    title: '', description: '', category: '', tech_stack: [],
    github_url: '', live_demo_url: '', organization: '', other_url: '', visibility: 'Published',
    issuer: '', issue_date: '', credential_url: '',
    event_name: '', event_year: '', project_name: '', role: '', result: '', event_link: '', project_link: '',
    achievement_date: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      onClose()
      return
    }
    setLoading(true)
    
    try {
      let endpoint = `/api/${section.toLowerCase() === 'resume' ? 'resumes' : section.toLowerCase()}`
      const url = entry 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}/${entry.id}` 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}`
      
      const requiresUpload = isProject || isCert || isResume
      
      let fetchOptions: RequestInit = {
        method: entry ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }

      if (requiresUpload) {
        const data = new FormData()
        if (isProject) {
          data.append("title", formData.title)
          data.append("description", formData.description)
          data.append("category", formData.category)
          data.append("tech_stack", Array.isArray(formData.tech_stack) ? formData.tech_stack.join(',') : formData.tech_stack)
          if (formData.project_date) data.append("project_date", formData.project_date)
          if (formData.github_url) data.append("github_url", formData.github_url)
          if (formData.live_demo_url) data.append("live_demo_url", formData.live_demo_url)
          if (formData.organization) data.append("organization", formData.organization)
          if (formData.other_url) data.append("other_url", formData.other_url)
          data.append("visibility", formData.visibility)
        } else if (isCert) {
          data.append("title", formData.title)
          data.append("issuer", formData.issuer)
          data.append("issue_date", formData.issue_date)
          data.append("category", formData.category)
          if (formData.credential_url) data.append("credential_url", formData.credential_url)
          data.append("visibility", formData.visibility)
        } else if (isResume) {
          data.append("title", formData.title)
          data.append("visibility", formData.visibility)
        }
        if (file) data.append("file", file)
        fetchOptions.body = data
      } else {
        fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' }
        if (isHackathon) {
          fetchOptions.body = JSON.stringify({
            event_name: formData.event_name,
            event_year: formData.event_year,
            project_name: formData.project_name,
            role: formData.role,
            result: formData.result,
            tech_stack: formData.tech_stack,
            description: formData.description,
            event_link: formData.event_link,
            project_link: formData.project_link,
            visibility: formData.visibility
          })
        } else if (isAchievement) {
          fetchOptions.body = JSON.stringify({
            title: formData.title,
            description: formData.description,
            achievement_date: formData.achievement_date,
            category: formData.category,
            visibility: formData.visibility
          })
        }
      }
      
      const res = await fetch(url, fetchOptions)
      if (res.ok) {
        onSave?.()
        onClose()
      } else {
        const error = await res.json()
        alert(`Error: ${JSON.stringify(error)}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <div className="modal-backdrop admin-modal-wrap" onMouseDown={onClose}>
    <div className="admin-form" onMouseDown={e => e.stopPropagation()}>
      <header>
        <div>
          <span className="mini-label">{entry ? "Edit entry" : "New entry"}</span>
          <h2>{entry ? "Edit" : "Add"} {section}</h2>
        </div>
        <button onClick={onClose} aria-label="Close"><Icon name="x" /></button>
      </header>
      <form onSubmit={handleSubmit}>
        {(isProject || isCert || isAchievement || isResume) && <div className="form-grid">
          <label>Title<input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={`Enter ${section.toLowerCase()} title`} required /></label>
          {!isResume && <label>Category<input value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Type category..." required /></label>}
        </div>}
        
        {isHackathon && <div className="form-grid">
          <label>Event Name<input value={formData.event_name || ''} onChange={e => setFormData({...formData, event_name: e.target.value})} placeholder="e.g. HackVerse 5.0" required /></label>
          <label>Event Year/Date<input value={formData.event_year || ''} onChange={e => setFormData({...formData, event_year: e.target.value})} placeholder="e.g. 2025 or Sept 2024" required /></label>
        </div>}

        {isHackathon && <div className="form-grid">
          <label>Project Name<input value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} placeholder="e.g. NeuraNotes" required /></label>
          <label>Role<input value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Full-stack Developer" required /></label>
        </div>}
        
        {(isProject || isHackathon || isAchievement) && <label>Description<textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Write a clear, concise description..." rows={4} required={isAchievement || isProject} /></label>}
        
        {isCert && <div className="form-grid">
          <label>Issuer<input value={formData.issuer || ''} onChange={e => setFormData({...formData, issuer: e.target.value})} placeholder="e.g. AWS, Coursera" required /></label>
          <label>Issue Date<input type="date" value={formData.issue_date?.split('T')[0] || ''} onChange={e => setFormData({...formData, issue_date: e.target.value})} required /></label>
        </div>}

        {isAchievement && <div className="form-grid">
          <label>Achievement Date<input type="date" value={formData.achievement_date?.split('T')[0] || ''} onChange={e => setFormData({...formData, achievement_date: e.target.value})} required /></label>
        </div>}

        {(isProject || isHackathon) && <div className="form-grid">
          <label>Tags / Technologies (comma separated)<input value={Array.isArray(formData.tech_stack) ? formData.tech_stack.join(', ') : formData.tech_stack || ''} onChange={e => setFormData({...formData, tech_stack: e.target.value as any})} placeholder="React, Python, PyTorch" required={isHackathon} /></label>
          {isProject && <label>Project Date<input type="date" value={formData.project_date?.split('T')[0] || ''} onChange={e => setFormData({...formData, project_date: e.target.value})} /></label>}
          {isHackathon && <label>Result <small>Optional</small><input value={formData.result || ''} onChange={e => setFormData({...formData, result: e.target.value})} placeholder="e.g. Winner, Top 10" /></label>}
        </div>}
        
        {isCert && <label>Credential URL <small>Optional</small><input type="url" value={formData.credential_url || ''} onChange={e => setFormData({...formData, credential_url: e.target.value})} placeholder="https://..." /></label>}

        {(isProject || isCert || isResume) && <label>{isResume ? "Resume PDF upload" : "Cover image / File upload"}
          <div className="upload-zone" style={{ cursor: 'pointer', position: 'relative' }}>
            <input type="file" onChange={e => e.target.files && setFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept={isResume ? ".pdf" : isCert ? ".jpg,.jpeg,.png,.webp,.pdf" : ".jpg,.jpeg,.png,.webp"} required={isResume && !entry} />
            <Icon name="upload" />
            <span><b>{file ? file.name : "Click to upload"}</b> {file ? "" : "or drag and drop"}</span>
            <small>{isResume ? "PDF up to 10MB" : isCert ? "PNG, JPG or PDF up to 10MB" : "PNG or JPG up to 5MB"}</small>
          </div>
        </label>}

        {isHackathon && <fieldset className="project-links-fields">
          <div className="form-section-heading">
            <div><span className="mini-label">Hackathon Links</span><h3>Code & Event details</h3></div>
          </div>
          <div className="form-grid">
            <label>Project URL <small>Optional</small><input type="url" value={formData.project_link || ''} onChange={e => setFormData({...formData, project_link: e.target.value})} placeholder="https://github.com/..." /></label>
            <label>Event URL <small>Optional</small><input type="url" value={formData.event_link || ''} onChange={e => setFormData({...formData, event_link: e.target.value})} placeholder="https://devpost.com/..." /></label>
          </div>
        </fieldset>}

        {isProject && <fieldset className="project-links-fields">
          <div className="form-section-heading">
            <div>
              <span className="mini-label">Project links</span>
              <h3>Code, demos & attribution</h3>
            </div>
            <p>GitHub and Live Demo are independent. Leave optional fields empty when they don't apply.</p>
          </div>
          <div className="form-grid">
            <label>GitHub Repository<input type="url" value={formData.github_url || ''} onChange={e => setFormData({...formData, github_url: e.target.value})} placeholder="https://github.com/username/project" /></label>
            <label>Live Demo URL <small>Optional</small><input type="url" value={formData.live_demo_url || ''} onChange={e => setFormData({...formData, live_demo_url: e.target.value})} placeholder="https://project.example.com" /></label>
          </div>
          <div className="form-grid">
            <label>Organization <small>Optional</small><input value={formData.organization || ''} onChange={e => setFormData({...formData, organization: e.target.value})} placeholder="College club, company, research group..." /></label>
            <label>Other Link <small>Optional</small><input type="url" value={formData.other_url || ''} onChange={e => setFormData({...formData, other_url: e.target.value})} placeholder="Documentation, video, article, or prototype" /></label>
          </div>
        </fieldset>}
        <div className="form-grid">
          <label>Visibility
            <select value={formData.visibility || 'Published'} onChange={e => setFormData({...formData, visibility: e.target.value})}>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Private">Private</option>
            </select>
          </label>
        </div>
        <footer>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="check">{loading ? 'Saving...' : `Save ${entry ? "changes" : section}`}</Button>
        </footer>
      </form>
    </div>
  </div>
}

function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthorization = async (currentSession: Session | null) => {
      if (!currentSession) {
        setIsAuthorized(false)
        setLoading(false)
        return
      }
      // Check if user is in admin_users table (protected by RLS)
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', currentSession.user.id)
        .single()
      
      if (data && !error) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
      setLoading(false)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      checkAuthorization(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(true) // Re-evaluate auth status on change
      checkAuthorization(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="login-page">
      <div className="login-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <p>Loading session...</p>
      </div>
    </div>
  }

  if (!session) {
    return <AdminLogin />
  }

  if (!isAuthorized) {
    return (
      <div className="login-page">
        <div className="login-glow" />
        <a className="logo admin-logo" href="/">P<span>.</span></a>
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="login-icon" style={{ background: "#fde8e8", color: "#d9534f" }}><Icon name="lock" /></div>
          <h1>Access Denied</h1>
          <p>You are authenticated, but you do not have owner/admin privileges to access this dashboard.</p>
          <div style={{ marginTop: "20px" }}>
            <Button onClick={() => supabase.auth.signOut()} icon="x" variant="secondary">Sign out</Button>
          </div>
        </div>
      </div>
    )
  }

  return <AdminDashboard session={session} />
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.pathname.startsWith("/admin"))
  useEffect(() => {
    const onPop = () => setIsAdmin(window.location.pathname.startsWith("/admin"))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])
  return isAdmin ? <AdminApp /> : <PublicPortfolio />
}
