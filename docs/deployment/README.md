# Deployment Guide

This guide covers deployment strategies and configurations for the MedQ medical education platform.

## Table of Contents

- [Production Environment Setup](#production-environment-setup)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)

## Production Environment Setup

### Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL database
- Redis (optional, for caching)
- Cloud storage (for file uploads)

### Build Process

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate deploy

# Build the application
bun run build

# Start production server
bun start
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medq_prod"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-at-least-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Email Service
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

### Optional Variables

```env
# Node Environment
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="/uploads"

# Logging
LOG_LEVEL="info"
LOG_FILE_PATH="/var/log/medq.log"

# Performance
NEXT_TELEMETRY_DISABLED=1
```

## Database Migration

### Pre-deployment Checks

1. **Backup Current Database**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Check Migration Status**
```bash
bunx prisma migrate status
```

3. **Deploy Migrations**
```bash
bunx prisma migrate deploy
```

### Migration Best Practices

- Always test migrations in staging environment first
- Use transaction-safe migrations when possible
- Monitor database performance during migrations
- Have rollback plan ready

## Vercel Deployment

### Project Setup

1. **Connect Repository**
   - Import project from GitHub/GitLab
   - Configure build settings

2. **Environment Variables**
   - Add all required environment variables
   - Use Vercel's environment variable management
   - Separate staging and production configs

3. **Build Configuration**

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "installCommand": "bun install",
  "devCommand": "bun dev"
}
```

### Vercel Configuration File

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install Bun
RUN npm install -g bun

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build application
RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/medq
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=medq
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Generate Prisma client
        run: bunx prisma generate
        
      - name: Run migrations
        run: bunx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run tests
        run: bun test
        
      - name: Build application
        run: bun run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Logging

### Application Monitoring

1. **Error Tracking**
   - Use Sentry for error tracking
   - Set up error boundaries in React components
   - Log critical errors to external service

2. **Performance Monitoring**
   - Monitor API response times
   - Track database query performance
   - Set up alerts for high response times

3. **Health Checks**

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    )
  }
}
```

### Logging Configuration

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH || 'app.log'
    })
  ]
})

export default logger
```

## Security Checklist

### Pre-deployment Security

- [ ] All environment variables are properly configured
- [ ] Database credentials are secure and rotated
- [ ] JWT secrets are strong and unique
- [ ] OAuth applications are configured with correct redirect URIs
- [ ] HTTPS is enforced in production
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place
- [ ] XSS protection is enabled

### Security Headers

```typescript
// middleware.ts - Add security headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  
  return response
}
```

### Database Security

- Use connection pooling
- Enable SSL for database connections
- Implement row-level security if needed
- Regular security audits and updates
- Monitor for suspicious queries

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false
}

module.exports = nextConfig
```

### Caching Strategy

- Implement Redis for session storage
- Use CDN for static assets
- Enable browser caching
- Implement API response caching
- Database query optimization

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Ensure Prisma schema is valid

2. **Database Connection Issues**
   - Verify connection string format
   - Check network connectivity
   - Ensure database is accessible

3. **Authentication Problems**
   - Verify OAuth configuration
   - Check JWT secret configuration
   - Validate redirect URIs

### Debug Commands

```bash
# Check build output
bun run build --debug

# Test database connection
bunx prisma db pull --preview-feature

# Validate environment
node -e "console.log(process.env)"
```

## Rollback Strategy

1. **Immediate Rollback**
   - Revert to previous deployment
   - Use platform-specific rollback features

2. **Database Rollback**
   - Restore from backup
   - Run rollback migrations if available

3. **Gradual Rollback**
   - Use feature flags to disable new features
   - Gradually route traffic to previous version
