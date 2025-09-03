import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status === 'verified') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Compare code (stored as verificationToken) and check expiry if present
    const now = new Date();
    if (!user.verificationToken || user.verificationToken !== code) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
    }
    if (user.verificationTokenExpires && now > user.verificationTokenExpires) {
      return NextResponse.json({ error: 'Code expiré' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'verified',
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    // Auto-login: issue JWT cookie
    const token = jwt.sign(
      { userId: updated.id, email: updated.email, role: updated.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        image: updated.image,
        faculty: updated.faculty,
        emailVerified: updated.emailVerified,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      token,
      message: 'Vérification réussie',
    });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Verify-code error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
