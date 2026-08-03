'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  writer: any | null  // writers table row
  signOut: () => Promise<void>
  refreshWriter: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  writer: null,
  signOut: async () => {},
  refreshWriter: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [writer, setWriter] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadWriter = async (userId: string) => {
    try {
      // Writer data lives in Malawiana's own Supabase
      const { data } = await supabase
        .from('writers')
        .select('*')
        .eq('user_id', userId)
        .single()
      setWriter(data || null)
    } catch (e) {
      setWriter(null)
    }
  }

  const refreshWriter = async () => {
    if (user) {
      await loadWriter(user.id)
    }
  }

  useEffect(() => {
    // Use Malawiana Supabase for auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadWriter(session.user.id)
      } else {
        setWriter(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadWriter(session.user.id)
      } else {
        setWriter(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setWriter(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, writer, signOut, refreshWriter }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
