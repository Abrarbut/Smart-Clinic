# PostgreSQL Connection Guide for SmartClinic

## 📊 Connection Details

Your PostgreSQL is running inside Docker with these credentials:

```
Host:     localhost (or postgres if connecting from inside container)
Port:     5433 (mapped from container port 5432)
Username: smartclinic_user
Password: love6767
Database: smartclinic
```

---

## 🔗 Method 1: Connect Using psql (Command Line)

### Option A: From Your Host Machine
```bash
# Install PostgreSQL client (if not already installed)
sudo apt-get install postgresql-client

# Connect to the database
psql -h localhost -U smartclinic_user -d smartclinic -p 5433
```

When prompted, enter password: `love6767`

### Option B: Inside Docker Container
```bash
# Connect directly inside the postgres container
docker-compose exec postgres psql -U smartclinic_user -d smartclinic

# Or with password
docker-compose exec postgres psql -h localhost -U smartclinic_user -d smartclinic
```

### Option C: Execute SQL from Command Line
```bash
# List all tables
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "\dt"

# Get user info
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "SELECT * FROM users;"

# Get doctors list
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "SELECT * FROM doctors;"
```

---

## 🎯 Method 2: Connect Using DBeaver (GUI)

1. **Download DBeaver** (https://dbeaver.io)
2. **Create New Connection:**
   - File → New Database Connection
   - Select PostgreSQL
   - Click Next

3. **Fill in Connection Details:**
   - Server Host: `localhost`
   - Port: `5433`
   - Database: `smartclinic`
   - Username: `smartclinic_user`
   - Password: `love6767`

4. **Test Connection** → Click "Test Connection"
5. **Finish** and browse your database!

---

## 🐳 Method 3: Connect from Node.js API (Already Configured)

Your API server automatically connects using the DATABASE_URL in docker-compose.yml:

```
DATABASE_URL: postgresql://smartclinic_user:love6767@postgres:5432/smartclinic
```

Note: Inside Docker, use `postgres` as hostname (service name)
From outside Docker, use `localhost:5433`

---

## 📋 Method 4: Connect Using pgAdmin (Web Interface)

Add to your `docker-compose.yml`:

```yaml
pgadmin:
  image: dpage/pgadmin4
  container_name: smartclinic-pgadmin
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
  depends_on:
    - postgres
  networks:
    - smartclinic-network
```

Then:
1. Run: `docker-compose up -d`
2. Open: http://localhost:5050
3. Login with `admin@example.com` / `admin`
4. Add Server:
   - Hostname: `postgres` (service name)
   - Username: `smartclinic_user`
   - Password: `love6767`
   - Port: `5432`

---

## ✅ Common Commands

### Check if PostgreSQL is running:
```bash
docker-compose ps | grep postgres
```

### View PostgreSQL logs:
```bash
docker-compose logs postgres
```

### Check database size:
```bash
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;"
```

### List all databases:
```bash
docker-compose exec postgres psql -U smartclinic_user -c "\l"
```

### Backup database:
```bash
docker-compose exec postgres pg_dump -U smartclinic_user smartclinic > backup.sql
```

### Restore database:
```bash
docker-compose exec -T postgres psql -U smartclinic_user smartclinic < backup.sql
```

---

## 🔧 Method 5: Using TablePlus (macOS/Windows/Linux)

1. Download: https://tableplus.com
2. Create connection:
   - Host: `localhost`
   - Port: `5433`
   - User: `smartclinic_user`
   - Password: `love6767`
   - Database: `smartclinic`
3. Connect!

---

## 📍 Connection String Examples

### For Node.js/Express:
```javascript
const connectionString = "postgresql://smartclinic_user:love6767@localhost:5433/smartclinic";
```

### For Python (psycopg2):
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="smartclinic",
    user="smartclinic_user",
    password="love6767",
    port=5433
)
```

### For Go:
```go
connectionString := "user=smartclinic_user password=love6767 dbname=smartclinic host=localhost port=5433 sslmode=disable"
```

### For Python SQLAlchemy:
```python
from sqlalchemy import create_engine

engine = create_engine("postgresql://smartclinic_user:love6767@localhost:5433/smartclinic")
```

---

## 🚨 Troubleshooting

### "Connection refused"
```bash
# Check if postgres container is running
docker-compose ps

# Restart postgres
docker-compose restart postgres
```

### "Authentication failed"
```bash
# Check your credentials in docker-compose.yml
# Default:
# Username: smartclinic_user
# Password: love6767
# Port: 5433
```

### "Database does not exist"
```bash
# Check available databases
docker-compose exec postgres psql -U smartclinic_user -c "\l"

# Create database if missing (shouldn't happen)
docker-compose exec postgres psql -U smartclinic_user -c "CREATE DATABASE smartclinic;"
```

### Port already in use
```bash
# Change port in docker-compose.yml from 5433 to another port
# Then restart:
docker-compose down
docker-compose up -d
```

---

## 🔐 Security Note

⚠️ **DO NOT** use these credentials in production!
- Change password in docker-compose.yml
- Use environment variables
- Enable SSL/TLS
- Use strong passwords (32+ characters)

For production, use:
```yaml
environment:
  POSTGRES_PASSWORD: ${DB_PASSWORD}  # From .env file
```

---

## 📝 Quick Start (TL;DR)

```bash
# 1. Connect from command line
psql -h localhost -U smartclinic_user -d smartclinic -p 5433

# 2. When prompted, enter password: love6767

# 3. List tables
\dt

# 4. View users
SELECT * FROM users;

# 5. Exit
\q
```

---

## 🎯 Database Tables

Your SmartClinic has these tables:

```sql
-- Users (patients, doctors, admins, receptionists)
SELECT * FROM users;

-- Doctors
SELECT * FROM doctors;

-- Appointments
SELECT * FROM appointments;

-- Medical History
SELECT * FROM medical_history;
```

---

Done! You can now connect to PostgreSQL using any of these methods. 🎉
