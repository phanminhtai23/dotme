import { createContext, useContext, useState } from 'react'

const LangCtx = createContext({ lang: 'vi', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('dotme_lang') || 'en')

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('dotme_lang', l)
  }

  return <LangCtx.Provider value={{ lang, setLang: changeLang }}>{children}</LangCtx.Provider>
}

export function useLang() {
  return useContext(LangCtx)
}
