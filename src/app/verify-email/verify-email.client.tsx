"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { updateUser } = useAuth();
  const presetEmail = params.get('email') || '';
  const [email, setEmail] = useState(presetEmail);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  const canSubmit = email && code.length === 6 && /^\d{6}$/.test(code);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Échec de la vérification');
      } else {
        updateUser(data.user);
        setMessage('Votre e‑mail a été vérifié. Redirection...');
        setTimeout(() => {
          router.push('/coming-soon');
        }, 600);
      }
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setResendLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Échec de l\'envoi');
      else setMessage('Nouveau code envoyé.');
    } catch (e) {
      setError('Erreur inattendue');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Panel - Same style as auth */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-medblue-600 to-medblue-800 text-white p-10 lg:p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            La nouvelle plateforme de<br />
            <span className="text-medblue-200">Questions révolutionnaire !</span>
          </h1>
          <div className="flex items-center mb-8">
            <Image
              src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwEhDtvz72VxFcMaBkoOH8vYK05Zd6q4mGPySp"
              alt="MedQ logo"
              width={200}
              height={48}
              sizes="200px"
              priority
              className="h-10 lg:h-12 w-auto object-contain transition-opacity duration-300"
            />
          </div>
          <p className="text-medblue-200 text-lg lg:text-2xl mb-12">
            Destinée aux étudiants en médecine
          </p>
        </div>

        {/* Professional Device Mockups - Mirroring auth page */}
        <div className="absolute bottom-8 left-8">
          {/* Premium Laptop Mockup */}
          <div className="relative transform -rotate-12">
            {/* Laptop Screen */}
            <div className="w-80 h-52 bg-gray-900 rounded-t-xl border border-gray-700 p-2">
              <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                {/* Browser Chrome */}
                <div className="h-6 bg-gray-200 flex items-center px-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                {/* App Interface */}
                <div className="bg-gradient-to-br from-medblue-500 to-medblue-700 h-32 p-4">
                  <div className="flex items-center mb-3">
                    <Image
                      src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwEhDtvz72VxFcMaBkoOH8vYK05Zd6q4mGPySp"
                      alt="MedQ logo"
                      width={80}
                      height={24}
                      sizes="80px"
                      className="h-5 w-auto object-contain"
                      priority
                    />
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="w-24 h-2 bg-white rounded mb-2"></div>
                    <div className="w-20 h-2 bg-white bg-opacity-70 rounded mb-2"></div>
                    <div className="w-28 h-2 bg-white bg-opacity-50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop Base */}
            <div className="w-80 h-6 bg-gray-800 rounded-b-2xl -mt-1 relative">
              <div className="absolute inset-x-0 top-1 h-3 bg-gray-700 rounded-lg mx-4"></div>
            </div>
          </div>
        </div>

        {/* Premium Phone Mockup */}
        <div className="absolute top-16 right-12">
          <div className="w-32 h-64 bg-gray-900 rounded-3xl border-2 border-gray-700 p-2 transform rotate-12">
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
              {/* Status Bar */}
              <div className="h-3 bg-black flex items-center justify-between px-2">
                <div className="flex items-center">
                  <div className="w-2 h-1 bg-white rounded-full"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-1 bg-white rounded"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              {/* App Header */}
              <div className="h-6 bg-medblue-600 flex items-center justify-center">
                <Image
                  src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwEhDtvz72VxFcMaBkoOH8vYK05Zd6q4mGPySp"
                  alt="MedQ logo"
                  width={40}
                  height={12}
                  sizes="40px"
                  className="h-3 w-auto object-contain"
                  priority
                />
              </div>
              {/* Content Area */}
              <div className="flex-1 p-2 bg-gray-50">
                {/* Question Card */}
                <div className="bg-white rounded shadow-sm p-2 mb-2">
                  <div className="w-12 h-1 bg-gray-300 rounded mb-1"></div>
                  <div className="w-8 h-1 bg-gray-300 rounded mb-2"></div>
                  <div className="space-y-1">
                    <div className="w-10 h-1 bg-medblue-200 rounded"></div>
                    <div className="w-8 h-1 bg-medblue-200 rounded"></div>
                    <div className="w-12 h-1 bg-medblue-200 rounded"></div>
                    <div className="w-6 h-1 bg-medblue-200 rounded"></div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-200 rounded">
                  <div className="w-1/3 h-full bg-medblue-500 rounded"></div>
                </div>
              </div>
              {/* Bottom Navigation */}
              <div className="h-4 bg-white border-t border-gray-200 flex items-center justify-center">
                <div className="flex space-x-2">
                  <div className="w-1 h-1 bg-medblue-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Floating Elements for Depth */}
        <div className="absolute top-1/3 right-1/4">
          <div className="w-6 h-6 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/3">
          <div className="w-4 h-4 bg-medblue-300 bg-opacity-20 rounded-full animate-pulse delay-1000"></div>
        </div>
        <div className="absolute top-1/2 left-1/3">
          <div className="w-3 h-3 bg-white bg-opacity-5 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Right Panel - Verify Form */}
      <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-950 p-6 sm:p-8 flex flex-col justify-center">
        {/* Mobile Hero */}
        <div className="md:hidden bg-gradient-to-br from-medblue-600 to-medblue-800 text-white rounded-xl p-5 mb-6">
          <div className="flex items-center mb-3">
            <Image
              src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwEhDtvz72VxFcMaBkoOH8vYK05Zd6q4mGPySp"
              alt="MedQ"
              width={180}
              height={40}
              sizes="(max-width: 640px) 160px, 180px"
              priority
              className="h-8 w-auto object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
            />
            <span className="sr-only">MedQ</span>
          </div>
          <p className="text-medblue-100 text-sm">
            La nouvelle plateforme de questions destinée aux étudiants en médecine
          </p>
        </div>

        {/* Card */}
        <div className="max-w-md mx-auto w-full">
          <div className="w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <div className="text-left mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">Vérifiez votre e‑mail</h1>
              <p className="mt-1 text-sm text-gray-600">Entrez le code à 6 chiffres envoyé à {email ? maskEmail(email) : 'votre adresse'}.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Adresse e‑mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Code</label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center tracking-[0.6em] text-base sm:text-lg px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="000000"
                />
                <p className="mt-1 text-xs text-gray-500">Le code expire dans 15 minutes.</p>
              </div>

              {error && (
                <div className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
              )}
              {message && (
                <div className="p-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{message}</div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
              >
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vérification…</>) : 'Vérifier'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={resend} disabled={!email || resendLoading} className="text-sm text-medblue-600 hover:text-medblue-700">
                {resendLoading ? 'Envoi…' : 'Renvoyer le code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
