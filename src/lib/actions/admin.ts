'use server';

import { prisma } from '@/lib/prisma';
import { requireAdminAccess } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

// Admin Stats Server Action
export async function getAdminStats() {
  try {
    // Verify admin access
    await requireAdminAccess();

    // Get current date for time-based queries
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch only user-related stats since we're focusing on admin dashboard + user management
    const [usersCount, recentUsers] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      
      // Recent users (last 7 days)
      prisma.user.findMany({
        where: {
          createdAt: { gte: thisWeek }
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          role: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return {
      users: usersCount,
      recentUsers
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw new Error('Failed to fetch admin stats');
  }
}

// Get Users List Server Action
export async function getUsers(
  page = 1, 
  limit = 20, 
  search = '', 
  filters?: {
    roles?: string[];
    niveaux?: string[];
    hasActiveSubscription?: boolean | null;
    profileCompleted?: boolean | null;
  }
) {
  try {
    await requireAdminAccess();

    const skip = (page - 1) * limit;
    
    // Build the where clause
    const where: any = {};
    
    // Add search conditions
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    // Add filter conditions
    if (filters) {
      // Role filter
      if (filters.roles && filters.roles.length > 0) {
        where.role = { in: filters.roles };
      }
      
      // Niveau filter
      if (filters.niveaux && filters.niveaux.length > 0) {
        where.niveauId = { in: filters.niveaux };
      }
      
      // Subscription filter
      if (filters.hasActiveSubscription !== null) {
        where.hasActiveSubscription = filters.hasActiveSubscription;
      }
      
      // Profile completion filter
      if (filters.profileCompleted !== null) {
        where.profileCompleted = filters.profileCompleted;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          profileCompleted: true,
          hasActiveSubscription: true,
          subscriptionExpiresAt: true,
          niveau: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Admin Analytics Server Action (date range + interval)
export async function getAdminAnalytics(params: {
  startDate: string; // ISO string
  endDate: string;   // ISO string
  interval: 'Daily' | 'Weekly' | 'Monthly';
}) {
  try {
    await requireAdminAccess();

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    // Normalize to inclusive range
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const interval = params.interval;

    // Fetch data to aggregate (signups and activity)
    const [usersInRange, activityInRange, totalUsersAllTime] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, name: true, email: true, createdAt: true, hasActiveSubscription: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userActivity.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { userId: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.user.count(),
    ]);

    // Helpers to bucket dates
    const toDayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    const startOfWeek = (d: Date) => {
      const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const day = dt.getUTCDay(); // 0=Sun
      const diff = (day + 6) % 7; // make Monday=0
      dt.setUTCDate(dt.getUTCDate() - diff);
      return dt;
    };
    const startOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    const fmtLabel = (d: Date) => {
      return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    };

    const advance = (d: Date) => {
      const nd = new Date(d);
      if (interval === 'Daily') nd.setUTCDate(nd.getUTCDate() + 1);
      else if (interval === 'Weekly') nd.setUTCDate(nd.getUTCDate() + 7);
      else nd.setUTCMonth(nd.getUTCMonth() + 1);
      return nd;
    };

    const bucketKey = (d: Date) => {
      if (interval === 'Daily') return toDayKey(d);
      if (interval === 'Weekly') return toDayKey(startOfWeek(d));
      const m = startOfMonth(d);
      return `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, '0')}-01`;
    };

    // Build all buckets from start..end
    const buckets: { key: string; label: string; date: Date }[] = [];
    let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    // Align cursor to bucket start
    if (interval === 'Weekly') cursor = startOfWeek(cursor);
    if (interval === 'Monthly') cursor = startOfMonth(cursor);
    const endUTC = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    while (cursor <= endUTC) {
      buckets.push({ key: bucketKey(cursor), label: fmtLabel(cursor), date: new Date(cursor) });
      cursor = advance(cursor);
    }

    // Initialize aggregates
    const byBucket = new Map<string, { newUsers: number; retained: number; reactivated: number; churned: number; activeUserIds: Set<string> }>();
    buckets.forEach(b => byBucket.set(b.key, { newUsers: 0, retained: 0, reactivated: 0, churned: 0, activeUserIds: new Set() }));

    // Aggregate signups
    for (const u of usersInRange) {
      const key = bucketKey(u.createdAt);
      const agg = byBucket.get(key);
      if (agg) agg.newUsers += 1;
    }

    // Aggregate activity (unique active users per bucket)
    for (const a of activityInRange) {
      const key = bucketKey(a.createdAt);
      const agg = byBucket.get(key);
      if (agg) agg.activeUserIds.add(a.userId);
    }

    // Compute retained as active unique users for that period (rough proxy)
    byBucket.forEach(v => { v.retained = v.activeUserIds.size; });

    // Build chart data
    const chartData = buckets.map(b => {
      const v = byBucket.get(b.key)!;
      return {
        date: b.label,
        newUsers: v.newUsers,
        retained: v.retained,
        reactivated: v.reactivated, // not computed currently
        churned: v.churned // not computed currently
      };
    });

    // Overview
    const totalNewUsers = usersInRange.length;
    const totalActiveUnique = new Set(activityInRange.map(a => a.userId)).size;
    const overview = {
      active: totalActiveUnique,
      newUsers: totalNewUsers,
      retained: Math.max(0, totalActiveUnique - totalNewUsers),
      reactivated: 0,
  period: `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
    };

    // Reports
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const weeks = Math.max(1, Math.round(diffDays / 7));
    const reports = {
      signUpsPerWeek: Math.round(totalNewUsers / weeks),
      signInsPerWeek: Math.round(activityInRange.length / weeks),
      totalSignUps: totalUsersAllTime,
    };

    // Recent users (latest signups in range; if none, latest overall)
    const recentUsers = usersInRange.slice(0, 5);
    if (recentUsers.length === 0) {
      const fallback = await prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true, hasActiveSubscription: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      recentUsers.push(...fallback);
    }

    return {
      overview,
      chartData,
      recentUsers,
      reports,
    };
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw new Error('Failed to fetch admin analytics');
  }
}

// Update User Role Server Action
export async function updateUserRole(userId: string, newRole: 'student' | 'maintainer' | 'admin') {
  try {
    await requireAdminAccess();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    revalidatePath('/admin/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

// Update User Niveau Server Action
export async function updateUserNiveau(userId: string, niveauId: string | null) {
  try {
    await requireAdminAccess();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { niveauId },
      select: {
        id: true,
        email: true,
        name: true,
        niveau: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath('/admin/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user niveau:', error);
    throw new Error('Failed to update user niveau');
  }
}

// Get All Niveaux Server Action
export async function getAllNiveaux() {
  try {
    await requireAdminAccess();

    const niveaux = await prisma.niveau.findMany({
      select: {
        id: true,
        name: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });

    return niveaux;
  } catch (error) {
    console.error('Error fetching niveaux:', error);
    throw new Error('Failed to fetch niveaux');
  }
}

// Get User Profile Server Action
export async function getUserProfile(userId: string) {
  try {
    await requireAdminAccess();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profileCompleted: true,
        hasActiveSubscription: true,
        subscriptionExpiresAt: true,
        niveau: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

// Delete User Server Action
export async function deleteUser(userId: string) {
  try {
    await requireAdminAccess();

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}
