import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';

const router = Router();

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Register new user with email/password
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Invalid input data',
        details: errors.array(),
      });
    }

    const { email, password, firstName, lastName } = req.body;
    const result = await AuthService.registerWithEmail(email, password, firstName, lastName);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: 'Internal server error',
    });
  }
});

// Login with email/password
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Invalid input data',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;
    const result = await AuthService.loginWithEmail(email, password);

    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'Internal server error',
    });
  }
});

// Initiate Google OAuth
router.get('/google', async (req, res) => {
  try {
    const { url } = await AuthService.signInWithGoogle();
    res.json({
      success: true,
      message: 'Google OAuth URL generated',
      data: { url },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google OAuth failed',
      error: 'Internal server error',
    });
  }
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'OAuth callback failed',
        error: 'Invalid authorization code',
      });
    }

    const result = await AuthService.handleOAuthCallback(code);

    if (result.success) {
      // Redirect to frontend with success
      res.redirect(`${process.env.APP_URL}/auth/success?token=${result.data?.session?.access_token}`);
    } else {
      // Redirect to frontend with error
      res.redirect(`${process.env.APP_URL}/auth/error?message=${encodeURIComponent(result.error || 'Authentication failed')}`);
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.APP_URL}/auth/error?message=${encodeURIComponent('Internal server error')}`);
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token verification failed',
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    if (user) {
      res.json({
        success: true,
        message: 'Token verified',
        data: { user },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Token verification failed',
        error: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: 'Internal server error',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Logout failed',
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const result = await AuthService.logout(token);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: 'Internal server error',
    });
  }
});

export default router; 