import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationCodeEmail } from '../../../../lib/email';
import { generateExpiryDate } from '../../../../lib/tokens';
import { validatePassword } from '../../../../lib/password-validation';

export async function POST(request: NextRequest) {
  try {
  const { email, password, name, faculty, niveauId } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'L’email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Validate faculty (required and must be one of the allowed values)
    const allowedFaculties = ['FMT', 'FMS', 'FMSf', 'FMM'] as const;
    if (!faculty || !allowedFaculties.includes(faculty)) {
      return NextResponse.json(
        { error: 'Faculté invalide. Valeurs autorisées : FMT, FMS, FMSf, FMM' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet e‑mail existe déjà' },
        { status: 409 }
      );
    }
    
    // Optional: validate niveauId exists (avoid FK violations)
    let niveauIdToSave: string | null = null;
    const rawNiveauId = typeof niveauId === 'string' ? niveauId.trim() : undefined;
    if (rawNiveauId) {
      // Quick shape check for UUID format; even if format passes, verify existence
      const niveau = await prisma.niveau.findUnique({ where: { id: rawNiveauId } });
      if (!niveau) {
        return NextResponse.json(
          { error: 'Niveau invalide. Veuillez sélectionner un niveau valide.' },
          { status: 400 }
        );
      }
      niveauIdToSave = rawNiveauId;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
  // Generate 6-digit numeric verification code
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationTokenExpires = generateExpiryDate(0.25); // ~15 minutes
    
    // Create user
  const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'student', // Default role
        status: 'pending',
        verificationToken,
        verificationTokenExpires,
        passwordUpdatedAt: new Date(),
    profileCompleted: false, // New users need to complete their profile
    faculty,
    niveauId: niveauIdToSave,
      }
    });
    
    // Send verification email
    let emailSent = false;
    let emailError: Error | null = null;
    
    try {
      await sendVerificationCodeEmail(email, verificationToken, name);
      emailSent = true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      emailError = error as Error;
      // Don't fail registration if email fails, but log it
    }
    
    // Return user data (without password and token)
    const userWithoutSensitiveData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
  faculty: user.faculty,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return NextResponse.json({
      user: userWithoutSensitiveData,
      message: emailSent 
        ? 'Inscription réussie. Un code de vérification a été envoyé à votre e‑mail.'
        : 'Inscription réussie, mais l’envoi de l’e‑mail de vérification a échoué. Veuillez contacter le support.',
      emailSent,
      emailError: emailError ? emailError.message : null
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Échec de l’inscription' },
      { status: 500 }
    );
  }
} 