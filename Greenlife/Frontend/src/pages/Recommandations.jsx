import React, { useState, useEffect } from "react";
import { Lightbulb, Droplets, Trash2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Recommandations() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    recommendations: [],
    analysis: {},
  });
  const [loading, setLoading] = useState(true);

  // ✅ FETCH
  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ai");
      setData(res.data);
    } catch (err) {
      console.log(err);

      // ✅ fallback إذا الـ backend مش خدام
      setData({
        recommendations: [
          {
            id: 1,
            title: "Réduction possible de 15%",
            description: "Votre consommation est élevée entre 18h et 22h.",
            priority: "Haute",
            type: "energy",
            color: "red",
          },
          {
            id: 2,
            title: "Optimisation douche",
            description: "Réduisez la durée des douches.",
            priority: "Moyenne",
            type: "water",
            color: "yellow",
          },
          {
            id: 3,
            title: "Tri sélectif",
            description: "30% des déchets sont recyclables.",
            priority: "Basse",
            type: "waste",
            color: "green",
          },
        ],
        analysis: {
          score: 82,
          savings: 180,
          activeCount: 3,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // loading
  if (loading) {
    return (
      <div className="p-10 text-center">
        Chargement de l'analyse IA...
      </div>
    );
  }

  // 🎨 helpers
  const getBorder = (color) => {
    if (color === "red") return "border-red-500";
    if (color === "yellow") return "border-yellow-400";
    return "border-green-500";
  };

  const getBg = (color) => {
    if (color === "red") return "bg-red-50 text-red-500";
    if (color === "yellow") return "bg-yellow-50 text-yellow-600";
    return "bg-green-50 text-green-500";
  };

  const getBadge = (color) => {
    if (color === "red") return "bg-red-50 text-red-500 border-red-100";
    if (color === "yellow") return "bg-yellow-50 text-yellow-600 border-yellow-100";
    return "bg-green-50 text-green-500 border-green-100";
  };

  const getIcon = (type) => {
    if (type === "energy") return <Lightbulb size={32} />;
    if (type === "water") return <Droplets size={32} />;
    return <Trash2 size={32} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-10">
          Recommandations IA
        </h2>

        {/* LIST */}
        <div className="space-y-6 mb-16">
          {data.recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white p-8 rounded-2xl shadow border-l-4 ${getBorder(rec.color)} hover:shadow-lg transition`}
            >
              <div className="flex gap-6">
                {/* ICON */}
                <div className={`p-4 rounded-xl ${getBg(rec.color)}`}>
                  {getIcon(rec.type)}
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-lg">{rec.title}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getBadge(rec.color)}`}
                    >
                      {rec.priority}
                    </span>
                  </div>

                  <p className="text-gray-500 my-3">{rec.description}</p>

                  {/* ✅ DETAILS NAVIGATION */}
                  <button
                    onClick={() => navigate(`/recommandations/${rec.id}`)}
                    className="text-emerald-600 flex items-center gap-1 hover:underline"
                  >
                    Détails <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ANALYSIS */}
        <div className="grid md:grid-cols-3 gap-6">
          <AnalysisCard label="Score" value={data.analysis.score} />
          <AnalysisCard label="Économie" value={`€${data.analysis.savings}`} />
          <AnalysisCard label="Actives" value={data.analysis.activeCount} />
        </div>
      </main>
    </div>
  );
}

// ✅ CARD
const AnalysisCard = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition">
    <p className="text-gray-400 text-sm">{label}</p>
    <h1 className="text-2xl font-bold text-emerald-600">{value}</h1>
  </div>
);