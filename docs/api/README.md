# API Documentation

## 🌐 Overview

MedQ provides a comprehensive RESTful API built with Next.js API routes. All endpoints follow consistent patterns for authentication, authorization, error handling, and response formatting.

## 🔐 Authentication

### Authentication Methods
1. **JWT Tokens**: Stateless authentication via HTTP-only cookies
2. **OAuth Integration**: Google and Facebook sign-in support
3. **Session Management**: Automatic token refresh and validation

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Admin**: Admin role required
- **Maintainer+**: Maintainer or Admin role required

## 📋 API Endpoints Overview

### Authentication Endpoints
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
POST   /api/auth/logout         # User logout
GET    /api/auth/me             # Get current user
POST   /api/auth/google/callback # Google OAuth callback
POST   /api/auth/facebook/callback # Facebook OAuth callback
```

### Core Content Endpoints
```
GET    /api/specialties         # List all specialties
POST   /api/specialties         # Create specialty (Admin)
PUT    /api/specialties         # Update specialty (Admin)
DELETE /api/specialties         # Delete specialty (Admin)

GET    /api/lectures            # List lectures
POST   /api/lectures            # Create lecture (Admin)
PUT    /api/lectures            # Update lecture (Admin)
DELETE /api/lectures            # Delete lecture (Admin)

GET    /api/questions           # List questions
POST   /api/questions           # Create question (Admin)
PUT    /api/questions           # Update question (Admin)
DELETE /api/questions           # Delete question (Admin)
```

### User Data Endpoints
```
GET    /api/dashboard/stats     # User dashboard statistics
GET    /api/dashboard/performance # User performance metrics
GET    /api/dashboard/popular-courses # Popular courses data

GET    /api/pinned-specialties  # User's pinned specialties
POST   /api/pinned-specialties  # Pin a specialty
DELETE /api/pinned-specialties  # Unpin a specialty

GET    /api/pinned-questions    # User's pinned questions
POST   /api/pinned-questions    # Pin a question
DELETE /api/pinned-questions    # Unpin a question
```

### Admin Endpoints
```
GET    /api/admin/users         # List all users (Admin)
PUT    /api/admin/users         # Update user data (Admin)

GET    /api/reports             # List content reports
POST   /api/reports             # Submit a report
PUT    /api/reports             # Update report status (Admin)

GET    /api/sessions            # List learning sessions
POST   /api/sessions            # Create session (Maintainer+)
```

## 🔍 Detailed Endpoint Documentation

### Authentication

#### POST `/api/auth/login`
**Purpose**: Authenticate user and establish session

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "profileCompleted": true,
    "niveauId": "uuid",
    "semesterId": "uuid"
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

**Status Codes**:
- `200`: Successful login
- `401`: Invalid credentials or unverified email
- `400`: Missing required fields

#### GET `/api/auth/me`
**Purpose**: Get current authenticated user information

**Headers**: `Authorization: Bearer <token>` or HTTP-only cookie

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "profileCompleted": true,
    "hasActiveSubscription": false,
    "niveau": {
      "id": "uuid",
      "name": "DCEM1",
      "order": 3
    },
    "semester": {
      "id": "uuid",
      "name": "DCEM1 - S1",
      "order": 1
    }
  }
}
```

### Specialties

#### GET `/api/specialties`
**Purpose**: List specialties with progress tracking

**Query Parameters**:
- `semester`: Filter by semester (`all`, `none`, or semester ID)
- `niveau`: Filter by niveau (`all` or niveau ID)

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Cardiology",
    "description": "Heart and cardiovascular system",
    "icon": "heart",
    "isFree": true,
    "niveauId": "uuid",
    "semesterId": "uuid",
    "_count": {
      "lectures": 15,
      "questions": 150
    },
    "progress": {
      "totalLectures": 15,
      "completedLectures": 8,
      "totalQuestions": 150,
      "completedQuestions": 95,
      "averageScore": 78,
      "lectureProgress": 53,
      "questionProgress": 63
    }
  }
]
```

#### POST `/api/specialties` (Admin Only)
**Purpose**: Create a new specialty

**Request Body**:
```json
{
  "name": "Dermatology",
  "description": "Skin, hair, and nail conditions",
  "icon": "skin",
  "niveauId": "uuid",
  "semesterId": "uuid",
  "isFree": false
}
```

**Response**: `201 Created` with specialty object

### Questions

#### GET `/api/questions`
**Purpose**: List questions for a lecture

**Query Parameters**:
- `lectureId`: Required lecture ID
- `type`: Filter by question type (`mcq`, `qroc`, `case`)
- `includeAnswered`: Include previously answered questions (`true`/`false`)

**Response**:
```json
[
  {
    "id": "uuid",
    "type": "mcq",
    "text": "What is the most common cause of chest pain?",
    "options": [
      {"key": "A", "text": "Myocardial infarction"},
      {"key": "B", "text": "Gastroesophageal reflux"},
      {"key": "C", "text": "Pneumonia"},
      {"key": "D", "text": "Pulmonary embolism"}
    ],
    "correctAnswers": ["B"],
    "explanation": "GERD is the most common cause of chest pain...",
    "courseReminder": "Review cardiac vs non-cardiac chest pain",
    "mediaUrl": "https://example.com/ecg-image.jpg",
    "mediaType": "image",
    "userData": {
      "attempts": 2,
      "lastScore": 100,
      "notes": "Remember the GERD connection"
    }
  }
]
```

#### POST `/api/questions` (Admin Only)
**Purpose**: Create a new question

**Request Body**:
```json
{
  "lectureId": "uuid",
  "type": "mcq",
  "text": "Question text here",
  "options": [
    {"key": "A", "text": "Option A"},
    {"key": "B", "text": "Option B"},
    {"key": "C", "text": "Option C"},
    {"key": "D", "text": "Option D"}
  ],
  "correctAnswers": ["A", "C"],
  "explanation": "Detailed explanation...",
  "courseReminder": "Additional learning material"
}
```

### Dashboard

#### GET `/api/dashboard/stats`
**Purpose**: Get user's dashboard statistics

**Response**:
```json
{
  "totalQuestions": 1250,
  "completedQuestions": 847,
  "averageScore": 78.5,
  "learningStreak": 12,
  "questionsToday": 25,
  "timeSpentToday": 45,
  "weakSpecialties": [
    {
      "specialtyId": "uuid",
      "name": "Neurology",
      "averageScore": 65
    }
  ],
  "lastLecture": {
    "id": "uuid",
    "title": "Cardiac Arrhythmias",
    "specialty": "Cardiology",
    "progress": 75
  }
}
```

#### GET `/api/dashboard/performance`
**Purpose**: Get detailed performance analytics

**Query Parameters**:
- `days`: Time window for analysis (default: 30, max: 180)

**Response**:
```json
{
  "summary": {
    "correct": 145,
    "partial": 32,
    "wrong": 23,
    "total": 200,
    "percentCorrect": 72.5,
    "percentPartial": 16,
    "percentWrong": 11.5,
    "windowDays": 30
  },
  "daily": [
    {
      "date": "2024-12-01",
      "correct": 8,
      "partial": 2,
      "wrong": 1,
      "total": 11
    }
  ],
  "bySpecialty": [
    {
      "specialtyId": "uuid",
      "name": "Cardiology",
      "correct": 45,
      "total": 60,
      "percentage": 75
    }
  ]
}
```

### Reports

#### POST `/api/reports`
**Purpose**: Submit a content report

**Request Body**:
```json
{
  "questionId": "uuid",
  "lectureId": "uuid",
  "reportType": "erreur_de_saisie",
  "message": "The correct answer should be option B, not A"
}
```

**Response**: `201 Created`

#### GET `/api/reports` (Admin Only)
**Purpose**: List all reports with filtering

**Query Parameters**:
- `status`: Filter by status (`pending`, `resolved`, `dismissed`)
- `lectureId`: Filter by specific lecture
- `search`: Search in message content

**Response**:
```json
[
  {
    "id": "uuid",
    "message": "Question has wrong answer",
    "status": "pending",
    "reportType": "correction_erronee",
    "createdAt": "2024-12-01T10:00:00Z",
    "question": {
      "id": "uuid",
      "text": "Question text...",
      "type": "mcq"
    },
    "lecture": {
      "id": "uuid",
      "title": "Lecture title",
      "specialty": {
        "name": "Cardiology"
      }
    },
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "name": "John Doe"
    }
  }
]
```

## 🔒 Authentication Middleware

### Middleware Functions

#### `requireAuth(handler)`
**Purpose**: Ensures user is authenticated

**Usage**:
```typescript
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  const userId = request.user?.userId;
  // Handler logic here
});
```

#### `requireAdmin(handler)`
**Purpose**: Ensures user has admin role

#### `requireMaintainerOrAdmin(handler)`
**Purpose**: Ensures user has maintainer or admin role

### Error Responses

#### Authentication Errors
```json
{
  "error": "Unauthorized",
  "message": "Valid authentication token required"
}
```

#### Authorization Errors
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

#### Validation Errors
```json
{
  "error": "Bad Request",
  "message": "Missing required field: lectureId",
  "field": "lectureId"
}
```

## 📝 Request/Response Patterns

### Standard Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>  // Optional, can use HTTP-only cookie
```

### Response Format
**Success Response**:
```json
{
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2024-12-01T10:00:00Z"
}
```

**Error Response**:
```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-01T10:00:00Z"
}
```

### Pagination
**Query Parameters**:
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Response**:
```json
{
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🚦 Rate Limiting

### Rate Limits by Endpoint Type
- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **Admin Operations**: 200 requests per minute
- **File Uploads**: 10 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Development & Testing

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Use token for authenticated requests
curl -X GET http://localhost:3000/api/specialties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Error Handling
All endpoints implement consistent error handling with appropriate HTTP status codes and descriptive error messages.

---
*For integration examples and SDK usage, see the [Development Guide](../development/README.md).*
