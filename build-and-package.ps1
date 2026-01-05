# Simple Hotel Kiosk Build Script (bypasses electron-builder packaging issues)

Write-Host "========================================"
Write-Host "  Hotel Kiosk Simple Build"
Write-Host "========================================"
Write-Host ""

# Step 1: Clean
Write-Host "Step 1: Cleaning old builds..."
Remove-Item -Recurse -Force dist, build -ErrorAction SilentlyContinue
Write-Host "Cleaned" -ForegroundColor Green
Write-Host ""

# Step 2: Build React app
Write-Host "Step 2: Building React app..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "React build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "React app built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Create distribution folder structure manually
Write-Host "Step 3: Creating distribution package..."
$distPath = ".\dist\Hotel-Kiosk"
New-Item -ItemType Directory -Force -Path "$distPath\resources\app" | Out-Null

# Copy Electron binary from node_modules
Write-Host "Copying Electron runtime..."
$electronPath = ".\node_modules\electron\dist"
Copy-Item -Path "$electronPath\*" -Destination $distPath -Recurse -Force

# Copy app files
Write-Host "Copying app files..."
Copy-Item -Path ".\build" -Destination "$distPath\resources\app\build" -Recurse -Force
Copy-Item -Path ".\electron" -Destination "$distPath\resources\app\electron" -Recurse -Force
Copy-Item -Path ".\package.json" -Destination "$distPath\resources\app\package.json" -Force

# Rename electron.exe to Hotel Kiosk.exe
Write-Host "Renaming executable..."
if (Test-Path "$distPath\electron.exe") {
    Rename-Item -Path "$distPath\electron.exe" -NewName "Hotel Kiosk.exe" -Force
}

Write-Host "Package created successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Verify
Write-Host "Step 4: Verifying build..."
$mainExists = Test-Path "$distPath\resources\app\electron\main.js"
$indexExists = Test-Path "$distPath\resources\app\build\index.html"
$exeExists = Test-Path "$distPath\Hotel Kiosk.exe"

if ($mainExists -and $indexExists -and $exeExists) {
    Write-Host "Build verification passed" -ForegroundColor Green
} else {
    Write-Host "Build verification failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Create zip
Write-Host "Step 5: Creating distributable zip..."
$zipName = "Hotel-Kiosk-Windows.zip"
Compress-Archive -Path "$distPath\*" -DestinationPath ".\dist\$zipName" -Force
Write-Host "Created: dist\$zipName" -ForegroundColor Green
Write-Host ""

# Done
Write-Host "========================================"
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Distributable: dist\$zipName"
Write-Host "Test locally: dist\Hotel-Kiosk\Hotel Kiosk.exe"
Write-Host ""