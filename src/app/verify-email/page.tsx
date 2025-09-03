import { ForceLightTheme } from '@/components/ForceLightTheme';
import React, { Suspense } from 'react';
import VerifyEmailClient from './verify-email.client';

export const metadata = { title: 'Vérifier l\'e‑mail • MedQ' };

export default function Page() {
  return (
    <>
      <ForceLightTheme />
      <Suspense>
        <VerifyEmailClient />
      </Suspense>
    </>
  );
}
