import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ URL loaded' : '❌ URL missing',
  key: supabaseAnonKey ? '✅ Key loaded' : '❌ Key missing'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // We'll handle our own session management
  }
})

// Test connection
supabase
  .from('v0001_auth')
  .select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
    } else {
      console.log('✅ Supabase connected successfully. Auth table has', count, 'records')
    }
  })

// Database types based on your actual schema
export interface AuthUser {
  id?: number
  created_at?: string
  mail: string  // Changed from 'email' to 'mail'
  password: string
  student_id: string
}

export interface StudentProfile {
  id?: number
  created_at?: string
  student_id: string
  first_name: string
  last_name: string
  email: string
  skills?: any
  projects?: any
  experience?: any
  certifications_and_licenses?: any
  job_preferences?: any
  profile_image?: string
}

// Helper function to test database connectivity
export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test auth table with correct column name
    const { data: authTest, error: authError } = await supabase
      .from('v0001_auth')
      .select('mail')  // Changed from 'email' to 'mail'
      .limit(1)
    
    console.log('Auth table test:', { 
      success: !authError, 
      error: authError?.message,
      recordCount: authTest?.length || 0
    })
    
    // Test student database table
    const { data: studentTest, error: studentError } = await supabase
      .from('v0001_student_database')
      .select('email')
      .limit(1)
    
    console.log('Student table test:', { 
      success: !studentError, 
      error: studentError?.message,
      recordCount: studentTest?.length || 0
    })
    
    return {
      authTable: !authError,
      studentTable: !studentError,
      errors: {
        auth: authError?.message,
        student: studentError?.message
      }
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return {
      authTable: false,
      studentTable: false,
      errors: {
        auth: 'Connection failed',
        student: 'Connection failed'
      }
    }
  }
}