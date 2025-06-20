import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getStudentProfile, StudentProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  studentProfile: StudentProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshStudentProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStudentProfile = async (userId: string) => {
    try {
      const { data, error } = await getStudentProfile(userId)
      if (!error && data) {
        setStudentProfile(data)
      } else if (error) {
        console.error('Error loading student profile:', error)
      }
    } catch (err) {
      console.error('Unexpected error loading student profile:', err)
    }
  }

  const refreshStudentProfile = async () => {
    if (user) {
      await loadStudentProfile(user.id)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadStudentProfile(session.user.id)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadStudentProfile(session.user.id)
      } else {
        setStudentProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        // Provide more user-friendly error messages
        let userMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email and confirm your account before signing in.'
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many login attempts. Please wait a moment before trying again.'
        }
        return { error: { ...error, message: userMessage } }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Unexpected sign in error:', err)
      return { error: { message: 'An unexpected error occurred. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      setStudentProfile(null)
    } catch (err) {
      console.error('Unexpected sign out error:', err)
    }
  }

  const value = {
    user,
    session,
    studentProfile,
    loading,
    signIn,
    signOut,
    refreshStudentProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}