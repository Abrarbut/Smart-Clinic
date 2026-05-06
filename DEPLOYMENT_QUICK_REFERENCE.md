# 📋 DEPLOYMENT QUICK REFERENCE

## What's Missing to Deploy?

```
┌─────────────────────────────────────────────────────────────┐
│                  SMARTCLINIC DEPLOYMENT STATUS              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Code           | 100% Complete (19,890 lines)           │
│  ✅ Dependencies   | Installed (npm/pnpm)                   │
│  ❌ Node.js        | 18.19.1 (need ≥20.19)                  │
│  ❌ PostgreSQL     | Not setup                               │
│  ❌ Build          | Not created                             │
│  ❌ Environment    | Placeholder values only                 │
│  ❌ SSL/HTTPS      | Not configured                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 DEPLOYMENT STEPS (In Order)

### STEP 1: Database Setup (5-10 min)
```bash
# Choose one option:

# Option A: Docker (easiest)
docker run -d -e POSTGRES_PASSWORD=securepass123 -p 5432:5432 postgres:15

# Option B: Direct install
sudo apt-get install postgresql
```

### STEP 2: Upgrade Node.js (10 min)
```bash
# Using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### STEP 3: Create Production .env (2 min)
```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/smartclinic"
SESSION_SECRET="your-secure-random-key-here"
PORT=3000
NODE_ENV=production
EOF
```

### STEP 4: Build Project (10 min)
```bash
pnpm run build
```

### STEP 5: Initialize Database (2-3 min)
```bash
pnpm --filter @workspace/db run push
```

### STEP 6: Start Services (2 min)
```bash
# Terminal 1: API Server
npm --filter @workspace/api-server start

# Terminal 2: Frontend (static serve)
npx http-server artifacts/smartclinic/dist -p 3001
```

### STEP 7: Setup Nginx (10 min)
- Configure reverse proxy
- Route /api → port 3000
- Route / → port 3001

### STEP 8: Add SSL (10 min)
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## ⏱️ TOTAL TIME ESTIMATE

| Step | Time |
|------|------|
| Database | 5-10 min |
| Node.js | 10 min |
| .env file | 2 min |
| Build | 10 min |
| DB Schema | 2-3 min |
| Services | 2 min |
| Nginx | 10 min |
| SSL | 10 min |
| **TOTAL** | **~61 minutes** |

---

## 📱 TECH STACK FOR DEPLOYMENT

```
┌──────────────────────┐
│   Load Balancer      │
│  (Nginx/Cloudflare)  │
└──────────┬───────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
┌───▼──────────────┐  ┌──────▼──────────┐
│ Frontend (React) │  │ API Server      │
│ Port: 3001       │  │ (Express)       │
│ Static HTML/CSS  │  │ Port: 3000      │
│ TanStack Query   │  │ Node.js         │
└──────────────────┘  └────────┬────────┘
                               │
                        ┌──────▼──────────┐
                        │  PostgreSQL     │
                        │  Database       │
                        │  Port: 5432     │
                        └─────────────────┘
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change SESSION_SECRET to random string
- [ ] Change DATABASE password to strong password
- [ ] Enable HTTPS/SSL certificate
- [ ] Setup firewall rules (only 80, 443)
- [ ] Hide API behind authentication
- [ ] Setup database backups
- [ ] Enable CORS properly
- [ ] Use environment variables (not hardcoded)
- [ ] Setup monitoring/logging
- [ ] Rate limiting on API

---

## 🚀 QUICKEST DEPLOYMENT PATH

For getting it running ASAP:

1. **Docker Compose** (everything in one file)
```yaml
version: '3'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
  
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3001:3001"
```

2. **Railway.app** (drag & drop deployment)
   - Connect GitHub
   - Add PostgreSQL addon
   - Set env vars
   - Deploy!

3. **Vercel** (frontend only)
   - Push to GitHub
   - Connect Vercel
   - Deploy frontend
   - Point API to external server

---

## 📞 DEPLOYMENT CHECKLIST

Run this before going live:

```bash
# ✅ Check database
psql -h localhost -U postgres -d smartclinic -c "SELECT COUNT(*) FROM information_schema.tables;"

# ✅ Check API
curl http://localhost:3000/health

# ✅ Check frontend
curl http://localhost:3001

# ✅ Check logs
pm2 logs

# ✅ Load test (optional)
# ab -n 100 -c 10 http://localhost:3000/health
```

---

## NEXT STEPS

1. **Read DEPLOYMENT_GUIDE.md** for detailed instructions
2. **Start with STEP 1** (Database setup)
3. **Follow each step sequentially**
4. **Test after each step**
5. **Ask for help if stuck!**

All steps are explained in detail in `DEPLOYMENT_GUIDE.md` ✨
