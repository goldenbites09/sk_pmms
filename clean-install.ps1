# Stop any running processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove directories
$itemsToRemove = @(
    "node_modules",
    ".next",
    "package-lock.json",
    ".pnpm-lock.yaml"
)

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        try {
            Remove-Item -Path $item -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Removed: $item"
        } catch {
            Write-Warning "⚠️  Failed to remove $item : $_"
        }
    } else {
        Write-Host "ℹ️  Not found: $item"
    }
}

# Install dependencies
Write-Host "🚀 Installing dependencies..."
npm install --force

# Check installation
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!"
} else {
    Write-Error "❌ Failed to install dependencies"
    exit 1
}
