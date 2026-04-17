import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Statistics() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "Electricite",
    valeur: "",
    unite: "kWh"
  });

  // ================= AUTO CLEAR ERROR =================
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // ================= FETCH =================
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/consumptions/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const formatted = res.data.stats.map((s) => {
        const goal = res.data.goals.find(
          (g) =>
            g.type_conso?.toLowerCase() === s._id?.toLowerCase()
        );

        return {
          name: s._id,
          value: s.total || 0,
          unit: s.unit || "",
          target: goal?.valeur_cible || 100,
          color:
            s._id === "electricite"
              ? "#EAB308"
              : s._id === "eau"
              ? "#3B82F6"
              : "#F97316"
        };
      });

      setData(formatted);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);

      if (err.response) {
        const status = err.response.status;

        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(err.response.data?.message || "Erreur serveur");
      } else if (err.request) {
        setError("Serveur injoignable ❌");
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= ADD =================
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/consumptions",
        {
          ...formData,
          type: formData.type.toLowerCase()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowAdd(false);
      setFormData({
        type: "Electricite",
        valeur: "",
        unite: "kWh"
      });

      fetchData();
    } catch (err) {
      console.error("ADD ERROR:", err);

      if (err.response) {
        const msg =
          err.response.data?.message ||
          "Erreur lors de l'ajout";

        setError(msg);

        if (err.response.status === 400) {
          setError("Données invalides ❌");
        }
      } else if (err.request) {
        setError("Pas de réponse du serveur ❌");
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const isEmpty = data.length === 0;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="flex-1 text-sm">{error}</span>
          <X
            size={18}
            className="cursor-pointer"
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* EMPTY */}
      {isEmpty ? (
        <div className="text-center text-gray-400 mt-20">
          📭 Aucune donnée disponible
        </div>
      ) : (
        <>
          {/* CHART */}
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="font-bold mb-4">Évolution</h2>

            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="valeur"
                    stroke="#10B981"
                    fill="#10B98133"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-center py-10">
                Pas d’historique 📊
              </div>
            )}
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((item, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow"
              >
                <p className="text-gray-500 capitalize">
                  {item.name}
                </p>

                <h3 className="text-xl font-bold">
                  {item.value} {item.unit}
                </h3>

                <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                  <div
                    className="h-2 bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (item.value / (item.target || 1)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleAdd}
            className="bg-white p-6 rounded-2xl w-96"
          >
            <h2 className="font-bold mb-4">Nouvelle consommation</h2>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value
                })
              }
              className="w-full mb-3 p-2 border rounded"
            >
              <option>Electricite</option>
              <option>Eau</option>
              <option>Dechets</option>
            </select>

            <input
              type="number"
              placeholder="Valeur"
              value={formData.valeur}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valeur: e.target.value
                })
              }
              className="w-full mb-3 p-2 border rounded"
            />

            <button
              disabled={submitLoading}
              className="w-full bg-emerald-600 text-white p-2 rounded"
            >
              {submitLoading ? "Enregistrement..." : "Ajouter"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}