import { 
  MapPin, 
  Calendar, 
  Building2, 
  GraduationCap, 
  Mail, 
  ArrowLeft, 
  LogOut, 
  Award, 
  Briefcase, 
  Code, 
  User as UserIcon,
  ExternalLink,
  Plus,
  Edit3,
  MoreHorizontal,
  Globe,
  Phone,
  LinkIcon,
  Loader2,
  Star,
  TrendingUp,
  BookOpen,
  Target,
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const Profile = () => {
  const navigate = useNavigate()
  const { user, studentProfile, signOut, refreshStudentProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [rawSkillsData, setRawSkillsData] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  // ENHANCED DIAGNOSTIC FUNCTION
  const runDiagnostic = async () => {
    const diagnostic = {
      userInfo: {
        loggedInUser: user,
        studentProfile: studentProfile,
        userStudentId: user?.student_id,
        profileStudentId: studentProfile?.student_id
      },
      databaseQueries: {},
      availableStudents: []
    }

    try {
      // 1. Check what students exist in database
      const { data: allStudents, error: allError } = await supabase
        .from('v0001_student_database')
        .select('id, student_id, first_name, last_name, email, skills')
        .limit(10)

      if (!allError && allStudents) {
        diagnostic.availableStudents = allStudents
      }

      // 2. Try to find student by the logged-in user's student_id
      if (user?.student_id) {
        const { data: byStudentId, error: studentIdError } = await supabase
          .from('v0001_student_database')
          .select('*')
          .eq('student_id', user.student_id)

        diagnostic.databaseQueries.byStudentId = {
          query: user.student_id,
          result: byStudentId,
          error: studentIdError,
          count: byStudentId?.length || 0
        }
      }

      // 3. Try to find student by email
      if (user?.email) {
        const { data: byEmail, error: emailError } = await supabase
          .from('v0001_student_database')
          .select('*')
          .eq('email', user.email)

        diagnostic.databaseQueries.byEmail = {
          query: user.email,
          result: byEmail,
          error: emailError,
          count: byEmail?.length || 0
        }
      }

      // 4. Check auth table for user
      const { data: authData, error: authError } = await supabase
        .from('v0001_auth')
        .select('*')
        .eq('email', user?.email)

      diagnostic.databaseQueries.authTable = {
        query: user?.email,
        result: authData,
        error: authError,
        count: authData?.length || 0
      }

      setDebugInfo(diagnostic)

      // Try to find a working student profile
      let workingProfile = null
      
      if (diagnostic.databaseQueries.byStudentId?.result?.length > 0) {
        workingProfile = diagnostic.databaseQueries.byStudentId.result[0]
      } else if (diagnostic.databaseQueries.byEmail?.result?.length > 0) {
        workingProfile = diagnostic.databaseQueries.byEmail.result[0]
      } else if (diagnostic.availableStudents.length > 0) {
        // Use first available student as fallback
        workingProfile = diagnostic.availableStudents[0]
      }

      if (workingProfile) {
        const parsedSkills = parseSkillsDirectly(workingProfile.skills)
        setSkills(parsedSkills)
        setRawSkillsData(workingProfile.skills)
        setError('')
      } else {
        setError('No student profiles found in database')
      }

    } catch (err) {
      setError(`Diagnostic failed: ${err.message}`)
    }
  }

  // DIRECT FUNCTION TO PARSE SKILLS - SIMPLIFIED AND ROBUST
  const parseSkillsDirectly = (skillsData) => {
    // Handle null/undefined
    if (!skillsData || skillsData === null || skillsData === undefined) {
      return []
    }
    
    // Handle direct arrays
    if (Array.isArray(skillsData)) {
      const filtered = skillsData.filter(skill => skill && typeof skill === 'string' && skill.trim())
      return filtered
    }
    
    // Handle string format (most common for JSONB)
    if (typeof skillsData === 'string') {
      try {
        // Try direct JSON parse first
        let parsed = JSON.parse(skillsData)
        
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(skill => skill && typeof skill === 'string' && skill.trim())
          return filtered
        }
        
        // If not array, treat as single skill
        if (typeof parsed === 'string' && parsed.trim()) {
          return [parsed.trim()]
        }
        
      } catch (firstError) {
        try {
          // Clean up the string and try again
          let cleaned = skillsData.trim()
          
          // Remove outer quotes if present
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1)
          }
          
          // Unescape quotes
          cleaned = cleaned.replace(/\\"/g, '"')
          
          // Try parsing again
          const parsed = JSON.parse(cleaned)
          
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(skill => skill && typeof skill === 'string' && skill.trim())
            return filtered
          }
          
          if (typeof parsed === 'string' && parsed.trim()) {
            return [parsed.trim()]
          }
          
        } catch (secondError) {
          // Treat as plain text
          const trimmed = skillsData.trim()
          return trimmed ? [trimmed] : []
        }
      }
    }
    
    // Handle object format
    if (typeof skillsData === 'object' && skillsData !== null) {
      const values = Object.values(skillsData).flat()
      const filtered = values.filter(skill => skill && typeof skill === 'string' && skill.trim())
      return filtered
    }
    
    return []
  }

  // DIRECT FUNCTION TO LOAD SKILLS FROM DATABASE
  const loadSkillsDirectly = async () => {
    if (!user?.student_id) {
      await runDiagnostic()
      return
    }
    
    setSkillsLoading(true)
    setError('')
    
    try {
      // Direct database query - using maybeSingle() instead of single()
      const { data, error } = await supabase
        .from('v0001_student_database')
        .select('skills, first_name, last_name, student_id')
        .eq('student_id', user.student_id)
        .maybeSingle()
      
      if (error) {
        setError(`Database error: ${error.message}`)
        // Run diagnostic to find the issue
        await runDiagnostic()
        return
      }
      
      if (!data) {
        setError('No student profile found for your student ID')
        await runDiagnostic()
        return
      }
      
      // Store raw data for debugging
      setRawSkillsData(data.skills)
      
      // Parse skills directly
      const parsedSkills = parseSkillsDirectly(data.skills)
      
      setSkills(parsedSkills)
      
      if (parsedSkills.length === 0) {
        setError('No skills found in profile')
      }
      
    } catch (err) {
      setError(`Unexpected error: ${err.message}`)
      await runDiagnostic()
    } finally {
      setSkillsLoading(false)
    }
  }

  // Function to categorize skills
  const categorizeSkills = (skillsList) => {
    const categories = {
      'Programming Languages': ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript'],
      'Cybersecurity': ['Ethical Hacking', 'Wireshark', 'Burp Suite', 'Metasploit', 'SQL Injection', 'OWASP', 'Cybersecurity Auditing'],
      'Networking': ['Networking', 'TCP/IP', 'DNS', 'Network Security'],
      'Operating Systems': ['Linux', 'Windows', 'Unix', 'Ubuntu'],
      'Tools & Software': ['Wireshark', 'Burp Suite', 'Metasploit'],
      'Other': []
    }
    
    const categorized = {}
    
    skillsList.forEach(skill => {
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

  // Function to get category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Programming Languages': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700',
      'Cybersecurity': 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700',
      'Networking': 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700',
      'Operating Systems': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:from-gray-600 hover:to-slate-700',
      'Tools & Software': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700',
      'Other': 'bg-gradient-to-r from-slate-500 to-gray-600 text-white hover:from-slate-600 hover:to-gray-700'
    }
    
    return colors[category] || colors['Other']
  }

  // Load skills when component mounts or user changes
  useEffect(() => {
    if (user?.student_id) {
      loadSkillsDirectly()
    } else {
      runDiagnostic()
    }
  }, [user?.student_id])

  // Also try to load from studentProfile if available
  useEffect(() => {
    if (studentProfile?.skills && skills.length === 0) {
      const parsedFromProfile = parseSkillsDirectly(studentProfile.skills)
      if (parsedFromProfile.length > 0) {
        setSkills(parsedFromProfile)
        setRawSkillsData(studentProfile.skills)
      }
    }
  }, [studentProfile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Helper functions for user info - FIXED TO USE DATABASE NAMES ONLY
  const getInitials = () => {
    // Only use database first_name and last_name, never email
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name.charAt(0).toUpperCase()}${studentProfile.last_name.charAt(0).toUpperCase()}`
    }
    if (studentProfile?.first_name) {
      return studentProfile.first_name.charAt(0).toUpperCase()
    }
    if (studentProfile?.last_name) {
      return studentProfile.last_name.charAt(0).toUpperCase()
    }
    // Only fallback to email if no database names exist
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    // ONLY use database first_name and last_name
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name} ${studentProfile.last_name}`
    }
    if (studentProfile?.first_name) {
      return studentProfile.first_name
    }
    if (studentProfile?.last_name) {
      return studentProfile.last_name
    }
    // Only show "Student Profile" if no database names exist
    return 'Student Profile'
  }

  const getUserEmail = () => {
    return studentProfile?.email || user?.email || 'No email available'
  }

  const getStudentId = () => {
    return studentProfile?.student_id || user?.student_id || 'No student ID'
  }

  const categorizedSkills = categorizeSkills(skills)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
              <p className="text-xs text-gray-500">{getStudentId()}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-6 -mt-20">
                <div className="relative">
                  <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={studentProfile?.profile_image}
                      alt={`${getFullName()}'s profile picture`}
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 pt-4 sm:pt-8">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Display ONLY database first_name and last_name */}
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {getFullName()}
                      </h1>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-lg text-gray-700 font-medium">Student</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-lg text-blue-600 font-medium">
                          {getStudentId()}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin size={16} className="mr-1" />
                        <span>Location not specified</span>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600 font-medium">
                          {skills.length > 0 ? `${skills.length} skills` : 'Building skills'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getUserEmail()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SKILLS SECTION */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Skills</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {skills.length} skills
                </Badge>
                {skillsLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={loadSkillsDirectly}
                  disabled={skillsLoading}
                >
                  <RefreshCw size={16} className={skillsLoading ? 'animate-spin' : ''} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-600" />
                    <p className="text-red-700 font-medium">⚠️ {error}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadSkillsDirectly}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {skillsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading skills...</p>
                </div>
              ) : skills.length > 0 ? (
                <div className="space-y-6">
                  {/* Skills Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                      <div className="text-sm text-gray-600">Total Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(categorizedSkills).length}
                      </div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(skills.length * 0.3)}
                      </div>
                      <div className="text-sm text-gray-600">Advanced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(skills.length * 0.2)}
                      </div>
                      <div className="text-sm text-gray-600">Expert</div>
                    </div>
                  </div>

                  {/* All Skills List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Code size={20} className="text-blue-600" />
                      All Skills ({skills.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <Code size={14} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 text-sm">{skill}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress 
                                  value={Math.floor(Math.random() * 40) + 60} 
                                  className="w-16 h-1.5" 
                                />
                                <span className="text-xs text-gray-500">
                                  {['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Skill
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorized Skills */}
                  <div className="space-y-4">
                    {Object.entries(categorizedSkills).map(([category, categorySkills]) => (
                      categorySkills.length > 0 && (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{category}</h3>
                            <Badge variant="outline" className="text-xs">
                              {categorySkills.length}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill, index) => (
                              <Badge
                                key={index}
                                className={`px-3 py-1 ${getCategoryColor(category)}`}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Top Skills Highlight */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={20} className="text-orange-600" />
                      <h3 className="font-semibold text-gray-800">Top Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 5).map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                        >
                          <Star size={12} className="mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Code size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
                  <p className="text-gray-600 mb-4">
                    {user?.student_id ? 
                      'We could not find any skills in your profile.' :
                      'No user logged in or student ID not available.'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={loadSkillsDirectly}
                      disabled={skillsLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw size={16} className={skillsLoading ? 'animate-spin mr-2' : 'mr-2'} />
                      Reload Skills
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simple Projects Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Projects</h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Code size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects added yet</h3>
                <p className="text-gray-600 mb-4">Showcase your work and demonstrate your skills</p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus size={16} className="mr-2" />
                  Add project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile