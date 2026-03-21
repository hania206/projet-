import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  return (
    <div>

      {/* HERO SECTION */}
      <div
        className="h-[500px] bg-cover bg-center flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507089947368-19c1da9775ae')",
        }}
      >
        <div className="bg-black/50 p-10 rounded-xl text-white max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Votre voyage vers une maison
            <span className="text-green-300"> plus verte </span>
            commence ici
          </h1>

          <p className="mb-6">
            Suivi énergie & eau, conseils IA, objectifs et impact carbone en temps réel.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition"
            >
              Start Tracking
            </button>

            <button
              onClick={() => navigate("/objectives")}
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition"
            >
              Voir l'impact
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 text-center py-16 bg-gray-50 px-6">
        {loading ? (
          <p className="col-span-3">Loading...</p>
        ) : stats.length > 0 ? (
          stats.map((item, index) => (
            <div
              key={index}
              className="border-l-4 border-green-500 px-6 bg-white shadow rounded-lg py-6"
            >
              <h1 className="text-3xl font-bold text-green-600">
                {item.value}
              </h1>
              <p className="text-gray-600">{item.label}</p>
            </div>
          ))
        ) : (
          <p className="col-span-3 text-gray-500">
            Aucun statistique disponible
          </p>
        )}
      </div>

      {/* FEATURES */}
      <div className="py-16 text-center px-6">
        <h2 className="text-2xl font-bold mb-10">
          Comment GreenLife Vous Aide
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-green-500 text-3xl mb-2">🌿</div>
            <h3 className="font-bold mb-2">Suivi Intuitif</h3>
            <p className="text-gray-600">
              Enregistrez facilement votre consommation d'eau et d'électricité.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-green-500 text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-2">Analyse IA</h3>
            <p className="text-gray-600">
              Identifiez les pics de consommation grâce à l'IA.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-green-500 text-3xl mb-2">💚</div>
            <h3 className="font-bold mb-2">Conseils Personnalisés</h3>
            <p className="text-gray-600">
              Recevez des recommandations pour économiser énergie et argent.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}