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

      // Query the auth table using email and password
      const { data: authData, error: authError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', email.trim())
        .eq('password', password.trim())
        .maybeSingle()

      console.log('Auth query result:', { authData, authError })

      if (authError) {
        console.error('Auth query error:', authError)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Database connection error' 
        }))
        return false
      }

      if (!authData) {
        console.log('No matching user found')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid email or password' 
        }))
        return false
      }

      console.log('Authentication successful for user:', authData)

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
        console.log('Student profile loaded:', profileData)
      } else {
        console.log('No student profile found for this email')
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

      console.log('Login successful')
      return true
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'An error occurred during login' 
      }))
      return false
    }
  }

  const logout = () => {
    console.log('Logging out')
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
        console.log('Restored auth state from localStorage')
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