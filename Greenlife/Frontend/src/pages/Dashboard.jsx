import React, { useState, useEffect, useCallback } from "react";
import {
  Zap, Droplets, Trash2, PlusCircle, TrendingUp,
  Calendar, Leaf, Home, BarChart3,
  Settings, LogOut, AlertCircle, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ energy: 0, water: 0, waste: 0 });

  const API_URL = "http://localhost:5000/api/consumptions";

  // Calcul des statistiques avec sécurité sur les types
  const calculateStats = useCallback((data) => {
    const newStats = data.reduce(
      (acc, curr) => {
        const val = Number(curr?.valeur) || 0;
        const type = curr?.type?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (type === "energie") acc.energy += val;
        else if (type === "eau") acc.water += val;
        else if (type === "dechets" || type === "waste" || type === "déchets") acc.waste += val;
        return acc;
      },
      { energy: 0, water: 0, waste: 0 }
    );
    setStats(newStats);
  }, []);

  // Récupération des données avec gestion d'erreur complète
  const fetchData = useCallback(async () => {
    let userInfo = {};
    try {
      const userStored = localStorage.getItem("userInfo");
      userInfo = userStored ? JSON.parse(userStored) : {};
    } catch (e) {
      console.error("Erreur de lecture du localStorage", e);
    }

    if (!userInfo.token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.consumptions || [];
      setConsumptions(data);
      calculateStats(data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("userInfo");
          navigate("/login");
        } else {
          setError(err.response.data?.message || "Erreur lors du chargement des données.");
        }
      } else if (err.request) {
        setError("Serveur injoignable. Vérifiez votre connexion API (Port 5000).");
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, calculateStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Suppression d'un relevé
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce relevé ?")) return;
    
    try {
      const userStored = localStorage.getItem("userInfo");
      const token = userStored ? JSON.parse(userStored).token : "";

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setConsumptions(prev => {
        const newData = prev.filter(item => item._id !== id);
        calculateStats(newData);
        return newData;
      });
    } catch (err) {
      const msg = err.response?.data?.message || "La suppression a échoué.";
      alert(`Erreur : ${msg}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* SIDEBAR GAUCHE - Z-index élevé pour rester au-dessus */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col z-[60]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-lg text-white">
              <Leaf size={24} fill="currentColor" />
            </div>
            <span className="hidden lg:block font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500">
              GreenLife
            </span>
          </div>
          <nav className="space-y-3">
            <NavItem icon={<Home size={22}/>} label="Dashboard" active onClick={() => navigate("/dashboard")} />
            <NavItem icon={<BarChart3 size={22}/>} label="Analyses" onClick={() => navigate("/statistics")} />
            <NavItem icon={<Settings size={22}/>} label="Réglages" onClick={() => navigate("/settings")} />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={() => { localStorage.removeItem("userInfo"); navigate("/login"); }} 
            className="flex items-center gap-4 w-full p-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
          >
            <LogOut size={22} />
            <span className="hidden lg:block font-bold">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      
      <main className="flex-1 ml-20 lg:ml-64 pt-32 lg:pt-44 p-6 lg:p-12 min-h-screen overflow-y-auto">
        
        {/* Header avec Titre et Bouton */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Vue d'ensemble</h1>
            <p className="text-slate-500 font-medium mt-1">Suivez l'impact de vos habitudes au quotidien.</p>
          </div>

          <button
            onClick={() => navigate("/add-record")}
            className="flex items-center justify-center gap-2 bg-[#059669] text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <PlusCircle size={20} />
            <span className="font-bold">Nouvel ajout</span>
          </button>
        </header>

        {/* Affichage de l'erreur */}
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-pulse">
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* CARTES DE STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title="Énergie" value={stats.energy} unit="kWh" gradient="from-amber-400 to-orange-500" icon={<Zap fill="currentColor"/>} />
          <StatCard title="Eau" value={stats.water} unit="m³" gradient="from-blue-400 to-cyan-500" icon={<Droplets fill="currentColor"/>} />
          <StatCard title="Déchets" value={stats.waste} unit="kg" gradient="from-rose-400 to-pink-500" icon={<Trash2 fill="currentColor"/>} />
        </div>

        {/* TABLEAU HISTORIQUE */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-emerald-500" size={24} />
              Historique des relevés
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : consumptions.length > 0 ? (
              <div className="space-y-3">
                {consumptions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all group border border-transparent hover:border-emerald-100">
                    <div className="flex items-center gap-5">
                      <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-700 capitalize tracking-tight">{item.type}</h4>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1">
                          <Calendar size={14} />
                          {new Date(item.dateConsommation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-800">{item.valeur}</span>
                        <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unite}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic font-medium">Aucun relevé disponible pour le moment.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Composants utilitaires
function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
        active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-400 hover:bg-slate-50 hover:text-emerald-600"
      }`}
    >
      <span>{icon}</span>
      <span className="hidden lg:block font-bold tracking-tight">{label}</span>
      {active && <ChevronRight className="ml-auto hidden lg:block" size={16} />}
    </div>
  );
}

function StatCard({ title, value, unit, gradient, icon }) {
  return (
    <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className={`mb-6 p-4 w-fit rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
          {Number(value || 0).toLocaleString()}
        </h3>
        <span className="text-sm font-black text-slate-300 uppercase">{unit}</span>
      </div>
    </div>
  );
}

function getIcon(type) {
  const t = type?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (t === "energie") return <Zap size={22} className="text-amber-500" fill="currentColor" />;
  if (t === "eau") return <Droplets size={22} className="text-blue-500" fill="currentColor" />;
  return <Trash2 size={22} className="text-rose-500" fill="currentColor" />;
}