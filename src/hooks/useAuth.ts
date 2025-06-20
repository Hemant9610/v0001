import { useState, useEffect } from 'react'
import { supabase, testDatabaseConnection, type AuthUser, type StudentProfile } from '@/lib/supabase'

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
    isLoading: true, // Start with loading true to check stored auth
    error: null
  })

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Starting login process for:', email)
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Clean inputs
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password.trim()

      console.log('🔍 Step 1: Testing database connection...')
      const connectionTest = await testDatabaseConnection()
      
      if (!connectionTest.authTable) {
        console.error('❌ Auth table connection failed:', connectionTest.errors.auth)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `❌ Database connection failed: ${connectionTest.errors.auth}` 
        }))
        return false
      }

      console.log('✅ Database connection successful')

      console.log('🔍 Step 2: Searching for email in auth table...')
      
      // Query auth table for the email
      const { data: authUsers, error: emailError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', cleanEmail)

      console.log('📊 Email search result:', {
        found: authUsers?.length || 0,
        error: emailError?.message || 'none'
      })

      if (emailError) {
        console.error('❌ Database query error:', emailError)
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `❌ Database error: ${emailError.message}` 
        }))
        return false
      }

      // Check if email exists
      if (!authUsers || authUsers.length === 0) {
        console.log('❌ Email not found in database')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Email not found. Please check your email address.' 
        }))
        return false
      }

      if (authUsers.length > 1) {
        console.warn('⚠️ Multiple users found with same email')
      }

      const authUser = authUsers[0]
      console.log('✅ Email found for user:', authUser.student_id)

      console.log('🔍 Step 3: Verifying password...')
      
      // Check password
      if (authUser.password !== cleanPassword) {
        console.log('❌ Password does not match')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Incorrect password. Please check your password.' 
        }))
        return false
      }

      console.log('✅ Password verified successfully')

      console.log('🔍 Step 4: Loading student profile...')
      
      // Fetch student profile using email
      const { data: studentProfiles, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('email', cleanEmail)

      console.log('📊 Profile search result:', {
        found: studentProfiles?.length || 0,
        error: profileError?.message || 'none'
      })

      let profileData = null
      if (profileError) {
        console.warn('⚠️ Could not fetch student profile:', profileError.message)
      } else if (studentProfiles && studentProfiles.length > 0) {
        profileData = studentProfiles[0]
        console.log('✅ Student profile loaded:', {
          name: `${profileData.first_name} ${profileData.last_name}`,
          studentId: profileData.student_id
        })
      } else {
        console.log('⚠️ No student profile found for this email')
      }

      // Update auth state
      const finalAuthState = {
        user: authUser,
        profile: profileData,
        isLoading: false,
        error: null
      }

      setAuthState(finalAuthState)

      // Store in localStorage for persistence
      try {
        localStorage.setItem('profeshare_auth_user', JSON.stringify(authUser))
        if (profileData) {
          localStorage.setItem('profeshare_student_profile', JSON.stringify(profileData))
        }
        console.log('✅ Auth state saved to localStorage')
      } catch (storageError) {
        console.warn('⚠️ Could not save to localStorage:', storageError)
      }

      console.log('🎉 Login successful! Access granted.')
      return true

    } catch (error) {
      console.error('💥 Unexpected login error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
      return false
    }
  }

  const logout = () => {
    console.log('🚪 Logging out user')
    
    setAuthState({
      user: null,
      profile: null,
      isLoading: false,
      error: null
    })
    
    // Clear localStorage
    try {
      localStorage.removeItem('profeshare_auth_user')
      localStorage.removeItem('profeshare_student_profile')
      console.log('✅ Auth data cleared from localStorage')
    } catch (error) {
      console.warn('⚠️ Could not clear localStorage:', error)
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth state...')
      
      try {
        const storedUser = localStorage.getItem('profeshare_auth_user')
        const storedProfile = localStorage.getItem('profeshare_student_profile')
        
        if (storedUser) {
          console.log('📦 Found stored auth data')
          
          const user = JSON.parse(storedUser)
          const profile = storedProfile ? JSON.parse(storedProfile) : null
          
          // Verify the stored data is still valid by testing database connection
          const connectionTest = await testDatabaseConnection()
          
          if (connectionTest.authTable) {
            setAuthState({
              user,
              profile,
              isLoading: false,
              error: null
            })
            console.log('✅ Auth state restored from localStorage')
          } else {
            console.log('❌ Database connection failed, clearing stored auth')
            logout()
          }
        } else {
          console.log('📭 No stored auth data found')
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error)
        logout()
      }
    }

    initializeAuth()
  }, [])

  return {
    ...authState,
    login,
    logout,
    clearError,
    isAuthenticated: !!authState.user
  }
}