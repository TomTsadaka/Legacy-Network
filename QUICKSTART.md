# Quick Database Setup

## Option 1: Create Vercel Postgres

1. Go to: https://vercel.com/toms-projects-7c7f54b9/legacy-network
2. Click "Storage" tab
3. Click "Create Database"
4. Choose "Postgres"
5. Name it: `legacy-network-db`
6. Click "Create"

This will automatically:
- Create the database
- Add DATABASE_URL to environment variables
- Trigger a new deployment

## Option 2: Wake Up Neon Database

1. Go to: https://console.neon.tech
2. Find your Legacy Network project
3. Click "Resume" or "Wake up"
4. Wait 30 seconds
5. Try again: https://legacy-network-mu.vercel.app/api/setup

---

After database is ready:
1. Visit: https://legacy-network-mu.vercel.app/api/setup
2. Then login: https://legacy-network-mu.vercel.app/auth/signin
   - Username: tom
   - Password: tom123
