import { Resend } from 'resend';
import { VerificationEmail } from '@/components/email/VerificationEmail';
import { ResetPasswordEmail } from '@/components/email/ResetPasswordEmail';
import { VerificationCodeEmail } from '@/components/email/VerificationCodeEmail';

const apiKey = process.env.RESEND_API_KEY || 're_PxdyjGzd_FqbUgeRJmKUu5iytjmdr2qnB';
const resend = new Resend(apiKey);

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MedQ <onboarding@resend.dev>';
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Vérification de votre e‑mail • MedQ',
      react: VerificationEmail({ firstName: name || null, verificationUrl }),
    });
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, name?: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MedQ <onboarding@resend.dev>';
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Réinitialisation du mot de passe • MedQ',
      react: ResetPasswordEmail({ firstName: name || null, resetUrl }),
    });
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendVerificationCodeEmail = async (email: string, code: string, name?: string) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MedQ <onboarding@resend.dev>';
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Votre code de vérification • MedQ',
      react: VerificationCodeEmail({ firstName: name || null, code }),
    });
    return result;
  } catch (error) {
    console.error('Error sending verification code email:', error);
    throw error;
  }
};