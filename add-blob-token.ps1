# Auto-Add Blob Token to Vercel
# This script will automatically add the BLOB_READ_WRITE_TOKEN

Write-Host "`n🔧 Adding BLOB_READ_WRITE_TOKEN to Vercel..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Magenta

# Step 1: Get blob store token
Write-Host "`n📦 Step 1: Getting Blob Store details..." -ForegroundColor Yellow
$storeId = "store_fy4GcPV1eUfG5Sc3"  # From our earlier creation

# Generate the token value (this will be shown in Vercel dashboard)
Write-Host "Store ID: $storeId" -ForegroundColor Gray

# Step 2: Interactive token input
Write-Host "`n🔑 Step 2: We need the BLOB token from Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Vercel Blob Store page..." -ForegroundColor Cyan
Start-Process "https://vercel.com/tomtsadaka-1543/legacy-network/stores/blob_$storeId"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "In the Vercel page that opened:" -ForegroundColor White
Write-Host "1. Find the '.env.local' code snippet" -ForegroundColor Gray
Write-Host "2. Copy the BLOB_READ_WRITE_TOKEN value" -ForegroundColor Gray
Write-Host "   (starts with 'vercel_blob_rw_...')" -ForegroundColor Gray
Write-Host ""

# Get token from user
$token = Read-Host "Paste the token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "`n❌ Error: No token provided!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Token received!" -ForegroundColor Green

# Step 3: Add to Vercel using CLI with echo pipe
Write-Host "`n📤 Step 3: Adding token to Vercel..." -ForegroundColor Yellow

try {
    # Create a temporary input file
    $inputFile = "blob-token-input.txt"
    @"
$token
y
y
y
"@ | Out-File -FilePath $inputFile -Encoding ASCII

    # Run vercel env add with input file
    Get-Content $inputFile | vercel env add BLOB_READ_WRITE_TOKEN

    # Clean up
    Remove-Item $inputFile -ErrorAction SilentlyContinue

    Write-Host "`n✅ SUCCESS! Token added to Vercel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 All done! The blob storage is now configured!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test it at: https://legacy-network-mu.vercel.app" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ Error adding token: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual fallback:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://vercel.com/tomtsadaka-1543/legacy-network/settings/environment-variables" -ForegroundColor Gray
    Write-Host "2. Click 'Add New'" -ForegroundColor Gray
    Write-Host "3. Key: BLOB_READ_WRITE_TOKEN" -ForegroundColor Gray
    Write-Host "4. Value: (paste the token)" -ForegroundColor Gray
    Write-Host "5. Select all environments" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Magenta
