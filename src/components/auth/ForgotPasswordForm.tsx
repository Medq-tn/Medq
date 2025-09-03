import { useState, useEffect } from 'react';
import { Loader2, ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { toast } from '@/hooks/use-toast';

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t, i18n } = useTranslation();

  // Force re-render when language changes
  useEffect(() => {
    // This will force the component to re-render when i18n is ready
  }, [i18n.language, i18n.isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
          // toast({
          //   title: t('auth.resetEmailSent', { email }),
          //   description: t('auth.checkEmail'),
          // });
      } else {
          // toast({
          //   title: t('auth.resetError'),
          //   description: data.error,
          //   variant: "destructive",
          // });
      }
    } catch (error) {
        // toast({
        //   title: t('auth.resetError'),
        //   description: t('auth.unexpectedError'),
        //   variant: "destructive",
        // });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
        {isSubmitted ? t('auth.checkYourEmail') : t('auth.resetPassword')}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        {isSubmitted ? t('auth.resetLinkSent') : t('auth.enterEmailForReset')}
      </p>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-medblue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-medblue-700 focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.sending')}
              </>
            ) : (
              t('auth.sendResetLink')
            )}
          </button>
        </form>
      ) : (
        <div className="text-left py-2">
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            {t('auth.resetEmailSent', { email })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.checkSpamFolder')}
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-medblue-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('auth.backToSignIn')}
        </button>
      </div>
    </div>
  );
}
