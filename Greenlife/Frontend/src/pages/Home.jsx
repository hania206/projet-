import React from "react";
import { Link } from "react-router-dom";


export default  function Home () {
  return (
    <div className="font-sans">

      {/* ================= NAVBAR ================= */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-green-600">GreenLife</h1>

        <div className="space-x-8 hidden md:flex">
          <a href="#features" className="hover:text-green-600">Fonctionnalités</a>
          <a href="#impact" className="hover:text-green-600">Impact</a>
          <Link to="/login" className="hover:text-green-600">Connexion</Link>
        </div>

        <Link
          to="/register"
          className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700"
        >
          S'inscrire
        </Link>
      </nav>

      {/* ================= HERO ================= */}
      <section
        className="h-screen bg-cover bg-center flex items-center justify-center text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511')",
        }}
      >
        <div className="bg-black bg-opacity-50 p-10 rounded-xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Votre voyage vers une maison <span className="text-green-400">plus verte</span> commence ici
          </h2>
          <p className="mb-8 text-lg">
            Suivi énergie & eau, conseils IA, objectifs et impact carbone en temps réel.
          </p>

          <div className="space-x-4">
            <button className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700">
              Start Tracking
            </button>
            <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black">
              Voir l'Impact
            </button>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="grid md:grid-cols-3 text-center py-16 bg-gray-100">
        <div>
          <h3 className="text-4xl font-bold text-green-600">25%</h3>
          <p className="mt-3 text-gray-600">
            Réduction moyenne de la consommation d'énergie
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-green-600">IA</h3>
          <p className="mt-3 text-gray-600">
            Recommandations personnalisées par Intelligence Artificielle
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-green-600">10K+</h3>
          <p className="mt-3 text-gray-600">
            Foyers engagés pour un avenir plus vert
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-20 px-10 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Comment GreenLife Vous Aide
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg p-8 rounded-xl">
            <div className="text-green-600 text-3xl mb-4">🌿</div>
            <h3 className="font-semibold text-xl mb-3">Suivi Intuitif</h3>
            <p className="text-gray-600">
              Enregistrez facilement votre consommation d'eau et d'électricité.
            </p>
          </div>

          <div className="bg-white shadow-lg p-8 rounded-xl">
            <div className="text-green-600 text-3xl mb-4">⚡</div>
            <h3 className="font-semibold text-xl mb-3">Analyse IA</h3>
            <p className="text-gray-600">
              Identifiez les pics de consommation grâce à l'intelligence artificielle.
            </p>
          </div>

          <div className="bg-white shadow-lg p-8 rounded-xl">
            <div className="text-green-600 text-3xl mb-4">💚</div>
            <h3 className="font-semibold text-xl mb-3">Conseils Personnalisés</h3>
            <p className="text-gray-600">
              Recevez des recommandations pratiques pour économiser des ressources.
            </p>
          </div>
        </div>
      </section>

     

    </div>
  );
};

