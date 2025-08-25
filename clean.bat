@echo off
echo Cleaning build directories and cache...

REM Remove node_modules cache
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

REM Remove Next.js build files
if exist ".next" rmdir /s /q ".next"

REM Force remove out directory
if exist "out" (
    echo Removing out directory...
    rmdir /s /q "out" 2>nul
    if exist "out" (
        echo Forcing removal of stubborn files...
        takeown /f "out" /r /d y >nul 2>&1
        icacls "out" /grant administrators:F /t >nul 2>&1
        rmdir /s /q "out" >nul 2>&1
    )
)

REM Remove dist directory if exists
if exist "dist" rmdir /s /q "dist"

echo Clean completed!
pause