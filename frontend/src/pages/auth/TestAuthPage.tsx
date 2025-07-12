import React, { useState } from 'react';
import { AuthForm } from '../../components/auth/LoginForm';
import { OAuthCallback } from '../../components/auth/OAuthCallback';
import { supabase } from '../../lib/supabase';

export const TestAuthPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  // Check if we're in an OAuth callback
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (code || error) {
      setIsOAuthCallback(true);
    }
  }, []);

  const handleSuccess = (user: any) => {
    setUser(user);
    setError('');
    console.log('Authentication successful:', user);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    console.error('Authentication error:', errorMessage);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isOAuthCallback) {
    return <OAuthCallback onSuccess={handleSuccess} onError={handleError} />;
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome, {user.email}!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You have successfully signed in.
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
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
      
      <AuthForm mode="login" onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}; 