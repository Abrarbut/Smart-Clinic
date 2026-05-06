# ✅ SMARTCLINIC DEPLOYMENT CHECKLIST

## Print This and Check Off As You Go! 📋

---

## 🎯 PRE-DEPLOYMENT (Read These First)

- [ ] Read `DEPLOYMENT_ROADMAP.md` (visual guide) - 5 min
- [ ] Read `DEPLOYMENT_QUICK_REFERENCE.md` (overview) - 5 min  
- [ ] Read `DEPLOYMENT_GUIDE.md` (detailed steps) - 15 min
- [ ] Choose your deployment path:
  - [ ] Docker (easiest, 30 min)
  - [ ] Manual (most control, 60 min)
  - [ ] PaaS (zero effort, 15 min)

---

## 🔴 CRITICAL: DO THESE FIRST

### Phase 1: Environment Setup (20 minutes)

- [ ] **1.1 Install PostgreSQL**
  - [ ] Option A: Docker
    ```bash
    docker run -d -e POSTGRES_PASSWORD=mypassword -p 5432:5432 postgres:15
    ```
  - [ ] Option B: Direct install (Ubuntu)
    ```bash
    sudo apt-get install postgresql postgresql-contrib
    ```
  - [ ] Verify: `psql -U postgres -c "SELECT 1;"`

- [ ] **1.2 Upgrade Node.js to v20+**
  - Current version: `node --version` (should be 18.19.1)
  - [ ] Install NVM: 
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    ```
  - [ ] Install Node 20:
    ```bash
    nvm install 20
    nvm use 20
    nvm alias default 20
    ```
  - [ ] Verify: `node --version` (should be v20.x.x)

- [ ] **1.3 Create .env Production File**
  - [ ] Copy current .env as backup: `cp .env .env.backup`
  - [ ] Edit .env with real values:
    ```bash
    DATABASE_URL="postgresql://smartclinic_user:YOUR_SECURE_PASSWORD@localhost:5432/smartclinic"
    SESSION_SECRET="YOUR_RANDOM_SECRET_KEY_MIN_32_CHARS"
    PORT=3000
    NODE_ENV=production
    ```
  - [ ] Verify: `cat .env` shows your values

### Phase 2: Build & Initialize (25 minutes)

- [ ] **2.1 Build the Project**
  - [ ] Navigate: `cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project`
  - [ ] Run: `pnpm run build`
  - [ ] Wait... (10 minutes)
  - [ ] Check: `ls -la artifacts/api-server/dist/` (should have files)
  - [ ] Check: `ls -la artifacts/smartclinic/dist/` (should have files)

- [ ] **2.2 Initialize Database Schema**
  - [ ] Run: `pnpm --filter @workspace/db run push`
  - [ ] Verify with:
    ```bash
    psql -U smartclinic_user -d smartclinic -c "\dt"
    ```
  - [ ] You should see 5 tables:
    - [ ] appointments
    - [ ] doctors
    - [ ] medical_history
    - [ ] users
    - [ ] (schema info tables)

### Phase 3: Start Services (5 minutes)

- [ ] **3.1 Start API Server**
  - [ ] Terminal 1:
    ```bash
    cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project
    PORT=3000 DATABASE_URL="..." SESSION_SECRET="..." npx pnpm run --filter @workspace/api-server start
    ```
  - [ ] Wait for: "Server listening on port 3000"
  - [ ] Test: `curl http://localhost:3000/health`

- [ ] **3.2 Start Frontend**
  - [ ] Terminal 2:
    ```bash
    cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project
    npx http-server artifacts/smartclinic/dist -p 3001
    ```
  - [ ] Or use: `npx pnpm run --filter @workspace/smartclinic dev`
  - [ ] Test: Open http://localhost:3001

### Phase 4: Functional Testing (10 minutes)

- [ ] **4.1 Test API Endpoints**
  - [ ] GET /health: `curl http://localhost:3000/health`
  - [ ] POST /auth/register: 
    ```bash
    curl -X POST http://localhost:3000/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"Test123!","role":"patient"}'
    ```
  - [ ] Check logs for errors: `pm2 logs smartclinic-api`

- [ ] **4.2 Test Frontend**
  - [ ] Open http://localhost:3001 in browser
  - [ ] [ ] Page loads without errors
  - [ ] [ ] Can see login form
  - [ ] [ ] Can navigate to register
  - [ ] [ ] Network requests show in DevTools

- [ ] **4.3 End-to-End Test**
  - [ ] [ ] Register new account
  - [ ] [ ] Login with credentials
  - [ ] [ ] View dashboard
  - [ ] [ ] Search for doctors
  - [ ] [ ] Check user profile
  - [ ] [ ] Logout

---

## 🟡 IMPORTANT: Production Setup (30 minutes)

### Phase 5: Reverse Proxy (10 minutes)

- [ ] **5.1 Install Nginx**
  ```bash
  sudo apt-get install nginx
  ```

- [ ] **5.2 Configure Nginx**
  - [ ] Create config: `/etc/nginx/sites-available/smartclinic`
  - [ ] Use template from `DOCKER_SETUP.md`
  - [ ] Verify: `sudo nginx -t`
  - [ ] Enable: `sudo ln -s /etc/nginx/sites-available/smartclinic /etc/nginx/sites-enabled/`
  - [ ] Start: `sudo systemctl start nginx`

### Phase 6: SSL Certificate (10 minutes)

- [ ] **6.1 Get SSL Certificate**
  ```bash
  sudo apt-get install certbot python3-certbot-nginx
  sudo certbot --nginx -d yourdomain.com
  ```

- [ ] **6.2 Auto-Renewal**
  ```bash
  sudo systemctl enable certbot.timer
  ```

### Phase 7: Domain Setup (10 minutes)

- [ ] **7.1 Configure DNS**
  - [ ] Go to domain registrar (GoDaddy, Namecheap, etc.)
  - [ ] Add A record: `yourdomain.com → your.server.ip`
  - [ ] Wait for propagation (up to 48 hours)
  - [ ] Test: `nslookup yourdomain.com`

- [ ] **7.2 Update Frontend Config**
  - [ ] Update API base URL in code
  - [ ] Rebuild frontend: `pnpm run --filter @workspace/smartclinic build`

---

## 🟢 OPTIONAL: Production Hardening (20 minutes)

### Phase 8: Monitoring & Logging

- [ ] **8.1 Setup PM2** (Process Manager)
  ```bash
  npm install -g pm2
  pm2 start ecosystem.config.js
  pm2 logs
  pm2 startup
  pm2 save
  ```

- [ ] **8.2 Setup Backups**
  - [ ] Create backup script
  - [ ] Schedule with cron: `0 2 * * * /path/to/backup.sh`

- [ ] **8.3 Setup Monitoring**
  - [ ] Option A: PM2 Plus (paid)
  - [ ] Option B: Datadog (paid)
  - [ ] Option C: Self-hosted (Prometheus)

### Phase 9: Security

- [ ] **9.1 Security Checklist**
  - [ ] [ ] HTTPS enabled
  - [ ] [ ] Database password is strong
  - [ ] [ ] SESSION_SECRET is random (32+ chars)
  - [ ] [ ] Firewall: Only 80, 443, 22 open
  - [ ] [ ] No hardcoded secrets in code
  - [ ] [ ] Rate limiting enabled
  - [ ] [ ] CORS configured properly
  - [ ] [ ] Database backup verified
  - [ ] [ ] SSH key instead of password
  - [ ] [ ] OS security updates applied

---

## 🚀 GO LIVE CHECKLIST

- [ ] All critical items complete ✅
- [ ] All important items complete ✅
- [ ] API working: `curl http://yourdomain.com/api/health`
- [ ] Frontend loading: Open http://yourdomain.com
- [ ] Can login and use app
- [ ] Database backups working
- [ ] SSL certificate valid: https://yourdomain.com
- [ ] No errors in logs
- [ ] Team notified
- [ ] Monitoring setup
- [ ] Support/escalation plan ready

### GO LIVE! 🎉

```bash
# Announce deployment
echo "SmartClinic is now LIVE at https://yourdomain.com"

# Monitor logs
pm2 logs smartclinic-api
pm2 logs smartclinic-frontend

# Celebrate! 🎉
```

---

## 📊 CHECKLIST SUMMARY

### Before Starting
- [ ] Read all docs (30 min)
- [ ] Choose deployment path
- [ ] Gather requirements

### Critical Tasks
- [ ] PostgreSQL running
- [ ] Node.js v20+ installed  
- [ ] .env configured
- [ ] Project built
- [ ] Database initialized
- [ ] Services started

### Important Tasks
- [ ] Nginx configured
- [ ] SSL certificate added
- [ ] Domain pointing to server

### Optional Enhancements
- [ ] PM2 monitoring
- [ ] Automated backups
- [ ] Centralized logging
- [ ] Performance monitoring

---

## 🔴 TROUBLESHOOTING

If something fails:

| Issue | Solution | Time |
|-------|----------|------|
| "Cannot find database" | Check PostgreSQL running | 2 min |
| "Node version too old" | Upgrade with `nvm install 20` | 5 min |
| "Port already in use" | Change PORT in .env | 2 min |
| "Build fails" | `rm -rf node_modules && pnpm install` | 5 min |
| "API won't start" | Check DATABASE_URL in .env | 2 min |
| "Frontend not loading" | Check if dist/ folder exists | 2 min |
| "SSL cert error" | Run certbot again | 5 min |

---

## ⏱️ TIME TRACKING

Start time: ___________
- [ ] Phase 1 done: _________ (20 min)
- [ ] Phase 2 done: _________ (25 min)
- [ ] Phase 3 done: _________ (5 min)
- [ ] Phase 4 done: _________ (10 min)
- [ ] Phase 5-7 done: _________ (30 min)
- [ ] Phase 8-9 done: _________ (20 min)

Total time: ___________

**Expected: 110-120 minutes**

---

## ✅ FINAL VERIFICATION

Run these commands to verify everything works:

```bash
# 1. Database
psql -U smartclinic_user -d smartclinic -c "SELECT COUNT(*) FROM users;"

# 2. API
curl http://localhost:3000/health

# 3. Frontend
curl http://localhost:3001 | head -20

# 4. Full integration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"deploy@test.com","password":"Deploy123!","role":"patient"}'

# 5. Logs
tail -20 /var/log/nginx/access.log
pm2 logs smartclinic-api
```

All green? 🟢 **YOU'RE DONE!**

---

## 📝 NOTES

Use this space for custom notes:

```
What worked:
_________________________________

What didn't:
_________________________________

Custom configs:
_________________________________

Domain: _______________________
Server IP: _____________________
Database password: [saved securely]
```

---

## 🎉 SUCCESS MESSAGE

When deployment is complete, verify with:

```bash
echo "✅ SmartClinic is LIVE!"
echo "URL: https://yourdomain.com"
echo "Admin panel: https://yourdomain.com/admin"
echo "Monitoring: http://yourdomain.com:3001/api/health"
echo ""
echo "🎉 Deployment complete!"
```

---

**Good luck! You've got this! 🚀**

Print this page and check off items as you complete them!
