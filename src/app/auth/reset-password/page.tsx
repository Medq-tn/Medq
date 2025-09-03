'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ForceLightTheme } from '@/components/ForceLightTheme';
import { validatePassword } from '@/lib/password-validation';
import { PasswordStrength } from '@/components/ui/password-strength';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link. Please check your email for the correct link.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('auth.passwordsNotMatch'));
      return;
    }

    // Validate password using shared utility
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setStatus('error');
      setMessage(t(validation.errors[0]));
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Show French success message and redirect shortly after
        setMessage(t('auth.passwordUpdatedSuccess'));
        setTimeout(() => {
          router.push('/auth');
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.error || t('auth.passwordResetFailed'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(t('auth.unexpectedError'));
    }
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  const confirmStatus = useMemo(() => {
    if (!confirmTouched || confirmPassword.length < 4) return 'neutral' as const;
    return password && confirmPassword === password ? 'match' : 'mismatch';
  }, [confirmPassword, password, confirmTouched]);

  const LeftMarketing = () => (
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
      {/* Laptop Mockup */}
      <div className="absolute bottom-8 left-8">
        <div className="relative transform -rotate-12">
          <div className="w-80 h-52 bg-gray-900 rounded-t-xl border border-gray-700 p-2">
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <div className="h-6 bg-gray-200 flex items-center px-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
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
          <div className="w-80 h-6 bg-gray-800 rounded-b-2xl -mt-1 relative">
            <div className="absolute inset-x-0 top-1 h-3 bg-gray-700 rounded-lg mx-4"></div>
          </div>
        </div>
      </div>
      {/* Phone Mockup */}
      <div className="absolute top-16 right-12">
        <div className="w-32 h-64 bg-gray-900 rounded-3xl border-2 border-gray-700 p-2 transform rotate-12">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
            <div className="h-3 bg-black flex items-center justify-between px-2">
              <div className="flex items-center">
                <div className="w-2 h-1 bg-white rounded-full"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-1 bg-white rounded"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
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
            <div className="flex-1 p-2 bg-gray-50">
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
              <div className="w-full h-1 bg-gray-200 rounded">
                <div className="w-1/3 h-full bg-medblue-500 rounded"></div>
              </div>
            </div>
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
      {/* Floating elements */}
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
  );

  return (
    <>
      <ForceLightTheme />
      <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
        {/* Left marketing */}
        <LeftMarketing />

        {/* Right content */}
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

          <div className="max-w-md mx-auto w-full">
            {/* Home link */}
            <div className="mb-2 flex">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-medblue-700 font-medium group">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 group-hover:bg-medblue-50 group-hover:text-medblue-700 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                <span>Retour à l’accueil</span>
              </Link>
            </div>

            {!token ? (
              <div className="w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">{t('auth.invalidResetLink')}</h1>
                <p className="text-gray-600 mb-4">{t('auth.invalidResetLinkDescription')}</p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2"
                >
                  {t('auth.backToLogin')}
                </button>
              </div>
            ) : (
              <div className="w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">{t('auth.resetPassword')}</h1>
                <p className="text-sm text-gray-600 mb-6">{t('auth.enterNewPassword')}</p>

                {/* Status messages */}
                {status === 'success' && (
                  <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    {message}
                  </div>
                )}
                {status === 'error' && (
                  <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.newPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.enterNewPassword')}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <PasswordStrength password={password} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.confirmPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setConfirmTouched(true)}
                        placeholder={t('auth.confirmPassword')}
                        required
                        minLength={8}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent pr-12 ${
                          confirmStatus === 'match'
                            ? 'border-green-500'
                            : confirmStatus === 'mismatch'
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmStatus === 'mismatch' && (
                      <p className="mt-1 text-xs text-red-600">{t('auth.passwordsNotMatch')}</p>
                    )}
                  </div>

                  {status === 'success' ? (
                    <button
                      type="button"
                      onClick={handleLogin}
                      className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2"
                    >
                      {t('auth.continueToLogin')}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.resettingPassword')}
                        </>
                      ) : (
                        t('auth.resetPassword')
                      )}
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 