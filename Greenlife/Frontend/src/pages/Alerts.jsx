import React, { useState, useEffect } from "react";
import { Zap, Droplets, Trash2, User, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Alerts() {
  const navigate = useNavigate();

  const [thresholds, setThresholds] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res1 = await axios.get("http://localhost:5000/api/thresholds");
      const res2 = await axios.get("http://localhost:5000/api/alerts");

      setThresholds(res1.data);
      setRecentAlerts(res2.data);
    } catch (err) {
      console.log(err);

      // fallback
      setThresholds([
        { id: "energy", label: "Énergie", current: 1250, unit: "kWh", limit: 1500, active: true, type: "energy" },
        { id: "water", label: "Eau", current: 45, unit: "m³", limit: 60, active: true, type: "water" },
        { id: "waste", label: "Déchets", current: 12, unit: "kg", limit: 20, active: true, type: "waste" },
      ]);

      setRecentAlerts([
        { id: 1, type: "Énergie", msg: "Consommation élevée", date: "10 fév", critical: true },
        { id: 2, type: "Eau", msg: "Seuil proche", date: "8 fév", critical: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ICON
  const getIcon = (type) => {
    if (type === "energy") return <Zap className="text-yellow-500" />;
    if (type === "water") return <Droplets className="text-blue-500" />;
    return <Trash2 className="text-orange-500" />;
  };

  // ✅ TOGGLE
  const handleToggle = (id) => {
    setThresholds((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, active: !t.active } : t
      )
    );
  };

  // ✅ CHANGE LIMIT
  const handleLimitChange = (id, value) => {
    setThresholds((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, limit: Number(value) } : t
      )
    );
  };

  // ✅ SAVE
  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/api/thresholds", thresholds);
      alert("Sauvegardé ✅");
    } catch (err) {
      console.log(err);
      alert("Erreur ❌");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Chargement...</div>;

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

          <button className="text-emerald-600 border-b-2 border-emerald-600">
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

      <main className="max-w-6xl mx-auto p-8">

        <h2 className="text-3xl font-bold mb-10">
          Gestion des alertes
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-6">Seuils</h3>

            {thresholds.map((t) => (
              <div key={t.id} className="mb-6">

                <div className="flex justify-between mb-2">
                  <div className="flex gap-3 items-center">
                    {getIcon(t.type)}
                    <span>{t.label}</span>
                  </div>

                  <button
                    onClick={() => handleToggle(t.id)}
                    className={`w-12 h-6 rounded-full transition ${
                      t.active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                <input
                  type="number"
                  value={t.limit}
                  onChange={(e) =>
                    handleLimitChange(t.id, e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />

                {t.active && t.current >= t.limit && (
                  <p className="text-red-500 text-xs flex gap-1 mt-1">
                    <AlertTriangle size={14} /> Alerte
                  </p>
                )}
              </div>
            ))}

            <button
              onClick={handleSave}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700"
            >
              Enregistrer
            </button>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-6">Alertes récentes</h3>

            {recentAlerts.length === 0 ? (
              <p className="text-gray-400">Aucune alerte</p>
            ) : (
              recentAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 mb-3 rounded ${
                    a.critical ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <p className="font-bold">{a.msg}</p>
                  <p className="text-xs text-gray-500">{a.date}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}