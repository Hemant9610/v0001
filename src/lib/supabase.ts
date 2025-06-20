import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AuthUser {
  id: number
  created_at: string
  email: string
  password: string
  student_id: string
}

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
}