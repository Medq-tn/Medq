export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact</h1>
        <p className="text-gray-600 mb-8">Une question ? Envoyez-nous un message et nous reviendrons rapidement vers vous.</p>
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medblue-300" placeholder="Nom" />
            <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medblue-300" placeholder="Email" type="email" />
          </div>
          <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medblue-300" placeholder="Sujet" />
          <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-medblue-300" placeholder="Votre message" />
          <button type="submit" className="bg-medblue-600 text-white px-5 py-2 rounded-md hover:bg-medblue-700 transition-colors">Envoyer</button>
        </form>
      </section>
    </main>
  );
}
