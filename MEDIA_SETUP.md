# Media Upload Setup - Vercel Blob

## ✅ What's Done:
1. Database schema updated with `Media` model
2. API routes created:
   - `POST /api/upload` - Upload images/videos
   - `PATCH /api/entries/[id]` - Update entry with media
   - `DELETE /api/media/[id]` - Delete media
   - `GET /api/children` - Get family children
3. Edit page created: `/entries/[id]/edit`
4. View page updated to show media gallery
5. Timeline cards show media thumbnails

## 🔑 Required: Vercel Blob Token

### Local Development (.env.local):
```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

### Production (Vercel Dashboard):
1. Go to: https://vercel.com/toms-projects/legacy-network/settings/environment-variables
2. Add new variable:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** (get from Vercel Blob Storage)
   - **Environment:** Production, Preview, Development

### Get Vercel Blob Token:
1. Go to https://vercel.com/dashboard/stores
2. Create a new Blob store (or use existing)
3. Copy the `BLOB_READ_WRITE_TOKEN`

## 📝 How to Use:

1. **Edit Entry:**
   - Navigate to any entry → click "ערוך"
   - Click "העלה תמונות/סרטונים"
   - Select images/videos
   - Click "שמור שינויים"

2. **View Media:**
   - Entry view page shows full gallery
   - Timeline cards show thumbnails

3. **Delete Media:**
   - In edit mode, hover over media → click X

## 💰 Vercel Blob Pricing:
- **Free tier:** 5GB storage + 50GB bandwidth/month
- **Pro:** Starts at $0.15/GB/month

## 🎨 Supported Formats:
- **Images:** JPEG, PNG, GIF, WebP
- **Videos:** MP4, MOV, AVI, WebM

## 🚀 Deploy:
```bash
git add .
git commit -m "✨ Media upload: Images & videos in entries"
git push
```

Then add the `BLOB_READ_WRITE_TOKEN` in Vercel dashboard!
