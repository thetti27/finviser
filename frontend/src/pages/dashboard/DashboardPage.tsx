import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { api, handleApiError } from '@/lib/api'

export const DashboardPage = () => {
  const [riskProfile, setRiskProfile] = useState<any>(null)
  const [reassessmentCheck, setReassessmentCheck] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRiskData()
  }, [])

  const loadRiskData = async () => {
    try {
      const [profileResponse, checkResponse] = await Promise.all([
        api.get('/risk-assessment/current'),
        api.get('/risk-assessment/reassessment-check')
      ])
      
      setRiskProfile(profileResponse.data.data)
      setReassessmentCheck(checkResponse.data.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load risk data:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome to your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,000</div>
            <p className="text-xs text-success-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Return</CardTitle>
            <BarChart3 className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+$8,500</div>
            <p className="text-xs text-success-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +6.8% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,250</div>
            <p className="text-xs text-secondary-500">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskProfile?.profile?.name || 'Not Set'}
            </div>
            <p className="text-xs text-secondary-500">
              {riskProfile?.profile?.name ? 'Based on your assessment' : 'Complete assessment to set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Section */}
      {reassessmentCheck?.shouldReassess && (
        <Card className="border-warning-200 bg-warning-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-2" />
              Risk Assessment Update Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warning-700 mb-4">
              {reassessmentCheck.reason}
            </p>
            <Link
              to="/risk-assessment"
              className="btn btn-warning inline-flex items-center"
            >
              Take Assessment Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Risk Profile Summary */}
      {riskProfile?.profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              Your Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">
                  {riskProfile.profile.name} Profile
                </h3>
                <p className="text-secondary-600 mb-4">
                  {riskProfile.profile.description}
                </p>
                <Link
                  to="/risk-history"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                >
                  View Assessment History
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Recommended Allocation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                    <span className="text-sm">Stocks</span>
                    <span className="font-medium text-primary-600">
                      {riskProfile.profile.recommendedAllocation.stocks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                    <span className="text-sm">Bonds</span>
                    <span className="font-medium text-primary-600">
                      {riskProfile.profile.recommendedAllocation.bonds}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-secondary-50 rounded">
                    <span className="text-sm">Cash</span>
                    <span className="font-medium text-primary-600">
                      {riskProfile.profile.recommendedAllocation.cash}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="font-medium">Investment Purchase</p>
                  <p className="text-sm text-secondary-500">Bought 10 shares of AAPL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-success-600">+$1,500</p>
                <p className="text-sm text-secondary-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-danger-600" />
                </div>
                <div>
                  <p className="font-medium">Withdrawal</p>
                  <p className="text-sm text-secondary-500">From checking account</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-danger-600">-$500</p>
                <p className="text-sm text-secondary-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 