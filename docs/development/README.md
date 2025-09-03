# Development Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.17 or higher
- **Bun**: Latest version (recommended package manager)
- **PostgreSQL**: Version 13 or higher
- **Git**: For version control

### Initial Setup

#### 1. Clone Repository
```bash
git clone https://github.com/wassimTlili/med-q-main.git
cd med-q-main
```

#### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medq_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# File Upload (UploadThing)
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxxxxxx"

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

#### 4. Database Setup
```bash
# Generate Prisma client
bunx prisma generate

# Apply database schema
bunx prisma db push

# Seed initial data
bun run db:seed
```

#### 5. Start Development Server
```bash
bun dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Development Workflow

### Branch Strategy
```
main (production)
├── develop (staging)
├── feature/feature-name
├── bugfix/issue-description
└── hotfix/critical-fix
```

### Commit Convention
```bash
# Format: type(scope): description
git commit -m "feat(auth): add OAuth login functionality"
git commit -m "fix(dashboard): resolve progress calculation bug"
git commit -m "docs(api): update authentication endpoints"
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Test addition/modification
- `chore`: Maintenance tasks

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR to `develop` branch
5. Code review and approval
6. Merge and deploy to staging
7. Final testing and merge to `main`

## 🛠️ Development Tools

### Code Quality
```bash
# Linting
bun run lint
bun run lint:fix

# Type checking
bun run type-check

# Formatting (Prettier)
bun run format
```

### Database Management
```bash
# View database in browser
bunx prisma studio

# Create migration
bunx prisma migrate dev --name migration-name

# Reset database (development only)
bunx prisma migrate reset

# Generate client after schema changes
bunx prisma generate
```

### Testing
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/components/Button.test.tsx

# Coverage report
bun test --coverage
```

## 📁 Project Structure Deep Dive

### Source Code Organization
```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API route handlers
│   │   ├── auth/            # Authentication endpoints
│   │   ├── admin/           # Admin-only endpoints
│   │   ├── specialties/     # Medical specialty management
│   │   ├── lectures/        # Lecture content management
│   │   ├── questions/       # Question management
│   │   ├── dashboard/       # Dashboard data endpoints
│   │   └── reports/         # Content reporting system
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Student dashboard
│   ├── admin/               # Admin panel pages
│   ├── exercices/           # Question practice interface
│   ├── lecture/             # Individual lecture viewer
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   │   ├── button.tsx       # Button variants
│   │   ├── dialog.tsx       # Modal dialogs
│   │   ├── form.tsx         # Form components with validation
│   │   ├── input.tsx        # Input field variants
│   │   ├── card.tsx         # Card containers
│   │   ├── chart.tsx        # Chart visualization components
│   │   └── sidebar/         # Sidebar navigation components
│   ├── auth/                # Authentication-related components
│   │   ├── LoginForm.tsx    # Login form with validation
│   │   ├── RegisterForm.tsx # Registration form
│   │   ├── OAuthButtons.tsx # Social login buttons
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   ├── admin/               # Admin panel components
│   │   ├── AdminSidebar.tsx # Admin navigation
│   │   ├── UserManagement.tsx # User management interface
│   │   ├── ContentManager.tsx # Content CRUD operations
│   │   └── AnalyticsDashboard.tsx # Admin analytics
│   ├── dashboard/           # Student dashboard widgets
│   │   ├── UserStats.tsx    # User statistics display
│   │   ├── PerformancePie.tsx # Performance visualization
│   │   ├── DailyChart.tsx   # Daily activity chart
│   │   └── ContinueLearning.tsx # Continue where left off
│   ├── questions/           # Question-related components
│   │   ├── QuestionCard.tsx # Individual question display
│   │   ├── MCQComponent.tsx # Multiple choice questions
│   │   ├── QROCComponent.tsx # Open-ended questions
│   │   ├── CaseComponent.tsx # Case-based questions
│   │   └── QuestionNav.tsx  # Question navigation
│   ├── lectures/            # Lecture components
│   │   ├── LectureList.tsx  # Lecture browser
│   │   ├── LectureCard.tsx  # Individual lecture card
│   │   └── LectureViewer.tsx # Lecture content viewer
│   ├── specialties/         # Medical specialty components
│   │   ├── SpecialtyGrid.tsx # Specialty overview grid
│   │   ├── SpecialtyCard.tsx # Individual specialty card
│   │   └── SpecialtyFilter.tsx # Filtering interface
│   ├── layout/              # Layout and navigation
│   │   ├── AppSidebar.tsx   # Main application sidebar
│   │   ├── UniversalHeader.tsx # Page header with navigation
│   │   └── Footer.tsx       # Application footer
│   └── theme/               # Theme and styling
│       ├── ThemeProvider.tsx # Theme context provider
│       └── ThemeToggle.tsx  # Dark/light mode toggle
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state management
│   ├── ThemeContext.tsx     # Theme state management
│   └── SubscriptionContext.tsx # Subscription state
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useDashboardData.ts  # Dashboard data fetching
│   ├── useQuestionState.ts  # Question state management
│   ├── useProgress.ts       # Progress tracking
│   └── useLocalStorage.ts   # Local storage utilities
├── lib/                     # Utility libraries and configurations
│   ├── prisma.ts            # Prisma client configuration
│   ├── auth-middleware.ts   # API authentication middleware
│   ├── utils.ts             # Common utility functions
│   ├── validations.ts       # Zod validation schemas
│   ├── email.ts             # Email service configuration
│   ├── tokens.ts            # JWT token utilities
│   └── db-features.ts       # Database feature flags
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Main type exports
│   ├── client-specialty-page.d.ts # Client-side types
│   ├── google.d.ts          # Google OAuth types
│   ├── chartjs.d.ts         # Chart.js type extensions
│   └── pdfjs-worker.d.ts    # PDF.js worker types
└── i18n/                    # Internationalization
    ├── index.ts             # i18n configuration
    ├── I18nProvider.tsx     # i18n context provider
    └── locales/             # Translation files
        ├── en.json          # English translations
        └── fr.json          # French translations
```

### Configuration Files
```
Project Root/
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── seed.ts              # Database seeding script
├── scripts/
│   ├── update-question-numbers.ts # Utility scripts
│   └── update-specialties-niveau.ts
├── components.json          # shadcn/ui configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Package dependencies
└── bun.lockb                # Bun lockfile
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage
```tsx
// Use semantic class names
<div className="bg-background text-foreground border border-border">
  <h1 className="text-2xl font-bold text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 lg:col-span-2">Main content</div>
  <div className="col-span-1">Sidebar</div>
</div>
```

### CSS Custom Properties
```css
/* Define in globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}
```

### Component Styling Best Practices
1. **Use CSS Variables**: For theme-aware styling
2. **Responsive First**: Mobile-first breakpoint approach
3. **Semantic Classes**: Use meaningful class names
4. **Component Variants**: Use class-variance-authority for variants
5. **Accessibility**: Include focus states and ARIA attributes

## 🔧 API Development

### API Route Structure
```typescript
// Standard API route template
import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const RequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
});

// Handler function
async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);
    
    // Business logic here
    const result = await prisma.model.create({
      data: validatedData
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export with middleware
export const POST = requireAuth(handler);
```

### Database Query Patterns
```typescript
// Efficient data fetching
const specialties = await prisma.specialty.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    _count: {
      select: {
        lectures: true,
        questions: true
      }
    }
  },
  where: {
    // Add user-specific filtering
    OR: [
      { niveauId: user.niveauId },
      { niveauId: null }
    ]
  },
  orderBy: [
    { niveau: { order: 'asc' } },
    { name: 'asc' }
  ]
});

// Aggregation queries
const userStats = await prisma.userProgress.aggregate({
  where: { userId },
  _avg: { score: true },
  _count: { completed: true }
});
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing
```typescript
// API route testing
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/specialties/route';

describe('/api/specialties', () => {
  it('returns specialties for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### Integration Testing
```typescript
// Database integration testing
import { prisma } from '@/lib/prisma';

describe('Specialty Management', () => {
  beforeEach(async () => {
    await prisma.specialty.deleteMany();
  });

  it('creates and retrieves specialty', async () => {
    const specialty = await prisma.specialty.create({
      data: {
        name: 'Test Specialty',
        description: 'Test description'
      }
    });

    expect(specialty.name).toBe('Test Specialty');

    const retrieved = await prisma.specialty.findUnique({
      where: { id: specialty.id }
    });

    expect(retrieved).toEqual(specialty);
  });
});
```

## 🚀 Performance Optimization

### Frontend Optimization
```typescript
// Code splitting with dynamic imports
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <AdminPanelSkeleton />
});

// Memoization for expensive calculations
const MemoizedChart = React.memo(function Chart({ data }: ChartProps) {
  const processedData = useMemo(() => {
    return processChartData(data);
  }, [data]);

  return <ChartComponent data={processedData} />;
});

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

function VirtualizedQuestionList({ questions }: { questions: Question[] }) {
  return (
    <List
      height={600}
      itemCount={questions.length}
      itemSize={120}
      itemData={questions}
    >
      {QuestionRow}
    </List>
  );
}
```

### Database Optimization
```typescript
// Query optimization
const optimizedQuery = await prisma.question.findMany({
  select: {
    id: true,
    text: true,
    type: true,
    // Only select needed fields
  },
  where: {
    lectureId,
    // Use indexed fields for filtering
  },
  take: 20,
  skip: page * 20,
  // Implement pagination
});

// Batch operations
const batchUpdate = await prisma.$transaction([
  prisma.userProgress.updateMany({
    where: { userId },
    data: { lastAccessed: new Date() }
  }),
  prisma.userActivity.create({
    data: { userId, type: 'session_end' }
  })
]);
```

## 🔄 Data Migration

### Prisma Migrations
```bash
# Create migration
bunx prisma migrate dev --name add-user-preferences

# Apply migrations in production
bunx prisma migrate deploy

# Reset development database
bunx prisma migrate reset
```

### Data Transformation Scripts
```typescript
// scripts/migrate-user-data.ts
import { prisma } from '../src/lib/prisma';

async function migrateUserData() {
  const users = await prisma.user.findMany({
    where: { profileCompleted: null }
  });

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileCompleted: Boolean(user.niveauId && user.semesterId)
      }
    });
  }
}

migrateUserData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 📦 Deployment

### Build Process
```bash
# Production build
bun run build

# Test production build locally
bun start

# Type checking
bun run type-check

# Linting
bun run lint
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://prod-user:password@prod-host:5432/medq_prod"
JWT_SECRET="production-jwt-secret-key"
NEXTAUTH_URL="https://medq.example.com"
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 🐛 Debugging & Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check connection
bunx prisma db pull

# Reset database schema
bunx prisma migrate reset

# Generate client
bunx prisma generate
```

#### Authentication Issues
```typescript
// Debug JWT tokens
const debugToken = (token: string) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    console.log('Token payload:', decoded);
  } catch (error) {
    console.error('Invalid token:', error);
  }
};
```

#### Performance Issues
```typescript
// Add query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Performance monitoring
console.time('Database Query');
const result = await prisma.question.findMany();
console.timeEnd('Database Query');
```

### Development Tools
- **Prisma Studio**: Database visualization
- **React DevTools**: Component debugging
- **Next.js DevTools**: Performance profiling
- **Chrome DevTools**: Network and performance analysis

---
*For deployment-specific instructions, see the [Deployment Guide](../deployment/README.md).*
