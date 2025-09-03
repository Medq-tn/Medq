# Database Schema Documentation

## 🗄️ Overview

MedQ uses **PostgreSQL** as the primary database with **Prisma ORM** for type-safe database operations. The schema is designed to support a comprehensive medical education platform with complex relationships between users, content, and progress tracking.

## 📊 Core Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Niveau    │    │  Semester   │
│             │────│             │────│             │
│ id (UUID)   │    │ id (UUID)   │    │ id (UUID)   │
│ email       │    │ name        │    │ name        │
│ role        │    │ order       │    │ order       │
│ niveauId    │    └─────────────┘    │ niveauId    │
│ semesterId  │                       └─────────────┘
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ UserProgress│    │  Specialty  │    │   Lecture   │
│             │    │             │────│             │
│ id (UUID)   │    │ id (UUID)   │    │ id (UUID)   │
│ userId      │    │ name        │    │ title       │
│ lectureId   │    │ niveauId    │    │ specialtyId │
│ questionId  │    │ semesterId  │    │ description │
│ score       │    │ description │    │ isFree      │
│ completed   │    │ isFree      │    └─────────────┘
└─────────────┘    └─────────────┘           │
                          │                  │ 1:N
                          │ 1:N              ▼
                          ▼            ┌─────────────┐
                   ┌─────────────┐     │  Question   │
                   │   Session   │     │             │
                   │             │     │ id (UUID)   │
                   │ id (UUID)   │     │ lectureId   │
                   │ name        │     │ type        │
                   │ pdfUrl      │     │ text        │
                   │ specialtyId │     │ options     │
                   └─────────────┘     │ explanation │
                                      └─────────────┘
```

## 🔧 Schema Models

### Core Models

#### User
**Primary entity for all users (students, maintainers, admins)**

```prisma
model User {
  id                    String         @id @default(dbgenerated("gen_random_uuid()"))
  email                 String         @unique
  role                  Role           @default(student)  // student | maintainer | admin
  name                  String?
  password              String?
  niveauId              String?        // Medical education level
  semesterId            String?        // Semester within niveau
  profileCompleted      Boolean        @default(false)
  hasActiveSubscription Boolean        @default(false)
  subscriptionExpiresAt DateTime?
  
  // Relationships
  niveau                Niveau?        @relation(fields: [niveauId], references: [id])
  semester              Semester?      @relation(fields: [semesterId], references: [id])
  progress              UserProgress[]
  reports               Report[]
  pinnedSpecialties     PinnedSpecialty[]
  pinnedQuestions       PinnedQuestion[]
  comments              Comment[]
}
```

#### Specialty
**Medical specialties (Cardiology, Neurology, etc.)**

```prisma
model Specialty {
  id          String    @id @default(dbgenerated("gen_random_uuid()"))
  name        String
  description String?
  icon        String?
  niveauId    String?   // Associated education level
  semesterId  String?   // Associated semester
  isFree      Boolean   @default(false)
  
  lectures    Lecture[]
  niveau      Niveau?   @relation(fields: [niveauId], references: [id])
  semester    Semester? @relation(fields: [semesterId], references: [id])
  sessions    Session[]
}
```

#### Question
**Core learning content with support for different question types**

```prisma
model Question {
  id                      String   @id @default(dbgenerated("gen_random_uuid()"))
  lectureId               String
  type                    String   // "mcq" | "qroc" | "case"
  text                    String
  options                 Json?    // For MCQ questions
  correctAnswers          String[] // Multiple correct answers supported
  explanation             String?
  courseReminder          String?  // Additional course content
  mediaUrl                String?  // Associated media (images, videos)
  mediaType               String?  // "image" | "video" | "audio"
  
  // Case-based question support
  caseNumber              Int?
  caseText                String?
  caseQuestionNumber      Int?
  parentQuestionId        String?  // For linked questions in cases
  
  lecture                 Lecture  @relation(fields: [lectureId], references: [id])
  parent                  Question? @relation("QuestionToQuestion", fields: [parentQuestionId], references: [id])
  children                Question[] @relation("QuestionToQuestion")
  reports                 Report[]
  userData                QuestionUserData[]
}
```

### Progress Tracking Models

#### UserProgress
**Tracks individual user progress through lectures and questions**

```prisma
model UserProgress {
  id           String   @id @default(dbgenerated("gen_random_uuid()"))
  userId       String
  lectureId    String
  questionId   String?
  completed    Boolean  @default(false)
  score        Float?   // Percentage score (0-100)
  lastAccessed DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id])
  lecture      Lecture  @relation(fields: [lectureId], references: [id])
  
  @@unique([userId, lectureId, questionId])
}
```

#### QuestionUserData
**Detailed user interaction data for questions**

```prisma
model QuestionUserData {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  userId      String
  questionId  String
  notes       String?  // User's personal notes
  highlights  Json?    // Highlighted text/options
  attempts    Int      @default(0)
  lastScore   Float?
  
  user        User     @relation(fields: [userId], references: [id])
  question    Question @relation(fields: [questionId], references: [id])
  
  @@unique([userId, questionId])
}
```

### Educational Structure Models

#### Niveau
**Medical education levels (PCEM1, PCEM2, DCEM1-3)**

```prisma
model Niveau {
  id        String      @id @default(dbgenerated("gen_random_uuid()"))
  name      String      @unique  // "PCEM1", "PCEM2", "DCEM1", etc.
  order     Int         @unique  // Display order
  
  users     User[]
  specialties Specialty[]
  semesters Semester[]
}
```

#### Semester
**Semesters within each niveau**

```prisma
model Semester {
  id        String    @id @default(dbgenerated("gen_random_uuid()"))
  name      String    // "DCEM1 - S1", "DCEM1 - S2"
  order     Int       // Semester order within niveau
  niveauId  String
  
  niveau    Niveau    @relation(fields: [niveauId], references: [id])
  specialties Specialty[]
  users     User[]
  
  @@unique([niveauId, order])
}
```

### Content Organization Models

#### CourseGroup
**Admin-created groupings of lectures within specialties**

```prisma
model CourseGroup {
  id           String         @id @default(dbgenerated("gen_random_uuid()"))
  name         String
  specialtyId  String
  createdBy    String
  
  specialty    Specialty      @relation(fields: [specialtyId], references: [id])
  creator      User           @relation(fields: [createdBy], references: [id])
  lectureGroups LectureGroup[]
  
  @@unique([specialtyId, name])
}
```

#### PinnedSpecialty & PinnedQuestion
**User's saved/bookmarked content**

```prisma
model PinnedSpecialty {
  id          String    @id @default(dbgenerated("gen_random_uuid()"))
  userId      String
  specialtyId String
  createdAt   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id])
  specialty   Specialty @relation(fields: [specialtyId], references: [id])
  
  @@unique([userId, specialtyId])
}
```

### Communication Models

#### Comment
**Question and lecture discussions with threading support**

```prisma
model Comment {
  id              String   @id @default(dbgenerated("gen_random_uuid()"))
  lectureId       String
  userId          String
  content         String
  isAnonymous     Boolean  @default(false)
  parentCommentId String?  // For threaded replies
  
  lecture         Lecture  @relation(fields: [lectureId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  parent          Comment? @relation("CommentToComment", fields: [parentCommentId], references: [id])
  replies         Comment[] @relation("CommentToComment")
  likes           CommentLike[]
}
```

#### Report
**User-submitted content reports**

```prisma
model Report {
  id         String     @id @default(dbgenerated("gen_random_uuid()"))
  questionId String
  lectureId  String
  message    String?
  userId     String?
  status     String     @default("pending")  // pending | resolved | dismissed
  reportType ReportType @default(erreur_de_saisie)
  
  question   Question   @relation(fields: [questionId], references: [id])
  lecture    Lecture    @relation(fields: [lectureId], references: [id])
  user       User?      @relation(fields: [userId], references: [id])
}

enum ReportType {
  erreur_de_saisie      // Data entry error
  question_hors_cours   // Off-topic question
  correction_erronee    // Incorrect correction
}
```

## 🔍 Key Database Features

### Indexing Strategy
```sql
-- Performance critical indexes
CREATE INDEX idx_lectures_specialty ON lectures(specialty_id);
CREATE INDEX idx_questions_lecture ON questions(lecture_id);
CREATE INDEX idx_user_progress_user_lecture ON user_progress(user_id, lecture_id);
CREATE INDEX idx_comments_lecture ON comments(lecture_id);
CREATE INDEX idx_reports_status ON reports(status);
```

### Data Constraints
- **UUID Primary Keys**: All entities use UUID for scalability
- **Unique Constraints**: Prevent duplicate relationships (user pinning same specialty twice)
- **Foreign Key Cascades**: Proper cleanup on entity deletion
- **Enum Types**: Structured data validation for roles and report types

### Performance Optimizations
- **Selective Queries**: Prisma select statements to fetch only needed fields
- **Efficient Joins**: Optimized include statements for related data
- **Aggregation Queries**: Database-level calculations for statistics
- **Connection Pooling**: Managed by Prisma for optimal performance

## 📈 Analytics & Reporting Queries

### User Progress Analytics
```typescript
// Get user's overall progress across all specialties
const userProgress = await prisma.userProgress.groupBy({
  by: ['userId'],
  where: { userId },
  _avg: { score: true },
  _count: { completed: true }
});
```

### Specialty Performance Metrics
```typescript
// Get average scores per specialty
const specialtyStats = await prisma.userProgress.groupBy({
  by: ['lecture.specialtyId'],
  _avg: { score: true },
  _count: { completed: true },
  where: { completed: true }
});
```

## 🔄 Migration Strategy

### Schema Evolution
- **Prisma Migrations**: Version-controlled schema changes
- **Backward Compatibility**: Careful handling of breaking changes
- **Data Migration**: Scripts for data transformation during schema updates
- **Rollback Plans**: Safe rollback procedures for failed migrations

### Database Maintenance
- **Regular Backups**: Automated daily backups
- **Performance Monitoring**: Query performance tracking
- **Index Optimization**: Regular index analysis and optimization
- **Data Archival**: Policies for old data management

---
*For database setup and migration instructions, see the [Development Guide](../development/README.md).*
