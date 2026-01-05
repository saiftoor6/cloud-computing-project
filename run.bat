@echo off
REM SMS Slang Translator - Local Development Runner (Windows)
REM This script starts both backend and frontend servers for local development

echo ========================================
echo   SMS Slang Translator - Local Dev
echo ========================================
echo.

REM Check if Python is installed (try py launcher first, then python)
where py >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py -3
    goto :found_python
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto :found_python
)

echo [ERROR] Python is not installed or not in PATH
echo Please install Python 3.8+ and try again
pause
exit /b 1

:found_python
echo Found Python at: %PYTHON_CMD%
echo.

REM Install Backend Dependencies
echo [1/3] Installing Backend Dependencies...
cd backend
%PYTHON_CMD% -m pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install dependencies, trying to continue anyway...
)
cd ..

REM Start Backend
echo [2/3] Starting Backend Server...
cd backend
start "SMS Translator Backend" cmd /k "%PYTHON_CMD% app.py"
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [3/3] Starting Frontend Server...
cd frontend
start "SMS Translator Frontend" cmd /k "%PYTHON_CMD% -m http.server 8080"
cd ..

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo   Frontend: http://localhost:8080
echo   Backend:  http://localhost:5000
echo.
echo   Press any key to open in browser...
pause >nul

start http://localhost:8080
