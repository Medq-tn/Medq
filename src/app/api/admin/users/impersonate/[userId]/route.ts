import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
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

    // Get user to impersonate
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hasActiveSubscription: true,
        subscriptionExpiresAt: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Don't allow impersonating other admins
    if (targetUser.role === 'admin') {
      return NextResponse.json({ 
        error: 'Impossible d\'impersonner un autre administrateur' 
      }, { status: 403 });
    }

    // Create impersonation token with admin context
    const impersonationToken = jwt.sign(
      {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        hasActiveSubscription: targetUser.hasActiveSubscription,
        impersonatedBy: decoded.userId, // Track who is impersonating
        isImpersonation: true
      },
      JWT_SECRET,
      { expiresIn: '2h' } // Shorter expiry for security
    );

    // Log the impersonation activity
    await prisma.userActivity.create({
      data: {
        userId: targetUser.id,
        type: 'admin_impersonation'
      }
    });

    return NextResponse.json({
      message: 'Token d\'impersonation généré',
      impersonationToken,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role
      },
      expiresIn: '2h'
    });

  } catch (error) {
    console.error('Error creating impersonation token:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du token d\'impersonation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify impersonation token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
      role: string; 
      impersonatedBy?: string;
      isImpersonation?: boolean;
    };

    if (!decoded.isImpersonation) {
      return NextResponse.json({ 
        error: 'Cette requête nécessite un token d\'impersonation' 
      }, { status: 400 });
    }

  const { userId } = await context.params;

    // Verify the impersonation is for the correct user
    if (decoded.userId !== userId) {
      return NextResponse.json({ 
        error: 'Token d\'impersonation invalide pour cet utilisateur' 
      }, { status: 403 });
    }

    // Log the end of impersonation
    await prisma.userActivity.create({
      data: {
        userId: decoded.userId,
        type: 'admin_impersonation_end'
      }
    });

    return NextResponse.json({
      message: 'Impersonation terminée',
      adminUserId: decoded.impersonatedBy
    });

  } catch (error) {
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la fin d\'impersonation' },
      { status: 500 }
    );
  }
}
