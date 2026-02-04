#!/bin/bash

# Portfolio Development Runner
# Запускает все сервисы для локальной разработки

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting Portfolio Development Environment..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    source backend/venv/bin/activate
fi

# Create data directories
mkdir -p data uploads

# Load environment variables
if [ -f "config/.env" ]; then
    export $(cat config/.env | grep -v '^#' | xargs)
fi

# Start API in background
echo "🔧 Starting API server on http://localhost:8000..."
cd backend
python -m uvicorn api.main:app --reload --port 8000 &
API_PID=$!
cd ..

# Wait for API to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend on http://localhost:3000..."
cd frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development environment started!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Admin panel: Press Ctrl+Shift+A on the website"
echo "   Default password: portfolio_admin_2024"
echo ""
echo "Press Ctrl+C to stop all services..."

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "👋 Goodbye!"
}

trap cleanup EXIT

# Wait for processes
wait
