'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowUnderConstruction?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, allowUnderConstruction = false }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're not loading and we have a definitive answer about auth status
    if (!isLoading) {
      if (!user) {
        // Store the current path to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.replace('/auth');
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        router.replace('/coming-soon');
        return;
      }

      // Redirect non-admin users from protected pages to coming-soon
      // unless they're already on coming-soon or auth pages
      if (!isAdmin && !allowUnderConstruction && 
          pathname !== '/coming-soon' && 
          !pathname.startsWith('/auth') && 
          !pathname.startsWith('/admin')) {
        router.replace('/coming-soon');
        return;
      }
    }
  }, [user, isAdmin, isLoading, requireAdmin, allowUnderConstruction, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Don&apos;t render anything if user is not authenticated or doesn&apos;t have required role
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
} 