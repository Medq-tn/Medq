import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { faculty, niveauId } = await request.json();
    if (!faculty || !niveauId) {
      return NextResponse.json({ error: 'Missing faculty or niveau' }, { status: 400 });
    }

    // Validate niveau exists
    const niveau = await prisma.niveau.findUnique({ where: { id: niveauId } });
    if (!niveau) {
      return NextResponse.json({ error: 'Invalid niveau' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        faculty,
        niveauId,
        profileCompleted: true,
      },
      select: { id: true, faculty: true, niveauId: true, profileCompleted: true },
    });

    return NextResponse.json({ user: updated, message: 'Onboarding completed' });
  } catch (err) {
    console.error('Onboarding update failed', err);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
