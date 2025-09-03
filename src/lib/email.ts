import { Resend } from 'resend';
import { VerificationEmail } from '@/components/email/VerificationEmail';
import { ResetPasswordEmail } from '@/components/email/ResetPasswordEmail';
import { VerificationCodeEmail } from '@/components/email/VerificationCodeEmail';
import { getBaseUrl } from './utils';

const apiKey = process.env.RESEND_API_KEY || 're_PxdyjGzd_FqbUgeRJmKUu5iytjmdr2qnB';
const resend = new Resend(apiKey);

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const base = getBaseUrl();
  const verificationUrl = `${base}/auth/verify?token=${encodeURIComponent(token)}`;
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
  const base = getBaseUrl();
  const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
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