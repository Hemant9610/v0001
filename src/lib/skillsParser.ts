/**
 * Enhanced skills parser for JSONB format from Supabase
 * Handles the specific format: "[\"Python\",\"Linux\",\"Networking\",...]"
 */

export interface ParsedSkill {
  name: string
  category?: string
  level?: string
}

/**
 * Parse JSONB skills data from database
 * Handles various formats including double-encoded JSON strings
 */
export const parseSkillsFromJSONB = (skillsData: any): string[] => {
  console.log('🔍 Parsing JSONB skills:', {
    data: skillsData,
    type: typeof skillsData,
    isArray: Array.isArray(skillsData),
    isNull: skillsData === null,
    stringified: JSON.stringify(skillsData)
  })
  
  // Handle null/undefined
  if (!skillsData || skillsData === null || skillsData === undefined) {
    console.log('❌ No skills data provided')
    return []
  }
  
  // Handle direct arrays (already parsed)
  if (Array.isArray(skillsData)) {
    console.log('✅ Skills data is already an array')
    return skillsData.filter(skill => 
      skill !== null && 
      skill !== undefined && 
      skill !== '' && 
      typeof skill === 'string'
    )
  }
  
  // Handle JSONB string format (most common case)
  if (typeof skillsData === 'string') {
    try {
      // Handle double-encoded JSON strings like "\"[\\\"Python\\\",\\\"Linux\\\"]\""
      let cleanedData = skillsData
      
      // Remove outer quotes if present
      if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
        cleanedData = cleanedData.slice(1, -1)
      }
      
      // Unescape escaped quotes
      cleanedData = cleanedData.replace(/\\"/g, '"')
      
      console.log('🔧 Cleaned JSON string:', cleanedData)
      
      // Parse the JSON
      const parsed = JSON.parse(cleanedData)
      console.log('✅ Parsed JSON:', parsed)
      
      if (Array.isArray(parsed)) {
        const validSkills = parsed.filter(skill => 
          skill !== null && 
          skill !== undefined && 
          skill !== '' && 
          typeof skill === 'string'
        )
        console.log('✅ Valid skills extracted:', validSkills)
        return validSkills
      }
      
      // If parsed result is not an array, treat as single skill
      if (typeof parsed === 'string' && parsed.trim()) {
        return [parsed.trim()]
      }
      
      console.log('⚠️ Parsed data is not an array:', parsed)
      return []
      
    } catch (err) {
      console.error('❌ Failed to parse JSON string:', err)
      console.log('🔧 Treating as plain text skill')
      
      // If JSON parsing fails, treat as plain text
      const trimmed = skillsData.trim()
      return trimmed ? [trimmed] : []
    }
  }
  
  // Handle JSONB object format
  if (typeof skillsData === 'object' && skillsData !== null) {
    console.log('🔧 Processing object format')
    
    // Extract all values from the object
    const values = Object.values(skillsData)
    const flatValues = values.flat().filter(skill => 
      skill !== null && 
      skill !== undefined && 
      skill !== '' && 
      typeof skill === 'string'
    )
    
    console.log('✅ Extracted values from object:', flatValues)
    return flatValues
  }
  
  console.log('⚠️ Unhandled data type, returning empty array')
  return []
}

/**
 * Categorize skills into different technology areas
 */
export const categorizeSkills = (skills: string[]): { [category: string]: string[] } => {
  const categories = {
    'Programming Languages': [
      'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'C', 'Assembly', 'Haskell'
    ],
    'Web Technologies': [
      'React', 'Vue', 'Angular', 'HTML', 'CSS', 'Node.js', 'Express', 'Django', 'Flask',
      'Tailwind', 'Bootstrap', 'jQuery', 'Next.js', 'Nuxt.js', 'Gatsby', 'Webpack', 'Vite'
    ],
    'Databases': [
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Firebase', 'Firestore',
      'DynamoDB', 'Cassandra', 'Neo4j', 'SQL', 'NoSQL'
    ],
    'Cloud & DevOps': [
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
      'CircleCI', 'Travis CI', 'Terraform', 'Ansible', 'Linux', 'Unix'
    ],
    'Cybersecurity': [
      'Ethical Hacking', 'Penetration Testing', 'Cybersecurity', 'Network Security',
      'Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'OWASP', 'SQL Injection',
      'XSS', 'CSRF', 'Vulnerability Assessment', 'Security Auditing', 'Cybersecurity Auditing',
      'Firewall', 'IDS', 'IPS', 'SIEM', 'Cryptography'
    ],
    'Networking': [
      'Networking', 'TCP/IP', 'DNS', 'DHCP', 'VPN', 'Router', 'Switch', 'Firewall',
      'Network Administration', 'Network Monitoring', 'Network Troubleshooting'
    ],
    'Operating Systems': [
      'Linux', 'Windows', 'macOS', 'Unix', 'Ubuntu', 'CentOS', 'Red Hat', 'Debian'
    ],
    'Tools & Software': [
      'Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'Figma', 'Sketch', 'Adobe XD',
      'Photoshop', 'Illustrator', 'VS Code', 'IntelliJ', 'Eclipse'
    ],
    'Other Skills': []
  }

  const categorized: { [key: string]: string[] } = {}
  
  skills.forEach(skill => {
    let placed = false
    const skillLower = skill.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => 
        skillLower.includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(skillLower) ||
        skillLower === keyword.toLowerCase()
      )) {
        if (!categorized[category]) categorized[category] = []
        categorized[category].push(skill)
        placed = true
        break
      }
    }
    
    if (!placed) {
      if (!categorized['Other Skills']) categorized['Other Skills'] = []
      categorized['Other Skills'].push(skill)
    }
  })

  return categorized
}

/**
 * Get skill level based on common patterns
 */
export const getSkillLevel = (skill: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' => {
  // This is a simple heuristic - in a real app you'd store this in the database
  const advancedSkills = ['Metasploit', 'Burp Suite', 'SQL Injection', 'Ethical Hacking']
  const intermediateSkills = ['Wireshark', 'Linux', 'Networking', 'Python']
  
  if (advancedSkills.some(advanced => skill.toLowerCase().includes(advanced.toLowerCase()))) {
    return 'Advanced'
  }
  
  if (intermediateSkills.some(intermediate => skill.toLowerCase().includes(intermediate.toLowerCase()))) {
    return 'Intermediate'
  }
  
  return 'Beginner'
}

/**
 * Format skills for display with enhanced metadata
 */
export const formatSkillsForDisplay = (skillsData: any): ParsedSkill[] => {
  const skills = parseSkillsFromJSONB(skillsData)
  
  return skills.map(skill => ({
    name: skill,
    level: getSkillLevel(skill),
    category: Object.entries(categorizeSkills([skill]))[0]?.[0] || 'Other Skills'
  }))
}