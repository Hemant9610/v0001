import { MapPin, Calendar, Building2, GraduationCap, Mail, ArrowLeft, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { user, studentProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
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
          <div className="h-22 bg-white/80 backdrop-blur-md border-b border-slate-200"></div>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar at top-left */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                  <AvatarImage
                    src={studentProfile?.profile_image || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl">
                    {studentProfile?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    {studentProfile?.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-semibold text-slate-800 mb-1">
                  {studentProfile?.first_name && studentProfile?.last_name 
                    ? `${studentProfile.first_name} ${studentProfile.last_name}`
                    : user?.user_metadata?.full_name || 'User Profile'
                  }
                </h1>
                <p className="text-base text-slate-600 mb-2">
                  {studentProfile?.job_preferences?.role || 'Student Profile'}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Building2 size={14} />
                    <span>{studentProfile?.experience?.company || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap size={14} />
                    <span>{studentProfile?.experience?.education || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{studentProfile?.job_preferences?.location || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <Mail size={14} />
                  <span>{studentProfile?.email || user?.email}</span>
                </div>

                <p className="mt-4 text-slate-700 text-sm leading-relaxed">
                  {studentProfile?.experience?.summary || 'No profile description available.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        {studentProfile?.skills && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Skills</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(studentProfile.skills) 
                  ? studentProfile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))
                  : Object.entries(studentProfile.skills).map(([category, skills]) => (
                      <div key={category} className="w-full mb-4">
                        <h3 className="font-medium text-slate-700 mb-2 capitalize">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(skills) && skills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {studentProfile?.projects && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Projects</h2>
            </CardHeader>
            <CardContent>
              {Array.isArray(studentProfile.projects) 
                ? studentProfile.projects.map((project: any, index: number) => (
                    <div key={index} className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium text-slate-800">{project.name || `Project ${index + 1}`}</h3>
                      <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-white text-slate-600 text-xs rounded border"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                : <p className="text-slate-600">No projects available</p>
              }
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Profile