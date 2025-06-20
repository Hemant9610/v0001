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
  Target
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

  // Refresh profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (user && !studentProfile) {
        setLoading(true)
        try {
          await refreshStudentProfile()
        } catch (err) {
          console.error('Error loading profile:', err)
          setError('Failed to load profile data')
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfile()
  }, [user, studentProfile, refreshStudentProfile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Enhanced helper function to safely render array or object data
  const renderArrayData = (data: any, fallback = []) => {
    console.log('🔍 Processing data:', { data, type: typeof data, isArray: Array.isArray(data) })
    
    if (!data) {
      console.log('❌ No data provided, returning fallback')
      return fallback
    }
    
    if (Array.isArray(data)) {
      console.log('✅ Data is array, returning as-is:', data)
      return data
    }
    
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        console.log('✅ Parsed JSON string:', parsed)
        if (Array.isArray(parsed)) {
          return parsed
        }
        // If parsed object has array values, extract them
        if (typeof parsed === 'object') {
          const values = Object.values(parsed).flat().filter(Boolean)
          console.log('✅ Extracted values from object:', values)
          return values
        }
        return [parsed]
      } catch (err) {
        console.log('⚠️ Failed to parse JSON, treating as single string:', data)
        return [data]
      }
    }
    
    if (typeof data === 'object') {
      // Handle object with array values or convert to array
      const values = Object.values(data)
      const flatValues = values.flat().filter(Boolean)
      console.log('✅ Extracted values from object:', flatValues)
      return flatValues.length > 0 ? flatValues : [JSON.stringify(data)]
    }
    
    console.log('⚠️ Converting single value to array:', [data])
    return [data]
  }

  // Helper function to get initials from the logged-in user's name
  const getInitials = () => {
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name.charAt(0).toUpperCase()}${studentProfile.last_name.charAt(0).toUpperCase()}`
    }
    if (studentProfile?.first_name) {
      return studentProfile.first_name.charAt(0).toUpperCase()
    }
    if (studentProfile?.email) {
      return studentProfile.email.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Get the full name of the logged-in user
  const getFullName = () => {
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name} ${studentProfile.last_name}`
    }
    if (studentProfile?.first_name) {
      return studentProfile.first_name
    }
    if (studentProfile?.last_name) {
      return studentProfile.last_name
    }
    // Fallback to email if no name is available
    if (studentProfile?.email) {
      return studentProfile.email.split('@')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Student Profile'
  }

  // Get user's email (prioritize student profile, fallback to auth user)
  const getUserEmail = () => {
    return studentProfile?.email || user?.email || 'No email available'
  }

  // Get user's student ID
  const getStudentId = () => {
    return studentProfile?.student_id || user?.student_id || 'No student ID'
  }

  // Parse data from database with enhanced processing and detailed logging
  console.log('🔍 Raw studentProfile data:', studentProfile)
  console.log('🔍 Raw skills data:', studentProfile?.skills)
  console.log('🔍 Raw projects data:', studentProfile?.projects)
  console.log('🔍 Raw experience data:', studentProfile?.experience)

  const skills = renderArrayData(studentProfile?.skills, [])
  const projects = renderArrayData(studentProfile?.projects, [])
  const experience = studentProfile?.experience || {}
  const certifications = renderArrayData(studentProfile?.certifications_and_licenses, [])
  const jobPrefs = studentProfile?.job_preferences || {}

  console.log('✅ Processed skills:', skills)
  console.log('✅ Processed projects:', projects)
  console.log('✅ Processed experience:', experience)

  // Enhanced skill categorization
  const categorizeSkills = (skillsList: string[]) => {
    console.log('🔍 Categorizing skills:', skillsList)
    
    const categories = {
      'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'],
      'Frontend Technologies': ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'jQuery'],
      'Backend Technologies': ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails'],
      'Databases': ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'SQLite', 'Firebase'],
      'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git'],
      'Other Skills': []
    }

    const categorized: { [key: string]: string[] } = {}
    
    skillsList.forEach(skill => {
      let placed = false
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))) {
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

    console.log('✅ Categorized skills:', categorized)
    return categorized
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
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
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
          
          {/* Show current user info in header */}
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
        {/* Centered Main Profile Content */}
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <Edit3 size={16} />
              </Button>
            </div>

            <CardContent className="relative px-6 pb-6">
              {/* Profile Picture */}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-md hover:bg-gray-50"
                  >
                    <Edit3 size={14} />
                  </Button>
                </div>

                {/* Profile Info - Prominently display user's name */}
                <div className="flex-1 pt-4 sm:pt-8">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* User's Full Name - Large and prominent */}
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {getFullName()}
                      </h1>
                      
                      {/* Student ID and Role */}
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-lg text-gray-700 font-medium">
                          {jobPrefs.desired_role || 'Student'}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-lg text-blue-600 font-medium">
                          {getStudentId()}
                        </p>
                      </div>
                      
                      {/* Location and connections */}
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin size={16} className="mr-1" />
                        <span>{jobPrefs.location || 'Location not specified'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600 font-medium">
                          {skills.length > 0 ? `${skills.length} skills` : 'Building skills'}
                        </span>
                      </div>
                      
                      {/* Company/Institution */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {jobPrefs.company_preference || 'Open to opportunities'}
                        </span>
                      </div>
                      
                      {/* Email */}
                      <div className="flex items-center gap-2 mb-4">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getUserEmail()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={20} />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                      Open to
                    </Button>
                    <Button variant="outline" className="px-6">
                      Add profile section
                    </Button>
                    <Button variant="outline" className="px-6">
                      Enhance profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Resources
                    </Button>
                  </div>
                </div>
              </div>

              {/* Open to Work Banner */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Open to work</h3>
                    <p className="text-sm text-gray-700">
                      {jobPrefs.job_type || 'Full-time'}, {jobPrefs.desired_role || 'Developer'} and {jobPrefs.industry || 'Technology'} roles
                    </p>
                    <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                      Show details
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Edit3 size={16} />
                  </Button>
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
                {experience?.summary || 
                 `Passionate ${jobPrefs.desired_role || 'student'} with expertise in modern technologies. 
                 Currently pursuing ${jobPrefs.education_level || 'undergraduate studies'} and seeking 
                 opportunities in ${jobPrefs.industry || 'technology sector'}.`}
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Skills Section with Better Data Handling */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Skills</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {skills.length} skills
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit3 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Debug Info for Skills (Development Only) */}
              {import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔍 Skills Debug Info</h4>
                  <div className="text-xs font-mono text-yellow-700 space-y-1">
                    <p><strong>Raw skills data:</strong> {JSON.stringify(studentProfile?.skills)}</p>
                    <p><strong>Processed skills:</strong> {JSON.stringify(skills)}</p>
                    <p><strong>Skills count:</strong> {skills.length}</p>
                    <p><strong>Skills type:</strong> {typeof studentProfile?.skills}</p>
                    <p><strong>Is array:</strong> {Array.isArray(studentProfile?.skills) ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}

              {skills.length > 0 ? (
                <div className="space-y-6">
                  {/* Skills Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                      <div className="text-sm text-gray-600">Total Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Object.keys(categorizedSkills).length}</div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{certifications.length}</div>
                      <div className="text-sm text-gray-600">Certifications</div>
                    </div>
                  </div>

                  {/* All Skills List (Simple Display) */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Code size={20} className="text-blue-600" />
                      All Skills
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {skills.map((skill: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <Code size={14} className="text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm">{skill}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={Math.floor(Math.random() * 40) + 60} className="w-16 h-1.5" />
                                <span className="text-xs text-gray-500">
                                  {Math.floor(Math.random() * 3) + 1}+ yrs
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Star size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categorized Skills */}
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
                          {categorySkills.map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 px-3 py-1"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  ))}

                  {/* Top Skills Highlight */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={20} className="text-orange-600" />
                      <h3 className="font-semibold text-gray-800">Top Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 5).map((skill: string, index: number) => (
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found in database</h3>
                  <p className="text-gray-600 mb-4">
                    {studentProfile ? 
                      'Your profile exists but no skills are recorded. Add your skills to showcase your expertise.' :
                      'No profile data found. Please check your database connection.'
                    }
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus size={16} className="mr-2" />
                    Add your first skill
                  </Button>
                  
                  {/* Debug button for development */}
                  {import.meta.env.DEV && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={refreshStudentProfile}
                      >
                        🔄 Refresh Profile Data
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Experience Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Experience</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {Object.keys(experience).length > 1 ? `${Object.keys(experience).length - 1} roles` : 'Entry level'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit3 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {experience && Object.keys(experience).length > 0 ? (
                <div className="space-y-6">
                  {/* Experience Timeline */}
                  <div className="relative">
                    {Object.entries(experience).map(([key, value], index) => {
                      if (key === 'summary') return null // Skip summary as it's shown in About
                      return (
                        <div key={key} className="flex gap-4 pb-6 relative">
                          {/* Timeline line */}
                          {index < Object.keys(experience).length - 2 && (
                            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                          )}
                          
                          {/* Company logo placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10">
                            <Building2 size={20} className="text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 capitalize text-lg">
                                    {key.replace(/_/g, ' ')}
                                  </h3>
                                  <p className="text-blue-600 font-medium">
                                    {jobPrefs.company_preference || 'Technology Company'}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              </div>
                              
                              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>
                                    {studentProfile?.created_at && 
                                     `${new Date(studentProfile.created_at).getFullYear()} - Present`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  <span>{jobPrefs.location || 'Remote'}</span>
                                </div>
                              </div>

                              {/* Skills used in this role */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Skills used:</p>
                                <div className="flex flex-wrap gap-1">
                                  {skills.slice(0, 4).map((skill: string, skillIndex: number) => (
                                    <Badge
                                      key={skillIndex}
                                      variant="secondary"
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {skills.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{skills.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Experience Summary */}
                  {experience.summary && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-green-600" />
                        <h3 className="font-semibold text-gray-800">Professional Summary</h3>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {experience.summary}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No experience added yet</h3>
                  <p className="text-gray-600 mb-4">Showcase your professional journey and accomplishments</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus size={16} className="mr-2" />
                    Add experience
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Projects Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Projects</h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {projects.length} projects
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit3 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Code size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {project.name || project.title || `Project ${index + 1}`}
                            </h3>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink size={14} />
                            </Button>
                          </div>
                          
                          {project.description && (
                            <p className="text-gray-700 text-sm mb-3 leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                          )}
                          
                          {project.technologies && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Array.isArray(project.technologies) ? 
                                project.technologies.slice(0, 3).map((tech: string, techIndex: number) => (
                                  <Badge
                                    key={techIndex}
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  >
                                    {tech}
                                  </Badge>
                                )) : (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                    {project.technologies}
                                  </Badge>
                                )
                              }
                              {Array.isArray(project.technologies) && project.technologies.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            {project.url ? (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Project
                                <ExternalLink size={14} className="ml-1" />
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">In Development</span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star size={12} />
                              <span>{Math.floor(Math.random() * 50) + 10}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Code size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects added yet</h3>
                  <p className="text-gray-600 mb-4">Showcase your work and demonstrate your skills</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus size={16} className="mr-2" />
                    Add project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Certifications Section */}
          {certifications.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">Licenses & Certifications</h2>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    {certifications.length} certifications
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((cert: any, index: number) => (
                    <div key={index} className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {cert.name || cert.title || `Certification ${index + 1}`}
                        </h4>
                        {cert.issuer && (
                          <p className="text-sm text-blue-600 font-medium mb-1">{cert.issuer}</p>
                        )}
                        {cert.date && (
                          <p className="text-xs text-gray-500">Issued {cert.date}</p>
                        )}
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Preferences Section */}
          {Object.keys(jobPrefs).length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Job Preferences</h2>
                <Button variant="ghost" size="sm">
                  <Edit3 size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(jobPrefs).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Briefcase size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 capitalize font-medium">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Info (only in development) */}
          {import.meta.env.DEV && (
            <Card className="border-dashed border-gray-300">
              <CardHeader>
                <h2 className="text-sm font-mono text-gray-500">Debug Info (Dev Only)</h2>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono text-gray-500 space-y-2">
                  <p><strong>Logged-in User:</strong> {getFullName()}</p>
                  <p><strong>User ID:</strong> {user?.student_id}</p>
                  <p><strong>Email:</strong> {getUserEmail()}</p>
                  <p><strong>Profile Loaded:</strong> {studentProfile ? 'Yes' : 'No'}</p>
                  <p><strong>Student ID:</strong> {getStudentId()}</p>
                  <p><strong>Database ID:</strong> {studentProfile?.id}</p>
                  <p><strong>Skills Count:</strong> {skills.length}</p>
                  <p><strong>Projects Count:</strong> {projects.length}</p>
                  <p><strong>Experience Keys:</strong> {Object.keys(experience).length}</p>
                  <p><strong>Created:</strong> {studentProfile?.created_at}</p>
                  <p><strong>Raw Skills Data:</strong> {JSON.stringify(studentProfile?.skills)}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshStudentProfile}
                    className="mt-2"
                  >
                    Refresh Profile Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile