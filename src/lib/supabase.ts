import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
    .from('v0001_student_database')
    .select('*')
    .eq('auth_user_id', userId)
    .single()
  
  return { data, error }
}

export const updateStudentProfile = async (userId: string, updates: Partial<StudentProfile>) => {
  const { data, error } = await supabase
    .from('v0001_student_database')
    .update(updates)
    .eq('auth_user_id', userId)
    .select()
    .single()
  
  return { data, error }
}

export const createStudentProfile = async (profile: Partial<StudentProfile>) => {
  const { data, error } = await supabase
    .from('v0001_student_database')
    .insert(profile)
    .select()
    .single()
  
  return { data, error }
}