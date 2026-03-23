# Setup Vercel Blob Storage for Legacy Network

Write-Host "🔧 Setting up Vercel Blob Storage..." -ForegroundColor Cyan

# Step 1: Link blob store (if not already done)
Write-Host "`n📦 Creating/Linking Blob Store..." -ForegroundColor Yellow
$linkProcess = Start-Process -FilePath "vercel" -ArgumentList "blob", "store", "add", "legacy-media-final" -WorkingDirectory "C:\Users\Tom Tsadaka\Projects\legacy-network" -NoNewWindow -Wait -PassThru

if ($linkProcess.ExitCode -eq 0) {
    Write-Host "✅ Blob store linked successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Blob store might already exist. Continuing..." -ForegroundColor Yellow
}

# Step 2: Generate token from Vercel dashboard
Write-Host "`n🔑 Getting Blob Token..." -ForegroundColor Yellow
Write-Host "Opening Vercel dashboard to get BLOB token..." -ForegroundColor Cyan
Start-Process "https://vercel.com/tomtsadaka-1543/legacy-network/stores"

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Magenta
Write-Host "📋 MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Magenta
Write-Host ""
Write-Host "1. In the Vercel dashboard that just opened:" -ForegroundColor White
Write-Host "   - Find the 'legacy-media' or 'legacy-media-final' store" -ForegroundColor Gray
Write-Host "   - Click on it" -ForegroundColor Gray
Write-Host "   - Copy the BLOB_READ_WRITE_TOKEN" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Then run:" -ForegroundColor White
Write-Host "   vercel env add BLOB_READ_WRITE_TOKEN" -ForegroundColor Cyan
Write-Host "   (Paste the token when prompted)" -ForegroundColor Gray
Write-Host "   (Select: Production, Preview, Development)" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Magenta
