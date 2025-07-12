import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui/Logo'
import { 
  Home, 
  User, 
  Settings, 
  LogOut,
  BarChart3,
  Wallet,
  TrendingUp
} from 'lucide-react'

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Risk Assessment', href: '/risk-assessment', icon: BarChart3 },
    { name: 'Risk History', href: '/risk-history', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 rounded-md hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 