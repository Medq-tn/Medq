# Architecture Overview

## 🏗️ System Architecture

MedQ follows a modern **full-stack architecture** with clear separation of concerns and scalable design patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React + TypeScript)                     │
│  • Pages & Components                                      │
│  • Client-side Routing                                     │
│  • State Management (Context + Hooks)                      │
│  • UI Components (Radix + shadcn/ui)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls (HTTP/JSON)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  • RESTful API Routes                                      │
│  • Authentication Middleware                               │
│  • Request/Response Validation                             │
│  • Role-based Access Control                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  • User Management                                          │
│  • Content Storage (Questions, Lectures, Specialties)      │
│  • Progress Tracking                                        │
│  • Analytics Data                                           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── admin/           # Admin-only endpoints
│   │   ├── specialties/     # Specialty management
│   │   ├── lectures/        # Lecture management
│   │   ├── questions/       # Question management
│   │   └── dashboard/       # Dashboard data
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Student dashboard
│   ├── admin/               # Admin panel
│   ├── exercices/           # Question practice
│   └── lecture/             # Lecture viewer
├── components/              # React Components
│   ├── ui/                  # Base UI components
│   ├── auth/                # Authentication components
│   ├── admin/               # Admin panel components
│   ├── dashboard/           # Dashboard components
│   ├── questions/           # Question components
│   └── layout/              # Layout components
├── contexts/                # React Contexts
├── hooks/                   # Custom React Hooks
├── lib/                     # Utility libraries
└── types/                   # TypeScript definitions
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User Login → JWT Token → HTTP-only Cookie → API Middleware → Database Verification
```

### 2. Question Practice Flow
```
Select Specialty → Load Questions → Answer Questions → Submit → Track Progress → Update Analytics
```

### 3. Admin Content Management Flow
```
Admin Login → Verify Permissions → CRUD Operations → Database Updates → Cache Invalidation
```

## 🧩 Component Architecture

### Frontend Components Hierarchy

```
App Layout
├── UniversalHeader
├── AppSidebar
│   ├── NavigationItems
│   └── UserProfile
└── Main Content
    ├── PageSpecific Components
    ├── Modals & Dialogs
    └── Toast Notifications
```

### State Management Strategy

1. **Server State**: React Query for API data caching
2. **Global State**: React Context for user authentication
3. **Local State**: useState for component-specific state
4. **Form State**: react-hook-form for complex forms

## 🔐 Security Architecture

### Authentication Layers
1. **JWT Tokens**: Stateless authentication
2. **HTTP-only Cookies**: Secure token storage
3. **Middleware Protection**: Route-level security
4. **Role-based Access**: Granular permissions

### Data Security
- **Input Validation**: Zod schemas + Prisma types
- **SQL Injection Protection**: Prisma ORM
- **XSS Prevention**: React built-in protections
- **CSRF Protection**: SameSite cookies

## 📊 Database Architecture

### Entity Relationships
```
Users ←→ Progress ←→ Questions
  ↓         ↓         ↓
Roles   Lectures   Specialties
  ↓         ↓         ↓
Permissions ←→ Content ←→ Niveaux
```

### Performance Optimizations
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Prisma select statements
- **Connection Pooling**: Prisma connection management
- **Caching Strategy**: API response caching

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Stateless API**: JWT-based authentication enables load balancing
- **Database Separation**: Read replicas for analytics queries
- **CDN Integration**: Static asset distribution

### Performance Optimization
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Tree shaking and compression
- **Database Queries**: Optimized Prisma queries

## 🔧 Development Architecture

### Build Process
```
TypeScript → ESLint → Build → Test → Deploy
```

### Development Workflow
1. **Feature Development**: Branch-based development
2. **Code Review**: PR-based review process
3. **Testing Strategy**: Unit + Integration tests
4. **Deployment**: Automated CI/CD pipeline

## 📱 Mobile-First Design

### Responsive Strategy
- **Breakpoint System**: Tailwind CSS responsive utilities
- **Touch Optimization**: Mobile-friendly interactions
- **Performance**: Optimized for mobile networks
- **PWA Ready**: Service worker and manifest support

## 🔄 API Design Patterns

### RESTful Conventions
- **Resource-based URLs**: `/api/specialties`, `/api/questions`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: Semantic HTTP status codes
- **Response Format**: Consistent JSON structure

### Middleware Pattern
```typescript
Route Handler → Auth Middleware → Permission Check → Business Logic → Response
```

---
*For detailed implementation examples, see the respective documentation sections.*
