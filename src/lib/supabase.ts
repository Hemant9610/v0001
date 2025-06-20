import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our custom auth system
export interface AuthUser {
  id: number
  mail: string  // Note: using 'mail' column name from v0001_auth table
  password: string
  student_id: string
  created_at: string
}

export interface StudentProfile {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  skills: any
  projects: any
  experience: any
  certifications_and_licenses: any
  job_preferences: any
  profile_image: string
  created_at: string
}

// Test database connection
export const testDatabaseConnection = async () => {
  const results = {
    authTable: false,
    studentTable: false,
    errors: {
      auth: '',
      student: ''
    }
  }

  try {
    console.log('🔍 Testing v0001_auth table connection...')
    const { data: authData, error: authError } = await supabase
      .from('v0001_auth')
      .select('count(*)')
      .limit(1)

    if (authError) {
      console.error('❌ Auth table error:', authError.message)
      results.errors.auth = authError.message
    } else {
      console.log('✅ Auth table connection successful')
      results.authTable = true
    }
  } catch (error) {
    console.error('❌ Auth table connection failed:', error)
    results.errors.auth = error instanceof Error ? error.message : 'Unknown error'
  }

  try {
    console.log('🔍 Testing v0001_student_database table connection...')
    const { data: studentData, error: studentError } = await supabase
      .from('v0001_student_database')
      .select('count(*)')
      .limit(1)

    if (studentError) {
      console.error('❌ Student table error:', studentError.message)
      results.errors.student = studentError.message
    } else {
      console.log('✅ Student table connection successful')
      results.studentTable = true
    }
  } catch (error) {
    console.error('❌ Student table connection failed:', error)
    results.errors.student = error instanceof Error ? error.message : 'Unknown error'
  }

  return results
}