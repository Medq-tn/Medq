# Troubleshooting Guide

Common issues and solutions for the MedQ medical education platform.

## Table of Contents

- [Development Issues](#development-issues)
- [Database Problems](#database-problems)
- [Authentication Issues](#authentication-issues)
- [API Errors](#api-errors)
- [Frontend Issues](#frontend-issues)
- [Deployment Problems](#deployment-problems)
- [Performance Issues](#performance-issues)
- [Debug Tools](#debug-tools)

## Development Issues

### Build Errors

#### TypeScript Errors

**Problem**: Build fails with TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript configuration
bunx tsc --noEmit

# Fix type errors step by step
bunx tsc --noEmit --incremental

# Update TypeScript and dependencies
bun update typescript @types/node @types/react
```

**Common Type Issues**:
- Missing type definitions for third-party libraries
- Incorrect Prisma client types after schema changes
- Component prop type mismatches

#### Prisma Generation Errors

**Problem**: `@prisma/client` types not found or outdated

**Solution**:
```bash
# Regenerate Prisma client
bunx prisma generate

# Reset and regenerate if schema changed significantly
bunx prisma migrate reset
bunx prisma generate
bunx prisma db push
```

#### Next.js Build Issues

**Problem**: Build fails with module resolution errors

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules bun.lockb
bun install

# Check next.config.js for correct settings
```

### Environment Configuration

#### Missing Environment Variables

**Problem**: Application crashes with "Environment variable not found"

**Solution**:
1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Fill in required variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/medq"
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="another-secret-key"
```

3. Restart development server:
```bash
bun dev
```

#### Environment Variable Loading Issues

**Problem**: Environment variables not loading in different environments

**Solution**:
```typescript
// lib/env.ts - Validate environment variables
function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET']
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

validateEnv()
```

## Database Problems

### Connection Issues

#### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL database

**Diagnostic Steps**:
```bash
# Test database connection
bunx prisma db pull

# Check if database is running
pg_isready -h localhost -p 5432

# Verify connection string format
echo $DATABASE_URL
```

**Solutions**:

1. **Database not running**:
```bash
# Start PostgreSQL (Ubuntu/Debian)
sudo systemctl start postgresql

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql
```

2. **Incorrect connection string**:
```env
# Correct format
DATABASE_URL="postgresql://username:password@host:port/database"

# Example for local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/medq_dev"
```

3. **Database doesn't exist**:
```bash
# Create database
createdb medq_dev

# Or using SQL
psql -c "CREATE DATABASE medq_dev;"
```

#### Migration Issues

**Problem**: Migration fails with constraint violations

**Solution**:
```bash
# Check migration status
bunx prisma migrate status

# Reset database (development only!)
bunx prisma migrate reset

# Apply migrations manually
bunx prisma migrate deploy

# Generate client after successful migration
bunx prisma generate
```

**Common Migration Problems**:

1. **Foreign key constraint failures**:
```sql
-- Check existing data that violates constraints
SELECT * FROM child_table 
WHERE parent_id NOT IN (SELECT id FROM parent_table);

-- Clean up orphaned records before migration
DELETE FROM child_table 
WHERE parent_id NOT IN (SELECT id FROM parent_table);
```

2. **Unique constraint violations**:
```sql
-- Find duplicate values
SELECT column_name, COUNT(*) 
FROM table_name 
GROUP BY column_name 
HAVING COUNT(*) > 1;

-- Remove duplicates keeping the first occurrence
DELETE FROM table_name 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM table_name 
  GROUP BY unique_column
);
```

### Schema Drift

**Problem**: Database schema doesn't match Prisma schema

**Solution**:
```bash
# Compare schemas
bunx prisma db pull
bunx prisma format

# Check for differences
git diff prisma/schema.prisma

# Option 1: Update Prisma schema to match database
bunx prisma db pull --force

# Option 2: Update database to match Prisma schema
bunx prisma db push --force-reset
```

## Authentication Issues

### JWT Token Problems

#### Invalid Token Errors

**Problem**: "Invalid token" or "Token expired" errors

**Diagnostic**:
```typescript
// Debug JWT token
import jwt from 'jsonwebtoken'

const token = 'your-token-here'
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!)
  console.log('Token valid:', decoded)
} catch (error) {
  console.log('Token error:', error.message)
}
```

**Solutions**:

1. **Token expired**: Implement token refresh
2. **Wrong secret**: Verify JWT_SECRET environment variable
3. **Malformed token**: Check token format and encoding

#### Session Management Issues

**Problem**: Users get logged out frequently

**Solution**:
```typescript
// Extend session duration
const tokenOptions = {
  expiresIn: '7d', // Instead of '1h'
  issuer: 'medq-app',
  audience: 'medq-users'
}

// Implement refresh token mechanism
export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  // Generate new access token
  // Return new tokens
}
```

### OAuth Integration Issues

#### Google OAuth Errors

**Problem**: "OAuth consent screen error" or "Invalid client"

**Solution**:
1. Check Google Console configuration:
   - Authorized redirect URIs include your domain
   - OAuth consent screen is configured
   - API credentials are correct

2. Verify environment variables:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
```

3. Test OAuth flow:
```bash
# Enable debug mode
DEBUG=1 bun dev
```

## API Errors

### Common HTTP Errors

#### 400 Bad Request

**Problem**: Invalid request data

**Debugging**:
```typescript
// Add request validation logging
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    // Validate with Zod schema
    const validated = schema.parse(body)
    
  } catch (error) {
    console.error('Validation error:', error)
    return new Response('Invalid request data', { status: 400 })
  }
}
```

#### 401 Unauthorized

**Problem**: Authentication required but not provided

**Solution**:
```typescript
// Check middleware execution
export function middleware(request: NextRequest) {
  console.log('Middleware executing for:', request.url)
  
  const token = request.headers.get('authorization')
  console.log('Token present:', !!token)
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
}
```

#### 403 Forbidden

**Problem**: User doesn't have required permissions

**Solution**:
```typescript
// Add role checking debug
function requireAdmin(user: User) {
  console.log('User role:', user.role)
  console.log('Required role: admin')
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
}
```

#### 500 Internal Server Error

**Problem**: Server-side error

**Debugging**:
```typescript
// Add comprehensive error logging
export async function GET(request: Request) {
  try {
    // Your code here
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      url: request.url,
      timestamp: new Date().toISOString()
    })
    
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### Rate Limiting Issues

**Problem**: "Too many requests" errors

**Solution**:
```typescript
// Adjust rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100
  message: 'Too many requests, please try again later'
}

// Add user-specific rate limiting
const getUserKey = (request: Request) => {
  const user = getCurrentUser(request)
  return user?.id || getClientIP(request)
}
```

## Frontend Issues

### Component Rendering Problems

#### Hydration Mismatches

**Problem**: "Hydration failed" errors in Next.js

**Solution**:
```typescript
// Use dynamic imports for client-only components
import dynamic from 'next/dynamic'

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)

// Or use useEffect for client-side only code
export function MyComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return <div>Client-side content</div>
}
```

#### State Management Issues

**Problem**: Component state not updating correctly

**Debugging**:
```typescript
// Add state debugging
export function useQuestionState() {
  const [state, setState] = useState(initialState)
  
  // Debug state changes
  useEffect(() => {
    console.log('State updated:', state)
  }, [state])
  
  const updateState = useCallback((newState) => {
    console.log('Updating state from:', state, 'to:', newState)
    setState(newState)
  }, [state])
  
  return [state, updateState]
}
```

### Styling Issues

#### Tailwind CSS Not Loading

**Problem**: Tailwind styles not applied

**Solution**:
1. Check `tailwind.config.ts` content paths:
```typescript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}
```

2. Verify CSS imports in layout:
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Clear build cache:
```bash
rm -rf .next node_modules/.cache
bun dev
```

#### Component Library Conflicts

**Problem**: shadcn/ui components not styled correctly

**Solution**:
```bash
# Reinstall components
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add input

# Check component imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

## Deployment Problems

### Build Failures in Production

#### Memory Issues

**Problem**: Build runs out of memory

**Solution**:
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}
```

#### Environment Variable Issues

**Problem**: Environment variables not available in production

**Solution**:
1. For client-side variables, prefix with `NEXT_PUBLIC_`:
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

2. For server-side only, don't use prefix:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
```

### Vercel Deployment Issues

#### Function Timeout

**Problem**: API functions timing out

**Solution**:
```json
// vercel.json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  }
}
```

#### Cold Start Performance

**Problem**: Slow API responses on first request

**Solution**:
```typescript
// Optimize database connections
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Performance Issues

### Slow Database Queries

#### Missing Indexes

**Problem**: Queries taking too long

**Diagnostic**:
```sql
-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'your_table';
```

**Solution**:
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_questions_specialty ON questions(specialty_id);
CREATE INDEX idx_progress_user_question ON question_progress(user_id, question_id);
CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at);
```

#### N+1 Query Problems

**Problem**: Too many database queries

**Solution**:
```typescript
// Use Prisma include/select to avoid N+1
const questions = await prisma.question.findMany({
  include: {
    specialty: true,
    choices: true,
    _count: {
      select: { progress: true }
    }
  }
})

// Instead of loading related data separately
```

### Frontend Performance

#### Large Bundle Size

**Problem**: JavaScript bundle too large

**Solution**:
```typescript
// Use dynamic imports
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  loading: () => <Spinner />
})

// Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true bun build
```

#### Memory Leaks

**Problem**: Memory usage increases over time

**Solution**:
```typescript
// Cleanup event listeners and subscriptions
useEffect(() => {
  const subscription = observable.subscribe(handler)
  
  return () => {
    subscription.unsubscribe()
  }
}, [])

// Remove refs when component unmounts
useEffect(() => {
  return () => {
    ref.current = null
  }
}, [])
```

## Debug Tools

### Database Debugging

```bash
# Prisma Studio for visual database inspection
bunx prisma studio

# Database logs
tail -f /var/log/postgresql/postgresql.log

# Query analysis
EXPLAIN ANALYZE SELECT * FROM questions WHERE specialty_id = 'cardiology';
```

### API Debugging

```typescript
// Request/Response logging middleware
export function withLogging(handler: any) {
  return async (req: Request) => {
    const start = Date.now()
    console.log(`${req.method} ${req.url}`)
    
    const response = await handler(req)
    
    console.log(`${req.method} ${req.url} - ${response.status} (${Date.now() - start}ms)`)
    return response
  }
}
```

### Frontend Debugging

```typescript
// React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(id: string, phase: string, actualDuration: number) {
  console.log('Component render:', { id, phase, actualDuration })
}

<Profiler id="QuestionList" onRender={onRenderCallback}>
  <QuestionList />
</Profiler>
```

### Environment Debugging

```bash
# Check all environment variables
printenv | grep -E "(DATABASE|JWT|NEXTAUTH)"

# Test API endpoints
curl -X GET http://localhost:3000/api/health \
  -H "Authorization: Bearer your-token"

# Check Node.js version and dependencies
node --version
bun --version
bunx prisma --version
```

## Emergency Procedures

### Database Recovery

1. **Stop the application**
2. **Restore from backup**:
```bash
pg_restore --clean --no-acl --no-owner -h localhost -U postgres -d medq_prod backup.sql
```
3. **Verify data integrity**
4. **Restart application**

### Application Rollback

1. **Revert to previous deployment**
2. **Check database compatibility**
3. **Update configuration if needed**
4. **Monitor for issues**

### Security Incident Response

1. **Rotate all secrets immediately**
2. **Review access logs**
3. **Update security patches**
4. **Notify users if data compromised**

This troubleshooting guide should help resolve most common issues encountered with the MedQ platform.
