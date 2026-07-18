'use client'
import { createContext, useContext, useEffect, useState } from 'react'
const ThemeContext = createContext({ theme: 'light', toggle: () => {} })
export function useTheme() { return useContext(ThemeContext) }
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
