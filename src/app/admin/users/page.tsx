'use client';

import { ClerkUsersPage } from '@/components/admin/ClerkUsersPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <ClerkUsersPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
