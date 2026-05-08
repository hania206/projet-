import React, { useState, useEffect, useCallback } from "react";
import {
  Zap, Droplets, Recycle, Target, Trash2,
  Lightbulb, ArrowRight, TrendingUp, Flame, PlusCircle,
  RefreshCw, AlertCircle, X, Edit3, Save, Calendar
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function Objectives() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ecoScore, setEcoScore] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    type_conso: "energy",
    valeur_cible: "",
    date_fin: ""
  });

  const getAuthToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) return token;
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return userInfo?.token || null;
    } catch (err) {
      console.error("❌ Erreur token:", err);
      return null;
    }
  }, []);

  const fetchObjectives = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      setError("Veuillez vous connecter");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`${API_URL}/api/objectives`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const goalsData = data.goals || data || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);

      // Calculer l'éco-score
      if (goalsData.length > 0) {
        const avg = goalsData.reduce((sum, g) => sum + (g.performance || 0), 0) / goalsData.length;
        setEcoScore(Math.round(avg));
      } else {
        setEcoScore(0);
      }
    } catch (err) {
      console.error("❌ Erreur fetch:", err);
      if (err.response?.status === 401) {
        setError("Session expirée");
        localStorage.clear();
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("API objectifs introuvable");
      } else {
        setError(err.response?.data?.message || "Erreur de chargement");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, navigate]);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  // Ajouter/Modifier un objectif
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!formData.valeur_cible || Number(formData.valeur_cible) <= 0) {
      setError("Veuillez entrer une valeur cible valide");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        type_conso: formData.type_conso,
        valeur_cible: Number(formData.valeur_cible),
        date_fin: formData.date_fin || undefined
      };

      if (editingGoal) {
        await axios.put(`${API_URL}/api/objectives/${editingGoal._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/objectives`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowAddForm(false);
      setEditingGoal(null);
      setFormData({ type_conso: "energy", valeur_cible: "", date_fin: "" });
      fetchObjectives();
    } catch (err) {
      console.error("❌ Erreur sauvegarde:", err);
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un objectif
  const deleteGoal = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet objectif ?")) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/objectives/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchObjectives();
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Éditer un objectif
  const startEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      type_conso: goal.type || "energy",
      valeur_cible: goal.target || "",
      date_fin: goal.date_fin ? new Date(goal.date_fin).toISOString().split('T')[0] : ""
    });
    setShowAddForm(true);
  };

  const getGoalDetails = (type) => {
    switch (type?.toLowerCase()) {
      case "energy": return { icon: <Zap className="text-yellow-500" />, unit: "kWh", label: "Énergie", color: "yellow" };
      case "water": return { icon: <Droplets className="text-blue-500" />, unit: "m³", label: "Eau", color: "blue" };
      case "waste": return { icon: <Recycle className="text-emerald-500" />, unit: "kg", label: "Déchets", color: "emerald" };
      default: return { icon: <Target className="text-gray-500" />, unit: "", label: type, color: "gray" };
    }
  };

  const getAdvice = (perf) => {
    if (perf > 80) return "🔥 Excellent ! Continuez ainsi !";
    if (perf > 50) return "👍 Bonne performance, vous pouvez faire mieux";
    return "⚠️ Attention, consommation un peu élevée";
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Chargement des objectifs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 md:p-6 font-sans">
      
      {/* ========== EN-TÊTE ========== */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Retour
          </button>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Objectifs 🌿</h1>
            <p className="text-emerald-100 text-lg">Maîtrisez votre consommation et agissez pour l'environnement.</p>
            <div className="mt-6 flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex gap-2 items-center text-sm">
                <TrendingUp size={16} /> Suivez votre progression
              </div>
              <button 
                onClick={() => { setEditingGoal(null); setFormData({ type_conso: "energy", valeur_cible: "", date_fin: "" }); setShowAddForm(true); }}
                className="bg-white text-emerald-600 px-4 py-2 rounded-xl flex gap-2 items-center text-sm font-bold hover:bg-emerald-50 transition"
              >
                <PlusCircle size={16} /> Nouvel objectif
              </button>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
          <div className="absolute right-10 top-0 bg-white/5 w-20 h-20 rounded-full"></div>
        </div>

        {/* Eco Score */}
        <div 
          className="bg-white p-6 rounded-3xl text-center shadow-md border-b-8 transition-all"
          style={{ borderBottomColor: ecoScore > 70 ? '#10b981' : ecoScore > 40 ? '#f59e0b' : '#ef4444' }}
        >
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Eco Score</p>
          <div className={`text-5xl font-black ${ecoScore > 70 ? 'text-emerald-600' : ecoScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
            {ecoScore}%
          </div>
          <p className="text-sm font-medium text-gray-500 mt-3">
            {ecoScore > 70 ? "🌍 Performance excellente" : ecoScore > 40 ? "📈 Bon travail !" : "⚠️ Besoin d'amélioration"}
          </p>
          <button onClick={fetchObjectives} className="mt-4 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mx-auto">
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      </div>

      {/* ========== ERREUR ========== */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-lg">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========== FORMULAIRE AJOUT/MODIFICATION ========== */}
      {showAddForm && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit3 size={20} className="text-emerald-500" />
              {editingGoal ? "Modifier l'objectif" : "Nouvel objectif"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={formData.type_conso}
                onChange={(e) => setFormData({ ...formData, type_conso: e.target.value })}
                className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="energy">⚡ Énergie</option>
                <option value="water">💧 Eau</option>
                <option value="waste">🗑️ Déchets</option>
              </select>
              <input
                type="number"
                placeholder="Valeur cible"
                value={formData.valeur_cible}
                onChange={(e) => setFormData({ ...formData, valeur_cible: e.target.value })}
                className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                min="1"
                required
              />
              <input
                type="date"
                value={formData.date_fin}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition">
                  {editingGoal ? "Modifier" : "Ajouter"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddForm(false); setEditingGoal(null); }}
                  className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LISTE DES OBJECTIFS ========== */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {goals.length === 0 && !loading ? (
            <div className="col-span-full bg-white p-16 rounded-3xl text-center shadow-sm border-2 border-dashed border-gray-200">
              <PlusCircle className="text-gray-300 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-800">Aucun objectif</h3>
              <p className="text-gray-500 mt-2 mb-6 text-sm">Définissez vos premiers objectifs de consommation.</p>
              <button 
                onClick={() => { setEditingGoal(null); setFormData({ type_conso: "energy", valeur_cible: "", date_fin: "" }); setShowAddForm(true); }}
                className="bg-emerald-600 text-white px-8 py-3 rounded-2xl hover:bg-emerald-700 transition-all font-bold"
              >
                Créer mon premier objectif
              </button>
            </div>
          ) : (
            goals.map(goal => {
              const { icon, unit, label, color } = getGoalDetails(goal.type);
              const perf = goal.performance || 0;
              const isBad = perf < 50;

              return (
                <div key={goal._id} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative group border border-slate-100">
                  {/* Badge streak */}
                  {goal.streak >= 3 && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-20 font-bold">
                      <Flame size={10} fill="white" /> {goal.streak} J
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 bg-${color}-50 rounded-2xl`}>{icon}</div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(goal)} className="text-gray-300 hover:text-emerald-500 transition-colors p-2" title="Modifier">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteGoal(goal._id)} className="text-gray-300 hover:text-red-500 transition-colors p-2" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold capitalize text-lg text-gray-800 mb-1">{label}</h3>
                  <p className="text-xs text-gray-400">Objectif: {goal.target} {unit}</p>
                  
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-2xl font-black text-slate-800">{goal.current || 0}</span>
                    <span className="text-gray-400 text-sm font-medium">{unit}</span>
                    <span className="mx-1 text-gray-300">/</span>
                    <span className="text-lg font-bold text-slate-600">{goal.target}</span>
                    <span className="text-gray-400 text-sm font-medium">{unit}</span>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full h-3 bg-slate-100 rounded-full mt-4 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isBad ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(perf, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-gray-400">{perf}%</span>
                    <p className={`text-xs font-bold ${isBad ? "text-red-500" : "text-emerald-600"}`}>
                      {isBad ? "⚠️ Élevé" : "✅ Bon"}
                    </p>
                  </div>

                  {/* Conseil */}
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <Lightbulb size={14} className="text-amber-500" />
                    </div>
                    <span className="font-medium text-sm text-slate-600">{getAdvice(perf)}</span>
                  </div>

                  {/* Jours suivis */}
                  <p className="text-[10px] text-gray-400 mt-3">
                    📅 {goal.daysTracked || 0} jour{goal.daysTracked > 1 ? 's' : ''} suivi{goal.daysTracked > 1 ? 's' : ''}
                    {goal.date_fin && <span> · Fin: {new Date(goal.date_fin).toLocaleDateString('fr-FR')}</span>}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <div className="max-w-6xl mx-auto mt-12 bg-slate-900 text-white p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white">🌍</div>
          <div>
            <h3 className="font-bold text-lg">Communauté Verte</h3>
            <p className="text-slate-400 text-sm">Défiez vos amis et comparez vos scores écologiques.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/ranking")}
          className="bg-white text-slate-900 px-8 py-3 rounded-2xl flex gap-2 items-center font-bold hover:bg-emerald-50 transition-all shadow-xl"
        >
          Rejoindre le défi <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}