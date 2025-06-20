import { MapPin, Calendar, Building2, GraduationCap, Mail, ArrowLeft, LogOut, Award, Briefcase, Code, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user, studentProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Helper function to safely render array or object data
  const renderArrayData = (data: any, fallback = 'Not specified') => {
    if (!data) return fallback
    if (Array.isArray(data)) return data
    if (typeof data === 'object') return Object.values(data).flat()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Back and Sign Out buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
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

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-22 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg -mt-16">
                  <AvatarImage
                    src={studentProfile?.profile_image || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0 pt-4 sm:pt-0">
                <h1 className="text-3xl font-semibold text-slate-800 mb-2">
                  {studentProfile?.first_name && studentProfile?.last_name 
                    ? `${studentProfile.first_name} ${studentProfile.last_name}`
                    : 'Student Profile'
                  }
                </h1>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <UserIcon size={12} className="mr-1" />
                    {studentProfile?.student_id || user?.student_id || 'No ID'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-blue-600 text-sm mb-4">
                  <Mail size={14} />
                  <span>{studentProfile?.email || user?.email || 'No email'}</span>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {studentProfile?.job_preferences?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{studentProfile.job_preferences.location}</span>
                    </div>
                  )}
                  {studentProfile?.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Joined {new Date(studentProfile.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        {studentProfile?.skills && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Skills</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {renderArrayData(studentProfile.skills, []).map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {skill}
                  </Badge>
                ))}
                {renderArrayData(studentProfile.skills, []).length === 0 && (
                  <p className="text-slate-500 italic">No skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {studentProfile?.projects && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-green-600" />
                <h2 className="text-xl font-semibold text-slate-800">Projects</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(studentProfile.projects) && studentProfile.projects.length > 0 ? (
                  studentProfile.projects.map((project: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h3 className="font-semibold text-slate-800 mb-2">
                        {project.name || project.title || `Project ${index + 1}`}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(project.technologies) ? 
                            project.technologies.map((tech: string, techIndex: number) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">
                                {project.technologies}
                              </Badge>
                            )
                          }
                        </div>
                      )}
                      {project.url && (
                        <div className="mt-2">
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            View Project
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No projects listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {studentProfile?.experience && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-purple-600" />
                <h2 className="text-xl font-semibold text-slate-800">Experience</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typeof studentProfile.experience === 'object' ? (
                  Object.entries(studentProfile.experience).map(([key, value]) => (
                    <div key={key} className="border-l-4 border-purple-200 pl-4">
                      <h3 className="font-medium text-slate-800 capitalize mb-1">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">{studentProfile.experience}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications and Licenses Section */}
        {studentProfile?.certifications_and_licenses && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award size={20} className="text-yellow-600" />
                <h2 className="text-xl font-semibold text-slate-800">Certifications & Licenses</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(studentProfile.certifications_and_licenses) ? (
                  studentProfile.certifications_and_licenses.map((cert: any, index: number) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-medium text-slate-800">
                        {cert.name || cert.title || `Certification ${index + 1}`}
                      </h3>
                      {cert.issuer && (
                        <p className="text-sm text-slate-600">Issued by: {cert.issuer}</p>
                      )}
                      {cert.date && (
                        <p className="text-sm text-slate-500">Date: {cert.date}</p>
                      )}
                      {cert.description && (
                        <p className="text-sm text-slate-600 mt-1">{cert.description}</p>
                      )}
                    </div>
                  ))
                ) : typeof studentProfile.certifications_and_licenses === 'object' ? (
                  Object.entries(studentProfile.certifications_and_licenses).map(([key, value]) => (
                    <div key={key} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-medium text-slate-800 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">{studentProfile.certifications_and_licenses}</p>
                )}
                {(!studentProfile.certifications_and_licenses || 
                  (Array.isArray(studentProfile.certifications_and_licenses) && studentProfile.certifications_and_licenses.length === 0)) && (
                  <p className="text-slate-500 italic">No certifications or licenses listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Preferences Section */}
        {studentProfile?.job_preferences && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-800">Job Preferences</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeof studentProfile.job_preferences === 'object' ? (
                  Object.entries(studentProfile.job_preferences).map(([key, value]) => (
                    <div key={key} className="p-3 bg-indigo-50 rounded-lg">
                      <h3 className="font-medium text-slate-800 capitalize mb-1">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {Array.isArray(value) ? value.join(', ') : 
                         typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">{studentProfile.job_preferences}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <Card className="border-dashed border-slate-300">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-600">Debug Info</h2>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono bg-slate-100 p-3 rounded overflow-auto">
                <p><strong>User:</strong> {JSON.stringify(user, null, 2)}</p>
                <p><strong>Student Profile:</strong> {JSON.stringify(studentProfile, null, 2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Profile