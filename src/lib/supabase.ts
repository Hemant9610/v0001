import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (err) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types based on your schema
export interface StudentProfile {
  id: number
  created_at: string
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
  auth_user_id?: string // Link to Supabase Auth user
}

export interface AuthUser {
  id: number
  created_at: string
  email: string
  password: string
  student_id: string
}

// Helper functions to work with student data
export const getStudentProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('Error in getStudentProfile:', err)
    return { data: null, error: err }
  }
}

export const updateStudentProfile = async (userId: string, updates: Partial<StudentProfile>) => {
  try {
    const { data, error } = await supabase
      .from('v0001_student_database')
      .update(updates)
      .eq('auth_user_id', userId)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('Error in updateStudentProfile:', err)
    return { data: null, error: err }
  }
}

export const createStudentProfile = async (profile: Partial<StudentProfile>) => {
  try {
    const { data, error } = await supabase
      .from('v0001_student_database')
      .insert(profile)
      .select()
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('Error in createStudentProfile:', err)
    return { data: null, error: err }
  }
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('v0001_student_database').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase connection test error:', err)
    return false
  }
}