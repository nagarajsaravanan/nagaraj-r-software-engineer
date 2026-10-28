import { useState, useEffect } from 'react'
import profilePhoto from './assets/profile.jpeg'
import signatureImg from './assets/signature.png'
import './App.css'

type ThemeMode = 'luminous' | 'monochrome' | 'executive' | 'cyber'
type ViewMode = 'website' | 'resume'

// Pure top-level constants for stable rendering & React compiler compliance
const CURRENT_YEAR = new Date().getFullYear()
const RESUME_DATE = new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

export default function App() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nagaraj_portfolio_theme')
    if (saved === 'midnight' || saved === 'sandstone' || saved === 'blush' || saved === 'rose') return 'monochrome'
    if (saved === 'lavender') return 'executive'
    return (saved as ThemeMode) || 'luminous'
  })
  const [viewMode, setViewMode] = useState<ViewMode>('website')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    localStorage.setItem('nagaraj_portfolio_theme', newTheme)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const [downloadState, setDownloadState] = useState<'idle' | 'generating' | 'success'>('idle')

  const handleDownloadResume = async () => {
    if (downloadState === 'generating') return
    setDownloadState('generating')

    try {
      // 1. Check if a pre-compiled static PDF exists in /public (e.g. Nagaraj_R_Resume.pdf)
      const staticCandidates = [
        '/Nagaraj_R_Senior_Software_Engineer_Resume.pdf',
        '/Nagaraj_R_Resume.pdf'
      ]

      for (const candidate of staticCandidates) {
        try {
          const res = await fetch(candidate, { method: 'HEAD' })
          if (res.ok && res.headers.get('content-type')?.includes('pdf')) {
            const link = document.createElement('a')
            link.href = candidate
            link.download = 'Nagaraj_R_Senior_Software_Engineer_Resume.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setDownloadState('success')
            setTimeout(() => setDownloadState('idle'), 2500)
            return
          }
        } catch {
          // Continue to next candidate or generator
        }
      }

      // 2. High-fidelity client-side PDF generation from .resume-sheet
      const resumeEl = document.querySelector<HTMLElement>('.resume-sheet')
      if (!resumeEl) {
        window.print()
        setDownloadState('idle')
        return
      }

      // Ensure html2pdf is available
      let html2pdf = (window as any).html2pdf
      if (!html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          script.onload = () => resolve(true)
          script.onerror = () => reject(new Error('Failed to load html2pdf'))
          document.head.appendChild(script)
        })
        html2pdf = (window as any).html2pdf
      }

      if (!html2pdf) {
        window.print()
        setDownloadState('idle')
        return
      }

      // Apply PDF export class for pristine white ATS styling regardless of active theme
      resumeEl.classList.add('pdf-export-mode')

      const opt = {
        margin: [8, 8, 8, 8],
        filename: 'Nagaraj_R_Senior_Software_Engineer_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf().set(opt).from(resumeEl).save()
      resumeEl.classList.remove('pdf-export-mode')

      setDownloadState('success')
      setTimeout(() => setDownloadState('idle'), 2500)
    } catch (err) {
      console.error('Error generating PDF:', err)
      const resumeEl = document.querySelector<HTMLElement>('.resume-sheet')
      if (resumeEl) resumeEl.classList.remove('pdf-export-mode')
      // Fallback to browser print dialog
      window.print()
      setDownloadState('idle')
    }
  }

  const themes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'luminous', label: 'Luminous', icon: '☀️' },
    { id: 'monochrome', label: 'Monochrome', icon: '⚪' },
    { id: 'executive', label: 'Executive', icon: '👔' },
    { id: 'cyber', label: 'Cyber', icon: '⚡' },
  ]



  // Technical Skills Data (8 Core Domains)
  const technicalSkills = [
    {
      category: 'Programming Languages',
      badge: 'Core Syntax & Typing',
      skills: ['JavaScript (ES6+)', 'TypeScript'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    },
    {
      category: 'Frontend Development',
      badge: 'UI, State & Responsive Systems',
      skills: ['React.js', 'Redux', 'HTML5', 'CSS3', 'SCSS', 'Tailwind CSS'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse>
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"></ellipse>
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse>
        </svg>
      )
    },
    {
      category: 'Backend Development',
      badge: 'APIs, Streaming & In-Memory Caching',
      skills: ['Node.js', 'Express.js', 'REST APIs', 'Microservices', 'Redis', 'Apache Kafka', 'Elasticsearch'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      )
    },
    {
      category: 'Databases',
      badge: 'SQL, NoSQL & Distributed Storage',
      skills: ['MongoDB', 'MySQL', 'Cassandra', 'Vertica'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      )
    },
    {
      category: 'Cloud & DevOps',
      badge: 'Cloud Infrastructure & CI/CD Pipelines',
      skills: ['AWS', 'Firebase', 'Docker', 'Git', 'CI/CD'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        </svg>
      )
    },
    {
      category: 'Testing & Code Quality',
      badge: 'Automated QA & Static Governance',
      skills: ['Jest', 'Mocha', 'Chai.js', 'SonarQube'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      category: 'Architecture & Engineering',
      badge: 'Distributed Systems, R&D & PoCs',
      skills: ['Microservices Architecture', 'R&D', 'PoC Development'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      )
    },
    {
      category: 'Project Management',
      badge: 'Agile Cadence & Sprint Execution',
      skills: ['Agile Methodology', 'User Story Writing', 'Sub-task Breakdown', 'Sprint Planning & Execution'],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      )
    }
  ]

  // Experience Data
  const experiences = [
    {
      role: 'Senior Software Development Engineer',
      company: 'Sutherland Global Solutions (Client: Philips)',
      period: 'June 2024 – April 2025',
      duration: '11 mos',
      highlights: [
        'Architected and delivered high-availability enterprise web modules using React.js and Node.js for Philips.',
        'Optimized MongoDB aggregation queries and Express REST APIs to reduce data latency.',
        'Engineered a reusable React component library, boosting UI consistency and delivery speed across sprint teams.',
        'Maintained high code quality through active peer code reviews and clean architecture standards.'
      ],
      tags: ['Enterprise Web', 'React.js', 'Node.js', 'MongoDB', 'REST APIs', 'Agile']
    },
    {
      role: 'Software Development Engineer G II',
      company: 'Contus Tech',
      period: 'November 2019 – May 2024',
      duration: '4 yrs 7 mos',
      highlights: [
        'Developed core VPlayed OTT streaming features including custom video player controls, subtitles, audio track switching, and live broadcasting.',
        'Built event-driven microservices with Node.js and Apache Kafka for user authentication, licensing, and automated subscriptions.',
        'Integrated Redis caching and Elasticsearch to handle high-traffic content discovery with sub-10ms response times.',
        'Configured cloud infrastructure on AWS and implemented multi-currency payment gateways (Stripe, PayPal, Razorpay).'
      ],
      tags: ['VPlayed OTT', 'Streaming Media', 'Microservices', 'Apache Kafka', 'Redis', 'Elasticsearch', 'AWS']
    },
    {
      role: 'Junior Software Developer',
      company: 'Askan Tech',
      period: 'December 2018 – July 2019',
      duration: '8 mos',
      highlights: [
        'Built dynamic web application modules and customized database schemas using PHP (Laravel, CodeIgniter) and Vue.js.',
        'Collaborated on production feature enhancements, bug resolution, and unit testing to ensure reliable deployment.'
      ],
      tags: ['PHP', 'Laravel', 'CodeIgniter', 'Vue.js', 'MySQL']
    }
  ]

  // Enterprise Featured Projects Data
  const projects = [
    {
      title: 'VPlayed – OTT Streaming Platform',
      client: 'Contus Tech | 4+ Years',
      tagline: 'Enterprise SaaS-based OTT platform enabling broadcasters and content owners to manage, stream, and monetize live and on-demand video content.',
      technologies: ['React.js', 'Angular', 'Node.js', 'Express.js', 'MongoDB', 'AWS', 'Redis', 'Kafka', 'Elasticsearch'],
      badge: 'OTT & Microservices',
      highlights: [
        'Developed scalable OTT modules including content management, video workflows, subscriptions, and user management.',
        'Built backend services and REST APIs using Node.js and Express.js with microservices architecture.',
        'Integrated AWS media services, payment gateways, caching, and search solutions to improve platform scalability.'
      ]
    },
    {
      title: 'Digital Twin Coil – Philips Healthcare',
      client: 'Philips Healthcare',
      tagline: 'Enterprise healthcare analytics platform for monitoring MRI coil performance and operational insights.',
      technologies: ['React.js', 'Redux', 'Node.js', 'Express.js', 'MongoDB', 'Vertica'],
      badge: 'Healthcare Analytics',
      highlights: [
        'Developed interactive dashboards to visualize healthcare equipment performance and analytics data.',
        'Built REST APIs for data aggregation, filtering, and reporting workflows.',
        'Optimized database queries and application performance for faster data visualization.'
      ]
    },
    {
      title: 'Daily Management Board – Philips Healthcare',
      client: 'Philips Healthcare',
      tagline: 'Enterprise KPI management platform used for tracking operational metrics and business performance.',
      technologies: ['React.js', 'Redux', 'Node.js', 'Express.js', 'MongoDB'],
      badge: 'Operational Telemetry & KPIs',
      highlights: [
        'Developed KPI dashboards with data visualization and reporting capabilities.',
        'Implemented backend APIs for KPI management, user access, and configuration workflows.',
        'Improved application usability through reusable React components and optimized API integration.'
      ]
    },
    {
      title: 'Kripalunidhi (JKP) – Spiritual Content Platform',
      client: 'Spiritual Content Platform',
      tagline: 'Subscription-based content streaming platform supporting digital content delivery.',
      technologies: ['React.js', 'Redux', 'Node.js', 'Express.js', 'MongoDB', 'AWS S3'],
      badge: 'Digital Content Delivery',
      highlights: [
        'Developed responsive web applications for users and administrators.',
        'Built APIs for content management, user management, and subscription workflows.',
        'Integrated cloud storage solutions for scalable content delivery.'
      ]
    }
  ]

  // Awards & Recognition Data
  const awards = [
    {
      title: 'Multi Tech Wizard Award',
      year: '2021',
      issuer: 'Contus Tech',
      description: 'Recognized for technical excellence, adaptability across multiple technologies, and consistent contribution to project delivery.',
      badge: 'Technical Excellence',
      icon: '🏆'
    }
  ]

  // Education Data
  const education = [
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'Achariya Arts and Science College',
      university: 'Pondicherry University',
      period: '2015 – 2018'
    }
  ]

  // Spoken Languages Data
  const languages = [
    { language: 'English', proficiency: 'Professional Working Proficiency' },
    { language: 'Tamil', proficiency: 'Native' },
    { language: 'Kannada', proficiency: 'Basic Conversational' }
  ]

  return (
    <div className="portfolio-app" data-theme={theme} data-view={viewMode}>
      {/* Ambient background glows */}
      <div className="ambient-light-light" />
      <div className="ambient-light-bottom" />

      {/* =========================================================================
          WEBSITE VIEW: STICKY DEDICATED NAVIGATION HEADER
          ========================================================================= */}
      {viewMode === 'website' && (
        <header className="website-nav-header">
          <div className="nav-container">
            {/* Brand Monogram & Title */}
            <a href="#hero" className="nav-brand-group" title="Nagaraj R - Senior Systems Engineer">
              <div className="nav-monogram">NR</div>
              <div className="nav-brand-text">
                <span className="nav-brand-name">NAGARAJ R</span>
                <span className="nav-brand-role">Senior Systems Engineer</span>
              </div>
            </a>

            {/* In-Page Navigation Links */}
            <nav className="nav-links-menu" aria-label="Page Sections">
              <a href="#summary" className="nav-menu-link">Summary</a>
              <a href="#skills" className="nav-menu-link">Skills</a>
              <a href="#experience" className="nav-menu-link">Experience</a>
              <a href="#awards" className="nav-menu-link">Awards</a>
              <a href="#projects" className="nav-menu-link">Projects</a>
              <a href="#contact" className="nav-menu-link">Contact</a>
            </nav>

            {/* Quick Action Buttons & Mobile Hamburger */}
            <div className="nav-actions-wrap">
              {/* Header Theme Switcher Capsule */}
              <div className="nav-theme-switcher" role="radiogroup" aria-label="Select Color Theme">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`nav-theme-btn ${theme === t.id ? 'active' : ''}`}
                    onClick={() => handleThemeChange(t.id)}
                    title={`${t.label} Theme`}
                    aria-label={`${t.label} Theme`}
                    aria-checked={theme === t.id}
                  >
                    <span className="nav-theme-icon">{t.icon}</span>
                    <span className="nav-theme-tooltip">{t.label}</span>
                  </button>
                ))}
              </div>

              <button type="button" className="nav-resume-btn" onClick={() => setViewMode('resume')}>
                Resume
              </button>
              <a
                href="mailto:nagaraj.srvn@gmail.com?subject=Opportunity%20Discussion%20with%20Nagaraj%20R"
                className="nav-hire-btn"
                title="Send Email to Nagaraj"
              >
                Get In Touch
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                className={`mobile-menu-toggle-btn ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown Drawer */}
          {isMobileMenuOpen && (
            <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation Menu">
              <nav className="mobile-nav-links" aria-label="Mobile Navigation">
                <a href="#summary" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">📌</span>
                  <span>Summary</span>
                </a>
                <a href="#skills" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">⚡</span>
                  <span>Skills</span>
                </a>
                <a href="#experience" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">💼</span>
                  <span>Experience</span>
                </a>
                <a href="#awards" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">🏆</span>
                  <span>Awards</span>
                </a>
                <a href="#projects" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">🚀</span>
                  <span>Projects</span>
                </a>
                <a href="#contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="mobile-nav-icon">✉️</span>
                  <span>Contact</span>
                </a>
              </nav>

              <div className="mobile-nav-divider" />

              {/* Mobile Theme Switcher Bar */}
              <div className="mobile-theme-bar">
                <span className="mobile-theme-label">ACTIVE THEME</span>
                <div className="mobile-theme-chips">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`mobile-theme-chip ${theme === t.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(t.id)}
                    >
                      <span className="mobile-theme-icon">{t.icon}</span>
                      <span className="mobile-theme-name">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-nav-divider" />

              <div className="mobile-nav-actions">
                <button
                  type="button"
                  className="mobile-action-btn resume-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setViewMode('resume')
                  }}
                >
                  <span>📄 View Resume</span>
                </button>
                <a
                  href="mailto:nagaraj.srvn@gmail.com?subject=Opportunity%20Discussion%20with%20Nagaraj%20R"
                  className="mobile-action-btn hire-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Get In Touch</span>
                </a>
              </div>
            </div>
          )}
        </header>
      )}

      {/* =========================================================================
          VIEW 1: STANDARD WEBSITE VIEW
          ========================================================================= */}
      {viewMode === 'website' && (
        <>
          {/* TOP ATS IDENTITY BANNER */}
          <header id="hero" className="top-banner-header">
            <div className="banner-inner">
              <div className="hero-split-layout">
                {/* Left: Identity & High-Impact Value Proposition */}
                <div className="hero-main-col">
                  <div className="hero-eyebrow-row">
                    <div className="status-pill">
                      <span className="status-pulse-dot" />
                      <span>Available for Senior / Lead Roles</span>
                    </div>
                  </div>

                  <h1 className="commander-name">NAGARAJ R</h1>
                  <h2 className="commander-title">Senior Software Engineer</h2>

                  <p className="hero-tagline">
                    “The only way to do great work is to love what you do.” — <strong>Steve Jobs</strong>
                  </p>

                  {/* Primary Call-to-Actions */}
                  <div className="hero-actions-group">
                    <a href="mailto:nagaraj.srvn@gmail.com?subject=Opportunity%20Discussion%20with%20Nagaraj%20R" className="action-pill-btn primary">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Get In Touch
                    </a>
                    <button type="button" className="action-pill-btn" onClick={() => setViewMode('resume')}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Resume
                    </button>
                    <button type="button" className="action-pill-btn" onClick={() => copyToClipboard('nagaraj.srvn@gmail.com', 'email')}>
                      {copiedField === 'email' ? '✓ Copied Email' : '📋 Copy Email'}
                    </button>
                    <button type="button" className="action-pill-btn" onClick={() => copyToClipboard('+916374983448', 'phone')}>
                      {copiedField === 'phone' ? '✓ Copied Phone' : '📞 Copy Phone'}
                    </button>
                  </div>
                </div>

                {/* Right: Quick Connect & Key Highlights Card */}
                <div className="hero-connect-card">
                  <div className="connect-card-header">
                    <span className="connect-card-title">DIRECT CHANNELS & TELEMETRY</span>
                    <span className="connect-card-badge">● Live</span>
                  </div>

                  <div className="connect-channels-list">
                    <a href="mailto:nagaraj.srvn@gmail.com" className="channel-item" title="Send Email">
                      <div className="channel-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <div className="channel-text">
                        <span className="channel-name">Email</span>
                        <span className="channel-val">nagaraj.srvn@gmail.com</span>
                      </div>
                      <span className="channel-arrow">↗</span>
                    </a>

                    <a href="tel:+916374983448" className="channel-item" title="Call Phone">
                      <div className="channel-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className="channel-text">
                        <span className="channel-name">Phone</span>
                        <span className="channel-val">+91 6374983448</span>
                      </div>
                      <span className="channel-arrow">↗</span>
                    </a>

                    <a href="https://github.com/nagarajsaravanan" target="_blank" rel="noopener noreferrer" className="channel-item" title="GitHub Profile">
                      <div className="channel-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                      </div>
                      <div className="channel-text">
                        <span className="channel-name">GitHub</span>
                        <span className="channel-val">nagarajsaravanan</span>
                      </div>
                      <span className="channel-arrow">↗</span>
                    </a>

                    <a href="https://www.linkedin.com/in/nagaraj-r-385049147/" target="_blank" rel="noopener noreferrer" className="channel-item" title="LinkedIn Profile">
                      <div className="channel-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </div>
                      <div className="channel-text">
                        <span className="channel-name">LinkedIn</span>
                        <span className="channel-val">nagaraj-r-385049147</span>
                      </div>
                      <span className="channel-arrow">↗</span>
                    </a>
                  </div>

                  {/* Highlights Strip */}
                  <div className="hero-mini-kpi-row">
                    <div className="mini-kpi-item">
                      <strong>6+</strong>
                      <span>Years Exp</span>
                    </div>
                    <div className="mini-kpi-divider" />
                    <div className="mini-kpi-item">
                      <strong>4.7 Yrs</strong>
                      <span>Contus OTT</span>
                    </div>
                    <div className="mini-kpi-divider" />
                    <div className="mini-kpi-item">
                      <strong>16+</strong>
                      <span>Tech Stack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="content-container">
            {/* PROFESSIONAL SUMMARY SECTION */}
            <section id="summary" className="section-card summary-card" aria-labelledby="section-summary-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <h2 id="section-summary-title" className="section-title">
                    PROFESSIONAL SUMMARY
                  </h2>
                </div>
              </div>

              <div className="summary-body">
                <p className="summary-paragraph">
                  <strong>Senior MERN Stack Developer</strong> with <strong>6+ years</strong> of experience building scalable web applications, <strong>OTT platforms</strong>, and enterprise solutions using <strong>React.js</strong>, <strong>Node.js</strong>, <strong>Express.js</strong>, and <strong>MongoDB</strong>. Experienced in designing <strong>REST APIs</strong>, <strong>microservices</strong> and real-time applications. Strong background in product development, performance optimization, and delivering reliable applications using modern engineering practices.
                </p>
              </div>
            </section>

            {/* TECHNICAL SKILLS SECTION */}
            <section id="skills" className="section-card skills-card" aria-labelledby="section-skills-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <span className="section-subtitle">EXPERTISE TAXONOMY</span>
                  <h2 id="section-skills-title" className="section-title">
                    TECHNICAL SKILLS
                  </h2>
                </div>
                <div className="skills-count-badge">
                  <span>8 Core Domains</span>
                </div>
              </div>

              <div className="skills-category-grid">
                {technicalSkills.map((cat) => (
                  <div key={cat.category} className="skill-category-card">
                    <div className="skill-cat-header">
                      <div className="skill-cat-icon-box">{cat.icon}</div>
                      <div className="skill-cat-info">
                        <h3 className="skill-cat-name">{cat.category}</h3>
                        <span className="skill-cat-badge">{cat.badge}</span>
                      </div>
                    </div>
                    <div className="skill-tags-wrapper">
                      {cat.skills.map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PROFESSIONAL EXPERIENCE SECTION */}
            <section id="experience" className="section-card experience-card" aria-labelledby="section-experience-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <span className="section-subtitle">CAREER MILESTONES</span>
                  <h2 id="section-experience-title" className="section-title">
                    PROFESSIONAL EXPERIENCE
                  </h2>
                </div>
                <div className="skills-count-badge">
                  <span>3 Impactful Roles</span>
                </div>
              </div>

              <div className="experience-list">
                {experiences.map((exp, idx) => (
                  <article key={idx} className="experience-item-card">
                    <div className="exp-top-row">
                      <div className="exp-title-group">
                        <h3 className="exp-role">{exp.role}</h3>
                        <div className="exp-company-line">
                          <span className="exp-company">{exp.company}</span>
                        </div>
                      </div>
                      <div className="exp-period-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{exp.period}</span>
                        <span className="exp-duration-tag">• {exp.duration}</span>
                      </div>
                    </div>

                    <ul className="exp-bullet-list">
                      {exp.highlights.map((point, pIdx) => (
                        <li key={pIdx} className="exp-bullet-item">
                          <span className="bullet-indicator" />
                          <span className="bullet-text">{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="exp-tags-row">
                      {exp.tags.map((tag) => (
                        <span key={tag} className="exp-tech-pill">{tag}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* AWARDS & RECOGNITION SECTION */}
            <section id="awards" className="section-card awards-card" aria-labelledby="section-awards-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <span className="section-subtitle">HONORS & CITATIONS</span>
                  <h2 id="section-awards-title" className="section-title">
                    AWARDS & RECOGNITION
                  </h2>
                </div>
                <div className="skills-count-badge">
                  <span>Excellence Citation</span>
                </div>
              </div>

              <div className="awards-grid">
                {awards.map((award, idx) => (
                  <article key={idx} className="award-item-card">
                    <div className="award-trophy-badge">
                      <span className="award-trophy-icon">{award.icon}</span>
                    </div>
                    <div className="award-card-body">
                      <div className="award-meta-row">
                        <span className="award-badge-pill">{award.badge}</span>
                        <span className="award-year-tag">{award.year}</span>
                      </div>
                      <h3 className="award-title">{award.title}</h3>
                      <div className="award-issuer-line">
                        <span className="award-issuer">{award.issuer}</span>
                      </div>
                      <p className="award-desc">{award.description}</p>
                      <div className="award-tags-row">
                        <span className="award-tag-pill">Technical Excellence</span>
                        <span className="award-tag-pill">Cross-Stack Adaptability</span>
                        <span className="award-tag-pill">Consistent Delivery</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* FEATURED ENTERPRISE PROJECTS SECTION */}
            <section id="projects" className="section-card projects-card" aria-labelledby="section-projects-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <span className="section-subtitle">FLAGSHIP ARCHITECTURES</span>
                  <h2 id="section-projects-title" className="section-title">
                    FEATURED ENTERPRISE PROJECTS
                  </h2>
                </div>
                <div className="skills-count-badge">
                  <span>4 Enterprise Solutions</span>
                </div>
              </div>

              <div className="projects-grid">
                {projects.map((proj, idx) => (
                  <article key={idx} className="project-item-card">
                    <div className="proj-top-row">
                      <div className="proj-title-group">
                        <span className="proj-badge">{proj.badge}</span>
                        <h3 className="proj-title">{proj.title}</h3>
                        <span className="proj-client">{proj.client}</span>
                      </div>
                    </div>

                    <p className="proj-tagline">{proj.tagline}</p>

                    <div className="proj-highlights">
                      <span className="proj-highlights-label">Key Engineering Contributions:</span>
                      <ul className="proj-bullet-list">
                        {proj.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="proj-bullet-item">
                            <span className="bullet-indicator" />
                            <span className="bullet-text">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="proj-tech-stack">
                      {proj.technologies.map((t) => (
                        <span key={t} className="proj-tech-pill">{t}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* CONTACT & COLLABORATION SECTION */}
            <section id="contact" className="section-card contact-section-card" aria-labelledby="section-contact-title">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <span className="section-subtitle">LET'S CONNECT</span>
                  <h2 id="section-contact-title" className="section-title">
                    GET IN TOUCH & COLLABORATE
                  </h2>
                </div>
                <div className="skills-count-badge">
                  <span>● Open for Opportunities</span>
                </div>
              </div>

              <div className="contact-direct-wrap">
                <p className="contact-lead-text">
                  Whether you are architecting a high-throughput OTT streaming platform, modernizing distributed microservices, or assembling an elite full-stack engineering team — let's connect and build something extraordinary.
                </p>

                <div className="contact-cards-grid">
                  {/* Email Card */}
                  <div className="contact-channel-card">
                    <div className="contact-channel-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div className="contact-channel-body">
                      <span className="contact-channel-label">Direct Email</span>
                      <a href="mailto:nagaraj.srvn@gmail.com" className="contact-channel-link">
                        nagaraj.srvn@gmail.com
                      </a>
                    </div>
                    <button
                      type="button"
                      className="contact-copy-btn"
                      onClick={() => copyToClipboard('nagaraj.srvn@gmail.com', 'contact-email')}
                      title="Copy Email Address"
                    >
                      {copiedField === 'contact-email' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Phone Card */}
                  <div className="contact-channel-card">
                    <div className="contact-channel-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className="contact-channel-body">
                      <span className="contact-channel-label">Direct Phone & WhatsApp</span>
                      <a href="tel:+916374983448" className="contact-channel-link">
                        +91 6374983448
                      </a>
                    </div>
                    <button
                      type="button"
                      className="contact-copy-btn"
                      onClick={() => copyToClipboard('+916374983448', 'contact-phone')}
                      title="Copy Phone Number"
                    >
                      {copiedField === 'contact-phone' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Professional Network Links */}
                <div className="contact-social-row">
                  <a
                    href="https://www.linkedin.com/in/nagaraj-r-385049147/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill"
                    title="LinkedIn Profile"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                    <span>LinkedIn</span>
                    <span className="social-arrow">↗</span>
                  </a>

                  <a
                    href="https://github.com/nagarajsaravanan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill"
                    title="GitHub Profile"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    <span>GitHub</span>
                    <span className="social-arrow">↗</span>
                  </a>

                  <button
                    type="button"
                    className="contact-social-pill resume-cta"
                    onClick={() => setViewMode('resume')}
                    title="View Resume"
                  >
                    <span>📄 View Resume</span>
                  </button>
                </div>
              </div>
            </section>
          </main>

          {/* COMPREHENSIVE ENTERPRISE WEBSITE FOOTER */}
          <footer className="site-main-footer" role="contentinfo">
            <div className="footer-inner-container">
              {/* TOP TIER: 4-COLUMN STRATEGIC GRID */}
              <div className="footer-top-grid">
                {/* Column 1: Identity & Architect Overview */}
                <div className="footer-col-brand">
                  <a href="#hero" className="footer-brand-header" title="Nagaraj R - Senior Systems Engineer">
                    <div className="footer-monogram-lg">NR</div>
                    <div className="footer-brand-titles">
                      <span className="footer-brand-name">NAGARAJ R</span>
                      <span className="footer-brand-title">Senior Software Engineer</span>
                    </div>
                  </a>

                  <p className="footer-brand-bio">
                    The only way to do great work is to love what you do - Steve Jobs
                  </p>

                  <div className="footer-status-pill">
                    <span className="footer-status-dot">●</span>
                    <span>Open for High-Impact Technical Roles & Consultations</span>
                  </div>

                  <div className="footer-award-badge">
                    <span className="footer-award-icon">🏆</span>
                    <span>Multi Tech Wizard Award Winner • Contus Tech (2021)</span>
                  </div>
                </div>

                {/* Column 2: Navigation Shortcuts */}
                <div className="footer-col-nav">
                  <h4 className="footer-heading">NAVIGATION</h4>
                  <ul className="footer-nav-list">
                    <li><a href="#summary" className="footer-nav-link">Professional Summary</a></li>
                    <li><a href="#skills" className="footer-nav-link">Technical Capabilities</a></li>
                    <li><a href="#experience" className="footer-nav-link">Career Milestones</a></li>
                    <li><a href="#awards" className="footer-nav-link">Awards & Recognition</a></li>
                    <li><a href="#projects" className="footer-nav-link">Enterprise Projects</a></li>
                    <li><a href="#contact" className="footer-nav-link">Get In Touch</a></li>
                  </ul>
                </div>

                {/* Column 3: Flagship Systems & Architectures */}
                <div className="footer-col-systems">
                  <h4 className="footer-heading">FLAGSHIP ARCHITECTURES</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <a href="#projects" className="footer-nav-link system-link">
                        <strong>VPlayed OTT Platform</strong>
                        <span>Contus Tech • 4+ Years</span>
                      </a>
                    </li>
                    <li>
                      <a href="#projects" className="footer-nav-link system-link">
                        <strong>Digital Twin Coil</strong>
                        <span>Philips Healthcare</span>
                      </a>
                    </li>
                    <li>
                      <a href="#projects" className="footer-nav-link system-link">
                        <strong>Daily Management Board</strong>
                        <span>Philips Healthcare</span>
                      </a>
                    </li>
                    <li>
                      <a href="#projects" className="footer-nav-link system-link">
                        <strong>Kripalunidhi Platform</strong>
                        <span>JKP Spiritual Media</span>
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Direct Channels & Actions */}
                <div className="footer-col-connect">
                  <h4 className="footer-heading">DIRECT CONNECT</h4>

                  <div className="footer-contact-items">
                    <div className="footer-contact-item">
                      <span className="footer-contact-lbl">Email</span>
                      <div className="footer-contact-val-row">
                        <a href="mailto:nagaraj.srvn@gmail.com" className="footer-contact-link">
                          nagaraj.srvn@gmail.com
                        </a>
                        <button
                          type="button"
                          className="footer-mini-copy"
                          onClick={() => copyToClipboard('nagaraj.srvn@gmail.com', 'footer-email')}
                          title="Copy Email Address"
                        >
                          {copiedField === 'footer-email' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="footer-contact-item">
                      <span className="footer-contact-lbl">Phone & WhatsApp</span>
                      <div className="footer-contact-val-row">
                        <a href="tel:+916374983448" className="footer-contact-link">
                          +91 6374983448
                        </a>
                        <button
                          type="button"
                          className="footer-mini-copy"
                          onClick={() => copyToClipboard('+916374983448', 'footer-phone')}
                          title="Copy Phone Number"
                        >
                          {copiedField === 'footer-phone' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social & View Buttons */}
                  <div className="footer-actions-row">
                    <a
                      href="https://www.linkedin.com/in/nagaraj-r-385049147/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      title="LinkedIn Profile"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      <span>LinkedIn</span>
                      <span className="footer-btn-arrow">↗</span>
                    </a>

                    <a
                      href="https://github.com/nagarajsaravanan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      title="GitHub Profile"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                      <span>GitHub</span>
                      <span className="footer-btn-arrow">↗</span>
                    </a>

                    <button
                      type="button"
                      className="footer-social-btn resume-highlight"
                      onClick={() => setViewMode('resume')}
                      title="Switch to Resume View"
                    >
                      <span>📄 View Resume</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM TIER: COPYRIGHT & BACK-TO-TOP */}
              <div className="footer-bottom-row">
                <div className="footer-copyright-text">
                  © {CURRENT_YEAR} <strong>Nagaraj R</strong>. All rights reserved. Built with React, TypeScript & Vanilla CSS.
                </div>

                <div className="footer-tagline-text">
                  Engineered for High-Throughput & Extreme Performance
                </div>

                <a href="#hero" className="footer-back-to-top-btn" title="Back to Top">
                  <span>Back to Top</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* =========================================================================
          VIEW 2: PRINTABLE ATS RESUME VIEW
          ========================================================================= */}
      {viewMode === 'resume' && (
        <main className="content-container resume-view-container">
          {/* Action Header for Resume */}
          <div className="resume-action-bar no-print">
            {/* Quick Theme Switcher in Resume Bar */}
            <div className="nav-theme-switcher" role="radiogroup" aria-label="Select Color Theme">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`nav-theme-btn ${theme === t.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(t.id)}
                  title={`${t.label} Theme`}
                  aria-label={`${t.label} Theme`}
                  aria-checked={theme === t.id}
                >
                  <span className="nav-theme-icon">{t.icon}</span>
                  <span className="nav-theme-tooltip">{t.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="action-pill-btn primary"
              onClick={handleDownloadResume}
              disabled={downloadState === 'generating'}
              title="Download ATS Resume as PDF"
            >
              {downloadState === 'generating' ? (
                <>
                  <span className="btn-spinner" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadState === 'success' ? (
                <>✓ PDF Downloaded!</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button type="button" className="action-pill-btn" onClick={() => copyToClipboard('nagaraj.srvn@gmail.com', 'email')}>
              {copiedField === 'email' ? '✓ Copied Email' : '📋 Copy Contact Email'}
            </button>
            <button type="button" className="action-pill-btn" onClick={() => setViewMode('website')}>
              🌐 Return to Website
            </button>
          </div>

          {/* Standard Printable ATS Document Sheet */}
          <article className="resume-sheet">
            {/* Header with Executive Profile Photo on Right */}
            <header className="resume-sheet-header">
              <div className="resume-header-row">
                <div className="resume-header-info">
                  <h1 className="resume-name">NAGARAJ R</h1>
                  <p className="resume-role">Senior Software Engineer</p>
                  <div className="resume-contact-line">
                    <span>+91 6374983448</span>
                    <span>•</span>
                    <span>nagaraj.srvn@gmail.com</span>
                    <span>•</span>
                    <a href="https://nagaraj-r-software-engineer.onrender.com/" target="_blank" rel="noreferrer">nagaraj-r-software-engineer.onrender.com</a>
                    <span>•</span>
                    <a href="https://github.com/nagarajsaravanan" target="_blank" rel="noreferrer">github.com/nagarajsaravanan</a>
                    <span>•</span>
                    <a href="https://www.linkedin.com/in/nagaraj-r-385049147/" target="_blank" rel="noreferrer">linkedin.com/in/nagaraj-r</a>
                  </div>
                </div>
                <div className="resume-photo-box">
                  <img src={profilePhoto} alt="Nagaraj R - Senior Software Engineer" className="resume-profile-photo" />
                </div>
              </div>
            </header>

            <hr className="resume-divider" />

            {/* Summary */}
            <section className="resume-section">
              <h2 className="resume-section-heading">PROFESSIONAL SUMMARY</h2>
              <p className="resume-summary-text">
                Senior MERN Stack Developer with 6+ years of experience building scalable web applications, OTT platforms, and enterprise solutions using React.js, Node.js, Express.js, and MongoDB. Experienced in designing REST APIs, microservices and real-time applications. Strong background in product development, performance optimization, and delivering reliable applications using modern engineering practices.
              </p>
            </section>

            <hr className="resume-divider" />

            {/* Technical Skills */}
            <section className="resume-section">
              <h2 className="resume-section-heading">TECHNICAL SKILLS</h2>
              <div className="resume-skills-grid">
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Programming Languages:</strong>
                  <span className="resume-skill-val">JavaScript (ES6+), TypeScript</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Frontend Development:</strong>
                  <span className="resume-skill-val">React.js, Redux, HTML5, CSS3, SCSS, Tailwind CSS</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Backend Development:</strong>
                  <span className="resume-skill-val">Node.js, Express.js, REST APIs, Microservices, Redis, Apache Kafka, Elasticsearch</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Databases:</strong>
                  <span className="resume-skill-val">MongoDB, MySQL, Cassandra, Vertica</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Cloud & DevOps:</strong>
                  <span className="resume-skill-val">AWS, Firebase, Docker, Git, CI/CD</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Testing & Code Quality:</strong>
                  <span className="resume-skill-val">Jest, Mocha, Chai.js, SonarQube</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Architecture & Engineering:</strong>
                  <span className="resume-skill-val">Microservices Architecture, R&D, PoC Development</span>
                </div>
                <div className="resume-skill-line">
                  <strong className="resume-skill-label">Project Management:</strong>
                  <span className="resume-skill-val">Agile Methodology, User Story Writing, Sub-task Breakdown, Sprint Planning & Execution</span>
                </div>
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Experience */}
            <section className="resume-section">
              <h2 className="resume-section-heading">PROFESSIONAL EXPERIENCE</h2>
              <div className="resume-exp-list">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="resume-exp-entry">
                    <div className="resume-exp-entry-header">
                      <div>
                        <h3 className="resume-exp-role">{exp.role}</h3>
                        <div className="resume-exp-company">{exp.company}</div>
                      </div>
                      <div className="resume-exp-period">{exp.period} ({exp.duration})</div>
                    </div>
                    <ul className="resume-exp-bullets">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Awards & Recognition */}
            <section className="resume-section">
              <h2 className="resume-section-heading">AWARDS & RECOGNITION</h2>
              <div className="resume-exp-list">
                {awards.map((award, idx) => (
                  <div key={idx} className="resume-exp-entry">
                    <div className="resume-exp-entry-header">
                      <div>
                        <h3 className="resume-exp-role">{award.title} – {award.year}</h3>
                        <div className="resume-exp-company">{award.issuer}</div>
                      </div>
                      <div className="resume-exp-period">{award.year}</div>
                    </div>
                    <p className="resume-summary-text" style={{ marginTop: '4px' }}>
                      {award.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Key Projects */}
            <section className="resume-section">
              <h2 className="resume-section-heading">KEY ENTERPRISE PROJECTS</h2>
              <div className="resume-exp-list">
                {projects.map((proj, idx) => (
                  <div key={idx} className="resume-exp-entry">
                    <div className="resume-exp-entry-header">
                      <div>
                        <h3 className="resume-exp-role">{proj.title}</h3>
                        <div className="resume-exp-company">{proj.client}</div>
                      </div>
                    </div>
                    <p style={{ margin: '2px 0 6px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{proj.tagline}</p>
                    <ul className="resume-exp-bullets">
                      {proj.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--accent-vibrant)' }}>
                      <strong>Technologies:</strong> {proj.technologies.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Education */}
            <section className="resume-section">
              <h2 className="resume-section-heading">EDUCATION</h2>
              <div className="resume-exp-list">
                {education.map((edu, idx) => (
                  <div key={idx} className="resume-exp-entry">
                    <div className="resume-exp-entry-header">
                      <div>
                        <h3 className="resume-exp-role">{edu.degree}</h3>
                        <div className="resume-exp-company">{edu.institution} • {edu.university}</div>
                      </div>
                      <div className="resume-exp-period">{edu.period}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Languages */}
            <section className="resume-section">
              <h2 className="resume-section-heading">LANGUAGES</h2>
              <div className="resume-languages-grid">
                {languages.map((lang, idx) => (
                  <div key={idx} className="resume-lang-item">
                    <strong>{lang.language}</strong> – {lang.proficiency}
                  </div>
                ))}
              </div>
            </section>

            <hr className="resume-divider" />

            {/* Declaration, Date & Signature */}
            <section className="resume-section resume-declaration-section">
              <p className="resume-declaration-text">
                I hereby declare that all the information provided above is authentic and complete to the best of my knowledge and belief.
              </p>
              <div className="resume-sign-grid">
                <div className="resume-sign-meta">
                  <div className="resume-meta-row">
                    <span className="resume-meta-label">Date:</span>
                    <span className="resume-meta-val">{RESUME_DATE}</span>
                  </div>
                </div>

                <div className="resume-signature-col">
                  <div className="resume-signature-canvas">
                    <img src={signatureImg} alt="Nagaraj R - Candidate Signature" className="resume-signature-img" />
                  </div>
                  <div className="resume-signature-line" />
                  <span className="resume-sign-name">Nagaraj R</span>
                </div>
              </div>
            </section>
          </article>
        </main>
      )}
    </div>
  )
}
