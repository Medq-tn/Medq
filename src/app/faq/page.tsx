import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "FAQ | MedQ",
  description: "Réponses aux questions fréquentes sur MedQ: paiement, compte, contenu, technique et abonnement.",
};

export default function FAQPage() {
  const sections = [
    {
      id: 'paiement',
      title: 'Paiement',
      items: [
        {
          q: 'Quels sont les modes de paiement acceptés ?',
          a: 'Carte bancaire, D17, virement ou espèces via code de paiement. Les instructions sont indiquées lors de la souscription.'
        },
        {
          q: 'Puis‑je obtenir une facture ?',
          a: "Oui, votre facture est disponible depuis la section Abonnement de votre compte après l'achat."
        },
      ],
    },
    {
      id: 'compte',
      title: 'Compte',
      items: [
        {
          q: 'Puis‑je utiliser MedQ sur plusieurs appareils ?',
          a: 'Oui, votre compte fonctionne sur ordinateur, tablette et mobile avec synchronisation.'
        },
        {
          q: 'Comment récupérer mon mot de passe ?',
          a: "Utilisez « Mot de passe oublié » sur la page d’authentification ; vous recevrez un e‑mail de réinitialisation."
        },
      ],
    },
    {
      id: 'contenu',
      title: 'Contenu et révision',
      items: [
        {
          q: 'Le contenu est‑il régulièrement mis à jour ?',
          a: 'Oui, de nouvelles questions, corrections et explications sont publiées toute l’année.'
        },
        {
          q: 'Comment cibler mes faiblesses ?',
          a: 'Utilisez les filtres par thème/difficulté, rejouez vos erreurs et créez des listes personnalisées.'
        },
      ],
    },
    {
      id: 'technique',
      title: 'Technique',
      items: [
        {
          q: 'Le site fonctionne‑t‑il hors connexion ?',
          a: "Non, une connexion internet est nécessaire pour garantir la synchronisation de vos données."
        },
        {
          q: 'Mon écran ne se met pas à jour / je rencontre un bug ?',
          a: 'Rafraîchissez la page et reconnectez‑vous. Si le problème persiste, contactez contact@medq.tn avec une capture.'
        },
      ],
    },
    {
      id: 'abonnement',
      title: 'Abonnement',
      items: [
        {
          q: 'Comment activer mon abonnement via un code ?',
          a: 'Rendez‑vous dans votre profil → Abonnement → Entrer le code pour activer l’accès immédiatement.'
        },
        {
          q: 'Puis‑je annuler ?',
          a: "Oui, vous pouvez annuler depuis la section Abonnement ; l'accès reste actif jusqu’à la fin de la période."
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar (scrolled style) */}
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" aria-label="Aller à l'accueil" className="flex items-center">
              <Image
                src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwc6JmYDs7xU9KRorsOPBFM3XfQgEkDm2yuiLj"
                alt="MedQ logo"
                width={200}
                height={48}
                sizes="200px"
                className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                priority
              />
            </Link>
            <div className="flex space-x-3 md:space-x-4">
              <Link
                href="/auth?mode=login"
                className="border border-medblue-600 text-medblue-600 hover:bg-medblue-50 hover:border-medblue-700 hover:text-medblue-700 hover:shadow-md hover:-translate-y-0.5 bg-transparent text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-200"
              >
                Connexion
              </Link>
              <Link
                href="/auth"
                className="bg-medblue-600 hover:bg-medblue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-14 md:h-16" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-medblue-600 to-medblue-800 py-12 md:py-16 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-3">
            <Link href="/" className="inline-flex items-center gap-2 text-medblue-100 hover:text-white transition-colors">
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Retour à l'accueil</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h1>
          <p className="mt-2 text-medblue-100">Questions fréquentes sur le paiement, le compte, le contenu et l’abonnement.</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Table of contents */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Sommaire</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
              {sections.map((s) => (
                <Link key={s.id} href={`#${s.id}`} className="text-medblue-700 hover:text-medblue-800 underline">
                  {s.title}
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
                <h2 id={s.id} className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{s.title}</h2>
                <div className="divide-y divide-gray-200">
                  {s.items.map((item, i) => (
                    <details key={i} className="group py-4">
                      <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between">
                        <span>{item.q}</span>
                        <span className="ml-4 inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-medblue-300 text-medblue-600 group-open:bg-medblue-600 group-open:text-white">+</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (same as landing) */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Image
                src="https://hbc9duawsb.ufs.sh/f/0SaNNFzuRrLwEhDtvz72VxFcMaBkoOH8vYK05Zd6q4mGPySp"
                alt="MedQ logo"
                width={200}
                height={48}
                sizes="200px"
                className="h-10 md:h-12 w-auto object-contain mb-4"
              />
              <p className="text-gray-300 leading-relaxed">
                La plateforme d'apprentissage médical de référence pour les étudiants ambitieux.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Plateforme</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/" className="hover:text-medblue-300 transition-colors">Accueil</Link></li>
                <li><Link href="/#fonctionnalites" className="hover:text-medblue-300 transition-colors">Fonctionnalités</Link></li>
                {/* Tarifs link removed */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Ressources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/guide" className="hover:text-medblue-300 transition-colors">Guide d'utilisation</Link></li>
                <li><Link href="/faq" className="hover:text-medblue-300 transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-medblue-300 transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Nous contacter</h4>
              <p className="text-gray-300">contact@medq.tn</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 MedQ. Tous droits réservés. |
              <Link href="/privacy" className="hover:text-medblue-300 ml-1">Politique de confidentialité</Link> |
              <Link href="/terms" className="hover:text-medblue-300 ml-1">Conditions d'utilisation</Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
