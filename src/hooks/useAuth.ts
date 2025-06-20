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
      // Query the v0001_auth table for matching credentials
      const { data: authData, error: authError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()

      if (authError || !authData) {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid email or password' 
        }))
        return false
      }

      // If authentication successful, fetch the student profile
      const { data: profileData, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', authData.student_id)
        .single()

      if (profileError) {
        console.warn('Could not fetch student profile:', profileError)
      }

      setAuthState({
        user: authData,
        profile: profileData || null,
        isLoading: false,
        error: null
      })

      // Store auth state in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(authData))
      if (profileData) {
        localStorage.setItem('student_profile', JSON.stringify(profileData))
      }

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