# SmartClinic Deployment Guide

## 🚀 DEPLOYMENT CHECKLIST - DO THESE STEPS ONE BY ONE

### Current Status:
- ✅ Project code: 100% complete (19,890 lines, 186 files)
- ✅ Dependencies: Installed
- ⚠️ Node.js: 18.19.1 (need 20.19+)
- ❌ Database: Not set up
- ❌ Environment: Not configured for production
- ❌ Build: Not created

---

## STEP 1: Setup PostgreSQL Database (5-10 minutes)

### Option A: Using Docker (RECOMMENDED)
```bash
# Pull and run PostgreSQL container
docker pull postgres:15
docker run -d \
  --name smartclinic-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=securepassword123 \
  -e POSTGRES_DB=smartclinic \
  -p 5432:5432 \
  -v smartclinic-db-data:/var/lib/postgresql/data \
  postgres:15
```

### Option B: Direct PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb smartclinic
sudo -u postgres createuser smartclinic_user
sudo -u postgres psql -c "ALTER USER smartclinic_user WITH PASSWORD 'securepassword123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smartclinic TO smartclinic_user;"
```

**Verify it's running:**
```bash
psql -h localhost -U postgres -d smartclinic -c "SELECT 1;"
```

---

## STEP 2: Upgrade Node.js to v20+ (10 minutes)

### Using NVM (Node Version Manager)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
npm --version
```

### Or Download Directly
```bash
# From https://nodejs.org/
# Download Node.js 20 LTS
# Extract and add to PATH
```

---

## STEP 3: Create Production Environment File (.env)

```bash
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project

# Create .env with production values:
cat > .env << 'EOF'
# DATABASE
DATABASE_URL="postgresql://smartclinic_user:securepassword123@localhost:5432/smartclinic"

# SESSION
SESSION_SECRET="your-production-secret-key-min-32-chars-please-change-this"

# API SERVER
PORT=3000
NODE_ENV=production

# OPTIONAL: API
API_BASE_URL="http://localhost:3000"
EOF
```

**⚠️ IMPORTANT:**
- Change `securepassword123` to a strong password
- Change `SESSION_SECRET` to a unique random string
- Change `localhost` to your domain when deployed

---

## STEP 4: Build the Project (5-10 minutes)

```bash
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project

# Run full build
pnpm run build

# Expected output: No TypeScript errors, built artifacts in dist/
```

If you get errors, run:
```bash
# Clear cache and rebuild
rm -rf node_modules/.pnpm-store
pnpm install
pnpm run build
```

---

## STEP 5: Initialize Database Schema (2-3 minutes)

```bash
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project

# Push database schema
pnpm --filter @workspace/db run push

# This creates tables:
# - users
# - doctors
# - appointments
# - medical_history
```

**Verify tables were created:**
```bash
psql -h localhost -U smartclinic_user -d smartclinic -c "\dt"
```

---

## STEP 6: (OPTIONAL) Seed Initial Data

If you want test data:
```bash
# Check if seed script exists
ls -la scripts/

# If seed.ts exists, run it:
pnpm --filter @workspace/db run seed
```

---

## STEP 7: Start Production Services

### Option A: Manual (for testing)

**Terminal 1 - API Server:**
```bash
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project
NODE_ENV=production \
  DATABASE_URL="postgresql://smartclinic_user:securepassword123@localhost:5432/smartclinic" \
  SESSION_SECRET="your-production-secret" \
  PORT=3000 \
  npx pnpm run --filter @workspace/api-server build && \
  npx pnpm run --filter @workspace/api-server start
```

**Terminal 2 - Frontend:**
```bash
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project
npx pnpm run --filter @workspace/smartclinic build

# Then serve the dist folder
npx http-server artifacts/smartclinic/dist -p 3001
```

### Option B: Using PM2 (for production)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "smartclinic-api",
      script: "./artifacts/api-server/dist/index.mjs",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "postgresql://smartclinic_user:securepassword123@localhost:5432/smartclinic",
        SESSION_SECRET: "your-production-secret"
      }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 logs
```

---

## STEP 8: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt-get install nginx

# Create config
sudo nano /etc/nginx/sites-available/smartclinic
```

```nginx
upstream api_backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # API routes
    location /api/ {
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smartclinic /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## STEP 9: Setup HTTPS (SSL Certificate)

```bash
# Using Let's Encrypt (FREE)
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## STEP 10: Deployment Checklist

Before going live, verify:

```bash
# ✅ Database running
psql -h localhost -U smartclinic_user -d smartclinic -c "SELECT 1;"

# ✅ API server responding
curl http://localhost:3000/health

# ✅ Frontend accessible
curl http://localhost:3001

# ✅ Logs clean
pm2 logs smartclinic-api

# ✅ Environment variables set
echo $DATABASE_URL
echo $SESSION_SECRET

# ✅ Build artifacts exist
ls -la artifacts/api-server/dist/
ls -la artifacts/smartclinic/dist/
```

---

## 🚨 REMAINING TASKS SUMMARY

| Task | Time | Status |
|------|------|--------|
| 1️⃣ Setup PostgreSQL | 5-10 min | ❌ TODO |
| 2️⃣ Upgrade Node.js | 10 min | ❌ TODO |
| 3️⃣ Create .env file | 2 min | ✅ PARTIAL (need production values) |
| 4️⃣ Build project | 5-10 min | ❌ TODO |
| 5️⃣ Initialize DB schema | 2-3 min | ❌ TODO |
| 6️⃣ Start services | 5 min | ❌ TODO |
| 7️⃣ Setup Nginx | 10 min | ❌ TODO |
| 8️⃣ Setup SSL | 10 min | ❌ TODO |
| **TOTAL TIME** | **~60 minutes** | |

---

## 🔗 DEPLOYMENT PLATFORMS (Alternative)

Instead of manual deployment, you can use:

### **Option 1: Vercel** (Frontend only)
```bash
# Build frontend
pnpm run --filter @workspace/smartclinic build
# Deploy artifacts/smartclinic/dist to Vercel
```

### **Option 2: Render** (Full Stack)
- Push to GitHub
- Connect Render to your repo
- Set environment variables
- Deploy automatically

### **Option 3: Railway** (Full Stack)
- Similar to Render
- Supports PostgreSQL + Node.js
- Git-based deployment

### **Option 4: Heroku** (Legacy)
```bash
heroku create smartclinic
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

---

## 📞 QUICK START (MINIMAL SETUP)

If you want to test quickly:

```bash
# 1. Start PostgreSQL Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

# 2. Upgrade Node (nvm)
nvm install 20 && nvm use 20

# 3. Build
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project
pnpm run build

# 4. Setup DB
pnpm --filter @workspace/db run push

# 5. Start API
PORT=3000 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres SESSION_SECRET=dev-secret npx pnpm run --filter @workspace/api-server start

# 6. In another terminal, start frontend (after Node upgrade)
npx pnpm run --filter @workspace/smartclinic dev
```

Then visit: **http://localhost:5173**

---

## ❓ QUESTIONS?

Need help with any step? Just ask!
