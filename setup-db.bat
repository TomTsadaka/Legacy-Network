@echo off
echo ========================================
echo   Legacy Network - Quick Database Setup
echo ========================================
echo.
echo Opening Neon Console in 3 seconds...
timeout /t 3 >nul
start https://console.neon.tech/app/projects
echo.
echo INSTRUCTIONS:
echo 1. Click "New Project"
echo 2. Name: legacy-network
echo 3. Region: US East (Ohio)
echo 4. Click "Create Project"
echo.
echo 5. Copy the DATABASE_URL (looks like: postgresql://...)
echo.
echo 6. Come back here and paste it when ready!
echo.
echo ========================================
pause
