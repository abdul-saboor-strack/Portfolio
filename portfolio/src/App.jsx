import { useEffect, useMemo, useState } from 'react'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import NeonBackground from './components/NeonBackground'
import Preloader from './components/Preloader'
import ProjectsSection from './components/ProjectsSection'
import ProjectModal from './components/ProjectModal'
import SkillsSection from './components/SkillsSection'
import ErrorBoundary from './components/ErrorBoundary'
import ThemeToggle from './components/ThemeToggle'
import TimelineSection from './components/TimelineSection'
import AdminPage from './admin/AdminPage'
import { usePortfolioData } from './hooks/usePortfolioData'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)

  const isAdmin =
    window.location.pathname === '/admin' || window.location.pathname === '/admin/' || window.location.hash === '#/admin'

  const { data } = usePortfolioData()
  const { name, headlinePhrases, about, skills, projects, timeline, contact, social } = data

  const modalOpen = Boolean(selectedProject)

  useEffect(() => {
    if (isAdmin) return
    document.title = `${name} | Portfolio`
  }, [name, isAdmin])

  const navItems = useMemo(
    () => [
      { id: 'about', label: 'About' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'experience', label: 'Experience' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  )

  if (isAdmin) {
    return <AdminPage />
  }

  return (
    <div>
      <Preloader />
      <NeonBackground />

      <header
        style={{
          position: 'fixed',
          top: 14,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div className="container" style={{ pointerEvents: 'auto' }}>
          <div className="glass2 headerBar">
            <div className="headerBrand">
              <div
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--grad)',
                  boxShadow: '0 0 18px rgba(0,240,255,0.25)',
                }}
              />
              <button
                type="button"
                className="btn btnSecondary"
                onClick={() => scrollToId('home')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 14,
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              >
                {name}
              </button>
            </div>
            <nav className="headerNav" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="btn btnSecondary"
                  onClick={() => scrollToId(item.id)}
                  style={{ padding: '8px 10px', borderRadius: 14, fontWeight: 900, fontSize: 13 }}
                >
                  {item.label}
                </button>
              ))}

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <main className="mainContent" style={{ paddingTop: 92 }}>
          <HeroSection name={name} headlinePhrases={headlinePhrases} onViewWork={() => scrollToId('projects')} />
          <AboutSection about={about} />
          <SkillsSection skills={skills} />
          <ProjectsSection projects={projects} onOpenProject={setSelectedProject} />
          <TimelineSection timeline={timeline} />
          <ContactSection contact={contact} social={social} />
          <Footer />
        </main>
      </ErrorBoundary>

      <ProjectModal project={selectedProject} isOpen={modalOpen} onClose={() => setSelectedProject(null)} />
    </div >
  )
}
