#!/bin/bash

# Horary Astrology App - Development Environment Setup Script
# This script starts all necessary services for local development

set -e  # Exit on any error

echo "🔮 Starting Horary Astrology App Development Environment"
echo "=============================================="

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

# Check if we're in the right directory
if [ ! -f "PROJECT-SUMMARY.md" ]; then
    print_error "Please run this script from the horary project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install it first."
    exit 1
fi

print_success "All prerequisites are installed"

# Start Supabase backend
print_status "Starting Supabase backend..."
if supabase start; then
    print_success "Supabase backend started successfully"
    echo ""
    echo "🌐 Backend Services:"
    echo "   API URL: http://127.0.0.1:54321"
    echo "   Studio URL: http://127.0.0.1:54323"
    echo "   Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    echo ""
else
    print_error "Failed to start Supabase backend"
    exit 1
fi

# Install frontend dependencies if needed
print_status "Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Run TypeScript type checking
print_status "Running TypeScript type check..."
if npm run type-check; then
    print_success "TypeScript compilation successful"
else
    print_warning "TypeScript compilation has issues, but continuing..."
fi

# Start frontend development server in background
print_status "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Give frontend time to start
sleep 3

print_success "Development environment is ready!"
echo ""
echo "🎯 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://127.0.0.1:54321"
echo "   Supabase Studio: http://127.0.0.1:54323"
echo "   Edge Functions: http://127.0.0.1:54321/functions/v1/"
echo ""
echo "📚 Documentation:"
echo "   Project Summary: PROJECT-SUMMARY.md"
echo "   Development Guidelines: docs/development-guidelines.md"
echo ""
echo "🧪 Testing:"
echo "   Test Edge Function: curl http://127.0.0.1:54321/functions/v1/test-function"
echo "   Serve functions: supabase functions serve --env-file .env.local --debug"
echo ""
echo "⚙️  Next Steps:"
echo "   1. Test Edge Functions with curl commands"
echo "   2. Open Supabase Studio to view database"
echo "   3. Start developing Edge Functions"
echo "   4. Implement frontend components"
echo ""

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down development environment..."
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_success "Frontend server stopped"
    fi
    
    # Stop Supabase
    supabase stop
    print_success "Supabase backend stopped"
    print_success "Development environment shutdown complete"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

print_warning "Press Ctrl+C to stop the development environment"
print_status "Monitoring services... (logs will appear below)"
echo ""

# Wait for user interrupt
wait $FRONTEND_PID
