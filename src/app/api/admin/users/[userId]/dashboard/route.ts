import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

async function getHandler(
  request: AuthenticatedRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    
    // Check if requesting user is admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: request.user?.userId },
      select: { role: true }
    });

    if (requestingUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get target user information
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profileCompleted: true,
        hasActiveSubscription: true,
        niveauId: true,
        semesterId: true,
        niveau: {
          select: { id: true, name: true, order: true }
        },
        semester: {
          select: { id: true, name: true, order: true }
        }
      }
    });

    if (!targetUser) {
  return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Get user's progress statistics
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        id: true,
        lectureId: true,
        score: true,
        completed: true,
        lastAccessed: true,
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

    // Calculate statistics
    const totalQuestions = userProgress.length;
    const completedQuestions = userProgress.filter(p => p.completed).length;
    const averageScore = userProgress.length > 0 
      ? userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length 
      : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        createdAt: true
      }
    });

    // Get specialty progress - group by lectureId first, then aggregate by specialty
    const progressByLecture = await prisma.userProgress.groupBy({
      by: ['lectureId'],
      where: { userId },
      _count: {
        id: true
      },
      _avg: {
        score: true
      }
    });

    // Get pinned content
    const pinnedSpecialties = await prisma.pinnedSpecialty.findMany({
      where: { userId },
      include: {
        specialty: {
          select: { id: true, name: true }
        }
      }
    });

    const pinnedQuestions = await prisma.pinnedQuestion.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            lecture: {
              select: {
                title: true,
                specialty: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      take: 5
    });

    return NextResponse.json({
      user: targetUser,
      statistics: {
        totalQuestions,
        completedQuestions,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
      },
      recentActivity,
      progressByLecture,
      pinnedContent: {
        specialties: pinnedSpecialties,
        questions: pinnedQuestions
      }
    });

  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch user dashboard' }, { status: 500 });
  }
}

export const GET = requireAuth(getHandler);
