import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdminAccess } from '@/lib/server-auth';

export async function DELETE(_req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdminAccess();
    const me = await getCurrentUser();
  const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }
    if (me && me.id === userId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    try {
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true });
    } catch (err: any) {
      // Prisma FK constraint error code is P2003
      if (err?.code === 'P2003') {
        return NextResponse.json({ error: 'Unable to delete: user has related data. Remove related records first.' }, { status: 409 });
      }
      console.error('Delete user error:', err);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  } catch (e) {
    // requireAdminAccess may have redirected; if not, return 401
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
}
