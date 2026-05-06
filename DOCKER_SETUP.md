# Docker Compose Configuration for SmartClinic

## Quick Setup (Copy & Paste)

```bash
# 1. Create docker-compose.yml in project root
cd /media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project

# 2. Copy the content below into docker-compose.yml

# 3. Create Dockerfile for API
# 4. Create Dockerfile for Frontend
# 5. Run: docker-compose up
```

---

## Files to Create:

### 1. docker-compose.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: smartclinic-db
    environment:
      POSTGRES_USER: smartclinic_user
      POSTGRES_PASSWORD: securepassword123
      POSTGRES_DB: smartclinic
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U smartclinic_user -d smartclinic"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - smartclinic-network

  # API Server
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: smartclinic-api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://smartclinic_user:securepassword123@postgres:5432/smartclinic
      SESSION_SECRET: your-production-secret-key-change-this
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - smartclinic-network
    restart: unless-stopped

  # Frontend Web Server
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: smartclinic-frontend
    ports:
      - "3001:80"
    networks:
      - smartclinic-network
    restart: unless-stopped

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: smartclinic-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
      - frontend
    networks:
      - smartclinic-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  smartclinic-network:
    driver: bridge
```

---

### 2. Dockerfile.api
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy lock file
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy project files
COPY package.json ./
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY tsconfig.json tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build API
RUN pnpm --filter @workspace/api-server run build

EXPOSE 3000

# Run API server
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
```

---

### 3. Dockerfile.frontend
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy lock file
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy project files
COPY package.json ./
COPY lib ./lib
COPY artifacts/smartclinic ./artifacts/smartclinic
COPY tsconfig.json tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
RUN pnpm --filter @workspace/smartclinic run build

# Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/artifacts/smartclinic/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

### 4. nginx-frontend.conf
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - all requests go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

---

### 5. nginx.conf (Main reverse proxy)
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;

    # Upstream definitions
    upstream api_backend {
        server api:3000;
    }

    upstream frontend_backend {
        server frontend:80;
    }

    # HTTP to HTTPS redirect (when SSL is enabled)
    server {
        listen 80;
        server_name _;

        # Allow Let's Encrypt verification
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL certificates (uncomment when ready)
        # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # API routes
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://api_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend routes
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            proxy_pass http://frontend_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## Quick Start Commands

```bash
# 1. Create all Docker files (they're above)

# 2. Build and start all services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f frontend

# 5. Test services
curl http://localhost:3000/health
curl http://localhost:3001
curl http://localhost/health

# 6. Access database
docker-compose exec postgres psql -U smartclinic_user -d smartclinic -c "SELECT 1;"

# 7. Stop all services
docker-compose down

# 8. Remove volumes (clean database)
docker-compose down -v
```

---

## Environment Configuration

Update in docker-compose.yml:
```yaml
environment:
  DATABASE_URL: postgresql://smartclinic_user:YOUR_PASSWORD@postgres:5432/smartclinic
  SESSION_SECRET: YOUR_UNIQUE_SECRET_KEY
  PORT: 3000
  NODE_ENV: production
```

---

## Production Deployment with Docker

```bash
# 1. Push to Docker Hub (optional)
docker build -f Dockerfile.api -t yourusername/smartclinic-api .
docker push yourusername/smartclinic-api

# 2. Deploy with docker-compose on production server
# Copy docker-compose.yml to server
# Run: docker-compose up -d

# 3. Setup automatic backups
docker-compose exec postgres pg_dump -U smartclinic_user smartclinic > backup.sql

# 4. Monitor health
docker-compose logs -f
```

---

## Troubleshooting

```bash
# API won't start: Check database connection
docker-compose logs api

# Database not initializing: Check password
docker-compose down -v
# Change password in docker-compose.yml
docker-compose up -d

# Port already in use: Change in docker-compose.yml
# ports:
#   - "8000:3000"  (use 8000 instead of 3000)

# Rebuild everything
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Files Needed

Create these files in `/media/abrarbutt/Local\ Disk\ D/smartclinic/SE-Project/`:

1. ✅ `docker-compose.yml` - Main orchestration
2. ✅ `Dockerfile.api` - API server image
3. ✅ `Dockerfile.frontend` - Frontend image
4. ✅ `nginx-frontend.conf` - Frontend Nginx config
5. ✅ `nginx.conf` - Main Nginx config

Then run:
```bash
docker-compose up -d
```

Done! 🎉
