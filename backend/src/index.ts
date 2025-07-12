import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import authRoutes from './routes/auth';
import authSupabaseRoutes from './routes/authSupabase';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import riskAssessmentRoutes from './routes/riskAssessment';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/v2', authSupabaseRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/risk-assessment', riskAssessmentRoutes);

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Finviser API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'Logout user',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password',
        'POST /api/auth/verify-email': 'Verify email address',
      },
      authV2: {
        'POST /api/auth/v2/register': 'Register a new user (Supabase)',
        'POST /api/auth/v2/login': 'Login user (Supabase)',
        'GET /api/auth/v2/google': 'Initiate Google OAuth',
        'GET /api/auth/v2/callback': 'Handle OAuth callback',
        'GET /api/auth/v2/verify': 'Verify JWT token',
        'POST /api/auth/v2/logout': 'Logout user (Supabase)',
      },
      user: {
        'GET /api/user/profile': 'Get user profile',
        'PUT /api/user/profile': 'Update user profile',
        'DELETE /api/user/account': 'Delete user account',
      },
      profile: {
        'GET /api/profile': 'Get detailed profile information',
        'PUT /api/profile': 'Update profile information',
      },
      riskAssessment: {
        'GET /api/risk-assessment/questions': 'Get risk assessment questions',
        'POST /api/risk-assessment/submit': 'Submit risk assessment answers',
        'GET /api/risk-assessment/history': 'Get assessment history',
        'GET /api/risk-assessment/current': 'Get current risk profile',
        'GET /api/risk-assessment/reassessment-check': 'Check if reassessment is needed',
      },
    },
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Finviser API server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

export default app; 