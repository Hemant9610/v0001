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

      console.log('🧹 Cleaned inputs:', {
        originalEmail: email,
        cleanedEmail: cleanEmail,
        passwordLength: cleanPassword.length
      })

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
      console.log('📧 Looking for email in "mail" column:', cleanEmail)
      
      // Query auth table for the email using the correct column name 'mail'
      const { data: authUsers, error: emailError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('mail', cleanEmail)  // Changed from 'email' to 'mail'

      console.log('📊 Email search query completed')
      console.log('📊 Raw database response:', {
        data: authUsers,
        error: emailError,
        foundUsers: authUsers?.length || 0
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
        console.log('❌ EMAIL NOT FOUND IN DATABASE')
        console.log('📧 Searched email in "mail" column:', cleanEmail)
        console.log('📊 Search result: 0 users found')
        console.log('💡 This means the email address is not registered in the system')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Email not found. Please check your email address or contact support.' 
        }))
        return false
      }

      if (authUsers.length > 1) {
        console.warn('⚠️ Multiple users found with same email:', authUsers.length)
        console.warn('📊 All matching users:', authUsers.map(u => ({ 
          id: u.id, 
          mail: u.mail, 
          student_id: u.student_id 
        })))
      }

      const authUser = authUsers[0]
      console.log('✅ EMAIL FOUND IN DATABASE')
      console.log('👤 User details:', {
        id: authUser.id,
        mail: authUser.mail,
        student_id: authUser.student_id,
        hasPassword: !!authUser.password,
        passwordLength: authUser.password?.length || 0
      })

      console.log('🔍 Step 3: Verifying password...')
      console.log('🔑 Password comparison:')
      console.log('   - Provided password:', `"${cleanPassword}" (length: ${cleanPassword.length})`)
      console.log('   - Database password:', `"${authUser.password}" (length: ${authUser.password?.length || 0})`)
      console.log('   - Passwords match:', authUser.password === cleanPassword)
      
      // Check password
      if (authUser.password !== cleanPassword) {
        console.log('❌ PASSWORD DOES NOT MATCH')
        console.log('🔑 Password verification failed:')
        console.log('   - Expected:', `"${authUser.password}"`)
        console.log('   - Received:', `"${cleanPassword}"`)
        console.log('   - Case sensitive comparison failed')
        console.log('💡 This means the password is incorrect')
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: '❌ Incorrect password. Please check your password and try again.' 
        }))
        return false
      }

      console.log('✅ PASSWORD VERIFIED SUCCESSFULLY')
      console.log('🔑 Password match confirmed:')
      console.log('   - Database password:', `"${authUser.password}"`)
      console.log('   - Provided password:', `"${cleanPassword}"`)
      console.log('   - Match result: TRUE')

      console.log('🔍 Step 4: Loading student profile...')
      console.log('📧 Searching student profile with email:', cleanEmail)
      
      // Fetch student profile using email (student table uses 'email' column)
      const { data: studentProfiles, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('email', cleanEmail)  // Student table still uses 'email' column

      console.log('📊 Profile search result:', {
        found: studentProfiles?.length || 0,
        error: profileError?.message || 'none',
        profiles: studentProfiles
      })

      let profileData = null
      if (profileError) {
        console.warn('⚠️ Could not fetch student profile:', profileError.message)
      } else if (studentProfiles && studentProfiles.length > 0) {
        profileData = studentProfiles[0]
        console.log('✅ Student profile loaded:', {
          name: `${profileData.first_name} ${profileData.last_name}`,
          studentId: profileData.student_id,
          email: profileData.email
        })
      } else {
        console.log('⚠️ No student profile found for this email')
        console.log('📧 Searched email in student database:', cleanEmail)
        console.log('💡 User can still login but profile data is not available')
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

      console.log('🎉 LOGIN SUCCESSFUL! ACCESS GRANTED.')
      console.log('📊 Final auth state:', {
        userEmail: authUser.mail,
        userStudentId: authUser.student_id,
        hasProfile: !!profileData,
        profileName: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'N/A'
      })
      return true

    } catch (error) {
      console.error('💥 Unexpected login error:', error)
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
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
            console.log('👤 Restored user:', {
              mail: user.mail,
              student_id: user.student_id,
              hasProfile: !!profile
            })
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