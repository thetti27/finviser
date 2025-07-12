import { supabaseAdmin, supabase } from '../lib/supabase';
import { prisma } from '../lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    session?: any;
  };
  error?: string;
}

export class AuthService {
  // Email/Password Registration
  static async registerWithEmail(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      // Check if user already exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Registration failed',
          error: 'User with this email already exists',
        };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for now
        user_metadata: {
          firstName,
          lastName,
        },
      });

      if (authError) {
        return {
          success: false,
          message: 'Registration failed',
          error: authError.message,
        };
      }

      // Create user in our database
      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email,
          firstName,
          lastName,
          isEmailVerified: true, // Since we auto-confirmed
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });

      return {
        success: true,
        message: 'User registered successfully',
        data: { user },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: 'Internal server error',
      };
    }
  }

  // Email/Password Login
  static async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          message: 'Login failed',
          error: error.message,
        };
      }

      // Get user from our database
      const user = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Login failed',
          error: 'User not found in database',
        };
      }

      return {
        success: true,
        message: 'Login successful',
        data: {
          user,
          session: data.session,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: 'Internal server error',
      };
    }
  }

  // Google OAuth Login
  static async signInWithGoogle(): Promise<{ url: string }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.APP_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { url: data.url };
  }

  // Handle OAuth callback
  static async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return {
          success: false,
          message: 'OAuth authentication failed',
          error: error.message,
        };
      }

      const { user: authUser } = data;

      if (!authUser) {
        return {
          success: false,
          message: 'OAuth authentication failed',
          error: 'Authentication failed',
        };
      }

      // Check if user exists in our database
      let user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });

      // If user doesn't exist, create them
      if (!user) {
        const firstName = authUser.user_metadata?.firstName || authUser.user_metadata?.full_name?.split(' ')[0] || '';
        const lastName = authUser.user_metadata?.lastName || authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';

        user = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email!,
            firstName,
            lastName,
            isEmailVerified: true,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isEmailVerified: true,
          },
        });
      }

      return {
        success: true,
        message: 'OAuth login successful',
        data: {
          user,
          session: data.session,
        },
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        message: 'OAuth authentication failed',
        error: 'Internal server error',
      };
    }
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      // Get user from our database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });

      return dbUser;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Logout
  static async logout(token: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        return {
          success: false,
          message: 'Logout failed',
          error: error.message,
        };
      }

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
        error: 'Internal server error',
      };
    }
  }
} 