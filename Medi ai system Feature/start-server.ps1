# Medical Imaging Viewer - Local Server Launcher
# Run this script to start a local web server

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Medical Imaging Viewer - Server Launcher    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$port = 8000

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Starting web server on port $port..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📂 Serving files from: $PWD" -ForegroundColor Cyan
    Write-Host "🌐 Open your browser to: http://localhost:$port" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Start Python HTTP server
    python -m http.server $port
}
catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods to run the application:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install Python:" -ForegroundColor Cyan
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "   Then run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Use Node.js (if installed):" -ForegroundColor Cyan
    Write-Host "   npx http-server -p $port" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Use VS Code:" -ForegroundColor Cyan
    Write-Host "   Install 'Live Server' extension" -ForegroundColor White
    Write-Host "   Right-click index.html -> Open with Live Server" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Double-click index.html:" -ForegroundColor Cyan
    Write-Host "   (May have CORS issues with DATA folder)" -ForegroundColor White
    Write-Host ""
    
    Read-Host "Press Enter to exit"
}
