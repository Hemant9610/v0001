// Debug authentication system
import { supabase } from './supabase'

export const debugAuth = {
  // Test database connection
  testConnection: async () => {
    console.log('🔍 Testing Supabase connection...')
    try {
      const { data, error } = await supabase
        .from('v0001_auth')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Connection failed:', error)
        return false
      }
      
      console.log('✅ Connection successful, records count:', data)
      return true
    } catch (err) {
      console.error('❌ Connection error:', err)
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

  // Test specific user login
  testUserLogin: async (email: string, password: string) => {
    console.log(`🔍 Testing login for: ${email}`)
    
    try {
      // Step 1: Check if user exists
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
      
      // Step 3: Check student profile
      const { data: studentProfile, error: profileError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', user.student_id)
      
      if (profileError) {
        console.error('❌ Error fetching student profile:', profileError)
      } else {
        console.log(`📊 Found ${studentProfile?.length || 0} student profiles`)
        if (studentProfile && studentProfile.length > 0) {
          console.log('👨‍🎓 Student profile:', {
            name: `${studentProfile[0].first_name} ${studentProfile[0].last_name}`,
            email: studentProfile[0].email
          })
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

  // Create test user
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
      
      // Create test user
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
      const { error: profileError } = await supabase
        .from('v0001_student_database')
        .insert({
          student_id: testStudentId,
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          skills: ['JavaScript', 'React', 'Node.js'],
          projects: [{ name: 'Test Project', description: 'A test project' }],
          experience: { summary: 'Test user for debugging' },
          job_preferences: { location: 'Remote' }
        })
      
      if (profileError) {
        console.error('❌ Error creating student profile:', profileError)
      } else {
        console.log('✅ Student profile created')
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
      return
    }
    
    // Test 2: List users
    const users = await debugAuth.listAllUsers()
    
    // Test 3: Create test user if no users exist
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