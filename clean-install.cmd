@echo off
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning up...
rmdir /s /q node_modules 2>nul
rmdir /s /q .next 2>nul
del package-lock.json 2>nul
del .pnpm-lock.yaml 2>nul

echo Installing dependencies...
call npm install --force

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencies installed successfully!
) else (
    echo ❌ Failed to install dependencies
    exit /b 1
)
