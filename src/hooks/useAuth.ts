import { useState, useEffect } from 'react'
import { supabase, type AuthUser, type StudentProfile } from '@/lib/supabase'

export interface AuthState {
  user: AuthUser | null
  profile: StudentProfile | null
  isLoading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: false,
    error: null
  })

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('Attempting login with email:', email)

      // First, check if the email exists in the auth table
      const { data: emailCheck, error: emailError } = await supabase
        .from('v0001_auth')
        .select('email, password')
        .eq('email', email.trim())
        .maybeSingle()

      console.log('Email check result:', { emailCheck, emailError })

      if (emailError) {
        console.error('Database query error:', emailError)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Database connection error. Please try again.' 
        }))
        return false
      }

      // If no user found with this email
      if (!emailCheck) {
        console.log('Email not found in database')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Email not found. Please check your email address.' 
        }))
        return false
      }

      // Email exists, now check if password matches
      if (emailCheck.password !== password.trim()) {
        console.log('Password does not match')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Incorrect password. Please check your password.' 
        }))
        return false
      }

      // Both email and password are correct, now get full user data
      const { data: authData, error: authError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', email.trim())
        .eq('password', password.trim())
        .single()

      console.log('Full auth data result:', { authData, authError })

      if (authError || !authData) {
        console.error('Error fetching full auth data:', authError)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Authentication error. Please try again.' 
        }))
        return false
      }

      console.log('✅ Authentication successful for user:', authData.email)

      // If authentication successful, fetch the student profile using email
      let profileData = null
      
      console.log('Fetching student profile for email:', authData.email)
      
      const { data: profile, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('email', authData.email)
        .maybeSingle()

      console.log('Student profile query result:', { profile, profileError })

      if (profileError) {
        console.warn('Could not fetch student profile:', profileError)
      } else if (profile) {
        profileData = profile
        console.log('✅ Student profile loaded:', profileData.first_name, profileData.last_name)
      } else {
        console.log('⚠️ No student profile found for this email')
      }

      setAuthState({
        user: authData,
        profile: profileData,
        isLoading: false,
        error: null
      })

      // Store auth state in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(authData))
      if (profileData) {
        localStorage.setItem('student_profile', JSON.stringify(profileData))
      }

      console.log('✅ Login successful - Access granted!')
      return true
    } catch (error) {
      console.error('Unexpected login error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }))
      return false
    }
  }

  const logout = () => {
    console.log('🚪 Logging out')
    setAuthState({
      user: null,
      profile: null,
      isLoading: false,
      error: null
    })
    localStorage.removeItem('auth_user')
    localStorage.removeItem('student_profile')
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  // Check for existing auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    const storedProfile = localStorage.getItem('student_profile')
    
    console.log('Checking stored auth:', { storedUser: !!storedUser, storedProfile: !!storedProfile })
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        const profile = storedProfile ? JSON.parse(storedProfile) : null
        setAuthState({
          user,
          profile,
          isLoading: false,
          error: null
        })
        console.log('✅ Restored auth state from localStorage')
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('student_profile')
      }
    }
  }, [])

  return {
    ...authState,
    login,
    logout,
    clearError,
    isAuthenticated: !!authState.user
  }
}