import * as React from 'react';
import { EMAIL_LOGO_URL } from '@/lib/branding';

interface Props {
  firstName?: string | null;
  code: string;
}

export function VerificationCodeEmail({ firstName, code }: Props) {
  const name = firstName && firstName.trim().length > 0 ? firstName : 'Étudiant(e)';
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Code de vérification</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f7fb', color: '#0f172a', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji' }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ padding: '24px 16px' }}>
                <table role="presentation" width="100%" style={{ maxWidth: 640, margin: '0 auto', background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 25px rgba(2,6,23,0.07)', overflow: 'hidden' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 24, backgroundColor: '#0A527F', textAlign: 'center' }}>
                        <img
                          src={EMAIL_LOGO_URL}
                          width={200}
                          alt="MedQ"
                          style={{ display: 'inline-block', width: '200px', height: 'auto' }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 24 }}>
                        <h1 style={{ margin: '0 0 8px', fontSize: 24, lineHeight: '28px', color: '#0f172a' }}>Votre code de vérification</h1>
                        <p style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>Bonjour {name},</p>
                        <p style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>
                          Utilisez le code ci‑dessous pour vérifier votre adresse e‑mail et activer votre compte MedQ.
                        </p>

                        <div style={{ textAlign: 'center', margin: '24px 0' }}>
                          <div style={{ display: 'inline-block', letterSpacing: '8px', fontWeight: 700, fontSize: 28, padding: '12px 20px', borderRadius: 12, background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                            {code}
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Ce code expire dans 15 minutes. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e‑mail.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 20, textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: 12 }}>
                        © 2025 MedQ. Tous droits réservés.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
