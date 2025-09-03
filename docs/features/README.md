# Features & Workflows Documentation

## 🎯 Overview

MedQ is a comprehensive medical education platform featuring interactive learning, progress tracking, content management, and analytics. This document outlines the key features and their implementation workflows.

## 📚 Core Learning Features

### 1. Question Practice System

#### Question Types
**Multiple Choice Questions (MCQ)**
- Standard medical exam format
- Single or multiple correct answers
- Option randomization support
- Detailed explanations
- Course reminder integration

**QROC (Questions à Réponse Ouverte Courte)**
- Open-ended short answer questions
- Text-based responses
- Manual or automated scoring
- Keyword matching validation

**Case-Based Questions**
- Multi-question clinical scenarios
- Linked question series
- Progressive case revelation
- Clinical reasoning assessment

#### Question Features
```typescript
interface Question {
  id: string;
  type: 'mcq' | 'qroc' | 'case';
  text: string;
  options?: Option[];           // For MCQ
  correctAnswers: string[];     // Multiple correct answers
  explanation: string;
  courseReminder?: string;      // Additional learning content
  mediaUrl?: string;           // Images, videos, audio
  mediaType?: string;
  
  // Case-based features
  caseNumber?: number;
  caseText?: string;
  caseQuestionNumber?: number;
  parentQuestionId?: string;    // Linked questions
}
```

#### Answer Tracking & Scoring
```typescript
interface UserProgress {
  userId: string;
  questionId: string;
  attempts: number;
  lastScore: number;            // 0-100 percentage
  completed: boolean;
  lastAccessed: Date;
}

// Scoring algorithm
function calculateScore(userAnswer: string[], correctAnswers: string[]): number {
  const correct = userAnswer.filter(a => correctAnswers.includes(a)).length;
  const incorrect = userAnswer.filter(a => !correctAnswers.includes(a)).length;
  const total = correctAnswers.length;
  
  // Partial credit with penalty for wrong selections
  const score = Math.max(0, (correct - incorrect) / total * 100);
  return Math.round(score);
}
```

### 2. Progress Tracking System

#### Individual Progress Metrics
- **Question Completion**: Tracks answered vs total questions
- **Lecture Progress**: Percentage completion per lecture
- **Specialty Mastery**: Overall performance by medical specialty
- **Score Tracking**: Historical performance with trends
- **Learning Streaks**: Consecutive days of activity

#### Analytics Dashboard
```typescript
interface DashboardStats {
  totalQuestions: number;
  completedQuestions: number;
  averageScore: number;
  learningStreak: number;
  questionsToday: number;
  timeSpentToday: number;        // Minutes
  weakSpecialties: SpecialtyStats[];
  strongSpecialties: SpecialtyStats[];
  recentActivity: ActivityPoint[];
}
```

#### Performance Visualization
- **Daily Learning Chart**: Question attempts over time
- **Performance Pie Chart**: Correct/Partial/Wrong breakdown
- **Specialty Radar**: Multi-specialty performance comparison
- **Progress Rings**: Visual completion indicators

### 3. Content Organization System

#### Hierarchical Structure
```
Medical Education Levels (Niveaux)
├── PCEM1 (1st year)
├── PCEM2 (2nd year)
├── DCEM1 (3rd year)
├── DCEM2 (4th year)
└── DCEM3 (5th year)
    ├── Semesters (S1, S2)
    └── Specialties
        ├── Cardiology
        ├── Neurology
        ├── Gastroenterology
        └── ...
            └── Lectures
                └── Questions
```

#### Content Filtering & Search
- **Niveau-based filtering**: Content appropriate to education level
- **Semester organization**: Time-based content structure
- **Specialty browsing**: Subject-matter navigation
- **Search functionality**: Full-text search across content
- **Pinning system**: Save important content for quick access

## 🎓 Study Modes & Workflows

### 1. Practice Mode
**Purpose**: Casual learning with immediate feedback

**Workflow**:
1. Select specialty or lecture
2. Choose number of questions
3. Answer questions with immediate feedback
4. Review explanations and course reminders
5. Track progress automatically

**Features**:
- Unlimited attempts
- Immediate answer feedback
- Detailed explanations
- Progress tracking
- Bookmark difficult questions

### 2. Exam Simulation Mode
**Purpose**: Timed practice matching real exam conditions

**Workflow**:
1. Select exam parameters (time, question count)
2. Answer questions without feedback
3. Submit complete exam
4. Review results with detailed analytics
5. Identify areas for improvement

**Features**:
- Configurable time limits
- No intermediate feedback
- Final score calculation
- Performance breakdown
- Question review post-exam

### 3. Revision Mode
**Purpose**: Quick review of previously answered content

**Workflow**:
1. Filter by answered questions
2. Review questions with known answers
3. Focus on weak areas
4. Quick navigation between topics

**Features**:
- Show/hide answers toggle
- Filter by performance level
- Quick topic jumping
- Spaced repetition suggestions

## 💾 Content Management Features

### 1. Admin Content Management

#### Specialty Management
```typescript
interface SpecialtyManager {
  createSpecialty(data: SpecialtyData): Promise<Specialty>;
  updateSpecialty(id: string, data: Partial<SpecialtyData>): Promise<Specialty>;
  deleteSpecialty(id: string): Promise<void>;
  assignToNiveau(specialtyId: string, niveauId: string): Promise<void>;
  setIcon(specialtyId: string, icon: string): Promise<void>;
}
```

#### Question Import System
**CSV/Excel Import Features**:
- Bulk question upload
- Format validation
- Data transformation
- Error reporting
- Progress tracking

**Import Format Example**:
```csv
Type,Question Text,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Specialty,Lecture
mcq,"What is the most common cause of...","Option 1","Option 2","Option 3","Option 4",A,"Detailed explanation here",Cardiology,"Basic Cardiology"
```

#### Media Management
- **Image Upload**: Question illustrations and diagrams
- **Video Integration**: Educational video content
- **Audio Support**: Pronunciation guides and audio cases
- **File Management**: Secure file storage and retrieval

### 2. User Management System

#### Role-Based Access Control
```typescript
enum UserRole {
  STUDENT = 'student',      // Basic access to learning content
  MAINTAINER = 'maintainer', // Content management for assigned niveau
  ADMIN = 'admin'           // Full system access
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  conditions?: {
    niveau?: string;
    specialty?: string;
  };
}
```

#### User Analytics
- Registration and engagement metrics
- Learning progress across user base
- Performance analytics by specialty
- Usage patterns and trends

## 🗣️ Communication Features

### 1. Comment System

#### Lecture-Level Comments
**Purpose**: General discussion about lecture content

**Features**:
- Threaded conversations
- Anonymous posting option
- Like/heart system
- Admin moderation
- Real-time updates

#### Question-Level Comments
**Purpose**: Specific discussion about individual questions

**Features**:
- Question-specific threads
- Answer clarification requests
- Study group collaboration
- Expert responses

#### Comment Management
```typescript
interface Comment {
  id: string;
  content: string;
  userId: string;
  lectureId?: string;
  questionId?: string;
  parentCommentId?: string;    // For threading
  isAnonymous: boolean;
  likes: number;
  createdAt: Date;
  replies: Comment[];
}
```

### 2. Reporting System

#### Content Issue Reporting
**Report Types**:
- `erreur_de_saisie`: Data entry errors
- `question_hors_cours`: Off-topic questions
- `correction_erronee`: Incorrect answers

**Workflow**:
1. User identifies content issue
2. Submits report with description
3. Admin reviews and categorizes
4. Issue resolution and content update
5. Reporter notification

#### Report Management Dashboard
- **Pending Reports**: New issues requiring attention
- **Report Analytics**: Common issue patterns
- **Resolution Tracking**: Issue lifecycle management
- **User Feedback**: Reporter satisfaction metrics

## 📊 Analytics & Intelligence Features

### 1. Learning Analytics

#### Individual Performance Analytics
```typescript
interface LearningAnalytics {
  performanceTrends: {
    timeframe: string;
    correctRate: number;
    questionCount: number;
  }[];
  
  specialtyBreakdown: {
    specialtyId: string;
    specialtyName: string;
    performance: number;
    questionsAnswered: number;
    averageTime: number;
  }[];
  
  learningPatterns: {
    preferredStudyTime: string;
    sessionDuration: number;
    questionsPerSession: number;
    difficultyPreference: string;
  };
}
```

#### Adaptive Learning Recommendations
- **Weak Area Identification**: Automatically detect struggling topics
- **Question Recommendations**: Suggest relevant practice questions
- **Review Scheduling**: Spaced repetition optimization
- **Study Plan Generation**: Personalized learning paths

### 2. Content Analytics

#### Question Performance Metrics
```typescript
interface QuestionAnalytics {
  questionId: string;
  totalAttempts: number;
  correctRate: number;
  averageScore: number;
  timeToComplete: number;
  difficultyIndex: number;
  discriminationIndex: number;    // How well it separates high/low performers
}
```

#### Usage Analytics
- Most accessed specialties
- Popular study times
- Common error patterns
- Content engagement metrics

## 🔄 Workflow Examples

### Student Learning Workflow
```
1. Login → 2. Dashboard Review → 3. Specialty Selection → 
4. Question Practice → 5. Performance Review → 6. Next Session Planning
```

### Admin Content Management Workflow
```
1. Content Review → 2. Issue Reports → 3. Content Updates → 
4. Quality Assurance → 5. Publication → 6. Performance Monitoring
```

### Collaborative Learning Workflow
```
1. Question Practice → 2. Difficulty Encountered → 3. Comment/Discussion → 
4. Peer Help → 5. Clarification → 6. Continued Learning
```

## 🎨 User Experience Features

### 1. Responsive Design
- **Mobile-First**: Optimized for smartphone learning
- **Tablet Support**: Enhanced experience for larger screens
- **Desktop Full-Feature**: Complete functionality on desktop
- **Progressive Web App**: Offline capability and app-like experience

### 2. Accessibility Features
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast Mode**: Enhanced visibility options
- **Font Size Adjustment**: User-customizable text size
- **Color-Blind Friendly**: Alternative color schemes

### 3. Personalization
- **Theme Selection**: Dark/light mode preference
- **Language Options**: Multi-language interface support
- **Dashboard Customization**: Configurable widget layout
- **Notification Preferences**: Customizable alert settings

## 🔧 Integration Features

### 1. Import/Export Capabilities
- **Question Bank Import**: Bulk content import from various formats
- **Progress Export**: Student data export for institutional use
- **Analytics Reports**: Detailed performance reporting
- **Content Backup**: Regular automated backups

### 2. API Integration
- **RESTful API**: Complete programmatic access
- **Webhook Support**: Real-time event notifications
- **SSO Integration**: Single sign-on capability
- **LMS Integration**: Learning Management System connectivity

---
*For detailed implementation guides for each feature, see the respective technical documentation sections.*
