import React, { useState, useEffect } from "react";
import {
  Zap,
  Droplets,
  Trash2,
  Award,
  CheckCircle,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Objectives() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH
  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/objectives");
      setData(res.data);
    } catch (err) {
      console.log(err);

      // fallback
      setData({
        goals: [
          { id: 1, title: "Réduire énergie", target: 15, current: 10.7, type: "energy" },
          { id: 2, title: "Réduire eau", target: 20, current: 13.5, type: "water" },
          { id: 3, title: "Réduire déchets", target: 25, current: 20, type: "waste" },
        ],
        badges: [
          { id: 1, name: "Eco", desc: "3 mois", obtained: true, type: "general" },
          { id: 2, name: "Water", desc: "15%", obtained: true, type: "water" },
          { id: 3, name: "Energy", desc: "10%", obtained: true, type: "energy" },
          { id: 4, name: "Waste", desc: "20%", obtained: false, type: "waste" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Chargement...</div>;

  // 🎯 helpers
  const getIcon = (type) => {
    if (type === "energy") return <Zap />;
    if (type === "water") return <Droplets />;
    if (type === "waste") return <Trash2 />;
    return <Award />;
  };

  const getColor = (type) => {
    if (type === "energy") return "bg-yellow-400";
    if (type === "water") return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAV */}
      <nav className="bg-white px-12 py-4 flex justify-between border-b">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-emerald-600 cursor-pointer"
        >
          GreenLife
        </h1>

        <div className="flex gap-8 text-gray-500">
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/add-record")}>
            Relevés
          </button>

          <button
            className="text-emerald-600 border-b-2 border-emerald-600"
          >
            Objectifs
          </button>

          <button onClick={() => navigate("/alerts")}>
            Alertes
          </button>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full flex gap-2"
        >
          <User size={18} /> Mon compte
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8">

        <h2 className="text-3xl font-bold mb-10">
          Mes objectifs
        </h2>

        {/* GOALS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {data.goals.map((goal) => {
            let percent = (goal.current / goal.target) * 100;
            if (percent > 100) percent = 100;

            const remaining = (goal.target - goal.current).toFixed(1);

            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">

                <div className="flex gap-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    {getIcon(goal.type)}
                  </div>

                  <div>
                    <h3 className="font-bold">{goal.title}</h3>
                    <p className="text-xs text-gray-400">
                      Objectif {goal.target}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span>{goal.current}%</span>
                  <span>{goal.target}%</span>
                </div>

                {/* PROGRESS */}
                <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
                  <div
                    className={`h-3 rounded-full ${getColor(goal.type)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  reste {remaining}%
                </p>
              </div>
            );
          })}
        </div>

        {/* BADGES */}
        <div className="grid md:grid-cols-4 gap-6">
          {data.badges.map((b) => (
            <div
              key={b.id}
              className={`p-6 rounded-xl text-center transition ${
                b.obtained
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-100 opacity-60"
              }`}
            >
              <div className="mb-3 flex justify-center">
                {getIcon(b.type)}
              </div>

              <h4 className="font-bold">{b.name}</h4>

              <p className="text-xs text-gray-400 mb-3">
                {b.desc}
              </p>

              {b.obtained ? (
                <span className="text-green-600 text-sm flex justify-center gap-1">
                  <CheckCircle size={14} /> Obtenu
                </span>
              ) : (
                <span className="text-gray-400 text-sm">
                  Locked
                </span>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}