import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Zap, Droplets, Trash2, PlusCircle, TrendingUp, TrendingDown,
  Calendar, Leaf, Home, BarChart3, Target, Award,
  Settings, LogOut, AlertCircle, ChevronRight, Bell,
  User, RefreshCw, Filter, Download, Search, X,
  Activity, Clock, MapPin, Thermometer, Cloud
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ==================== CONSTANTES ====================
const API_URL = "http://localhost:5000/api/consumptions";

// ==================== COMPOSANT PRINCIPAL ====================
export default function Dashboard() {
  const navigate = useNavigate();
  
  // ==================== ÉTATS ====================
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showStats, setShowStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==================== STATISTIQUES ====================
  const [stats, setStats] = useState({
    energy: { value: 0, trend: 0, co2: 0 },
    water: { value: 0, trend: 0, co2: 0 },
    waste: { value: 0, trend: 0, co2: 0 },
    total: { co2: 0, count: 0 }
  });

  // ==================== RÉCUPÉRATION USER INFO ====================
  const getAuthToken = useCallback(() => {
    try {
      // Essayer plusieurs formats de stockage
      const token = localStorage.getItem("token");
      if (token) return token;

      const userStored = localStorage.getItem("userInfo");
      if (userStored) {
        const parsed = JSON.parse(userStored);
        return parsed?.token || null;
      }

      const user = localStorage.getItem("user");
      if (user) {
        return localStorage.getItem("token");
      }

      return null;
    } catch (e) {
      console.error("❌ Erreur récupération token:", e);
      return null;
    }
  }, []);

  const getUserInfo = useCallback(() => {
    try {
      const userStored = localStorage.getItem("userInfo");
      if (userStored) {
        const parsed = JSON.parse(userStored);
        return parsed?.user || parsed;
      }

      const user = localStorage.getItem("user");
      if (user) {
        return JSON.parse(user);
      }

      return null;
    } catch (e) {
      console.error("❌ Erreur récupération userInfo:", e);
      return null;
    }
  }, []);

  // ==================== CALCULS STATISTIQUES ====================
  const calculateStats = useCallback((data) => {
    if (!Array.isArray(data)) {
      console.warn("⚠️ calculateStats: data n'est pas un tableau", data);
      return;
    }

    const newStats = {
      energy: { value: 0, trend: 0, co2: 0 },
      water: { value: 0, trend: 0, co2: 0 },
      waste: { value: 0, trend: 0, co2: 0 },
      total: { co2: 0, count: data.length }
    };

    // Calcul par type
    data.forEach(item => {
      const val = Number(item?.valeur) || 0;
      const co2 = Number(item?.co2) || 0;
      const type = item?.type?.toLowerCase().trim();

      if (type === "energie" || type === "electricite") {
        newStats.energy.value += val;
        newStats.energy.co2 += co2;
      } else if (type === "eau") {
        newStats.water.value += val;
        newStats.water.co2 += co2;
      } else if (type === "dechets") {
        newStats.waste.value += val;
        newStats.waste.co2 += co2;
      }
      
      newStats.total.co2 += co2;
    });

    // Arrondir les valeurs
    newStats.energy.value = parseFloat(newStats.energy.value.toFixed(1));
    newStats.energy.co2 = parseFloat(newStats.energy.co2.toFixed(1));
    newStats.water.value = parseFloat(newStats.water.value.toFixed(1));
    newStats.water.co2 = parseFloat(newStats.water.co2.toFixed(1));
    newStats.waste.value = parseFloat(newStats.waste.value.toFixed(1));
    newStats.waste.co2 = parseFloat(newStats.waste.co2.toFixed(1));
    newStats.total.co2 = parseFloat(newStats.total.co2.toFixed(1));

    // Calcul des tendances (basé sur les données réelles si possible)
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthData = data.filter(item => {
      const date = new Date(item.dateConsommation);
      return date >= thisMonth;
    });

    const lastMonthData = data.filter(item => {
      const date = new Date(item.dateConsommation);
      return date >= lastMonth && date < thisMonth;
    });

    // Calculer les tendances par type
    const calcTrend = (thisMonthItems, lastMonthItems, field = 'valeur') => {
      const thisSum = thisMonthItems.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
      const lastSum = lastMonthItems.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
      
      if (lastSum > 0) {
        return parseFloat(((thisSum - lastSum) / lastSum * 100).toFixed(1));
      }
      return thisSum > 0 ? 100 : 0;
    };

    newStats.energy.trend = calcTrend(
      thisMonthData.filter(i => i.type === "energie" || i.type === "electricite"),
      lastMonthData.filter(i => i.type === "energie" || i.type === "electricite")
    );
    newStats.water.trend = calcTrend(
      thisMonthData.filter(i => i.type === "eau"),
      lastMonthData.filter(i => i.type === "eau")
    );
    newStats.waste.trend = calcTrend(
      thisMonthData.filter(i => i.type === "dechets"),
      lastMonthData.filter(i => i.type === "dechets")
    );

    setStats(newStats);
  }, []);

  // ==================== RÉCUPÉRATION DONNÉES ====================
  const fetchData = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      console.warn("⚠️ Aucun token trouvé, redirection vers login");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer les infos utilisateur
      const user = getUserInfo();
      setUserInfo(user);

      console.log("📡 Récupération des données depuis:", API_URL);

      // Récupérer les consommations
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📥 Réponse API:", res.data);

      let data = [];
      
      // Gérer différents formats de réponse
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.consumptions) {
        data = res.data.consumptions;
      } else if (res.data?.data?.consumptions) {
        data = res.data.data.consumptions;
      } else if (res.data?.data?.data) {
        data = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else {
        console.warn("⚠️ Format de réponse inconnu:", res.data);
        data = [];
      }

      console.log(`✅ ${data.length} consommations chargées`);
      setConsumptions(data);
      calculateStats(data);

    } catch (err) {
      console.error("❌ Erreur fetch:", err);
      
      if (err.response) {
        // Erreur serveur avec réponse
        if (err.response.status === 401) {
          console.warn("🔒 Token invalide, déconnexion");
          localStorage.clear();
          navigate("/login");
        } else if (err.response.status === 404) {
          setError("API introuvable. Vérifiez l'URL du serveur.");
        } else if (err.response.status === 500) {
          setError("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setError(err.response.data?.message || `Erreur ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Pas de réponse du serveur
        setError("🚫 Serveur injoignable. Vérifiez que le backend tourne sur le port 5000.");
      } else {
        // Erreur de configuration
        setError(`Erreur: ${err.message || "Une erreur inattendue est survenue."}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthToken, getUserInfo, navigate, calculateStats]); // ✅ Toutes les dépendances

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== SUPPRESSION ====================
  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Voulez-vous vraiment supprimer ce relevé ?")) return;
    
    const token = getAuthToken();
    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setConsumptions(prev => {
        const newData = prev.filter(item => item._id !== id);
        calculateStats(newData);
        return newData;
      });

    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      const msg = err.response?.data?.message || "La suppression a échoué.";
      setError(msg);
    }
  };

  // ==================== FILTRAGE ET TRI ====================
  const filteredConsumptions = useMemo(() => {
    let result = [...consumptions];

    // Filtre par type
    if (filter !== "all") {
      result = result.filter(item => {
        const type = item.type?.toLowerCase().trim();
        if (filter === "energie") return type === "energie" || type === "electricite";
        if (filter === "eau") return type === "eau";
        if (filter === "dechets") return type === "dechets";
        return true;
      });
    }

    // Recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        item.type?.toLowerCase().includes(term) ||
        item.valeur?.toString().includes(term) ||
        item.unite?.toLowerCase().includes(term) ||
        item.details?.devices?.some(d => d.toLowerCase().includes(term)) ||
        item.details?.notes?.toLowerCase().includes(term)
      );
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.dateConsommation) - new Date(a.dateConsommation);
      }
      if (sortBy === "valeur") {
        return (b.valeur || 0) - (a.valeur || 0);
      }
      if (sortBy === "type") {
        return (a.type || "").localeCompare(b.type || "");
      }
      return 0;
    });

    return result;
  }, [consumptions, filter, searchTerm, sortBy]);

  // ==================== ACTIONS ====================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleExport = () => {
    if (filteredConsumptions.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const exportData = filteredConsumptions.map(item => ({
      type: item.type,
      valeur: item.valeur,
      unite: item.unite,
      co2: item.co2,
      date: new Date(item.dateConsommation).toISOString(),
      details: item.details
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `greenlife-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  // ==================== RENDU ====================
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      
      {/* ========== SIDEBAR ========== */}
      <aside className="w-64 bg-white shadow-xl flex flex-col fixed h-full z-40 border-r border-gray-100">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl shadow-lg">
              <Leaf size={24} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                GreenLife
              </span>
              <p className="text-[10px] text-gray-400 font-medium">Tableau de bord</p>
            </div>
          </div>
        </div>

        {/* Profil utilisateur */}
        {userInfo && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-700 truncate">
                  {userInfo.prenom || ''} {userInfo.nom || ''}
                </p>
                <p className="text-xs text-gray-400 truncate">{userInfo.email || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<Home size={20} />} label="Dashboard" active onClick={() => navigate("/dashboard")} />
          <NavItem icon={<PlusCircle size={20} />} label="Nouveau relevé" onClick={() => navigate("/add-record")} />
          <NavItem icon={<BarChart3 size={20} />} label="Statistiques" onClick={() => navigate("/statistics")} />
          <NavItem icon={<Target size={20} />} label="Objectifs" onClick={() => navigate("/objectives")} />
          <NavItem icon={<Award size={20} />} label="Classement" onClick={() => navigate("/ranking")} />
          <NavItem icon={<Bell size={20} />} label="Alertes" onClick={() => navigate("/alerts")} />
          <NavItem icon={<Settings size={20} />} label="Réglages" onClick={() => navigate("/settings")} />
        </nav>

        {/* Déconnexion */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ========== CONTENU PRINCIPAL ========== */}
      <div className="flex-1 ml-64">
        <main className="p-6 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-800">
                👋 Bonjour{userInfo?.prenom ? `, ${userInfo.prenom}` : ''} !
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                Suivez l'impact de vos habitudes au quotidien
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={consumptions.length === 0}
                className="flex items-center gap-2 bg-white text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50 text-sm font-medium"
              >
                <Download size={16} />
                Export
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "..." : "Actu."}
              </button>
              
              <button
                onClick={() => navigate("/add-record")}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-sm font-bold"
              >
                <PlusCircle size={18} />
                Nouvel ajout
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="font-medium text-sm flex-1">{error}</p>
              <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-lg transition">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="ÉNERGIE" 
              value={stats.energy.value} 
              co2={stats.energy.co2}
              trend={stats.energy.trend}
              unit="kWh" 
              color="from-amber-400 to-amber-600"
              bgColor="bg-amber-50"
              icon={<Zap size={24} className="text-white" />} 
            />
            <StatCard 
              title="EAU" 
              value={stats.water.value} 
              co2={stats.water.co2}
              trend={stats.water.trend}
              unit="m³" 
              color="from-blue-400 to-blue-600"
              bgColor="bg-blue-50"
              icon={<Droplets size={24} className="text-white" />} 
            />
            <StatCard 
              title="DÉCHETS" 
              value={stats.waste.value} 
              co2={stats.waste.co2}
              trend={stats.waste.trend}
              unit="kg" 
              color="from-red-400 to-red-600"
              bgColor="bg-red-50"
              icon={<Trash2 size={24} className="text-white" />} 
            />
          </div>

          {/* CO2 Total Badge */}
          {stats.total.co2 > 0 && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Leaf size={32} className="text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Empreinte carbone totale</p>
                  <p className="text-3xl font-black">{stats.total.co2.toFixed(1)} <span className="text-lg">kg CO₂</span></p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-emerald-100 text-sm">{stats.total.count} relevé{stats.total.count > 1 ? 's' : ''}</p>
                <p className="text-white/80 text-xs mt-1">
                  ≈ {Math.round(stats.total.co2 * 5)} km en voiture
                </p>
              </div>
            </div>
          )}

          {/* Barre de filtres et recherche */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "Tous" },
                  { key: "energie", label: "⚡ Énergie" },
                  { key: "eau", label: "💧 Eau" },
                  { key: "dechets", label: "🗑️ Déchets" }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      filter === f.key
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date">📅 Par date</option>
                <option value="valeur">📊 Par valeur</option>
                <option value="type">🏷️ Par type</option>
              </select>
            </div>
          </div>

          {/* Historique des relevés */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={22} />
                Historique des relevés
                <span className="text-sm font-normal text-gray-400">
                  ({filteredConsumptions.length})
                </span>
              </h2>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {showStats ? "Masquer stats" : "Afficher stats"}
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400 text-sm">Chargement de vos données...</p>
                </div>
              ) : filteredConsumptions.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredConsumptions.map((item, index) => (
                    <div 
                      key={item._id || index} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${
                          item.type === "energie" || item.type === "electricite" ? "bg-amber-100" :
                          item.type === "eau" ? "bg-blue-100" : "bg-red-100"
                        }`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-700 capitalize">
                            {item.type === "electricite" ? "Énergie" : item.type}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(item.dateConsommation).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            {item.details?.time && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {item.details.time}
                              </span>
                            )}
                            {item.details?.temperature && (
                              <span className="flex items-center gap-1">
                                <Thermometer size={12} />
                                {item.details.temperature}°C
                              </span>
                            )}
                          </div>
                          {item.details?.devices && item.details.devices.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.details.devices.slice(0, 3).map((device, i) => (
                                <span key={i} className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                  {device}
                                </span>
                              ))}
                              {item.details.devices.length > 3 && (
                                <span className="text-[10px] text-gray-400">
                                  +{item.details.devices.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div>
                            <span className="text-xl font-black text-gray-800">{item.valeur}</span>
                            <span className="ml-1.5 text-xs font-medium text-gray-400 uppercase">{item.unite}</span>
                          </div>
                          {item.co2 > 0 && (
                            <div className="text-[10px] font-bold text-emerald-500 mt-0.5">
                              {item.co2.toFixed(1)} kg CO₂
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(item._id)} 
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-400 font-medium text-lg">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun relevé disponible"}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {searchTerm ? "Essayez un autre terme de recherche" : "Commencez par ajouter votre premier relevé"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate("/add-record")}
                      className="mt-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm font-bold"
                    >
                      + Ajouter un relevé
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ==================== COMPOSANTS ====================

function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
        active 
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
          : "text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
      }`}
    >
      <span className={`${active ? "" : "group-hover:scale-110"} transition-transform`}>
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight className="ml-auto" size={16} />}
    </div>
  );
}

function StatCard({ title, value, co2, trend, unit, color, bgColor, icon }) {
  return (
    <div className={`${bgColor} p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} p-3 rounded-xl shadow-lg`}>
          {icon}
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend < 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}>
            {trend < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-gray-800">
          {Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
        </h3>
        <span className="text-sm font-medium text-gray-400 uppercase">{unit}</span>
      </div>
      
      {co2 > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <Leaf size={12} />
          {co2.toFixed(1)} kg CO₂
        </div>
      )}
    </div>
  );
}

function getTypeIcon(type) {
  const t = type?.toLowerCase().trim();
  if (t === "energie" || t === "electricite") return <Zap size={20} className="text-amber-500" />;
  if (t === "eau") return <Droplets size={20} className="text-blue-500" />;
  return <Trash2 size={20} className="text-red-500" />;
}