import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "Conditions d’utilisation | MedQ",
  description: "Les règles d’utilisation de MedQ et les engagements réciproques.",
};

export default function TermsPage() {
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
                className="h-10 md:h-12 w-auto object-contain mix-blend-normal"
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

      <section className="bg-gradient-to-br from-medblue-600 to-medblue-800 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-white">
          <div className="mb-3">
            <Link href="/" className="inline-flex items-center gap-2 text-medblue-100 hover:text-white transition-colors">
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Retour à l'accueil</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Conditions d’utilisation</h1>
          <p className="mt-2 text-medblue-100">Dernière mise à jour : 01/09/2025</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="prose prose-slate prose-lg max-w-none leading-relaxed text-slate-800 prose-headings:tracking-tight prose-headings:text-slate-900 prose-a:text-medblue-700 hover:prose-a:text-medblue-800">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5 mb-8">
              <h2 className="m-0 text-xl md:text-2xl font-semibold">Sommaire</h2>
              <ol className="mt-3 list-decimal pl-6 space-y-1 text-[15px] md:text-base">
                <li><Link href="#objet">Objet du service</Link></li>
                <li><Link href="#compte">Compte et sécurité</Link></li>
                <li><Link href="#abonnements">Abonnements et paiements</Link></li>
                <li><Link href="#utilisation">Utilisation acceptable</Link></li>
                <li><Link href="#propriete">Propriété intellectuelle</Link></li>
                <li><Link href="#disponibilite">Disponibilité et évolutions</Link></li>
                <li><Link href="#responsabilite">Limitation de responsabilité</Link></li>
                <li><Link href="#resiliation">Résiliation</Link></li>
                <li><Link href="#droit">Droit applicable</Link></li>
                <li><Link href="#contact">Contact</Link></li>
              </ol>
            </div>

            <p>
              En utilisant MedQ, vous acceptez ces conditions. Veuillez les lire attentivement : elles
              précisent vos droits, vos responsabilités et nos engagements.
            </p>

            <h2 id="objet">1. Objet du service</h2>
            <p>
              MedQ est une plateforme d’apprentissage destinée aux étudiants en médecine : questions,
              corrections, annotations, statistiques et outils collaboratifs.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="compte">2. Compte et sécurité</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
              <li>Prévenez‑nous immédiatement en cas d’accès non autorisé.</li>
              <li>Un compte est personnel et non cessible.</li>
            </ul>
            <hr className="my-8 border-gray-200" />

            <h2 id="abonnements">3. Abonnements et paiements</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Les tarifs et durées d’accès sont indiqués clairement avant l’achat.</li>
              <li>Selon la réglementation locale, un droit de rétractation peut ne pas s’appliquer aux contenus numériques fournis immédiatement.</li>
              <li>Les moyens de paiement acceptés sont affichés sur la page de souscription.</li>
            </ul>
            <hr className="my-8 border-gray-200" />

            <h2 id="utilisation">4. Utilisation acceptable</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Il est interdit de copier, partager ou revendre les contenus sans autorisation.</li>
              <li>Tout comportement visant à perturber le service peut entraîner la suspension du compte.</li>
            </ul>
            <hr className="my-8 border-gray-200" />

            <h2 id="propriete">5. Propriété intellectuelle</h2>
            <p>
              Les contenus et logiciels de MedQ sont protégés. Toute reproduction non autorisée est interdite.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="disponibilite">6. Disponibilité et évolutions</h2>
            <p>
              Nous visons une haute disponibilité, mais ne garantissons pas l’absence d’interruptions. Des
              mises à jour ou modifications peuvent être apportées pour améliorer le service.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="responsabilite">7. Limitation de responsabilité</h2>
            <p>
              MedQ fournit des contenus à visée pédagogique et ne remplace pas l’avis d’un professionnel de
              santé. Dans les limites autorisées par la loi, notre responsabilité est limitée au montant payé
              pour l’accès au service sur la période en cause.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="resiliation">8. Résiliation</h2>
            <p>
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace. La résiliation prend
              effet à la fin de la période en cours.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="droit">9. Droit applicable</h2>
            <p>
              Ces conditions sont régies par le droit applicable dans votre juridiction, sous réserve des dispositions impératives.
            </p>
            <hr className="my-8 border-gray-200" />

            <h2 id="contact">10. Contact</h2>
            <p>
              Pour toute question au sujet de ces conditions : 
              <a href="mailto:legal@medq.tn" className="text-medblue-700 underline ml-1">legal@medq.tn</a>.
            </p>

            <p className="text-sm text-gray-500">
              En cas de divergence, les informations présentées dans l’application et le reçu d’achat font foi.
            </p>
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
