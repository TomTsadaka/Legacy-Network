# Setup Vercel Environment Variables
# Run this script to add all required env vars to Vercel

$DATABASE_URL = "postgresql://neondb_owner:npg_kEti29GpzcvK@ep-twilight-shape-anvotk09-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
$NEXTAUTH_SECRET = "myO1aDffT8Og1wgd3InTp4K44BeST3jeA+aJw3X0xhQ="
$NEXTAUTH_URL_PROD = "https://legacy-network-mu.vercel.app"

Write-Host "Adding DATABASE_URL..." -ForegroundColor Yellow
echo $DATABASE_URL | vercel env add DATABASE_URL production preview development

Write-Host "`nAdding NEXTAUTH_SECRET..." -ForegroundColor Yellow
echo $NEXTAUTH_SECRET | vercel env add NEXTAUTH_SECRET production preview development

Write-Host "`nAdding NEXTAUTH_URL..." -ForegroundColor Yellow
echo $NEXTAUTH_URL_PROD | vercel env add NEXTAUTH_URL production

Write-Host "`n✅ All environment variables added!" -ForegroundColor Green
Write-Host "`nNext step: Run 'vercel --prod' to deploy to production" -ForegroundColor Cyan
