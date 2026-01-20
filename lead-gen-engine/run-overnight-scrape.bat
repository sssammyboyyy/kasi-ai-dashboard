@echo off
REM ===========================================
REM MEGA OVERNIGHT ICP SCRAPE
REM ===========================================
REM Runs 3 scrapes sequentially:
REM 1. Commercial Cleaning (43 locations) - ~4300 leads
REM 2. Office Cleaning (5 metros) - ~500 leads
REM 3. Industrial Cleaning (10 hubs) - ~1000 leads
REM Total potential: ~5800 leads
REM Expected duration: 6-10 hours
REM
REM Usage: Double-click or run from command prompt

echo.
echo  ========================================
echo   KASI AI - MEGA OVERNIGHT ICP SCRAPE
echo  ========================================
echo   Total potential leads: 5800+
echo   Scrapes: 3 (commercial, office, industrial)
echo   Locations: 58 across South Africa
echo  ========================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo Error: Run this script from the lead-gen-suite directory
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [1/3] Starting COMMERCIAL CLEANING scrape...
echo Started at %date% %time%
call npx apify run --input-file=overnight-icp-scrape.json
echo Commercial cleaning complete at %time%

echo.
echo [2/3] Starting OFFICE CLEANING scrape...
call npx apify run --input-file=overnight-office-cleaning.json
echo Office cleaning complete at %time%

echo.
echo [3/3] Starting INDUSTRIAL CLEANING scrape...
call npx apify run --input-file=overnight-industrial-cleaning.json
echo Industrial cleaning complete at %time%

echo.
echo ========================================
echo   ALL SCRAPES COMPLETE!
echo   Finished at %date% %time%
echo   Check storage\datasets\default\ for results
echo ========================================
pause
