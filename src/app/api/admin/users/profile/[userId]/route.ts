import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

  const { userId } = await context.params;

    // Get comprehensive user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        niveau: {
          select: {
            id: true,
            name: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            progress: true,
            pinnedSpecialties: true,
            pinnedQuestions: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Get additional statistics
    const [
      totalQuestions,
      completedQuestions,
      averageScore,
      recentActivity,
      accountAge,
      loginStats
    ] = await Promise.all([
      // Total questions attempted
      prisma.userProgress.count({
        where: { userId }
      }),
      
      // Completed questions
      prisma.userProgress.count({
        where: { 
          userId,
          completed: true
        }
      }),
      
      // Average score
      prisma.userProgress.aggregate({
        where: { 
          userId,
          score: { not: null }
        },
        _avg: {
          score: true
        }
      }),
      
      // Recent activity (last 30 days)
      prisma.userProgress.count({
        where: {
          userId,
          lastAccessed: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Account age in days
      Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      
      // Login frequency estimation based on activity
      prisma.userProgress.groupBy({
        by: ['lastAccessed'],
        where: {
          userId,
          lastAccessed: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        _count: true
      })
    ]);

    // Calculate engagement metrics
    const uniqueActivityDays = loginStats.length;
    const avgSessionsPerWeek = (uniqueActivityDays / 13) * 7; // 90 days ≈ 13 weeks

    // Get academic progress
    const academicProgress = await prisma.specialty.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        lectures: {
          select: {
            id: true
          }
        }
      },
      where: {
        lectures: {
          some: {
            progress: {
              some: {
                userId
              }
            }
          }
        }
      }
    });

    // Get subscription info from user fields
    const subscriptionInfo = {
      hasActiveSubscription: user.hasActiveSubscription,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    };

    const profileData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        profileCompleted: user.profileCompleted,
        niveauId: user.niveauId,
        semesterId: user.semesterId,
        niveau: user.niveau,
        semester: user.semester,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.updatedAt, // Approximation
        subscription: subscriptionInfo
      },
      statistics: {
        totalQuestions,
        completedQuestions,
        completionRate: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0,
        averageScore: averageScore._avg.score ? Math.round(averageScore._avg.score * 10) / 10 : 0,
        recentActivity30Days: recentActivity,
        accountAgeDays: accountAge,
        uniqueStudyDays: uniqueActivityDays,
        avgSessionsPerWeek: Math.round(avgSessionsPerWeek * 10) / 10,
        totalPinnedItems: user._count.pinnedSpecialties + user._count.pinnedQuestions,
        totalComments: user._count.comments
      },
      academicProgress: academicProgress.map(specialty => ({
        specialtyId: specialty.id,
        specialtyName: specialty.name,
        icon: specialty.icon,
        totalLectures: specialty.lectures.length
      })),
      subscriptionHistory: [subscriptionInfo],
      engagement: {
        level: getEngagementLevel(uniqueActivityDays, totalQuestions, accountAge),
        lastActiveWithin: getLastActiveStatus(recentActivity),
        consistencyScore: Math.min(100, Math.round((uniqueActivityDays / (accountAge || 1)) * 100))
      }
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    }

  const { userId } = await context.params;
    const body = await request.json();

    // Validate update fields
    const allowedFields = [
      'name', 'email', 'role', 'niveauId', 'semesterId', 
      'emailVerified', 'profileCompleted'
    ];
    
    const updateData: any = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ valide à mettre à jour' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        niveau: {
          select: {
            id: true,
            name: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Profil utilisateur mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

// Helper functions
function getEngagementLevel(studyDays: number, totalQuestions: number, accountAge: number): string {
  const engagementScore = (studyDays * 2) + (totalQuestions * 0.1) - (accountAge * 0.1);
  
  if (engagementScore >= 50) return 'Très élevé';
  if (engagementScore >= 25) return 'Élevé';
  if (engagementScore >= 10) return 'Modéré';
  if (engagementScore >= 5) return 'Faible';
  return 'Très faible';
}

function getLastActiveStatus(recentActivity: number): string {
  if (recentActivity > 0) return '30 derniers jours';
  return 'Plus de 30 jours';
}
