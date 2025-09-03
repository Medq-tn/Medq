# MedQ - Medical Quiz Platform Documentation

## 🏥 Project Overview

**MedQ** is a comprehensive medical education platform designed for medical students to practice and learn through interactive quizzes, lectures, and assessments. The platform supports multiple medical education levels (PCEM1, PCEM2, DCEM1-3) with specialized content organization.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Configure DATABASE_URL and other required variables

# Run database migrations
bunx prisma generate
bunx prisma db push

# Seed the database
bun run db:seed

# Start development server
bun dev
```

## 📋 Table of Contents

1. [Architecture Overview](./architecture/README.md)
2. [Database Schema](./database/README.md)
3. [API Documentation](./api/README.md)
4. [Frontend Components](./frontend/README.md)
5. [Authentication System](./authentication/README.md)
6. [Features & Workflows](./features/README.md)
7. [Development Guide](./development/README.md)
8. [Deployment Guide](./deployment/README.md)
9. [Testing Guide](./testing/README.md)
10. [Troubleshooting Guide](./troubleshooting/README.md)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **Charts**: Recharts
- **PDF Viewer**: react-pdf
- **Authentication**: Custom JWT implementation

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **File Upload**: UploadThing
- **Email**: Resend

### Tools & Infrastructure
- **Package Manager**: Bun
- **Type Safety**: TypeScript + Zod
- **Linting**: ESLint
- **Database Management**: Prisma Studio
- **Internationalization**: react-i18next

## 🎯 Core Features

### For Students
- **Interactive Quizzes**: MCQ, QROC, and case-based questions
- **Progress Tracking**: Detailed analytics and performance metrics
- **Specialty Navigation**: Organized by medical specialties and levels
- **Study Modes**: Practice, revision, and exam simulation
- **Comments & Discussion**: Question-level and lecture-level discussions
- **Pinning System**: Save important questions and specialties
- **Dashboard**: Comprehensive learning analytics

### For Educators & Admins
- **Content Management**: Create and manage specialties, lectures, questions
- **User Management**: Manage student accounts and permissions
- **Analytics & Reports**: Student performance insights
- **Import Tools**: Bulk import questions from CSV/Excel
- **Session Management**: Organize learning sessions with PDFs

### Advanced Features
- **Adaptive Learning**: Performance-based question recommendations
- **Multi-level Authentication**: Student, Maintainer, Admin roles
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: System preference support
- **Real-time Updates**: Live progress tracking
- **Subscription System**: Premium content access control

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medq"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## 📈 Project Status

- ✅ **Core Platform**: Fully functional
- ✅ **Authentication System**: Complete with JWT + OAuth
- ✅ **Question Management**: MCQ, QROC, Cases
- ✅ **Progress Tracking**: Comprehensive analytics
- ✅ **Admin Panel**: Full content management
- ✅ **Responsive Design**: Mobile-optimized
- 🔄 **Advanced Analytics**: In development
- 🔄 **Mobile App**: Planned

## 🤝 Contributing

See [Development Guide](./development/README.md) for contribution guidelines and development setup.

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the [FAQ](./faq.md)
- Review the [Troubleshooting Guide](./troubleshooting.md)

---
*Last updated: December 2024*
