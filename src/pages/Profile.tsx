import { MapPin, Calendar, Building2, GraduationCap, Mail, ArrowLeft, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Use profile data if available, otherwise fallback to default data
  const profileData = profile || {
    first_name: 'Student',
    last_name: 'User',
    email: user?.email || '',
    student_id: user?.student_id || '',
  };

  const displayName = `${profileData.first_name || 'Student'} ${profileData.last_name || 'User'}`;
  const initials = `${profileData.first_name?.[0] || 'S'}${profileData.last_name?.[0] || 'U'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Back and Logout buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-22 bg-white/80 backdrop-blur-md border-b border-slate-200"></div>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                  <AvatarImage
                    src={profileData.profile_image || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-semibold text-slate-800 mb-1">{displayName}</h1>
                <p className="text-base text-slate-600 mb-2">
                  Student ID: {profileData.student_id}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    <span>{profileData.email}</span>
                  </div>
                  {profile?.skills && (
                    <div className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      <span>Skills Available</span>
                    </div>
                  )}
                </div>

                {profile && (
                  <p className="mt-4 text-slate-700 text-sm leading-relaxed">
                    Welcome to your profile! Your information is securely stored and ready for job matching.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section (if available) */}
        {profile?.skills && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Skills</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(profile.skills) ? (
                  profile.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-600">Skills data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section (if available) */}
        {profile?.projects && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Projects</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Project information available in your profile.</p>
            </CardContent>
          </Card>
        )}

        {/* Experience Section (if available) */}
        {profile?.experience && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Experience</h2>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Experience information available in your profile.</p>
            </CardContent>
          </Card>
        )}

        {/* Default Experience Section for demo */}
        {!profile && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-800">Experience</h2>
            </CardHeader>
            <CardContent className="divide-y divide-slate-200">
              <div className="flex gap-4 py-6">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <Building2 size={20} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-0.5">Student</h3>
                  <p className="text-slate-600 text-sm mb-1">Academic Institution</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Current</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-2">
                    Currently enrolled as a student, building skills and preparing for career opportunities.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-300">
                      Learning
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-300">
                      Development
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;