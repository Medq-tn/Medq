import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, auth pages, coming-soon, and home page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/auth' ||
    pathname === '/coming-soon' ||
  pathname.startsWith('/verify-email') ||
  pathname.startsWith('/verify-mail') ||
  pathname.startsWith('/privacy') ||
  pathname.startsWith('/terms') ||
  pathname.startsWith('/guide') ||
  pathname.startsWith('/faq') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated by looking for the auth token cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to home page if not authenticated (instead of auth)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For authenticated users accessing admin routes, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     * - coming-soon (coming soon page)
     * - / (home page)
     */
  '/((?!api|_next/static|_next/image|favicon.ico|auth|coming-soon|verify-email|verify-mail|privacy|terms|guide|faq|$).*)',
  ],
}; 