/**
 * Simple JavaScript helper to fetch and parse skills from the database
 * Works with JSONB format like: "[\"Python\",\"Linux\",\"Networking\",...]"
 */

import { supabase } from './supabase'

// Function to get skills from database and parse them
export async function getStudentSkills(studentId) {
  try {
    console.log('🔍 Fetching skills for student:', studentId)
    
    const { data, error } = await supabase
      .from('v0001_student_database')
      .select('skills, first_name, last_name')
      .eq('student_id', studentId)
      .single()
    
    if (error) {
      console.error('❌ Error fetching skills:', error)
      return { skills: [], error }
    }
    
    if (!data) {
      console.log('❌ No student found')
      return { skills: [], error: 'Student not found' }
    }
    
    console.log('✅ Raw skills data:', data.skills)
    console.log('✅ Data type:', typeof data.skills)
    
    // Parse the skills
    const parsedSkills = parseSkillsFromJSONB(data.skills)
    console.log('✅ Parsed skills:', parsedSkills)
    
    return { 
      skills: parsedSkills, 
      studentName: `${data.first_name} ${data.last_name}`,
      error: null 
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return { skills: [], error: err.message }
  }
}

// Function to parse JSONB skills data
export function parseSkillsFromJSONB(skillsData) {
  console.log('🔧 Parsing skills data:', {
    data: skillsData,
    type: typeof skillsData,
    isArray: Array.isArray(skillsData)
  })
  
  // Handle null/undefined
  if (!skillsData || skillsData === null || skillsData === undefined) {
    console.log('❌ No skills data')
    return []
  }
  
  // Handle direct arrays
  if (Array.isArray(skillsData)) {
    console.log('✅ Already an array')
    return skillsData.filter(skill => skill && skill.trim())
  }
  
  // Handle JSONB string format
  if (typeof skillsData === 'string') {
    try {
      // Clean up the string
      let cleanedData = skillsData.trim()
      
      // Remove outer quotes if present
      if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
        cleanedData = cleanedData.slice(1, -1)
      }
      
      // Unescape escaped quotes
      cleanedData = cleanedData.replace(/\\"/g, '"')
      
      console.log('🔧 Cleaned data:', cleanedData)
      
      // Parse JSON
      const parsed = JSON.parse(cleanedData)
      console.log('✅ Parsed JSON:', parsed)
      
      if (Array.isArray(parsed)) {
        return parsed.filter(skill => skill && skill.trim())
      }
      
      return [parsed].filter(skill => skill && skill.trim())
      
    } catch (err) {
      console.error('❌ JSON parse error:', err)
      // Treat as single skill if parsing fails
      return skillsData.trim() ? [skillsData.trim()] : []
    }
  }
  
  // Handle object format
  if (typeof skillsData === 'object') {
    const values = Object.values(skillsData).flat()
    return values.filter(skill => skill && typeof skill === 'string' && skill.trim())
  }
  
  return []
}

// Function to categorize skills
export function categorizeSkills(skills) {
  const categories = {
    'Programming Languages': ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript'],
    'Cybersecurity': ['Ethical Hacking', 'Wireshark', 'Burp Suite', 'Metasploit', 'SQL Injection', 'OWASP', 'Cybersecurity Auditing'],
    'Networking': ['Networking', 'TCP/IP', 'DNS', 'Network Security'],
    'Operating Systems': ['Linux', 'Windows', 'Unix', 'Ubuntu'],
    'Tools & Software': ['Wireshark', 'Burp Suite', 'Metasploit'],
    'Other': []
  }
  
  const categorized = {}
  
  skills.forEach(skill => {
    let placed = false
    const skillLower = skill.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => 
        skillLower.includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(skillLower)
      )) {
        if (!categorized[category]) categorized[category] = []
        categorized[category].push(skill)
        placed = true
        break
      }
    }
    
    if (!placed) {
      if (!categorized['Other']) categorized['Other'] = []
      categorized['Other'].push(skill)
    }
  })
  
  return categorized
}

// Function to create skills HTML
export function createSkillsHTML(skills) {
  if (!skills || skills.length === 0) {
    return `
      <div class="text-center py-8 text-gray-500">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <span class="text-2xl">💻</span>
        </div>
        <p class="text-gray-600">No skills found</p>
      </div>
    `
  }
  
  const categorized = categorizeSkills(skills)
  
  let html = `
    <div class="space-y-6">
      <!-- Skills Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">${skills.length}</div>
          <div class="text-sm text-gray-600">Total Skills</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">${Object.keys(categorized).length}</div>
          <div class="text-sm text-gray-600">Categories</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">${Math.floor(skills.length * 0.3)}</div>
          <div class="text-sm text-gray-600">Advanced</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">${Math.floor(skills.length * 0.2)}</div>
          <div class="text-sm text-gray-600">Expert</div>
        </div>
      </div>
      
      <!-- All Skills -->
      <div class="space-y-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
          <span class="text-blue-600">💻</span>
          All Skills (${skills.length})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  `
  
  skills.forEach(skill => {
    html += `
      <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-sm">💻</span>
          </div>
          <span class="font-medium text-gray-900 text-sm">${skill}</span>
        </div>
        <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Skill</span>
      </div>
    `
  })
  
  html += `
        </div>
      </div>
      
      <!-- Categorized Skills -->
      <div class="space-y-4">
  `
  
  Object.entries(categorized).forEach(([category, categorySkills]) => {
    if (categorySkills.length > 0) {
      const categoryColor = getCategoryColor(category)
      html += `
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-800">${category}</h3>
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${categorySkills.length}</span>
          </div>
          <div class="flex flex-wrap gap-2">
      `
      
      categorySkills.forEach(skill => {
        html += `
          <span class="px-3 py-1 ${categoryColor} rounded-full text-sm font-medium">
            ${skill}
          </span>
        `
      })
      
      html += `
          </div>
        </div>
      `
    }
  })
  
  html += `
      </div>
      
      <!-- Top Skills -->
      <div class="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-orange-600">⭐</span>
          <h3 class="font-semibold text-gray-800">Top Skills</h3>
        </div>
        <div class="flex flex-wrap gap-2">
  `
  
  skills.slice(0, 5).forEach(skill => {
    html += `
      <span class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
        ⭐ ${skill}
      </span>
    `
  })
  
  html += `
        </div>
      </div>
    </div>
  `
  
  return html
}

// Helper function for category colors
function getCategoryColor(category) {
  const colors = {
    'Programming Languages': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    'Cybersecurity': 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    'Networking': 'bg-gradient-to-r from-orange-500 to-red-600 text-white',
    'Operating Systems': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
    'Tools & Software': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
    'Other': 'bg-gradient-to-r from-slate-500 to-gray-600 text-white'
  }
  
  return colors[category] || colors['Other']
}

// Function to display skills in a container
export async function displaySkillsInContainer(containerId, studentId) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error('❌ Container not found:', containerId)
    return
  }
  
  // Show loading
  container.innerHTML = `
    <div class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Loading skills...</p>
    </div>
  `
  
  try {
    const { skills, studentName, error } = await getStudentSkills(studentId)
    
    if (error) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <p>Error loading skills: ${error}</p>
        </div>
      `
      return
    }
    
    console.log('✅ Displaying skills for:', studentName)
    console.log('✅ Skills:', skills)
    
    container.innerHTML = createSkillsHTML(skills)
    
  } catch (err) {
    console.error('❌ Error displaying skills:', err)
    container.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <p>Error: ${err.message}</p>
      </div>
    `
  }
}

// Add to window for manual testing
if (typeof window !== 'undefined') {
  window.skillsHelper = {
    getStudentSkills,
    parseSkillsFromJSONB,
    categorizeSkills,
    createSkillsHTML,
    displaySkillsInContainer
  }
}