import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Lightbulb,
  Droplets,
  Trash2,
  Target,
  Leaf,
  AlertTriangle,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function Recommandations() {
  const [data, setData] = useState({
    summary: "",
    recommendations: [],
    analysis: { score: 0, savings: 0, co2Saved: 0 },
    wow_message: "",
    prediction: { energy: 0, water: 0, waste: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consumptions, setConsumptions] = useState([]);

  const [goals, setGoals] = useState({
    co2Target: 0,
    energyTarget: 0,
    waterTarget: 0
  });

  // =========================
  // 🔥 FETCH DATA
  // =========================
  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

        if (!userInfo?.token) {
          throw new Error("Utilisateur non connecté");
        }

        const headers = {
          Authorization: `Bearer ${userInfo.token}`
        };

        const [aiRes, consRes] = await Promise.all([
          axios.get("http://localhost:5000/api/ai", { headers }),
          axios.get("http://localhost:5000/api/consumptions", { headers })
        ]);

        if (!isMounted) return;

        // ✅ CONSUMPTIONS
        const rawCons =
          consRes.data?.consumptions ||
          consRes.data?.data ||
          consRes.data ||
          [];

        const safeCons = Array.isArray(rawCons) ? rawCons : [];
        setConsumptions(safeCons);

        // ✅ GOALS SAFE
        try {
          const rawGoals = localStorage.getItem("goals");
          if (rawGoals) {
            const g = JSON.parse(rawGoals);

            setGoals({
              co2Target: Number(g.co2Target) || 0,
              energyTarget: Number(g.energyTarget) || 0,
              waterTarget: Number(g.waterTarget) || 0
            });
          }
        } catch (err) {
          console.log("Goals error:", err);
        }

        // ✅ AI DATA
        const ai = aiRes.data || {};

        setData({
          summary: ai.summary || "Analyse terminée",
          recommendations: Array.isArray(ai.recommendations)
            ? ai.recommendations
            : [],
          analysis: {
            score: ai.analysis?.score || 0,
            savings: ai.analysis?.savings || 0,
            co2Saved: ai.analysis?.co2Saved || 0
          },
          wow_message: ai.wow_message || "",
          prediction: ai.prediction || {
            energy: 0,
            water: 0,
            waste: 0
          }
        });

      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // 🔥 SMART ALERTS (FIX TYPE)
  // =========================
  const smartAdvice = useMemo(() => {
    if (!consumptions.length) return [];

    let energy = 0,
      water = 0,
      waste = 0;

    consumptions.forEach((c) => {
      const value = Number(c.valeur) || 0;
      const type = (c.type || "").toLowerCase().trim();

      if (type.includes("energie")) energy += value;
      else if (type.includes("eau")) water += value;
      else if (type.includes("dechet") || type.includes("waste"))
        waste += value;
    });

    const advices = [];

    if (energy > 800) {
      advices.push({
        type: "energy",
        title: "⚠️ Énergie élevée",
        description: `${energy} kWh`
      });
    }

    if (water > 40) {
      advices.push({
        type: "water",
        title: "⚠️ Eau élevée",
        description: `${water} m³`
      });
    }

    if (waste > 15) {
      advices.push({
        type: "waste",
        title: "⚠️ Déchets élevés",
        description: `${waste} kg`
      });
    }

    if (goals.co2Target > 0) {
      const totalCO2 = consumptions.reduce(
        (a, b) => a + (Number(b.co2) || 0),
        0
      );

      advices.push({
        type: "target",
        title:
          totalCO2 > goals.co2Target
            ? "❌ Objectif dépassé"
            : "✅ Objectif respecté",
        description: `${totalCO2} / ${goals.co2Target}`
      });
    }

    return advices;
  }, [consumptions, goals]);

  const getIcon = (type) => {
    switch (type) {
      case "energy":
        return <Lightbulb className="text-yellow-500" />;
      case "water":
        return <Droplets className="text-blue-500" />;
      case "waste":
        return <Trash2 className="text-orange-500" />;
      case "target":
        return <Target className="text-green-500" />;
      default:
        return <Leaf />;
    }
  };

  // =========================
  // UI STATES
  // =========================
  if (loading) {
    return (
      <div className="p-20 text-center text-emerald-600 font-bold">
        Analyse IA...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500">
        ⚠️ {error}
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-3xl font-bold mb-6 flex gap-2 items-center">
        <Sparkles className="text-emerald-500" />
        Recommandations IA
      </h1>

      {/* SUMMARY */}
      <div className="bg-emerald-600 text-white p-6 rounded-xl mb-6">
        <p className="italic">"{data.summary}"</p>

        {data.wow_message && (
          <p className="mt-3 font-bold">
            ✨ {data.wow_message}
          </p>
        )}
      </div>

      {/* 🔮 PREDICTION */}
      <div className="bg-white p-5 rounded-xl mb-6 shadow">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <TrendingUp /> Prévision mois prochain
        </h2>
        <p>⚡ Énergie: {data.prediction.energy} kWh</p>
        <p>💧 Eau: {data.prediction.water} m³</p>
        <p>♻️ Déchets: {data.prediction.waste} kg</p>
      </div>

      {/* AI RECOMMENDATIONS */}
      <div className="space-y-4 mb-8">
        {data.recommendations.map((rec, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border-l-4 border-emerald-500"
          >
            <div className="flex gap-3">
              {getIcon(rec.type)}

              <div>
                <h3 className="font-bold">{rec.title}</h3>
                <p className="text-gray-500">{rec.description}</p>

                {rec.tips && (
                  <ul className="text-sm mt-2 list-disc ml-5 text-gray-600">
                    {rec.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SMART ALERTS */}
      <h2 className="font-bold mb-4">Alertes intelligentes</h2>

      <div className="space-y-4">
        {smartAdvice.map((a, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border-l-4 border-orange-400"
          >
            <div className="flex gap-3">
              <AlertTriangle className="text-orange-500" />
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="text-gray-500">{a.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ANALYSIS */}
      <div className="grid grid-cols-3 gap-4 mt-10">
        <Card label="Score" value={`${data.analysis.score}/100`} />
        <Card label="Économie" value={`${data.analysis.savings}€`} />
        <Card label="CO2" value={`${data.analysis.co2Saved} kg`} />
      </div>
    </div>
  );
}

// =========================
// CARD
// =========================
const Card = ({ label, value }) => (
  <div className="bg-white p-5 rounded-xl text-center shadow">
    <p className="text-gray-400">{label}</p>
    <h2 className="text-2xl font-bold text-emerald-600">{value}</h2>
  </div>
);