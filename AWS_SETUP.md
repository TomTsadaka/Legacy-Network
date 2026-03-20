# AWS RDS Setup for Legacy Network

## Option 1: AWS Console (UI)

### Step 1: Create RDS Database
1. Go to AWS Console → RDS → Create database
2. Choose:
   - **Engine**: PostgreSQL (version 15 or 16)
   - **Template**: Free tier (if eligible) or Dev/Test
   - **DB instance identifier**: `legacy-network-db`
   - **Master username**: `postgres`
   - **Master password**: (create a strong password, save it!)
   
3. Instance configuration:
   - **DB instance class**: `db.t3.micro` (free tier) or `db.t4g.micro`
   - **Storage**: 20 GB (General Purpose SSD)
   - **Storage autoscaling**: Enable (up to 100 GB)

4. Connectivity:
   - **Public access**: YES (for development)
   - **VPC security group**: Create new → `legacy-network-sg`
   - **Availability Zone**: No preference

5. Additional configuration:
   - **Initial database name**: `legacy_network`
   - **Backup retention**: 7 days
   - **Enable encryption**: YES

6. **Create database** (takes ~5 minutes)

### Step 2: Configure Security Group
1. Go to EC2 → Security Groups → Find `legacy-network-sg`
2. Edit **Inbound rules**:
   - Type: PostgreSQL
   - Port: 5432
   - Source: `My IP` (or `0.0.0.0/0` for testing - **NOT for production!**)
3. Save rules

### Step 3: Get Connection String
1. Go to RDS → Databases → `legacy-network-db`
2. Copy **Endpoint** (looks like: `legacy-network-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Build your connection string:
```
postgresql://postgres:YOUR_PASSWORD@YOUR_ENDPOINT:5432/legacy_network
```

Example:
```
postgresql://postgres:MySecurePass123@legacy-network-db.c9akr123456.us-east-1.rds.amazonaws.com:5432/legacy_network
```

---

## Option 2: AWS CLI (Fast!)

```bash
# 1. Create DB instance
aws rds create-db-instance \
  --db-instance-identifier legacy-network-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD_HERE \
  --allocated-storage 20 \
  --db-name legacy_network \
  --publicly-accessible \
  --backup-retention-period 7 \
  --storage-encrypted

# 2. Wait for creation (check status)
aws rds describe-db-instances \
  --db-instance-identifier legacy-network-db \
  --query 'DBInstances[0].DBInstanceStatus'

# 3. Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier legacy-network-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

---

## Cheaper Alternative: Neon (Recommended for Dev)

**Why Neon?**
- ✅ Free tier: 0.5 GB storage, always free
- ✅ Serverless PostgreSQL (auto-pause when idle)
- ✅ Instant setup (no waiting)
- ✅ Built-in connection pooling
- ✅ Better for development

**Setup:**
1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create project: "Legacy Network"
4. Copy connection string
5. Paste into `.env`

---

## After Database is Ready

### 1. Update `.env`
```env
# Replace with your actual connection string
DATABASE_URL="postgresql://postgres:password@your-endpoint:5432/legacy_network"

NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Run Migrations
```bash
cd C:\Users\Tom Tsadaka\Projects\legacy-network

# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# OR use migrations (better for production)
npx prisma migrate dev --name init
```

### 3. Verify
```bash
# Open Prisma Studio to see your database
npx prisma studio
```

---

## Cost Estimates

### AWS RDS (db.t3.micro)
- **Free tier** (12 months): Free for 750 hours/month
- **After free tier**: ~$15-20/month
- **Storage**: $0.115/GB/month

### Neon (Free Tier)
- **Storage**: 0.5 GB free forever
- **Compute**: Auto-pause when idle
- **Paid**: Starts at $19/month for more storage

---

## Security Checklist

- [ ] Use strong database password (20+ characters)
- [ ] Enable SSL/TLS connection
- [ ] Restrict security group to your IP only
- [ ] Enable automated backups
- [ ] Use environment variables (never commit passwords)
- [ ] For production: Use private subnet + VPC
- [ ] Enable encryption at rest
- [ ] Set up CloudWatch alerts

---

## Troubleshooting

### "Connection timeout"
- Check security group allows your IP on port 5432
- Verify public access is enabled
- Check VPC route table

### "Authentication failed"
- Double-check username/password
- Ensure database name is correct in connection string

### "SSL connection required"
Add `?sslmode=require` to connection string:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

---

**Built by**: Tom Tsadaka  
**Date**: 2026-03-20
