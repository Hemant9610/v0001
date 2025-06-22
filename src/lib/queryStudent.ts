import { supabase } from './supabase'

// Function to get a specific student's data by name
export const getStudentByName = async (firstName: string, lastName: string) => {
  try {
    console.log(`🔍 Searching for student: ${firstName} ${lastName}`)
    
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('*')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error fetching student:', error)
      return { data: null, error }
    }
    
    if (data) {
      console.log('✅ Found student:', {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        student_id: data.student_id,
        skills: data.skills,
        skills_type: typeof data.skills,
        skills_count: Array.isArray(data.skills) ? data.skills.length : 'Not an array'
      })
    } else {
      console.log('❌ No student found with that name')
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Function to get Ishaan Malik specifically
export const getIshaanMalik = async () => {
  return await getStudentByName('Ishaan', 'Malik')
}

// Function to parse and display skills in a readable format
export const parseSkills = (skillsData: any) => {
  console.log('🔍 Parsing skills data:', {
    data: skillsData,
    type: typeof skillsData,
    isArray: Array.isArray(skillsData),
    isNull: skillsData === null,
    stringified: JSON.stringify(skillsData)
  })
  
  if (!skillsData || skillsData === null || skillsData === undefined) {
    return []
  }
  
  // Handle direct arrays
  if (Array.isArray(skillsData)) {
    return skillsData.filter(skill => skill !== null && skill !== undefined && skill !== '')
  }
  
  // Handle JSONB string format
  if (typeof skillsData === 'string') {
    try {
      const parsed = JSON.parse(skillsData)
      if (Array.isArray(parsed)) {
        return parsed.filter(skill => skill !== null && skill !== undefined && skill !== '')
      }
      return [parsed].filter(skill => skill !== null && skill !== undefined && skill !== '')
    } catch (err) {
      return skillsData.trim() ? [skillsData] : []
    }
  }
  
  // Handle JSONB object format
  if (typeof skillsData === 'object' && skillsData !== null) {
    const values = Object.values(skillsData).flat()
    return values.filter(skill => skill !== null && skill !== undefined && skill !== '')
  }
  
  return []
}

// Function to display all students (for debugging)
export const getAllStudents = async () => {
  try {
    console.log('🔍 Fetching all students...')
    
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('id, student_id, first_name, last_name, email, skills')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error fetching students:', error)
      return { data: [], error }
    }
    
    console.log('📋 All students:')
    data?.forEach((student, index) => {
      const skills = parseSkills(student.skills)
      console.log(`${index + 1}. ${student.first_name} ${student.last_name}`)
      console.log(`   Student ID: ${student.student_id}`)
      console.log(`   Email: ${student.email}`)
      console.log(`   Skills: ${skills.length > 0 ? skills.join(', ') : 'No skills'}`)
      console.log('   ---')
    })
    
    return { data: data || [], error: null }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return { data: [], error: err }
  }
}

// Add to window for manual testing in browser console
if (typeof window !== 'undefined') {
  (window as any).queryStudent = {
    getIshaanMalik,
    getStudentByName,
    getAllStudents,
    parseSkills
  }
}