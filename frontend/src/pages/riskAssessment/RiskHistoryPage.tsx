import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Calendar, TrendingUp, TrendingDown, Minus, Clock, AlertCircle } from 'lucide-react'
import { api, handleApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Assessment {
  id: string
  riskScore: number
  riskProfile: string
  lifeEvent?: string
  notes?: string
  completedAt: string
  profile: {
    name: string
    description: string
    characteristics: string[]
    recommendedAllocation: {
      bonds: string
      stocks: string
      cash: string
    }
  }
}

export const RiskHistoryPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reassessmentCheck, setReassessmentCheck] = useState<any>(null)

  useEffect(() => {
    loadAssessmentHistory()
    checkReassessment()
  }, [])

  const loadAssessmentHistory = async () => {
    try {
      const response = await api.get('/risk-assessment/history')
      setAssessments(response.data.data.assessments)
      setIsLoading(false)
    } catch (error) {
      toast.error(handleApiError(error))
      setIsLoading(false)
    }
  }

  const checkReassessment = async () => {
    try {
      const response = await api.get('/risk-assessment/reassessment-check')
      setReassessmentCheck(response.data.data)
    } catch (error) {
      console.error('Failed to check reassessment:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRiskTrend = (currentIndex: number) => {
    if (currentIndex === assessments.length - 1) return 'current'
    
    const current = assessments[currentIndex]
    const next = assessments[currentIndex + 1]
    
    if (current.riskScore > next.riskScore) return 'decreased'
    if (current.riskScore < next.riskScore) return 'increased'
    return 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increased':
        return <TrendingUp className="h-4 w-4 text-success-600" />
      case 'decreased':
        return <TrendingDown className="h-4 w-4 text-danger-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-secondary-600" />
      default:
        return null
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increased':
        return 'Risk tolerance increased'
      case 'decreased':
        return 'Risk tolerance decreased'
      case 'stable':
        return 'Risk tolerance remained stable'
      default:
        return 'Current assessment'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Risk Assessment History
          </h1>
          <p className="text-secondary-600">
            Track your risk tolerance changes over time and see how your profile has evolved.
          </p>
        </div>
        <Link
          to="/risk-assessment"
          className="btn btn-primary"
        >
          Take New Assessment
        </Link>
      </div>

      {/* Reassessment Alert */}
      {reassessmentCheck?.shouldReassess && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-warning-800 mb-1">
                  Consider Reassessment
                </h3>
                <p className="text-warning-700 text-sm mb-3">
                  {reassessmentCheck.reason}
                </p>
                <Link
                  to="/risk-assessment"
                  className="btn btn-sm btn-warning"
                >
                  Take Assessment Now
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <Clock className="mx-auto h-12 w-12 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No Assessments Yet
            </h3>
            <p className="text-secondary-600 mb-4">
              You haven't completed any risk assessments yet. Take your first assessment to get started.
            </p>
            <Link
              to="/risk-assessment"
              className="btn btn-primary"
            >
              Take Your First Assessment
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {assessments.map((assessment, index) => {
            const trend = getRiskTrend(index)
            const isLatest = index === 0

            return (
              <Card key={assessment.id} className={isLatest ? 'border-primary-200 bg-primary-50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {assessment.profile.name} Profile
                        {isLatest && (
                          <span className="ml-2 px-2 py-1 text-xs bg-primary-600 text-white rounded-full">
                            Current
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-secondary-600 mt-1">
                        Completed on {formatDate(assessment.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend)}
                      <span className="text-sm text-secondary-600">
                        {getTrendText(trend)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Risk Score</h4>
                      <div className="text-2xl font-bold text-primary-600">
                        {assessment.riskScore.toFixed(2)}
                      </div>
                      <p className="text-sm text-secondary-500">
                        Out of 3.0 maximum
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Profile</h4>
                      <div className="text-lg font-semibold text-secondary-900">
                        {assessment.profile.name}
                      </div>
                      <p className="text-sm text-secondary-600">
                        {assessment.profile.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-secondary-900 mb-2">Recommended Allocation</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Stocks:</span>
                          <span className="font-medium">{assessment.profile.recommendedAllocation.stocks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bonds:</span>
                          <span className="font-medium">{assessment.profile.recommendedAllocation.bonds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash:</span>
                          <span className="font-medium">{assessment.profile.recommendedAllocation.cash}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Life Event and Notes */}
                  {(assessment.lifeEvent || assessment.notes) && (
                    <div className="pt-4 border-t border-secondary-200">
                      {assessment.lifeEvent && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-secondary-700">Life Event: </span>
                          <span className="text-sm text-secondary-600 capitalize">
                            {assessment.lifeEvent.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                      {assessment.notes && (
                        <div>
                          <span className="text-sm font-medium text-secondary-700">Notes: </span>
                          <span className="text-sm text-secondary-600">{assessment.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Characteristics */}
                  <div className="pt-4 border-t border-secondary-200">
                    <h4 className="font-medium text-secondary-900 mb-2">Key Characteristics</h4>
                    <ul className="grid md:grid-cols-2 gap-1">
                      {assessment.profile.characteristics.map((characteristic, charIndex) => (
                        <li key={charIndex} className="flex items-start text-sm text-secondary-600">
                          <span className="text-primary-600 mr-2">•</span>
                          {characteristic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Assessment Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-warning-600 mr-2" />
            When to Retake Your Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3">Major Life Events</h4>
              <ul className="space-y-2 text-sm text-secondary-600">
                <li>• Marriage or divorce</li>
                <li>• Birth of a child</li>
                <li>• Job change or career shift</li>
                <li>• Retirement</li>
                <li>• Significant inheritance</li>
                <li>• Health issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3">Financial Changes</h4>
              <ul className="space-y-2 text-sm text-secondary-600">
                <li>• Significant increase/decrease in income</li>
                <li>• Major purchase (home, business)</li>
                <li>• Change in debt levels</li>
                <li>• Shift in financial goals</li>
                <li>• Market experience changes</li>
                <li>• Annual review (recommended)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 