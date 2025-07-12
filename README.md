# Finviser - Holistic Financial Management Platform

Finviser is an agentic platform that provides comprehensive personal and small business financial management, focusing on portfolio diversification, investment advice based on risk appetite, and real-time business health monitoring through direct bank integration.

## 🚀 Features

### Phase 1: Foundation & Core User Experience (MVP)
- **Secure Authentication**: Industry-standard OAuth 2.0 and JWT implementation
- **User Onboarding**: Streamlined sign-up and profile creation
- **Financial Overview**: Comprehensive dashboard with portfolio insights
- **Data Security**: Encrypted database schema for sensitive information

### Future Phases
- Portfolio diversification analysis
- Investment advice based on risk appetite
- Real-time business health monitoring
- Direct bank integration
- Advanced financial analytics

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API communication

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL database
- Prisma ORM for database management
- JWT for authentication
- bcrypt for password hashing
- CORS and security middleware

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finviser
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Configure database**
   - Install PostgreSQL
   - Create a database named `finviser`
   - Update database connection in `backend/.env`

5. **Run database migrations**
   ```bash
   cd backend
   npm run db:migrate
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all workspaces

### Project Structure

```
finviser/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── package.json       # Root workspace configuration
└── README.md         # Project documentation
```

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Encrypted database fields for sensitive data
- Rate limiting for API endpoints

## 📝 API Documentation

The backend API documentation will be available at `http://localhost:3001/api-docs` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team. 