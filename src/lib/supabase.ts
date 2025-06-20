import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please create a .env file in your project root with:')
  console.error('VITE_SUPABASE_URL=your_supabase_project_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('You can find these values in your Supabase project settings under "API"')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (err) {
  console.error('❌ Invalid VITE_SUPABASE_URL format:', supabaseUrl)
  console.error('Expected format: https://your-project-id.supabase.co')
  throw new Error('Invalid VITE_SUPABASE_URL format. Please check your .env file.')
}

// Check for placeholder values
if (supabaseUrl.includes('your-project-id') || supabaseUrl.includes('your_supabase_project_url')) {
  console.error('❌ VITE_SUPABASE_URL contains placeholder values!')
  console.error('Please replace with your actual Supabase project URL')
  throw new Error('VITE_SUPABASE_URL contains placeholder values. Please update your .env file.')
}

if (supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('your_supabase_anon_key')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY contains placeholder values!')
  console.error('Please replace with your actual Supabase anon key')
  throw new Error('VITE_SUPABASE_ANON_KEY contains placeholder values. Please update your .env file.')
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

// Enhanced helper functions to work with student data
export const getStudentProfile = async (userId: string) => {
  try {
    console.log('🔍 Fetching student profile for user ID:', userId)
    
    // Try multiple approaches to find the student profile
    let data = null
    let error = null

    // Method 1: Try by auth_user_id (if linked)
    const { data: profileByAuthId, error: authIdError } = await supabase
      .from('v0001_student_database')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle()
    
    if (profileByAuthId && !authIdError) {
      console.log('✅ Found profile by auth_user_id')
      return { data: profileByAuthId, error: null }
    }

    // Method 2: Try by student_id (if userId is actually a student_id)
    const { data: profileByStudentId, error: studentIdError } = await supabase
      .from('v0001_student_database')
      .select('*')
      .eq('student_id', userId)
      .maybeSingle()
    
    if (profileByStudentId && !studentIdError) {
      console.log('✅ Found profile by student_id')
      return { data: profileByStudentId, error: null }
    }

    // Method 3: Try by email (if userId is an email)
    if (userId.includes('@')) {
      const { data: profileByEmail, error: emailError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('email', userId)
        .maybeSingle()
      
      if (profileByEmail && !emailError) {
        console.log('✅ Found profile by email')
        return { data: profileByEmail, error: null }
      }
    }

    console.log('❌ No profile found for user:', userId)
    return { data: null, error: 'Profile not found' }
    
  } catch (err) {
    console.error('Error in getStudentProfile:', err)
    return { data: null, error: err }
  }
}

// Get student profile by student_id specifically
export const getStudentProfileByStudentId = async (studentId: string) => {
  try {
    console.log('🔍 Fetching student profile by student_id:', studentId)
    
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error fetching by student_id:', error)
      return { data: null, error }
    }
    
    if (data) {
      console.log('✅ Found student profile:', {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        student_id: data.student_id
      })
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Error in getStudentProfileByStudentId:', err)
    return { data: null, error: err }
  }
}

// Get all student profiles (for debugging)
export const getAllStudentProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('id, student_id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching all profiles:', error)
      return { data: [], error }
    }
    
    console.log('📋 Available student profiles:', data)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error in getAllStudentProfiles:', err)
    return { data: [], error: err }
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
    console.log('🔍 Testing Supabase connection...')
    
    // Test v0001_student_database table
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log('📊 Student database records count:', data)
    
    // Also test v0001_auth table
    const { data: authData, error: authError } = await supabase
      .from('v0001_auth')
      .select('count', { count: 'exact', head: true })
    
    if (!authError) {
      console.log('📊 Auth records count:', authData)
    }
    
    return true
  } catch (err) {
    console.error('❌ Supabase connection test error:', err)
    return false
  }
}

// Enhanced debug function to show all available data
export const debugStudentData = async () => {
  console.log('🔍 Debug: Fetching all student data...')
  
  try {
    // Get all student profiles
    const { data: students, error } = await supabase
      .from('v0001_student_database')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching student data:', error)
      return
    }
    
    console.log('📋 Available student profiles:')
    students?.forEach((student, index) => {
      console.log(`${index + 1}. ${student.first_name} ${student.last_name}`)
      console.log(`   Student ID: ${student.student_id}`)
      console.log(`   Email: ${student.email}`)
      console.log(`   Skills: ${Array.isArray(student.skills) ? student.skills.length : 'N/A'} skills`)
      console.log(`   Projects: ${Array.isArray(student.projects) ? student.projects.length : 'N/A'} projects`)
      console.log(`   Created: ${student.created_at}`)
      console.log('   ---')
    })
    
    return students
  } catch (err) {
    console.error('❌ Debug error:', err)
  }
}