import React, { createContext, useContext, useEffect, useState } from 'react'
import { customAuth, CustomAuthUser } from '@/lib/customAuth'
import { StudentProfile } from '@/lib/supabase'

interface AuthContextType {
  user: CustomAuthUser | null
  studentProfile: StudentProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshStudentProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomAuthUser | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStudentProfile = async (student_id: string) => {
    try {
      // Use the safe method that handles single record gracefully
      const { data, error } = await customAuth.getStudentProfileSafe(student_id)
      
      if (error) {
        console.error('Error loading student profile:', error)
        // If it's a "multiple records" error, try to get the first one
        if (error.message?.includes('multiple') || error.code === 'PGRST116') {
          console.warn('Multiple student profiles found, using the first one')
          const { data: fallbackData } = await customAuth.getStudentProfile(student_id)
          if (fallbackData) {
            setStudentProfile(fallbackData)
          }
        }
      } else if (data) {
        setStudentProfile(data)
      }
    } catch (err) {
      console.error('Unexpected error loading student profile:', err)
    }
  }

  const refreshStudentProfile = async () => {
    if (user) {
      await loadStudentProfile(user.student_id)
    }
  }

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('profeshare_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        loadStudentProfile(parsedUser.student_id)
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('profeshare_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await customAuth.signIn(email, password)
      
      if (error || !authUser) {
        return { error: { message: error || 'Sign in failed' } }
      }
      
      // Store user in state and localStorage
      setUser(authUser)
      localStorage.setItem('profeshare_user', JSON.stringify(authUser))
      
      // Load student profile
      await loadStudentProfile(authUser.student_id)
      
      return { error: null }
    } catch (err) {
      console.error('Unexpected sign in error:', err)
      return { error: { message: 'An unexpected error occurred. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setStudentProfile(null)
      localStorage.removeItem('profeshare_user')
    } catch (err) {
      console.error('Unexpected sign out error:', err)
    }
  }

  const value = {
    user,
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