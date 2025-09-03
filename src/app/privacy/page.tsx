import Image from 'next/image';
import Link from 'next/link';
import { ForceLightTheme } from '@/components/ForceLightTheme';

export const metadata = {
  title: 'Politique de confidentialité | MedQ',
  description: "Comment MedQ collecte, utilise et protège vos données personnelles.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Force light mode on this page only */}
      <ForceLightTheme />
      
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
      <section className="bg-gradient-to-br from-medblue-600 to-medblue-800 py-16 md:py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-medblue-100 hover:text-white transition-colors">
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Retour à l'accueil</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Politique de confidentialité</h1>
          <p className="mt-4 text-xl text-medblue-100">Dernière mise à jour : 01 septembre 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Table of Contents */}
      

          {/* Introduction */}
          <div className="mb-16 p-8 bg-gradient-to-r from-medblue-50 to-blue-50 rounded-2xl border border-medblue-100 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🛡️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Chez MedQ, nous respectons votre vie privée. Cette politique explique clairement quelles
                  données nous collectons, à quelles fins et comment exercer vos droits.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            {/* Section 1: Données collectées */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="donnees" className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">1</span>
                Données que nous collectons
              </h2>
              
              <div className="space-y-10">
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Informations de compte</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Nom, e‑mail et informations de profil liées à votre parcours.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Paramètres de préférences (langue, thème, notifications).</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Données d'utilisation</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Progression, réponses aux questions, annotations et favoris.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Interactions sociales (commentaires, réactions) lorsque vous les utilisez.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Données techniques</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Identifiants de session, type d'appareil et informations de performance.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Logs techniques pour la sécurité et l'amélioration du service.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2: Finalités */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="finalites" className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">2</span>
                Finalités du traitement
              </h2>
              
              <div className="space-y-10">
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Fournir et améliorer le service</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Fonctionnalités d'apprentissage (statistiques, sessions, commentaires).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                      <span className="text-lg">Personnalisation de l'expérience selon votre spécialité et votre niveau.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sécurité et intégrité</h3>
                  <p className="text-lg text-gray-700">
                    Prévenir la fraude, garantir la disponibilité et la sécurité des données.
                  </p>
                </div>
                
                <div className="border-l-4 border-medblue-200 pl-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Assistance et communication</h3>
                  <p className="text-lg text-gray-700">
                    Support utilisateur et informations importantes liées au service.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Conservation */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="conservation" className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">3</span>
                Conservation
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nous conservons les données uniquement pendant la durée nécessaire à la fourniture du service
                et conformément aux exigences légales applicables. Vous pouvez demander la suppression de votre
                compte à tout moment.
              </p>
            </div>

            {/* Section 4: Partage */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="partage" className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">4</span>
                Partage
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nous ne vendons pas vos données. Elles peuvent être partagées avec des prestataires de confiance
                strictement nécessaires au fonctionnement (hébergement, e‑mail, analytique), dans le cadre
                d'accords de confidentialité et de sécurité appropriés.
              </p>
            </div>

            {/* Section 5: Sécurité */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="securite" className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">5</span>
                Sécurité
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nous appliquons des mesures techniques et organisationnelles adaptées pour protéger vos données
                contre l'accès non autorisé, la modification ou la perte.
              </p>
            </div>

            {/* Section 6: Vos droits */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="vos-droits" className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">6</span>
                Vos droits
              </h2>
              <ul className="space-y-4 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                  <span className="text-lg">Accès, rectification, portabilité, limitation et suppression de vos données.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                  <span className="text-lg">Opposition à certains traitements lorsque la loi l'autorise.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-medblue-500 rounded-full mt-3 flex-shrink-0"></span>
                  <span className="text-lg">Réclamation auprès de l'autorité de contrôle compétente.</span>
                </li>
              </ul>
              <p className="text-lg text-gray-700 leading-relaxed">
                Pour exercer vos droits, contactez‑nous depuis l'adresse associée à votre compte.
              </p>
            </div>

            {/* Section 7: Contact */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
              <h2 id="contact" className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                <span className="w-12 h-12 bg-medblue-100 text-medblue-600 rounded-xl flex items-center justify-center text-xl font-bold">7</span>
                Contact
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Pour toute question ou demande relative à la vie privée :
              </p>
              <div className="p-6 bg-medblue-50 rounded-xl border border-medblue-100">
                <a href="mailto:contact@medq.tn" className="text-xl font-semibold text-medblue-700 hover:text-medblue-800 transition-colors">
                  contact@medq.tn
                </a>
              </div>
            </div>

           
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
