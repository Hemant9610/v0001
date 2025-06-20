import React, { createContext, useContext, useEffect, useState } from 'react'
import { customAuth, CustomAuthUser } from '@/lib/customAuth'
import { StudentProfile, getStudentProfileByStudentId, debugStudentData } from '@/lib/supabase'

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
      console.log('🔍 Loading student profile for student_id:', student_id)
      
      // Use the enhanced method to get student profile by student_id
      const { data, error } = await getStudentProfileByStudentId(student_id)
      
      if (error) {
        console.error('❌ Error loading student profile:', error)
        
        // If no profile found, show debug info in development
        if (import.meta.env.DEV) {
          console.log('🔍 Running debug to show available profiles...')
          await debugStudentData()
        }
      } else if (data) {
        console.log('✅ Student profile loaded successfully:', {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          student_id: data.student_id,
          skills_count: Array.isArray(data.skills) ? data.skills.length : 0,
          projects_count: Array.isArray(data.projects) ? data.projects.length : 0
        })
        setStudentProfile(data)
      } else {
        console.log('ℹ️ No student profile found for student_id:', student_id)
        
        // In development, show available profiles
        if (import.meta.env.DEV) {
          console.log('🔍 Available profiles:')
          await debugStudentData()
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error loading student profile:', err)
    }
  }

  const refreshStudentProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing student profile for:', user.student_id)
      await loadStudentProfile(user.student_id)
    } else {
      console.log('ℹ️ No user logged in, cannot refresh profile')
    }
  }

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('profeshare_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('🔄 Restoring user from localStorage:', parsedUser)
        setUser(parsedUser)
        loadStudentProfile(parsedUser.student_id)
      } catch (err) {
        console.error('❌ Error parsing stored user:', err)
        localStorage.removeItem('profeshare_user')
      }
    } else {
      console.log('ℹ️ No stored user found')
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login with:', { email: email.trim(), passwordLength: password.length })
      
      const { user: authUser, error } = await customAuth.signIn(email, password)
      
      if (error || !authUser) {
        console.error('❌ Sign in error:', error)
        return { error: { message: error || 'Sign in failed' } }
      }
      
      console.log('✅ Authentication successful for:', authUser)
      
      // Store user in state and localStorage
      setUser(authUser)
      localStorage.setItem('profeshare_user', JSON.stringify(authUser))
      
      // Load student profile using the student_id from auth
      await loadStudentProfile(authUser.student_id)
      
      return { error: null }
    } catch (err) {
      console.error('❌ Unexpected sign in error:', err)
      return { error: { message: 'An unexpected error occurred. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user')
      setUser(null)
      setStudentProfile(null)
      localStorage.removeItem('profeshare_user')
    } catch (err) {
      console.error('❌ Unexpected sign out error:', err)
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