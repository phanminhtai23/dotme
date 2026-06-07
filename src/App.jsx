import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import MessageWidget from './components/MessageWidget'
import { trackVisit } from './analytics'
import { LangProvider } from './LangContext'

function AppContent() {
  useEffect(() => { trackVisit() }, [])

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <MessageWidget />
    </>
  )
}

export default function App() {
  return <LangProvider><AppContent /></LangProvider>
}
