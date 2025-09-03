'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedAnalyticsDashboard } from '@/components/admin/EnhancedAnalyticsDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EnhancedAnalyticsDashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}