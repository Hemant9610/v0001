import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { parseSkillsFromJSONB, categorizeSkills, formatSkillsForDisplay } from '@/lib/skillsParser'
import { Code, Star, TrendingUp, Award } from 'lucide-react'

interface SkillsDisplayProps {
  skillsData: any
  showCategories?: boolean
  showLevels?: boolean
  maxSkillsToShow?: number
  compact?: boolean
}

export const SkillsDisplay: React.FC<SkillsDisplayProps> = ({
  skillsData,
  showCategories = true,
  showLevels = false,
  maxSkillsToShow,
  compact = false
}) => {
  const skills = parseSkillsFromJSONB(skillsData)
  const categorizedSkills = categorizeSkills(skills)
  const formattedSkills = formatSkillsForDisplay(skillsData)

  console.log('🎨 SkillsDisplay rendering:', {
    rawData: skillsData,
    parsedSkills: skills,
    skillsCount: skills.length,
    categorizedCount: Object.keys(categorizedSkills).length
  })

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Code size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600">No skills found</p>
      </div>
    )
  }

  // Compact view - just show skills as badges
  if (compact) {
    const displaySkills = maxSkillsToShow ? skills.slice(0, maxSkillsToShow) : skills
    return (
      <div className="flex flex-wrap gap-2">
        {displaySkills.map((skill, index) => (
          <Badge
            key={index}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
          >
            {skill}
          </Badge>
        ))}
        {maxSkillsToShow && skills.length > maxSkillsToShow && (
          <Badge variant="outline">
            +{skills.length - maxSkillsToShow} more
          </Badge>
        )}
      </div>
    )
  }

  return (
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
            {formattedSkills.filter(s => s.level === 'Advanced').length}
          </div>
          <div className="text-sm text-gray-600">Advanced</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formattedSkills.filter(s => s.level === 'Expert').length}
          </div>
          <div className="text-sm text-gray-600">Expert</div>
        </div>
      </div>

      {/* All Skills Grid */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Code size={20} className="text-blue-600" />
          All Skills ({skills.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {formattedSkills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Code size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{skill.name}</span>
                  {showLevels && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={
                          skill.level === 'Expert' ? 100 :
                          skill.level === 'Advanced' ? 80 :
                          skill.level === 'Intermediate' ? 60 : 40
                        } 
                        className="w-16 h-1.5" 
                      />
                      <span className="text-xs text-gray-500">{skill.level}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {skill.category?.replace(' Skills', '') || 'Other'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Skills */}
      {showCategories && (
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
                  {categorySkills.map((skill: string, index: number) => (
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
      )}

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

      {/* Debug Info (Development Only) */}
      {import.meta.env.DEV && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">🔍 Debug Info</h4>
          <div className="text-xs font-mono text-gray-600 space-y-1">
            <p><strong>Raw data:</strong> {JSON.stringify(skillsData)}</p>
            <p><strong>Data type:</strong> {typeof skillsData}</p>
            <p><strong>Is array:</strong> {Array.isArray(skillsData) ? 'Yes' : 'No'}</p>
            <p><strong>Parsed skills:</strong> {JSON.stringify(skills)}</p>
            <p><strong>Skills count:</strong> {skills.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get category-specific colors
const getCategoryColor = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    'Programming Languages': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700',
    'Web Technologies': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700',
    'Databases': 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700',
    'Cloud & DevOps': 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700',
    'Cybersecurity': 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700',
    'Networking': 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700',
    'Operating Systems': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:from-gray-600 hover:to-slate-700',
    'Tools & Software': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700',
    'Other Skills': 'bg-gradient-to-r from-slate-500 to-gray-600 text-white hover:from-slate-600 hover:to-gray-700'
  }
  
  return colorMap[category] || colorMap['Other Skills']
}

export default SkillsDisplay