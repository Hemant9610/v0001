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
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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

  // Helper function to safely render array or object data
  const renderArrayData = (data: any, fallback = []) => {
    if (!data) return fallback
    if (Array.isArray(data)) return data
    if (typeof data === 'object') {
      // Handle object with array values
      const values = Object.values(data)
      return values.flat().filter(Boolean)
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : [data]
      } catch {
        return [data]
      }
    }
    return [data]
  }

  // Helper function to get initials
  const getInitials = () => {
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name.charAt(0)}${studentProfile.last_name.charAt(0)}`
    }
    if (studentProfile?.email) {
      return studentProfile.email.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    if (studentProfile?.first_name && studentProfile?.last_name) {
      return `${studentProfile.first_name} ${studentProfile.last_name}`
    }
    if (studentProfile?.first_name) {
      return studentProfile.first_name
    }
    return 'Student Profile'
  }

  // Parse data from database
  const skills = renderArrayData(studentProfile?.skills, [])
  const projects = renderArrayData(studentProfile?.projects, [])
  const experience = studentProfile?.experience || {}
  const certifications = renderArrayData(studentProfile?.certifications_and_licenses, [])
  const jobPrefs = studentProfile?.job_preferences || {}

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
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
          
          <div className="flex items-center gap-3">
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
                      alt="Profile"
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

                {/* Profile Info */}
                <div className="flex-1 pt-4 sm:pt-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        {getFullName()}
                      </h1>
                      <p className="text-lg text-gray-700 mb-2">
                        {jobPrefs.desired_role || 'Student'} • {studentProfile?.student_id || user?.student_id}
                      </p>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin size={16} className="mr-1" />
                        <span>{jobPrefs.location || 'Location not specified'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600 font-medium">
                          {studentProfile?.email ? '500+ connections' : 'Contact info'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {jobPrefs.company_preference || 'Open to opportunities'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {studentProfile?.email || user?.email}
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

          {/* Experience Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Experience</h2>
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
                  {Object.entries(experience).map(([key, value], index) => {
                    if (key === 'summary') return null // Skip summary as it's shown in About
                    return (
                      <div key={key} className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={20} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {key.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-gray-700 text-sm mb-2">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {studentProfile?.created_at && 
                             `Since ${new Date(studentProfile.created_at).getFullYear()}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No experience added yet</p>
                  <Button variant="outline" className="mt-3">
                    <Plus size={16} className="mr-2" />
                    Add experience
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Projects</h2>
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
                <div className="space-y-6">
                  {projects.map((project: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Code size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {project.name || project.title || `Project ${index + 1}`}
                        </h3>
                        {project.description && (
                          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Array.isArray(project.technologies) ? 
                              project.technologies.map((tech: string, techIndex: number) => (
                                <Badge
                                  key={techIndex}
                                  variant="secondary"
                                  className="text-xs bg-gray-100 text-gray-700"
                                >
                                  {tech}
                                </Badge>
                              )) : (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  {project.technologies}
                                </Badge>
                              )
                            }
                          </div>
                        )}
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Project
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No projects added yet</p>
                  <Button variant="outline" className="mt-3">
                    <Plus size={16} className="mr-2" />
                    Add project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Skills</h2>
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
              {skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {skills.slice(0, 9).map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Code size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{skill}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus size={16} />
                      </Button>
                    </div>
                  ))}
                  {skills.length > 9 && (
                    <Button variant="outline" className="mt-2">
                      Show all {skills.length} skills
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No skills added yet</p>
                  <Button variant="outline" className="mt-3">
                    <Plus size={16} className="mr-2" />
                    Add skill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications Section */}
          {certifications.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Licenses & certifications</h2>
                <Button variant="ghost" size="sm">
                  <Plus size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center flex-shrink-0">
                        <Award size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {cert.name || cert.title || `Certification ${index + 1}`}
                        </h4>
                        {cert.issuer && (
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        )}
                        {cert.date && (
                          <p className="text-xs text-gray-500">Issued {cert.date}</p>
                        )}
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
                    <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Briefcase size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-medium text-gray-900">
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
                  <p><strong>User ID:</strong> {user?.student_id}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Profile Loaded:</strong> {studentProfile ? 'Yes' : 'No'}</p>
                  <p><strong>Student ID:</strong> {studentProfile?.student_id}</p>
                  <p><strong>Database ID:</strong> {studentProfile?.id}</p>
                  <p><strong>Created:</strong> {studentProfile?.created_at}</p>
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