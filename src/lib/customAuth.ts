import { supabase } from './supabase'
import { getForcedSingleRecord, getMaybeSingleRecord } from './supabaseHelpers'

export interface CustomAuthUser {
  email: string
  student_id: string
}

export interface AuthResponse {
  user: CustomAuthUser | null
  error: string | null
}

// Custom authentication functions for v0001_auth table
export const customAuth = {
  // Sign in using v0001_auth table with forced single record
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Use helper to force exactly one record
      const { data, error } = await getForcedSingleRecord('v0001_auth', 'email', email.trim())

      if (error || !data) {
        return {
          user: null,
          error: 'Invalid email or password'
        }
      }

      // Simple password comparison (in production, you should hash passwords)
      if (data.password !== password) {
        return {
          user: null,
          error: 'Invalid email or password'
        }
      }

      // Return user data without password
      return {
        user: {
          email: data.email,
          student_id: data.student_id
        },
        error: null
      }
    } catch (err) {
      console.error('Custom auth error:', err)
      return {
        user: null,
        error: 'An error occurred during sign in'
      }
    }
  },

  // Get student profile by student_id with forced single record
  getStudentProfile: async (student_id: string) => {
    try {
      // Method 1: Using .single() for strict enforcement
      const { data, error } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', student_id)
        .single() // This will error if 0 or >1 records

      return { data, error }
    } catch (err) {
      console.error('Error getting student profile:', err)
      return { data: null, error: err }
    }
  },

  // Alternative method using maybeSingle for more graceful handling
  getStudentProfileSafe: async (student_id: string) => {
    try {
      const { data, error } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', student_id)
        .maybeSingle() // Returns null if no records, error if multiple

      return { data, error }
    } catch (err) {
      console.error('Error getting student profile:', err)
      return { data: null, error: err }
    }
  },

  // Create new user in v0001_auth table
  signUp: async (email: string, password: string, student_id: string): Promise<AuthResponse> => {
    try {
      // Check if user already exists using maybeSingle
      const { data: existingUser } = await supabase
        .from('v0001_auth')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle()

      if (existingUser) {
        return {
          user: null,
          error: 'User with this email already exists'
        }
      }

      // Insert new user and return single record
      const { data, error } = await supabase
        .from('v0001_auth')
        .insert({
          email: email.trim(),
          password, // In production, hash this password
          student_id
        })
        .select('email, student_id')
        .single() // Force single record return

      if (error) {
        return {
          user: null,
          error: 'Failed to create account'
        }
      }

      return {
        user: data,
        error: null
      }
    } catch (err) {
      console.error('Custom signup error:', err)
      return {
        user: null,
        error: 'An error occurred during sign up'
      }
    }
  }
}