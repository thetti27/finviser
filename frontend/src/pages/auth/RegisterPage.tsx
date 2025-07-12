import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthForm } from '@/components/auth/LoginForm'

export const RegisterPage = () => {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSuccess = (user: any) => {
    setError('')
    navigate('/dashboard')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
      <AuthForm mode="register" onSuccess={handleSuccess} onError={handleError} />
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 