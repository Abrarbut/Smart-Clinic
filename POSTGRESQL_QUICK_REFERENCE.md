# 🗄️ PostgreSQL Connection Quick Reference

## Your Database Connection Details

```
┌─────────────────────────────────────────────┐
│         POSTGRESQL CONNECTION INFO          │
├─────────────────────────────────────────────┤
│                                             │
│  Host:         localhost                   │
│  Port:         5433                        │
│  Database:     smartclinic                 │
│  Username:     smartclinic_user            │
│  Password:     love6767                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Fastest Ways to Connect

### Method 1: Command Line (Fastest)
```bash
psql -h localhost -U smartclinic_user -d smartclinic -p 5433
# Password: love6767
```

### Method 2: From Docker Container
```bash
docker-compose exec postgres psql -U smartclinic_user -d smartclinic
```

### Method 3: GUI Tools
- **DBeaver** (Recommended) - Free, powerful
- **pgAdmin** - Web interface
- **TablePlus** - Beautiful, user-friendly
- **VS Code Extension** - Built-in

---

## 📊 Quick SQL Commands

```sql
-- View all users
SELECT * FROM users;

-- View all doctors
SELECT * FROM doctors;

-- View all appointments
SELECT * FROM appointments;

-- View database size
SELECT pg_size_pretty(pg_database_size('smartclinic'));

-- List all tables
\dt

-- Exit psql
\q
```

---

## 🔧 Docker Commands

```bash
# Check if postgres is running
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Stop database
docker-compose stop postgres

# Restart database
docker-compose restart postgres

# Backup database
docker-compose exec postgres pg_dump -U smartclinic_user smartclinic > backup.sql

# Restore database
docker-compose exec -T postgres psql -U smartclinic_user smartclinic < backup.sql
```

---

## ⚡ One-Liner Examples

```bash
# Connect and list all users
psql -h localhost -U smartclinic_user -d smartclinic -p 5433 -c "SELECT * FROM users;"

# Connect and see table info
psql -h localhost -U smartclinic_user -d smartclinic -p 5433 -c "\dt"

# From inside container
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "SELECT COUNT(*) FROM users;"
```

---

## 🎯 Connection String for Code

**Node.js/JavaScript:**
```javascript
const connectionString = "postgresql://smartclinic_user:love6767@localhost:5433/smartclinic";
```

**Python:**
```python
conn = psycopg2.connect(
    host="localhost", port=5433,
    database="smartclinic",
    user="smartclinic_user",
    password="love6767"
)
```

**Docker (Inside Container):**
```
postgresql://smartclinic_user:love6767@postgres:5432/smartclinic
```

---

## 📖 Full Guide

See: **POSTGRESQL_CONNECTION.md** for detailed instructions on:
- DBeaver setup
- pgAdmin setup
- TablePlus setup
- Backup/Restore
- Troubleshooting
- Security best practices

---

## ✅ Test Connection

```bash
# Quick test
psql -h localhost -U smartclinic_user -d smartclinic -p 5433 -c "SELECT 1;"

# Should output:
# ?column?
# ----------
#        1
```

All set! Your database is ready to connect! 🎉
