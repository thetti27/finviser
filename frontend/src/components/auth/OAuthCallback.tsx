import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface OAuthCallbackProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          onError(error.message);
          return;
        }

        if (data.session?.user) {
          onSuccess(data.session.user);
        } else {
          onError('No user session found');
        }
      } catch (error) {
        onError('Failed to process OAuth callback');
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return null;
}; 