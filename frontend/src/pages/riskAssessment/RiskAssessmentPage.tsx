import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { api, handleApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Question {
  id: string
  question: string
  type: string
  options: Array<{
    value: string
    label: string
    score: number
  }>
  weight: number
}

interface Answer {
  questionId: string
  answer: string
}

interface RiskProfile {
  name: string
  description: string
  characteristics: string[]
  recommendedAllocation: {
    bonds: string
    stocks: string
    cash: string
  }
}

export const RiskAssessmentPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lifeEvent, setLifeEvent] = useState('')
  const [notes, setNotes] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await api.get('/risk-assessment/questions')
      setQuestions(response.data.data.questions)
      setIsLoading(false)
    } catch (error) {
      toast.error(handleApiError(error))
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentQuestion].id
    const newAnswers = [...answers]
    const existingIndex = newAnswers.findIndex(a => a.questionId === questionId)
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex].answer = answer
    } else {
      newAnswers.push({ questionId, answer })
    }
    
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const canProceed = () => {
    const questionId = questions[currentQuestion]?.id
    return answers.find(a => a.questionId === questionId)?.answer
  }

  const canSubmit = () => {
    return answers.length === questions.length
  }

  const submitAssessment = async () => {
    if (!canSubmit()) return

    setIsSubmitting(true)
    try {
      const response = await api.post('/risk-assessment/submit', {
        answers,
        lifeEvent: lifeEvent || undefined,
        notes: notes || undefined
      })

      setRiskProfile(response.data.data.profile)
      setShowResults(true)
      toast.success('Risk assessment completed successfully!')
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100
  }

  const getCurrentAnswer = () => {
    const questionId = questions[currentQuestion]?.id
    return answers.find(a => a.questionId === questionId)?.answer
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (showResults && riskProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-success-600 mb-4" />
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-secondary-600">
            Your risk profile has been determined based on your answers.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Your Risk Profile: {riskProfile.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-secondary-700 mb-4">
                {riskProfile.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Characteristics</h3>
                <ul className="space-y-2">
                  {riskProfile.characteristics.map((characteristic, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-success-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary-700">{characteristic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Recommended Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                    <span className="font-medium">Bonds</span>
                    <span className="text-primary-600 font-semibold">
                      {riskProfile.recommendedAllocation.bonds}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                    <span className="font-medium">Stocks</span>
                    <span className="text-primary-600 font-semibold">
                      {riskProfile.recommendedAllocation.stocks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                    <span className="font-medium">Cash</span>
                    <span className="text-primary-600 font-semibold">
                      {riskProfile.recommendedAllocation.cash}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestion(0)
                  setAnswers([])
                  setLifeEvent('')
                  setNotes('')
                }}
                className="btn btn-outline"
              >
                Retake Assessment
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Risk Assessment
        </h1>
        <p className="text-secondary-600">
          Help us understand your risk tolerance to provide personalized investment recommendations.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round(getProgressPercentage())}% Complete
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {questions[currentQuestion]?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {questions[currentQuestion]?.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  getCurrentAnswer() === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${questions[currentQuestion]?.id}`}
                  value={option.value}
                  checked={getCurrentAnswer() === option.value}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <span className="font-medium text-secondary-900">
                    {option.label}
                  </span>
                </div>
                {getCurrentAnswer() === option.value && (
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                )}
              </label>
            ))}
          </div>

          {/* Life Event and Notes (only on last question) */}
          {currentQuestion === questions.length - 1 && (
            <div className="space-y-4 pt-6 border-t border-secondary-200">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Life Event (Optional)
                </label>
                <select
                  value={lifeEvent}
                  onChange={(e) => setLifeEvent(e.target.value)}
                  className="input"
                >
                  <option value="">Select a life event (if applicable)</option>
                  <option value="marriage">Marriage</option>
                  <option value="divorce">Divorce</option>
                  <option value="birth">Birth of Child</option>
                  <option value="job_change">Job Change</option>
                  <option value="retirement">Retirement</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="health_issue">Health Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context about your financial situation..."
                  className="input min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="btn btn-outline flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={!canProceed()}
                className="btn btn-primary flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={submitAssessment}
                disabled={!canSubmit() || isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-warning-600 mr-2" />
            Assessment Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-secondary-600">
            <li>• Answer honestly based on your current financial situation</li>
            <li>• Consider your emotional reaction to market volatility</li>
            <li>• Think about your investment time horizon</li>
            <li>• You can retake this assessment anytime your circumstances change</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 