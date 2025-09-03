# Testing Guide

Comprehensive testing strategies and configurations for the MedQ medical education platform.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [API Testing](#api-testing)
- [Database Testing](#database-testing)
- [Frontend Testing](#frontend-testing)
- [Test Configuration](#test-configuration)
- [Best Practices](#best-practices)

## Testing Philosophy

The MedQ platform follows a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between different parts of the system
- **End-to-End Tests**: Test complete user workflows
- **API Tests**: Test all API endpoints thoroughly
- **Performance Tests**: Ensure the application performs well under load

## Test Structure

```
tests/
├── __mocks__/              # Mock implementations
├── fixtures/               # Test data and fixtures
├── unit/                   # Unit tests
│   ├── components/         # React component tests
│   ├── hooks/              # Custom hook tests
│   ├── lib/                # Utility function tests
│   └── utils/              # Helper function tests
├── integration/            # Integration tests
│   ├── api/                # API route tests
│   ├── auth/               # Authentication flow tests
│   └── database/           # Database operation tests
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts        # Authentication flows
│   ├── exercises.spec.ts   # Exercise workflows
│   └── admin.spec.ts       # Admin functionality
└── performance/            # Performance tests
```

## Unit Testing

### Component Testing with React Testing Library

```typescript
// tests/unit/components/QuestionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard } from '@/components/questions/QuestionCard'

const mockQuestion = {
  id: '1',
  text: 'What is the capital of France?',
  type: 'mcq' as const,
  choices: [
    { id: '1', text: 'London', isCorrect: false },
    { id: '2', text: 'Paris', isCorrect: true },
    { id: '3', text: 'Berlin', isCorrect: false },
    { id: '4', text: 'Madrid', isCorrect: false }
  ]
}

describe('QuestionCard', () => {
  it('renders question text correctly', () => {
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })

  it('renders all answer choices', () => {
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('Madrid')).toBeInTheDocument()
  })

  it('handles answer selection', () => {
    const onAnswerSelect = jest.fn()
    render(<QuestionCard question={mockQuestion} onAnswerSelect={onAnswerSelect} />)
    
    fireEvent.click(screen.getByText('Paris'))
    expect(onAnswerSelect).toHaveBeenCalledWith('2')
  })
})
```

### Hook Testing

```typescript
// tests/unit/hooks/use-question-state.test.ts
import { renderHook, act } from '@testing-library/react'
import { useQuestionState } from '@/hooks/use-question-state'

describe('useQuestionState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useQuestionState())
    
    expect(result.current.currentQuestionIndex).toBe(0)
    expect(result.current.answers).toEqual({})
    expect(result.current.isCompleted).toBe(false)
  })

  it('updates answer correctly', () => {
    const { result } = renderHook(() => useQuestionState())
    
    act(() => {
      result.current.setAnswer('1', 'answer1')
    })
    
    expect(result.current.answers['1']).toBe('answer1')
  })

  it('navigates to next question', () => {
    const questions = [{ id: '1' }, { id: '2' }, { id: '3' }]
    const { result } = renderHook(() => useQuestionState(questions))
    
    act(() => {
      result.current.nextQuestion()
    })
    
    expect(result.current.currentQuestionIndex).toBe(1)
  })
})
```

### Utility Function Testing

```typescript
// tests/unit/lib/password-validation.test.ts
import { validatePassword, getPasswordStrength } from '@/lib/password-validation'

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })
  })

  describe('getPasswordStrength', () => {
    it('calculates strength correctly', () => {
      expect(getPasswordStrength('weak')).toBe('weak')
      expect(getPasswordStrength('StrongPass123!')).toBe('strong')
    })
  })
})
```

## Integration Testing

### API Route Testing

```typescript
// tests/integration/api/questions.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/questions/route'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/tokens'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    question: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('/api/questions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/questions', () => {
    it('returns questions for authenticated user', async () => {
      const mockQuestions = [
        { id: '1', text: 'Test question', type: 'mcq' }
      ]
      
      ;(prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions)
      
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: `Bearer ${generateToken({ userId: 'user1' })}`
        }
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockQuestions)
    })

    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
    })
  })

  describe('POST /api/questions', () => {
    it('creates question with valid data', async () => {
      const questionData = {
        text: 'New question',
        type: 'mcq',
        specialtyId: 'specialty1'
      }

      const mockCreatedQuestion = { id: '1', ...questionData }
      ;(prisma.question.create as jest.Mock).mockResolvedValue(mockCreatedQuestion)

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${generateToken({ userId: 'admin1', role: 'admin' })}`
        },
        body: questionData
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toEqual(mockCreatedQuestion)
    })
  })
})
```

### Database Integration Testing

```typescript
// tests/integration/database/user-operations.test.ts
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

describe('User Database Operations', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@' } }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates user with hashed password', async () => {
    const userData = {
      email: 'test@example.com',
      password: await hashPassword('password123'),
      firstName: 'Test',
      lastName: 'User',
      role: 'student' as const
    }

    const user = await prisma.user.create({
      data: userData
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.password).not.toBe('password123') // Should be hashed
  })

  it('creates user progress tracking', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'progress-test@example.com',
        password: 'hashed',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      }
    })

    const question = await prisma.question.create({
      data: {
        text: 'Test question',
        type: 'mcq',
        specialtyId: 'specialty1'
      }
    })

    const progress = await prisma.questionProgress.create({
      data: {
        userId: user.id,
        questionId: question.id,
        isCorrect: true,
        attempts: 1
      }
    })

    expect(progress.userId).toBe(user.id)
    expect(progress.questionId).toBe(question.id)
    expect(progress.isCorrect).toBe(true)
  })
})
```

## End-to-End Testing

### Playwright Configuration

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Authentication Flow Testing

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up with email', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="first-name-input"]', 'Test')
    await page.fill('[data-testid="last-name-input"]', 'User')
    
    await page.click('[data-testid="signup-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User')
  })

  test('user can sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('[data-testid="email-input"]', 'existing@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    await page.click('[data-testid="signin-button"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    
    await page.click('[data-testid="signin-button"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})
```

### Exercise Workflow Testing

```typescript
// tests/e2e/exercises.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Exercise Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'student@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="signin-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('student can start an exercise session', async ({ page }) => {
    await page.goto('/exercices')
    
    // Select specialty
    await page.click('[data-testid="specialty-cardiology"]')
    
    // Configure session
    await page.selectOption('[data-testid="question-count"]', '10')
    await page.selectOption('[data-testid="study-mode"]', 'tutor')
    
    await page.click('[data-testid="start-session-button"]')
    
    await expect(page).toHaveURL(/\/session\//)
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible()
    await expect(page.locator('[data-testid="question-counter"]')).toContainText('1 / 10')
  })

  test('student can answer questions and see results', async ({ page }) => {
    await page.goto('/session/test-session-id')
    
    // Answer first question
    await page.click('[data-testid="choice-a"]')
    await page.click('[data-testid="submit-answer"]')
    
    // Check feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible()
    
    // Go to next question
    await page.click('[data-testid="next-question"]')
    
    await expect(page.locator('[data-testid="question-counter"]')).toContainText('2 / 10')
  })

  test('student can complete session and view results', async ({ page }) => {
    await page.goto('/session/test-session-id')
    
    // Answer all questions (mock scenario)
    for (let i = 1; i <= 10; i++) {
      await page.click('[data-testid="choice-a"]')
      await page.click('[data-testid="submit-answer"]')
      
      if (i < 10) {
        await page.click('[data-testid="next-question"]')
      } else {
        await page.click('[data-testid="finish-session"]')
      }
    }
    
    // Check results page
    await expect(page).toHaveURL(/\/session\/.*\/results/)
    await expect(page.locator('[data-testid="session-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="questions-correct"]')).toBeVisible()
    await expect(page.locator('[data-testid="time-spent"]')).toBeVisible()
  })
})
```

## API Testing

### Comprehensive API Test Suite

```typescript
// tests/integration/api/api-suite.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { testApiClient } from '../helpers/api-client'

describe('API Integration Tests', () => {
  let adminToken: string
  let studentToken: string

  beforeAll(async () => {
    // Setup test users and get tokens
    adminToken = await testApiClient.createAdminUser()
    studentToken = await testApiClient.createStudentUser()
  })

  afterAll(async () => {
    // Cleanup test data
    await testApiClient.cleanup()
  })

  describe('Question Management', () => {
    it('admin can create question', async () => {
      const questionData = {
        text: 'Test question',
        type: 'mcq',
        specialtyId: 'cardiology',
        choices: [
          { text: 'Choice A', isCorrect: true },
          { text: 'Choice B', isCorrect: false }
        ]
      }

      const response = await testApiClient.post('/api/questions', questionData, adminToken)
      expect(response.status).toBe(201)
      expect(response.data.id).toBeDefined()
    })

    it('student cannot create question', async () => {
      const questionData = {
        text: 'Test question',
        type: 'mcq',
        specialtyId: 'cardiology'
      }

      const response = await testApiClient.post('/api/questions', questionData, studentToken)
      expect(response.status).toBe(403)
    })
  })

  describe('Session Management', () => {
    it('student can create session', async () => {
      const sessionData = {
        specialtyId: 'cardiology',
        questionCount: 10,
        studyMode: 'tutor'
      }

      const response = await testApiClient.post('/api/sessions', sessionData, studentToken)
      expect(response.status).toBe(201)
      expect(response.data.questions).toHaveLength(10)
    })

    it('student can submit answers', async () => {
      const sessionId = 'test-session-id'
      const answerData = {
        questionId: 'question-1',
        selectedChoices: ['choice-1'],
        timeSpent: 30
      }

      const response = await testApiClient.post(
        `/api/sessions/${sessionId}/answers`,
        answerData,
        studentToken
      )
      expect(response.status).toBe(200)
      expect(response.data.isCorrect).toBeDefined()
    })
  })
})
```

## Database Testing

### Test Database Setup

```typescript
// tests/helpers/database.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

export async function setupTestDatabase() {
  // Reset database
  execSync('bunx prisma migrate reset --force --skip-seed', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  })
  
  // Run migrations
  execSync('bunx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  })
  
  // Seed test data
  await seedTestData()
}

export async function cleanupTestDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Question", "Specialty" CASCADE`
}

async function seedTestData() {
  // Create test specialties
  await prisma.specialty.createMany({
    data: [
      { id: 'cardiology', name: 'Cardiology', slug: 'cardiology' },
      { id: 'neurology', name: 'Neurology', slug: 'neurology' }
    ]
  })
  
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@test.com',
        password: 'hashed-password',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      {
        email: 'student@test.com',
        password: 'hashed-password',
        firstName: 'Student',
        lastName: 'User',
        role: 'student'
      }
    ]
  })
}

export { prisma as testPrisma }
```

## Frontend Testing

### Component Testing Best Practices

```typescript
// tests/helpers/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Implementations

```typescript
// tests/__mocks__/next-auth.ts
export { default } from 'next-auth'

export const getServerSession = jest.fn(() => {
  return Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'student'
    }
  })
})

export const signIn = jest.fn()
export const signOut = jest.fn()
export const useSession = jest.fn(() => ({
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'student'
    }
  },
  status: 'authenticated'
}))
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Setup MSW server
export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
```

## Best Practices

### Test Organization

1. **File Naming**: Use `.test.ts` or `.spec.ts` suffixes
2. **Directory Structure**: Mirror the source code structure
3. **Test Grouping**: Group related tests using `describe` blocks
4. **Test Names**: Use descriptive names that explain what is being tested

### Testing Guidelines

1. **Arrange, Act, Assert**: Structure tests clearly
2. **Test One Thing**: Each test should verify one specific behavior
3. **Use Test Data**: Create reusable test fixtures
4. **Mock External Dependencies**: Isolate the code under test
5. **Clean Up**: Always clean up test data and mocks

### Performance Testing

```typescript
// tests/performance/api-performance.test.ts
import { performance } from 'perf_hooks'

describe('API Performance', () => {
  it('questions endpoint responds within 200ms', async () => {
    const start = performance.now()
    
    const response = await fetch('/api/questions', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    const end = performance.now()
    const responseTime = end - start
    
    expect(response.status).toBe(200)
    expect(responseTime).toBeLessThan(200)
  })
})
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:api": "jest --testPathPattern=integration/api",
    "test:setup": "node scripts/setup-test-db.js"
  }
}
```

This comprehensive testing guide ensures robust quality assurance for the MedQ platform across all levels of the application stack.
