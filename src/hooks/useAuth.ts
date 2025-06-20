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
      console.log('Attempting login with:', { email, password })

      // First, let's check what data exists in the auth table
      const { data: allAuthData, error: allAuthError } = await supabase
        .from('v0001_auth')
        .select('*')
        .limit(10)

      console.log('All auth records (first 10):', allAuthData)
      console.log('Auth table query error:', allAuthError)

      // Now try to find matching email first
      const { data: emailMatches, error: emailError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', email.trim())

      console.log('Email matches:', emailMatches)
      console.log('Email query error:', emailError)

      if (emailError) {
        console.error('Email query error:', emailError)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Database connection error' 
        }))
        return false
      }

      if (!emailMatches || emailMatches.length === 0) {
        console.log('No email matches found')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Email not found in database' 
        }))
        return false
      }

      // Check if any of the email matches have the correct password
      const passwordMatch = emailMatches.find(user => {
        console.log('Comparing passwords:', { 
          provided: password, 
          stored: user.password,
          match: user.password === password 
        })
        return user.password === password
      })

      if (!passwordMatch) {
        console.log('Password does not match for email:', email)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Incorrect password' 
        }))
        return false
      }

      console.log('Authentication successful for user:', passwordMatch)

      // If authentication successful, fetch the student profile
      let profileData = null
      if (passwordMatch.student_id) {
        console.log('Fetching student profile for student_id:', passwordMatch.student_id)
        
        const { data: profile, error: profileError } = await supabase
          .from('v0001_student_database')
          .select('*')
          .eq('student_id', passwordMatch.student_id)
          .maybeSingle()

        console.log('Student profile query result:', { profile, profileError })

        if (profileError) {
          console.warn('Could not fetch student profile:', profileError)
        } else {
          profileData = profile
          console.log('Student profile loaded:', profileData)
        }
      }

      setAuthState({
        user: passwordMatch,
        profile: profileData,
        isLoading: false,
        error: null
      })

      // Store auth state in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(passwordMatch))
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