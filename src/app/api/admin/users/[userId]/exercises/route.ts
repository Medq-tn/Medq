import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

async function getHandler(request: AuthenticatedRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    
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
        niveauId: true,
        semesterId: true,
        niveau: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } }
      }
    });

    if (!targetUser) {
  return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Get user's progress with detailed information
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        id: true,
        lectureId: true,
        questionId: true,
        score: true,
        completed: true,
        lastAccessed: true,
        createdAt: true,
        updatedAt: true,
        lecture: {
          select: {
            id: true,
            title: true,
            specialtyId: true,
            specialty: {
              select: {
                id: true,
                name: true,
                icon: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get questions separately if needed
    const questionIds = userProgress
      .map(p => p.questionId)
      .filter(Boolean) as string[];
    
    const questions = questionIds.length > 0 ? await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        text: true,
        type: true,
        number: true
      }
    }) : [];

    const questionMap = questions.reduce((acc, q) => {
      acc[q.id] = q;
      return acc;
    }, {} as Record<string, typeof questions[0]>);

    // Get pinned specialties
    const pinnedSpecialties = await prisma.pinnedSpecialty.findMany({
      where: { userId },
      include: {
        specialty: {
          select: {
            id: true,
            name: true,
            icon: true,
            _count: {
              select: {
                lectures: true
              }
            }
          }
        }
      }
    });

    // Get pinned questions
    const pinnedQuestions = await prisma.pinnedQuestion.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            type: true,
            number: true,
            lecture: {
              select: {
                id: true,
                title: true,
                specialty: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Aggregate progress by specialty
    const progressBySpecialty = userProgress.reduce((acc, progress) => {
      const specialtyId = progress.lecture.specialtyId;
      const specialtyName = progress.lecture.specialty.name;
      
      if (!acc[specialtyId]) {
        acc[specialtyId] = {
          specialtyId,
          specialtyName,
          icon: progress.lecture.specialty.icon,
          totalQuestions: 0,
          completedQuestions: 0,
          totalScore: 0,
          scoreCount: 0,
          lectures: new Set(),
          lastAccessed: progress.lastAccessed
        };
      }
      
      acc[specialtyId].totalQuestions++;
      acc[specialtyId].lectures.add(progress.lecture.title);
      
      if (progress.completed) {
        acc[specialtyId].completedQuestions++;
      }
      
      if (progress.score !== null) {
        acc[specialtyId].totalScore += progress.score;
        acc[specialtyId].scoreCount++;
      }
      
      if (progress.lastAccessed && (!acc[specialtyId].lastAccessed || progress.lastAccessed > acc[specialtyId].lastAccessed)) {
        acc[specialtyId].lastAccessed = progress.lastAccessed;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate averages
    const specialtyStats = Object.values(progressBySpecialty).map((specialty: any) => ({
      ...specialty,
      lectureCount: specialty.lectures.size,
      averageScore: specialty.scoreCount > 0 ? Math.round((specialty.totalScore / specialty.scoreCount) * 10) / 10 : 0,
      completionRate: specialty.totalQuestions > 0 ? Math.round((specialty.completedQuestions / specialty.totalQuestions) * 100) : 0,
      lectures: undefined // Remove the Set object
    }));

    // Get recent exercise activity (last 50 entries)
    const recentActivity = userProgress
      .slice(0, 50)
      .map(progress => ({
        id: progress.id,
        type: 'exercise_attempt',
        lectureTitle: progress.lecture.title,
        specialtyName: progress.lecture.specialty.name,
        questionNumber: progress.questionId ? questionMap[progress.questionId]?.number : null,
        score: progress.score,
        completed: progress.completed,
        lastAccessed: progress.lastAccessed,
        createdAt: progress.createdAt
      }));

    return NextResponse.json({
      user: targetUser,
      statistics: {
        totalProgress: userProgress.length,
        completedQuestions: userProgress.filter(p => p.completed).length,
        totalScore: userProgress.reduce((sum, p) => sum + (p.score || 0), 0),
        averageScore: userProgress.length > 0 ? userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length : 0,
        uniqueSpecialties: specialtyStats.length,
        uniqueLectures: new Set(userProgress.map(p => p.lectureId)).size
      },
      specialtyProgress: specialtyStats.sort((a, b) => b.totalQuestions - a.totalQuestions),
      recentActivity,
      pinnedContent: {
        specialties: pinnedSpecialties,
        questions: pinnedQuestions
      }
    });

  } catch (error) {
    console.error('Error fetching user exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch user exercises' }, { status: 500 });
  }
}

export const GET = requireAuth(getHandler);
