import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
// toast removed
import { validatePassword } from '@/lib/password-validation';
import { PasswordStrength } from '@/components/ui/password-strength';

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const { t } = useTranslation();

  // Check if we have a valid reset token by looking at the URL
  useEffect(() => {
    // Log current URL parameters for debugging
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const type = params.get('type');
    const accessToken = params.get('access_token');
    
    console.log('Reset password URL parameters:', { 
      type,
      hasAccessToken: !!accessToken,
      fullUrl: window.location.href 
    });
    
    // If we don't have the right parameters, the reset link might be invalid
    if (!type || type !== 'recovery') {
      console.log('Not a valid recovery flow');
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return;
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(t(validation.errors[0]));
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting password reset');
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: '', // For reset, we don't have current password
          newPassword: password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Password update failed:', data.error);
  setError(data.error || t('auth.passwordResetFailed'));
      } else {
  console.log('Password updated successfully');
        // Redirect to dashboard after successful password reset
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Password reset error:', err);
  setError(t('auth.passwordResetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
        {t('auth.createNewPassword')}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        {t('auth.enterNewPassword')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('auth.newPassword')}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={8}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent pr-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordValidation && (
            <div className="mt-2">
              <PasswordStrength password={password} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('auth.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.updating')}
            </>
          ) : (
            t('auth.resetPassword')
          )}
        </button>
      </form>
    </div>
  );
}
