# Deployment Guide - Exam Manager System

## Production Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Prepare for Deployment**

```bash
# Build the application
npm run build

# Test production build locally
npm start
```

2. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure:
# - Project name
# - Environment variables
# - Database (use Vercel Postgres or external)
```

3. **Configure Environment Variables in Vercel Dashboard**

- `DATABASE_URL` - PostgreSQL connection string
- `ENCRYPTION_KEY` - Secure encryption key
- `SMTP_*` - Email configuration
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `SESSION_SECRET` - Secure session secret

4. **Database Setup**

For production, use PostgreSQL:

```bash
# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Run migrations
npx prisma migrate deploy
```

### Option 2: Self-Hosted (Docker)

1. **Create Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/exammanager
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads
      - ./public/models:/app/public/models

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=exammanager
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=exammanager
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Deploy**

```bash
docker-compose up -d
```

### Option 3: Traditional Server (PM2)

1. **Server Requirements**

- Node.js 18+
- PostgreSQL or MySQL
- Nginx (reverse proxy)
- SSL Certificate (Let's Encrypt)

2. **Install PM2**

```bash
npm install -g pm2
```

3. **Build and Start**

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "exam-manager" -- start
pm2 save
pm2 startup
```

4. **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **SSL Setup (Let's Encrypt)**

```bash
sudo certbot --nginx -d your-domain.com
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong encryption key (32+ characters)
- [ ] Enable HTTPS (required for camera/microphone)
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## Performance Optimization

1. **Database Indexing**

```sql
-- Add indexes for common queries
CREATE INDEX idx_student_matric ON Student(matricNumber);
CREATE INDEX idx_exam_session_student ON ExamSession(studentId);
CREATE INDEX idx_essay_submission_status ON EssaySubmission(status);
```

2. **Caching**

- Enable Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

3. **Monitoring**

- Set up application monitoring (Sentry, LogRocket)
- Database query monitoring
- Server resource monitoring

## Backup Strategy

1. **Database Backups**

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

2. **File Backups**

- Backup uploaded student photos
- Backup scanned essay sheets
- Backup question files

3. **Automated Backups**

Set up cron job or scheduled task for daily backups.

## Maintenance

1. **Regular Updates**

```bash
# Update dependencies
npm update

# Update Prisma
npx prisma update

# Run migrations
npx prisma migrate deploy
```

2. **Database Maintenance**

```sql
-- Vacuum database (SQLite)
VACUUM;

-- Analyze tables (PostgreSQL)
ANALYZE;
```

3. **Log Rotation**

Configure log rotation to prevent disk space issues.

## Support

For issues and questions:
- GitHub Issues: https://github.com/AlowoloduTJ/Exam-Manager/issues
- Documentation: See README.md
