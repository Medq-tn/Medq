import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '../../../../lib/auth-middleware';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '../../../../lib/password-validation';

async function putHandler(request: AuthenticatedRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    if (!newPassword) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe est requis' },
        { status: 400 }
      );
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }
    
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }
    
    // If current password is provided, verify it
    if (currentPassword && user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est incorrect' },
          { status: 400 }
        );
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        passwordUpdatedAt: new Date()
      }
    });
    
    return NextResponse.json({ 
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler); 