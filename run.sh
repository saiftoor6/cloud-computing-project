#!/bin/bash
# SMS Slang Translator - Local Development Runner (Linux/macOS)
# This script starts both backend and frontend servers for local development

set -e

echo "========================================"
echo "  SMS Slang Translator - Local Dev"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python 3 is not installed${NC}"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}[1/2] Starting Backend Server...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "     Creating virtual environment..."
    python3 -m venv venv
fi

echo "     Installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

echo "     Starting Flask API on http://localhost:5000"
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start Frontend
echo -e "${GREEN}[2/2] Starting Frontend Server...${NC}"
cd frontend
echo "     Starting web server on http://localhost:8080"
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo -e "${GREEN}  Servers Started Successfully!${NC}"
echo "========================================"
echo
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:5000"
echo
echo "  Press Ctrl+C to stop both servers"
echo

# Open browser (works on macOS and most Linux)
if command -v open &> /dev/null; then
    open http://localhost:8080
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080
fi

# Wait for both processes
wait
