import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user details
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
          select: { id: true, name: true, order: true }
        },
        semester: {
          select: { id: true, name: true, order: true }
        }
      }
    });

    if (!user) {
  return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Get user progress data
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            specialty: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    // Get user activity
    const userActivity = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate stats
    const totalQuestions = userProgress.length;
    const completedQuestions = userProgress.filter(p => p.completed).length;
    const averageScore = userProgress.length > 0 
      ? userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length 
      : 0;

    // Group progress by specialty
    const progressBySpecialty = userProgress.reduce((acc, p) => {
      const specialtyName = p.lecture.specialty.name;
      if (!acc[specialtyName]) {
        acc[specialtyName] = {
          total: 0,
          completed: 0,
          averageScore: 0,
          scores: []
        };
      }
      acc[specialtyName].total++;
      if (p.completed) acc[specialtyName].completed++;
      if (p.score !== null) acc[specialtyName].scores.push(p.score);
      return acc;
    }, {} as Record<string, any>);

    // Calculate average scores for specialties
    Object.keys(progressBySpecialty).forEach(specialty => {
      const scores = progressBySpecialty[specialty].scores;
      progressBySpecialty[specialty].averageScore = scores.length > 0
        ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
        : 0;
    });

    return NextResponse.json({
      user,
      stats: {
        totalQuestions,
        completedQuestions,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
      },
      progressBySpecialty,
      recentActivity: userActivity,
      recentProgress: userProgress.slice(-5)
    });

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch user dashboard' }, { status: 500 });
  }
}

async function handler(request: AuthenticatedRequest) {
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: request.user?.userId },
    select: { role: true }
  });

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  return getHandler(request);
}

export const GET = requireAuth(handler);
