import { MapPin, Calendar, Building2, GraduationCap, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-22 bg-white/80 backdrop-blur-md border-b border-slate-200"></div>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar at top-left */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl">SA</AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-semibold text-slate-800 mb-1">Sarah Anderson</h1>
                <p className="text-base text-slate-600 mb-2">Senior UI/UX Designer & Product Manager</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Building2 size={14} />
                    <span>TechCorp Solutions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap size={14} />
                    <span>Stanford University</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <Mail size={14} />
                  <span>sarah.anderson@email.com</span>
                </div>

                <p className="mt-4 text-slate-700 text-sm leading-relaxed">
                  Passionate UI/UX Designer with 6+ years of experience creating user-centered digital experiences. Specialized in design systems, mobile interfaces, and cross-functional collaboration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-800">Experience</h2>
          </CardHeader>
          <CardContent className="divide-y divide-slate-200">
            {[
              {
                title: 'Senior UI/UX Designer & Product Manager',
                company: 'TechCorp Solutions',
                time: 'Jan 2022 - Present • 2 yrs 11 mos',
                location: 'San Francisco, CA • Remote',
                description:
                  'Leading design initiatives for enterprise SaaS products, managing a team of 4 designers and collaborating closely with product and engineering teams.',
                points: [
                  'Redesigned core dashboard resulting in 40% increase in user engagement',
                  'Established design system adopted across 5 product teams',
                  'Led user research initiatives with 200+ participants',
                  'Mentored junior designers and interns',
                ],
                skills: [
                  'Figma',
                  'Design Systems',
                  'User Research',
                  'Product Management',
                  'Team Leadership',
                ],
              },
              {
                title: 'UI/UX Designer',
                company: 'DesignStudio Inc.',
                time: 'Jun 2020 - Dec 2021 • 1 yr 7 mos',
                location: 'New York, NY',
                description:
                  'Designed mobile and web interfaces for fintech and e-commerce clients, focusing on conversion optimization and user experience improvements.',
                points: [
                  'Increased app conversion rates by 25%',
                  'Created wireframes and prototypes for 15+ projects',
                  'Collaborated with developers to ensure pixel-perfect implementation',
                ],
                skills: [
                  'Sketch',
                  'Figma',
                  'Prototyping',
                  'Mobile Design',
                  'Web Design',
                ],
              },
              {
                title: 'Junior UI Designer',
                company: 'Creative Agency',
                time: 'Aug 2018 - May 2020 • 1 yr 10 mos',
                location: 'Los Angeles, CA',
                description:
                  'Created visual designs for digital marketing campaigns and brand identities for clients in entertainment and lifestyle sectors.',
                points: [
                  'Designed marketing materials for 20+ campaigns',
                  'Created brand guidelines and visual identity systems',
                  'Collaborated with senior designers on large-scale projects',
                ],
                skills: [
                  'Adobe Creative Suite',
                  'Brand Design',
                  'Marketing Design',
                  'Visual Design',
                ],
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 py-6">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <Building2 size={20} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-0.5">{item.title}</h3>
                  <p className="text-slate-600 text-sm mb-1">{item.company}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-2">{item.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    {item.points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;