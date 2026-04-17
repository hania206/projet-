import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si utilisateur est connecté
  const isLoggedIn = !!localStorage.getItem("userInfo");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  // Redirection selon connexion
  const handleNavigate = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="font-sans text-gray-800">

      {/* HERO SECTION */}
      <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae"
            alt="Maison verte"
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative text-center max-w-3xl px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-snug">
            Votre voyage vers une maison{" "}
            <span className="text-green-300">plus verte</span> commence ici
          </h1>
          <p className="text-white/90 mb-6 text-lg">
            Suivi énergie & eau, conseils IA, objectifs et impact carbone en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
            >
              Start Tracking
            </button>
            <button
              onClick={() => handleNavigate("/objectives")}
              className="border border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Voir l'impact
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {loading ? (
            <p className="col-span-3 text-gray-500">Chargement...</p>
          ) : stats.length > 0 ? (
            stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition"
              >
                <h2 className="text-3xl font-extrabold text-green-600">{item.value}</h2>
                <p className="text-gray-500 mt-1">{item.label}</p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-gray-500">Aucune statistique disponible</p>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          Comment GreenLife Vous Aide
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🌿"
            title="Suivi Intuitif"
            description="Enregistrez facilement votre consommation d'eau et d'électricité."
          />
          <FeatureCard
            icon="⚡"
            title="Analyse IA"
            description="Identifiez les pics de consommation grâce à l'IA."
          />
          <FeatureCard
            icon="💚"
            title="Conseils Personnalisés"
            description="Recevez des recommandations pour économiser énergie et argent."
          />
        </div>
      </section>
    </div>
  );
}

// --- FEATURE CARD ---
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transform hover:-translate-y-2 transition">
      <div className="text-green-500 text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}