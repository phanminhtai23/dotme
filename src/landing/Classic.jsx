import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import EduPub from '../components/EduPub'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import Cursor from '../components/Cursor'
import MessageWidget from '../components/MessageWidget'

export default function Classic() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <EduPub />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <MessageWidget />
    </>
  )
}
