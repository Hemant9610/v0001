// Debug authentication system
import { supabase, debugStudentData } from './supabase'

export const debugAuth = {
  // Test database connection
  testConnection: async () => {
    console.log('🔍 Testing Supabase connection...')
    
    // First check if environment variables are properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing environment variables!')
      console.error('Please check your .env file and ensure you have:')
      console.error('- VITE_SUPABASE_URL')
      console.error('- VITE_SUPABASE_ANON_KEY')
      return false
    }
    
    if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-key')) {
      console.error('❌ Environment variables contain placeholder values!')
      console.error('Please update your .env file with actual Supabase credentials.')
      console.error('You can find these in your Supabase project settings under "API".')
      return false
    }
    
    try {
      const { data, error } = await supabase
        .from('v0001_auth')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Connection failed:', error)
        console.error('This might indicate:')
        console.error('- Incorrect Supabase URL or API key')
        console.error('- Network connectivity issues')
        console.error('- Supabase project is paused or deleted')
        return false
      }
      
      console.log('✅ Connection successful, auth records count:', data)
      
      // Also test student database
      const { data: studentData, error: studentError } = await supabase
        .from('v0001_student_database')
        .select('count', { count: 'exact', head: true })
      
      if (!studentError) {
        console.log('✅ Student database accessible, records count:', studentData)
      }
      
      return true
    } catch (err) {
      console.error('❌ Connection error:', err)
      console.error('This typically means:')
      console.error('- Invalid Supabase URL format')
      console.error('- Network is blocked or offline')
      console.error('- CORS issues (check Supabase project settings)')
      return false
    }
  },

  // List all users in v0001_auth table
  listAllUsers: async () => {
    console.log('🔍 Fetching all users from v0001_auth...')
    try {
      const { data, error } = await supabase
        .from('v0001_auth')
        .select('email, student_id')
        .limit(10)
      
      if (error) {
        console.error('❌ Error fetching users:', error)
        return []
      }
      
      console.log('📋 Available users:', data)
      return data || []
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return []
    }
  },

  // List all student profiles
  listAllStudentProfiles: async () => {
    console.log('🔍 Fetching all student profiles...')
    try {
      const { data, error } = await supabase
        .from('v0001_student_database')
        .select('id, student_id, first_name, last_name, email, created_at')
        .limit(10)
      
      if (error) {
        console.error('❌ Error fetching student profiles:', error)
        return []
      }
      
      console.log('📋 Available student profiles:')
      data?.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.first_name} ${profile.last_name}`)
        console.log(`   Student ID: ${profile.student_id}`)
        console.log(`   Email: ${profile.email}`)
        console.log(`   Database ID: ${profile.id}`)
        console.log('   ---')
      })
      
      return data || []
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return []
    }
  },

  // Test specific user login
  testUserLogin: async (email: string, password: string) => {
    console.log(`🔍 Testing login for: ${email}`)
    
    try {
      // Step 1: Check if user exists in auth table
      const { data: users, error: fetchError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', email.trim())
      
      if (fetchError) {
        console.error('❌ Error fetching user:', fetchError)
        return { success: false, error: fetchError }
      }
      
      console.log(`📊 Found ${users?.length || 0} users with email ${email}`)
      
      if (!users || users.length === 0) {
        console.log('❌ No user found with this email')
        return { success: false, error: 'User not found' }
      }
      
      if (users.length > 1) {
        console.warn('⚠️ Multiple users found with same email:', users)
      }
      
      const user = users[0]
      console.log('👤 User data:', { 
        email: user.email, 
        student_id: user.student_id,
        hasPassword: !!user.password 
      })
      
      // Step 2: Check password
      if (user.password !== password) {
        console.log('❌ Password mismatch')
        console.log('Expected password length:', user.password?.length || 0)
        console.log('Provided password length:', password?.length || 0)
        return { success: false, error: 'Invalid password' }
      }
      
      console.log('✅ Password matches!')
      
      // Step 3: Check student profile in v0001_student_database
      const { data: studentProfile, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', user.student_id)
      
      if (profileError) {
        console.error('❌ Error fetching student profile:', profileError)
      } else {
        console.log(`📊 Found ${studentProfile?.length || 0} student profiles for student_id: ${user.student_id}`)
        if (studentProfile && studentProfile.length > 0) {
          const profile = studentProfile[0]
          console.log('👨‍🎓 Student profile:', {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            student_id: profile.student_id,
            skills: Array.isArray(profile.skills) ? profile.skills.length : 'N/A',
            projects: Array.isArray(profile.projects) ? profile.projects.length : 'N/A'
          })
        } else {
          console.log('⚠️ No student profile found for this user')
          console.log('🔍 Available student profiles:')
          await debugAuth.listAllStudentProfiles()
        }
      }
      
      return { 
        success: true, 
        user: {
          email: user.email,
          student_id: user.student_id
        },
        studentProfile: studentProfile?.[0] || null
      }
      
    } catch (err) {
      console.error('❌ Unexpected error during login test:', err)
      return { success: false, error: err }
    }
  },

  // Create test user with matching student profile
  createTestUser: async () => {
    const testEmail = 'test@example.com'
    const testPassword = 'password123'
    const testStudentId = 'STU_TEST_001'
    
    console.log('🔍 Creating test user...')
    
    try {
      // Check if test user already exists
      const { data: existing } = await supabase
        .from('v0001_auth')
        .select('email')
        .eq('email', testEmail)
        .maybeSingle()
      
      if (existing) {
        console.log('ℹ️ Test user already exists')
        return { email: testEmail, password: testPassword, student_id: testStudentId }
      }
      
      // Create test user in auth table
      const { data, error } = await supabase
        .from('v0001_auth')
        .insert({
          email: testEmail,
          password: testPassword,
          student_id: testStudentId
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating test user:', error)
        return null
      }
      
      console.log('✅ Test user created:', data)
      
      // Create corresponding student profile
      const { data: profileData, error: profileError } = await supabase
        .from('v0001_student_database')
        .insert({
          student_id: testStudentId,
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
          projects: [
            { 
              name: 'Test Project', 
              description: 'A sample project for testing',
              technologies: ['React', 'TypeScript'],
              url: 'https://github.com/test/project'
            }
          ],
          experience: { 
            summary: 'Test user for debugging authentication and profile system',
            internship: 'Software Development Intern at Tech Company'
          },
          job_preferences: { 
            location: 'Remote',
            desired_role: 'Software Developer',
            job_type: 'Full-time',
            industry: 'Technology'
          },
          certifications_and_licenses: [
            {
              name: 'JavaScript Certification',
              issuer: 'Tech Academy',
              date: '2024'
            }
          ]
        })
        .select()
        .single()
      
      if (profileError) {
        console.error('❌ Error creating student profile:', profileError)
      } else {
        console.log('✅ Student profile created:', {
          id: profileData.id,
          name: `${profileData.first_name} ${profileData.last_name}`,
          student_id: profileData.student_id
        })
      }
      
      return { email: testEmail, password: testPassword, student_id: testStudentId }
      
    } catch (err) {
      console.error('❌ Unexpected error creating test user:', err)
      return null
    }
  },

  // Run full diagnostic
  runDiagnostic: async () => {
    console.log('🚀 Starting authentication diagnostic...')
    console.log('=====================================')
    
    // Test 1: Connection
    const connectionOk = await debugAuth.testConnection()
    if (!connectionOk) {
      console.log('❌ Diagnostic failed: No database connection')
      console.log('')
      console.log('🔧 To fix this issue:')
      console.log('1. Check your .env file in the project root')
      console.log('2. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
      console.log('3. Get these values from your Supabase project settings > API')
      console.log('4. Restart the development server after updating .env')
      console.log('=====================================')
      return
    }
    
    // Test 2: List users
    const users = await debugAuth.listAllUsers()
    
    // Test 3: List student profiles
    const profiles = await debugAuth.listAllStudentProfiles()
    
    // Test 4: Create test user if no users exist
    if (users.length === 0) {
      console.log('ℹ️ No users found, creating test user...')
      const testUser = await debugAuth.createTestUser()
      if (testUser) {
        console.log('✅ Test user created. Try logging in with:')
        console.log(`Email: ${testUser.email}`)
        console.log(`Password: ${testUser.password}`)
      }
    } else {
      console.log('ℹ️ Existing users found. Try logging in with one of these emails:')
      users.forEach(user => console.log(`- ${user.email} (Student ID: ${user.student_id})`))
    }
    
    // Test 5: Show data summary
    console.log('')
    console.log('📊 Database Summary:')
    console.log(`- Auth users: ${users.length}`)
    console.log(`- Student profiles: ${profiles.length}`)
    
    if (profiles.length > 0) {
      console.log('')
      console.log('🎯 Available student profiles for testing:')
      profiles.forEach(profile => {
        console.log(`- ${profile.first_name} ${profile.last_name} (${profile.student_id})`)
      })
    }
    
    console.log('=====================================')
    console.log('🏁 Diagnostic complete')
  }
}

// Auto-run diagnostic in development
if (import.meta.env.DEV) {
  // Add to window for manual testing
  ;(window as any).debugAuth = debugAuth
  
  // Auto-run diagnostic after a short delay
  setTimeout(() => {
    debugAuth.runDiagnostic()
  }, 2000)
}