import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getIshaanMalik, getAllStudents, parseSkills } from '@/lib/queryStudent'
import { Loader2, User, Code, Database } from 'lucide-react'

const QueryTest = () => {
  const [loading, setLoading] = useState(false)
  const [ishaanData, setIshaanData] = useState<any>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleGetIshaan = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await getIshaanMalik()
      
      if (error) {
        setError(`Error: ${error}`)
      } else if (data) {
        setIshaanData(data)
        console.log('Ishaan Malik data:', data)
        console.log('Ishaan skills:', parseSkills(data.skills))
      } else {
        setError('Ishaan Malik not found in database')
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    }
    
    setLoading(false)
  }

  const handleGetAllStudents = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await getAllStudents()
      
      if (error) {
        setError(`Error: ${error}`)
      } else {
        setAllStudents(data)
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={24} />
              Student Database Query Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleGetIshaan}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                Get Ishaan Malik's Data
              </Button>
              
              <Button 
                onClick={handleGetAllStudents}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                Get All Students
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ishaan Malik's Data */}
        {ishaanData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Ishaan Malik's Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {ishaanData.first_name} {ishaanData.last_name}</p>
                  <p><strong>Student ID:</strong> {ishaanData.student_id}</p>
                  <p><strong>Email:</strong> {ishaanData.email}</p>
                  <p><strong>Database ID:</strong> {ishaanData.id}</p>
                </div>
                <div>
                  <p><strong>Created:</strong> {new Date(ishaanData.created_at).toLocaleDateString()}</p>
                  <p><strong>Skills Data Type:</strong> {typeof ishaanData.skills}</p>
                  <p><strong>Raw Skills:</strong> {JSON.stringify(ishaanData.skills)}</p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code size={16} />
                  Skills ({parseSkills(ishaanData.skills).length})
                </h3>
                
                {parseSkills(ishaanData.skills).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {parseSkills(ishaanData.skills).map((skill: string, index: number) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills found</p>
                )}
              </div>

              {/* Projects Section */}
              {ishaanData.projects && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Projects</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(ishaanData.projects, null, 2)}
                  </pre>
                </div>
              )}

              {/* Experience Section */}
              {ishaanData.experience && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Experience</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(ishaanData.experience, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Students List */}
        {allStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Students ({allStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allStudents.map((student, index) => (
                  <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Skills:</p>
                      {parseSkills(student.skills).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parseSkills(student.skills).slice(0, 5).map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {parseSkills(student.skills).length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{parseSkills(student.skills).length - 5} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No skills</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default QueryTest