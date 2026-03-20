# Vercel Environment Variables Setup

## Quick Setup (2 minutes)

### 1. Go to Vercel Dashboard
https://vercel.com/toms-projects-7c7f54b9/legacy-network/settings/environment-variables

### 2. Add These Variables

Click "Add New" for each:

#### DATABASE_URL
```
postgresql://neondb_owner:npg_kEti29GpzcvK@ep-twilight-shape-anvotk09-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
- Environment: Production, Preview, Development (check all 3)
- Type: Encrypted (sensitive)

#### NEXTAUTH_URL
```
https://legacy-network-mu.vercel.app
```
- Environment: Production
- Type: Plain Text

For Preview:
```
https://legacy-network-git-master-toms-projects-7c7f54b9.vercel.app
```
- Environment: Preview
- Type: Plain Text

#### NEXTAUTH_SECRET
```
myO1aDffT8Og1wgd3InTp4K44BeST3jeA+aJw3X0xhQ=
```
- Environment: Production, Preview, Development (check all 3)
- Type: Encrypted (sensitive)

### 3. Save All Variables

### 4. Redeploy to Production

After saving all env vars, run:
```bash
vercel --prod
```

Or just click "Redeploy" in the dashboard.

---

## Your URLs

- **Production**: https://legacy-network-mu.vercel.app
- **Preview**: https://legacy-network-159fogrc9-toms-projects-7c7f54b9.vercel.app
- **Inspect**: https://vercel.com/toms-projects-7c7f54b9/legacy-network/6V8EByutC6XKK2Jfn4yztCX1ZP18

---

That's it! 🚀
