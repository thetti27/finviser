import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo className="mx-auto h-12 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-secondary-900">
              Welcome to Finviser
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Your holistic financial management platform
            </p>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-6">
              Take Control of Your Financial Future
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Finviser provides comprehensive portfolio management, investment advice, 
              and real-time business health monitoring to help you make informed financial decisions.
            </p>
            <div className="grid grid-cols-1 gap-6 text-left max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-200 font-semibold">✓</span>
                </div>
                <span className="text-primary-100">Portfolio diversification analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-200 font-semibold">✓</span>
                </div>
                <span className="text-primary-100">Risk-based investment advice</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-200 font-semibold">✓</span>
                </div>
                <span className="text-primary-100">Real-time business monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-200 font-semibold">✓</span>
                </div>
                <span className="text-primary-100">Direct bank integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 