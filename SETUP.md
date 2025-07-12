# Finviser Platform Setup Guide

This guide will help you set up the Finviser platform on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd finviser

# Install all dependencies (root, backend, and frontend)
npm run install:all
```

### 2. Database Setup

#### Install PostgreSQL

**Windows:**
- Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the postgres user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE finviser;

# Exit psql
\q
```

### 3. Environment Configuration

#### Backend Environment

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit the environment file with your settings
nano backend/.env
```

**Required Environment Variables:**

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/finviser"

# JWT Configuration (generate secure keys)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-here-make-it-long-and-random"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"
```

**Generate Secure JWT Keys:**

```bash
# Generate random strings for JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend Environment

```bash
# Copy environment template (if exists)
cp frontend/env.example frontend/.env

# Edit the environment file
nano frontend/.env
```

### 4. Database Migration

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### 5. Start Development Servers

```bash
# From the root directory
npm run dev
```

This will start both:
- **Backend API**: http://localhost:3001
- **Frontend App**: http://localhost:5173

## Development Workflow

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Build for production
npm run build
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Documentation

Once the backend is running, you can access:

- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## Authentication Flow

The platform implements a complete authentication system:

1. **Registration**: Users can create accounts with email verification
2. **Login**: JWT-based authentication with access and refresh tokens
3. **Password Reset**: Secure password recovery via email
4. **Email Verification**: Account activation through email links
5. **Token Refresh**: Automatic token renewal for seamless user experience

## Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure access and refresh token system
- **CORS Protection**: Configured for secure cross-origin requests
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## Database Schema

The platform includes a comprehensive database schema with:

- **Users**: Authentication and basic user information
- **Profiles**: Detailed user profiles with financial preferences and risk tolerance
- **Risk Assessments**: Comprehensive risk tolerance assessments with scoring and history
- **Accounts**: Bank and investment account management
- **Portfolios**: Investment portfolio tracking
- **Holdings**: Individual investment holdings
- **Transactions**: Financial transaction history

## Risk Assessment System

The platform includes a sophisticated risk assessment system:

### Features
- **Multi-step Questionnaire**: 10 comprehensive questions covering age, investment horizon, risk tolerance, financial goals, emergency funds, income stability, investment experience, loss reaction, debt levels, and financial knowledge
- **Weighted Scoring Algorithm**: Each question has different weights based on importance to risk tolerance
- **Risk Profile Categories**: Conservative, Moderate, and Aggressive profiles with detailed characteristics
- **Recommended Asset Allocation**: Specific allocation recommendations for stocks, bonds, and cash
- **Assessment History**: Track changes in risk tolerance over time
- **Reassessment Reminders**: Automatic suggestions for reassessment based on time elapsed or life events
- **Life Event Tracking**: Optional tracking of major life events that may affect risk tolerance

### Risk Profiles
- **Conservative**: Focus on capital preservation, 60-80% bonds, 20-40% stocks
- **Moderate**: Balanced approach, 40-60% bonds, 40-60% stocks
- **Aggressive**: Maximum growth potential, 10-30% bonds, 70-90% stocks

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. API Documentation

Visit http://localhost:3001/api-docs to see all available endpoints.

### 3. Frontend Application

Visit http://localhost:5173 to access the web application.

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::3001
```
- Kill existing processes: `lsof -ti:3001 | xargs kill -9`
- Or change port in `.env`

**3. JWT Secret Missing**
```
Error: JWT_SECRET is required
```
- Set JWT_SECRET in backend `.env`
- Generate a secure random string

**4. CORS Errors**
```
Access to fetch at 'http://localhost:3001/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```
- Check CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches

### Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that PostgreSQL is running and accessible

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use production-grade secrets
2. **Database**: Use managed PostgreSQL service
3. **SSL/TLS**: Enable HTTPS for all communications
4. **Monitoring**: Implement logging and monitoring
5. **Backup**: Set up database backups
6. **CI/CD**: Implement automated deployment pipeline

## Next Steps

After successful setup:

1. **Complete User Onboarding**: Implement remaining auth pages
2. **Add Financial Data**: Integrate with banking APIs
3. **Portfolio Management**: Build investment tracking features
4. **Risk Assessment**: Implement advanced risk analysis
5. **Business Features**: Add small business financial tools
6. **Testing**: Add comprehensive test suite
7. **Documentation**: Expand API and user documentation

## Support

For additional support or questions, please refer to the project documentation or create an issue in the repository. 