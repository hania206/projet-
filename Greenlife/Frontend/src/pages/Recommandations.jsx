import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Lightbulb, Droplets, Trash2, Target, Leaf,
  AlertTriangle, Sparkles, TrendingUp, TrendingDown,
  Award, Zap, Shield, Loader2, RefreshCw
} from "lucide-react";

export default function Recommandations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consumptions, setConsumptions] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo?.token) throw new Error("Non connecté");

        const headers = { Authorization: `Bearer ${userInfo.token}` };

        const [aiRes, consRes] = await Promise.all([
          axios.get("http://localhost:5000/api/ai", { headers }),
          axios.get("http://localhost:5000/api/consumptions", { headers })
        ]);

        if (!mounted) return;

        setConsumptions(consRes.data?.consumptions || consRes.data?.data || consRes.data || []);
        setData(aiRes.data);

      } catch (err) {
        if (mounted) setError(err.response?.data?.message || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  const smartAlerts = useMemo(() => {
    if (!consumptions.length) return [];
    const totals = { energy: 0, water: 0, waste: 0 };
    
    consumptions.forEach(c => {
      const v = Number(c.valeur) || 0;
      const t = (c.type || "").toLowerCase();
      if (t.includes("energie")) totals.energy += v;
      else if (t.includes("eau")) totals.water += v;
      else if (t.includes("dechet")) totals.waste += v;
    });

    const alerts = [];
    if (totals.energy > 500) alerts.push({ type: "energy", icon: <Zap size={16} />, msg: `Énergie élevée : ${totals.energy.toFixed(0)} kWh`, color: "amber" });
    if (totals.water > 30) alerts.push({ type: "water", icon: <Droplets size={16} />, msg: `Eau élevée : ${totals.water.toFixed(1)} m³`, color: "blue" });
    if (totals.waste > 10) alerts.push({ type: "waste", icon: <Trash2 size={16} />, msg: `Déchets élevés : ${totals.waste.toFixed(0)} kg`, color: "red" });
    
    return alerts;
  }, [consumptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-bold">Analyse IA en cours...</p>
          <p className="text-gray-400 text-sm">Génération de vos recommandations personnalisées</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 p-8 rounded-2xl max-w-md">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-600 font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
            <RefreshCw size={14} className="inline mr-1" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const recommendations = data?.recommendations || [];
  const analysis = data?.analysis || { score: 0, savings: 0, co2Saved: 0 };
  const prediction = data?.prediction || { energy: 0, water: 0, waste: 0 };

  return (
    <div className="space-y-8 pb-8">
      
      {/* 🌟 HEADER */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-amber-300" size={28} />
            <h1 className="text-3xl font-black">Recommandations IA</h1>
          </div>
          <p className="text-emerald-100 max-w-xl">{data?.summary || "Analyse de vos habitudes"}</p>
          {data?.wow_message && (
            <p className="mt-3 text-amber-200 font-bold">✨ {data.wow_message}</p>
          )}
        </div>
      </div>

      {/* 📊 SCORE CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard icon={<Award size={24} />} label="Score Éco" value={`${analysis.score}/100`} color="emerald" />
        <ScoreCard icon={<TrendingDown size={24} />} label="Économies" value={`${analysis.savings}€`} color="blue" />
        <ScoreCard icon={<Leaf size={24} />} label="CO2 Évité" value={`${analysis.co2Saved} kg`} color="green" />
      </div>

      {/* 🔮 PRÉDICTIONS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
          <TrendingUp className="text-emerald-500" size={22} />
          Prévisions du mois prochain
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <PredCard icon={<Zap size={20} />} label="Énergie" value={`${prediction.energy} kWh`} color="amber" />
          <PredCard icon={<Droplets size={20} />} label="Eau" value={`${prediction.water} m³`} color="blue" />
          <PredCard icon={<Trash2 size={20} />} label="Déchets" value={`${prediction.waste} kg`} color="red" />
        </div>
      </div>

      {/* ⚠️ ALERTES */}
      {smartAlerts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-500" size={22} />
            Alertes intelligentes
          </h2>
          <div className="space-y-2">
            {smartAlerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 bg-${alert.color}-50 rounded-xl border border-${alert.color}-100`}>
                <span className={`text-${alert.color}-500`}>{alert.icon}</span>
                <p className="text-sm font-medium text-gray-700">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💡 RECOMMANDATIONS */}
      <div>
        <h2 className="font-bold text-lg mb-4">Conseils personnalisés</h2>
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl ${
                  rec.type === "energy" ? "bg-amber-100 text-amber-600" :
                  rec.type === "water" ? "bg-blue-100 text-blue-600" :
                  "bg-emerald-100 text-emerald-600"
                }`}>
                  {rec.type === "energy" ? <Zap size={22} /> :
                   rec.type === "water" ? <Droplets size={22} /> :
                   <Trash2 size={22} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{rec.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{rec.description}</p>
                  {rec.tips && (
                    <ul className="space-y-1">
                      {rec.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon, label, value, color }) {
  const colors = {
    emerald: "from-emerald-500 to-green-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-teal-500"
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="text-xs text-white/80 font-medium">{label}</p>
    </div>
  );
}

function PredCard({ icon, label, value, color }) {
  const colors = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600"
  };
  return (
    <div className={`${colors[color]} rounded-xl p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}