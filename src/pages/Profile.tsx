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
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [skills, setSkills] = useState([])

  // Function to fetch student profile directly from database
  const fetchStudentProfile = async () => {
    if (!user?.student_id) {
      setError('No student ID available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Query the v0001_student_database table directly
      const { data, error: dbError } = await supabase
        .from('v0001_student_database')
        .select('*')
        .eq('student_id', user.student_id)
        .maybeSingle()

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      if (!data) {
        // Try to find by email as fallback
        const { data: emailData, error: emailError } = await supabase
          .from('v0001_student_database')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (emailError) {
          throw new Error(`Email lookup error: ${emailError.message}`)
        }

        if (!emailData) {
          setError('No student profile found in database')
          setLoading(false)
          return
        }

        setProfileData(emailData)
      } else {
        setProfileData(data)
      }

      // Parse skills from the profile data
      if (data?.skills || emailData?.skills) {
        const skillsData = data?.skills || emailData?.skills
        const parsedSkills = parseSkillsFromDatabase(skillsData)
        setSkills(parsedSkills)
      }

      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Function to parse skills from JSONB format
  const parseSkillsFromDatabase = (skillsData) => {
    if (!skillsData || skillsData === null || skillsData === undefined) {
      return []
    }
    
    // Handle direct arrays
    if (Array.isArray(skillsData)) {
      return skillsData.filter(skill => skill && typeof skill === 'string' && skill.trim())
    }
    
    // Handle JSONB string format
    if (typeof skillsData === 'string') {
      try {
        let cleanedData = skillsData.trim()
        
        // Remove outer quotes if present
        if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
          cleanedData = cleanedData.slice(1, -1)
        }
        
        // Unescape escaped quotes
        cleanedData = cleanedData.replace(/\\"/g, '"')
        
        const parsed = JSON.parse(cleanedData)
        
        if (Array.isArray(parsed)) {
          return parsed.filter(skill => skill && typeof skill === 'string' && skill.trim())
        }
        
        if (typeof parsed === 'string' && parsed.trim()) {
          return [parsed.trim()]
        }
        
        return []
      } catch (err) {
        const trimmed = skillsData.trim()
        return trimmed ? [trimmed] : []
      }
    }
    
    // Handle object format
    if (typeof skillsData === 'object' && skillsData !== null) {
      const values = Object.values(skillsData).flat()
      return values.filter(skill => skill && typeof skill === 'string' && skill.trim())
    }
    
    return []
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

  // Load profile data when component mounts
  useEffect(() => {
    fetchStudentProfile()
  }, [user?.student_id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Helper functions for user info - ONLY use database data
  const getInitials = () => {
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name.charAt(0).toUpperCase()}${profileData.last_name.charAt(0).toUpperCase()}`
    }
    if (profileData?.first_name) {
      return profileData.first_name.charAt(0).toUpperCase()
    }
    if (profileData?.last_name) {
      return profileData.last_name.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`
    }
    if (profileData?.first_name) {
      return profileData.first_name
    }
    if (profileData?.last_name) {
      return profileData.last_name
    }
    return 'Student Profile'
  }

  const getUserEmail = () => {
    return profileData?.email || user?.email || 'No email available'
  }

  const getStudentId = () => {
    return profileData?.student_id || user?.student_id || 'No student ID'
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchStudentProfile} className="w-full">
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
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
                      src={profileData?.profile_image}
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
                      {/* Display database first_name and last_name */}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                      Open to work
                    </Button>
                    <Button variant="outline" className="px-6">
                      Add profile section
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-6"
                      onClick={fetchStudentProfile}
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Status */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Profile Active</h3>
                    <p className="text-sm text-gray-700">
                      Your profile is loaded from the database with {skills.length} skills
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">About</h2>
              <Button variant="ghost" size="sm">
                <Edit3 size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {profileData?.experience?.summary || 
                 `Passionate student with expertise in modern technologies. 
                 Currently pursuing studies and seeking opportunities in the technology sector.`}
              </p>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Skills</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {skills.length} skills
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={fetchStudentProfile}
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {skills.length > 0 ? (
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
                    No skills data found in your profile
                  </p>
                  <Button 
                    onClick={fetchStudentProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Reload Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
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

          {/* Database Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Database size={20} />
                Profile Data Source
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Database Table:</strong> v0001_student_database</p>
                  <p><strong>Student ID:</strong> {profileData?.student_id}</p>
                  <p><strong>Database ID:</strong> {profileData?.id}</p>
                </div>
                <div>
                  <p><strong>First Name:</strong> {profileData?.first_name || 'Not set'}</p>
                  <p><strong>Last Name:</strong> {profileData?.last_name || 'Not set'}</p>
                  <p><strong>Email:</strong> {profileData?.email || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile