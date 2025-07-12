#!/bin/bash

# Finviser Platform Installation Script
# This script automates the setup process for the Finviser platform

set -e

echo "🚀 Finviser Platform Installation Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm v8 or higher."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed or not in PATH."
        print_warning "Please install PostgreSQL and ensure 'psql' is available in your PATH."
        print_warning "You can continue with the installation, but you'll need to set up the database manually."
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "PostgreSQL is installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "All dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/env.example" ]; then
            cp backend/env.example backend/.env
            print_success "Created backend/.env from template"
            print_warning "Please edit backend/.env with your database credentials and JWT secrets"
        else
            print_warning "backend/env.example not found. Please create backend/.env manually"
        fi
    else
        print_warning "backend/.env already exists. Skipping..."
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/env.example" ]; then
            cp frontend/env.example frontend/.env
            print_success "Created frontend/.env from template"
        else
            print_warning "frontend/env.example not found. Please create frontend/.env manually"
        fi
    else
        print_warning "frontend/.env already exists. Skipping..."
    fi
}

# Generate JWT secrets
generate_jwt_secrets() {
    print_status "Generating JWT secrets..."
    
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    echo "Generated JWT secrets:"
    echo "JWT_SECRET: $JWT_SECRET"
    echo "JWT_REFRESH_SECRET: $JWT_REFRESH_SECRET"
    echo ""
    print_warning "Please add these secrets to your backend/.env file"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if command -v psql &> /dev/null; then
        read -p "Do you want to create the database now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter PostgreSQL username (default: postgres): " PG_USER
            PG_USER=${PG_USER:-postgres}
            
            print_status "Creating database 'finviser'..."
            if psql -U "$PG_USER" -c "CREATE DATABASE finviser;" 2>/dev/null; then
                print_success "Database 'finviser' created successfully"
            else
                print_warning "Failed to create database. It might already exist or you need to run as superuser."
                print_warning "You can create it manually: CREATE DATABASE finviser;"
            fi
        fi
    else
        print_warning "PostgreSQL not available. Please create the database manually."
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ -f "backend/.env" ]; then
        cd backend
        
        print_status "Generating Prisma client..."
        npm run db:generate
        
        print_status "Running migrations..."
        npm run db:migrate
        
        cd ..
        print_success "Database migrations completed"
    else
        print_warning "backend/.env not found. Skipping migrations."
        print_warning "Please set up your environment file and run migrations manually:"
        print_warning "cd backend && npm run db:generate && npm run db:migrate"
    fi
}

# Main installation process
main() {
    echo ""
    print_status "Starting Finviser platform installation..."
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_npm
    check_postgresql
    
    echo ""
    print_status "Installing dependencies..."
    install_dependencies
    
    echo ""
    print_status "Setting up environment files..."
    setup_environment
    
    echo ""
    print_status "Generating JWT secrets..."
    generate_jwt_secrets
    
    echo ""
    print_status "Setting up database..."
    setup_database
    
    echo ""
    print_status "Running database migrations..."
    run_migrations
    
    echo ""
    print_success "Installation completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env with your database credentials and JWT secrets"
    echo "2. Start the development servers: npm run dev"
    echo "3. Access the application at http://localhost:5173"
    echo "4. Check API documentation at http://localhost:3001/api-docs"
    echo ""
    echo "For detailed setup instructions, see SETUP.md"
}

# Run main function
main "$@" 