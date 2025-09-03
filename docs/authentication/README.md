# Authentication System Documentation

## 🔐 Overview

MedQ implements a robust authentication system supporting multiple authentication methods, role-based access control, and secure session management. The system is built with JWT tokens, HTTP-only cookies, and OAuth integration.

## 🏗️ Authentication Architecture

### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │  Auth Middleware │    │    Database     │
│                 │────│                 │────│                 │
│ • Login Forms   │    │ • JWT Validation│    │ • User Storage  │
│ • OAuth Buttons │    │ • Role Checking │    │ • Session Data  │
│ • Route Guards  │    │ • Token Refresh │    │ • Permissions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow
```
1. User Login Request → 2. Credential Validation → 3. JWT Generation → 
4. HTTP-Only Cookie → 5. Client Authorization → 6. Protected Routes
```

## 🔑 Authentication Methods

### 1. Email/Password Authentication

#### Registration Process
**Endpoint**: `POST /api/auth/register`

**Flow**:
1. User submits registration form
2. Password validation (strength requirements)
3. Email uniqueness check
4. Password hashing (bcrypt)
5. User creation in database
6. Verification email sent
7. Account requires email verification

**Implementation**:
```typescript
// Registration handler
export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();
  
  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return NextResponse.json({ 
      error: passwordValidation.errors.join(', ') 
    }, { status: 400 });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Generate verification token
  const verificationToken = generateToken();
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'student',
      status: 'pending',
      verificationToken,
      profileCompleted: false
    }
  });
  
  // Send verification email
  await sendVerificationEmail(email, verificationToken, name);
  
  return NextResponse.json({ success: true });
}
```

#### Login Process
**Endpoint**: `POST /api/auth/login`

**Flow**:
1. User submits credentials
2. Email verification status check
3. Password verification (bcrypt)
4. JWT token generation
5. HTTP-only cookie setting
6. User session establishment

**Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Check email verification
  if (user.password && user.status !== 'verified') {
    return NextResponse.json({ 
      error: 'Please verify your email address',
      needsVerification: true 
    }, { status: 401 });
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password || '');
  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Set HTTP-only cookie
  const response = NextResponse.json({ user: sanitizeUser(user), token });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
  
  return response;
}
```

### 2. OAuth Authentication

#### Google OAuth Integration
**Endpoint**: `POST /api/auth/google/callback`

**Flow**:
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. Google returns authorization code
4. Exchange code for user profile
5. Create or link user account
6. Generate JWT and establish session

**Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const { code } = await request.json();
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXTAUTH_URL}/auth/callback`
    })
  });
  
  const tokens = await tokenResponse.json();
  
  // Get user profile
  const profileResponse = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
  );
  const profile = await profileResponse.json();
  
  // Find or create user
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { google_id: profile.id },
        { email: profile.email }
      ]
    }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        google_id: profile.id,
        role: 'student',
        profileCompleted: false
      }
    });
  }
  
  // Generate JWT and return
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return NextResponse.json({ user: sanitizeUser(user), token });
}
```

#### Facebook OAuth Integration
**Endpoint**: `POST /api/auth/facebook/callback`

Similar implementation to Google OAuth with Facebook-specific endpoints and profile structure.

## 🛡️ Security Features

### JWT Token Security
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Token structure
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'maintainer' | 'admin';
  iat: number;
  exp: number;
}

// Token generation
const token = jwt.sign(
  { userId, email, role },
  JWT_SECRET,
  { 
    expiresIn: '7d',
    algorithm: 'HS256'
  }
);
```

### Password Security
```typescript
// Password validation rules
export function validatePassword(password: string) {
  const rules = [
    { test: password.length >= 8, message: 'At least 8 characters' },
    { test: /[a-z]/.test(password), message: 'At least one lowercase letter' },
    { test: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
    { test: /\d/.test(password), message: 'At least one number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'At least one special character' }
  ];
  
  const errors = rules.filter(rule => !rule.test).map(rule => rule.message);
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculateStrength(password)
  };
}

// Password hashing
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### HTTP-Only Cookie Configuration
```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,           // Prevent XSS attacks
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',         // CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/'                // Available to entire domain
});
```

## 🔒 Authorization & Middleware

### Authentication Middleware
**File**: `src/lib/auth-middleware.ts`

```typescript
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    hasActiveSubscription?: boolean;
  };
}

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedRequest | null> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) return null;
    
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        hasActiveSubscription: true,
        subscriptionExpiresAt: true
      }
    });
    
    if (!user) return null;
    
    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      hasActiveSubscription: checkSubscriptionStatus(user)
    };
    
    return authenticatedRequest;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
```

### Role-Based Access Control

#### Middleware Functions
```typescript
// Require authentication
export function requireAuth<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    const authenticatedRequest = await authenticateRequest(request);
    if (!authenticatedRequest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(authenticatedRequest, ...args);
  };
}

// Require admin role
export function requireAdmin<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return requireAuth(async (request: AuthenticatedRequest, ...args: T) => {
    if (request.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(request, ...args);
  });
}

// Require maintainer or admin role
export function requireMaintainerOrAdmin<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return requireAuth(async (request: AuthenticatedRequest, ...args: T) => {
    const role = request.user?.role;
    if (role !== 'maintainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(request, ...args);
  });
}
```

#### Usage in API Routes
```typescript
// Protected route example
async function getHandler(request: AuthenticatedRequest) {
  const userId = request.user?.userId;
  // Handler logic with authenticated user
}

async function adminHandler(request: AuthenticatedRequest) {
  // Admin-only logic
}

export const GET = requireAuth(getHandler);
export const POST = requireAdmin(adminHandler);
```

## 🛡️ Route Protection

### Next.js Middleware
**File**: `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/auth' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|pdf.worker|public).*)',
  ],
};
```

### Client-Side Route Guards
**File**: `src/components/auth/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMaintainer?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireMaintainer = false 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth');
        return;
      }

      if (requireAdmin && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      if (requireMaintainer && !['maintainer', 'admin'].includes(user.role)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isLoading, requireAdmin, requireMaintainer, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## 🔄 Session Management

### React Context for Authentication State
**File**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setUser(null);
      router.push('/auth');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📧 Email Verification

### Verification Email System
**File**: `src/lib/email.ts`

```typescript
export async function sendVerificationEmail(
  email: string, 
  token: string, 
  name?: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  await resend.emails.send({
    from: 'MedQ <noreply@medq.app>',
    to: email,
    subject: 'Verify your MedQ account',
    html: `
      <h1>Welcome to MedQ${name ? `, ${name}` : ''}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email Address</a>
      <p>This link will expire in 24 hours.</p>
    `
  });
}
```

### Verification Handler
**Endpoint**: `GET /api/auth/verify`

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect('/auth?error=invalid-token');
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  });

  if (!user) {
    return NextResponse.redirect('/auth?error=invalid-token');
  }

  // Update user status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'verified',
      verificationToken: null,
      emailVerified: new Date()
    }
  });

  return NextResponse.redirect('/auth?verified=true');
}
```

## 🔄 Password Reset

### Reset Request Flow
1. User requests password reset
2. Generate secure reset token
3. Send reset email with token
4. Token expires after 1 hour
5. User completes reset with new password

**Implementation**:
```typescript
// Generate reset token
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (user) {
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt
      }
    });
    
    await sendPasswordResetEmail(email, resetToken);
  }
  
  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true });
}
```

## ⚡ Performance Optimizations

### Token Caching Strategy
- Client-side token caching in memory
- Automatic token refresh before expiration
- Graceful handling of expired tokens

### Database Query Optimization
- Selective user data fetching
- Indexed queries for authentication
- Connection pooling for scalability

---
*For security configuration and best practices, see the [Development Guide](../development/README.md).*
