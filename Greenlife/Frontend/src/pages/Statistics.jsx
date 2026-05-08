import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  ArrowLeft, BarChart3, History, Leaf, Droplets, 
  Zap, Trash2, Share2, TrendingDown, TrendingUp,
  Calendar, Download, RefreshCw, AlertCircle,
  Target, PieChart, Activity, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import axios from "axios";

// ==================== CONSTANTES ====================
const API_URL = "http://localhost:5000/api/consumptions";
const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

// ==================== COMPOSANT PRINCIPAL ====================
export default function Statistics() {
  const navigate = useNavigate();
  
  // ==================== ÉTATS ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7");
  const [chartType, setChartType] = useState("area");
  const [showPieChart, setShowPieChart] = useState(false);
  
  const [graphData, setGraphData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [impactStats, setImpactStats] = useState({
    electricite: { val: 0, trend: 0, co2: 0 },
    eau: { val: 0, trend: 0, co2: 0 },
    dechets: { val: 0, trend: 0, co2: 0 },
    co2: { val: 0, trend: 0 }
  });
  const [recentHistory, setRecentHistory] = useState([]);
  const [totalCO2, setTotalCO2] = useState(0);

  // ==================== RÉCUPÉRATION TOKEN ====================
  const getAuthToken = useCallback(() => {
    try {
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
    } catch (parseError) {
      console.error("❌ Erreur récupération token:", parseError);
      return null;
    }
  }, []);

  // ==================== RÉCUPÉRATION DONNÉES ====================
  const fetchStatistics = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("📡 Récupération des statistiques...");

      // Essayer l'endpoint stats, avec fallback
      let res;
      try {
        res = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Stats reçues du backend");
      } catch (statsEndpointError) {
        console.warn("⚠️ Endpoint /stats non disponible:", statsEndpointError.message);
        
        // Fallback: récupérer toutes les consommations
        try {
          res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("✅ Fallback: données brutes reçues");
        } catch (fallbackRequestError) {
          console.error("❌ Fallback également en échec:", fallbackRequestError.message);
          throw fallbackRequestError;
        }
      }

      console.log("📥 Réponse reçue:", res.data ? "OK" : "Vide");

      // Traitement des données
      let consumptions = [];
      
      if (res.data?.consumptions) {
        consumptions = res.data.consumptions;
      } else if (res.data?.data?.consumptions) {
        consumptions = res.data.data.consumptions;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        consumptions = res.data.data;
      } else if (Array.isArray(res.data)) {
        consumptions = res.data;
      }

      console.log(`📊 ${consumptions.length} consommations trouvées`);

      // Si on a des stats pré-calculées du backend
      if (res.data?.stats) {
        setImpactStats({
          electricite: { 
            val: res.data.stats.electricite?.val || 0, 
            trend: res.data.stats.electricite?.trend || 0,
            co2: res.data.stats.electricite?.co2 || 0
          },
          eau: { 
            val: res.data.stats.eau?.val || 0, 
            trend: res.data.stats.eau?.trend || 0,
            co2: res.data.stats.eau?.co2 || 0
          },
          dechets: { 
            val: res.data.stats.dechets?.val || 0, 
            trend: res.data.stats.dechets?.trend || 0,
            co2: res.data.stats.dechets?.co2 || 0
          },
          co2: { 
            val: res.data.stats.co2?.val || res.data.totalCo2 || 0, 
            trend: res.data.stats.co2?.trend || 0
          }
        });
        setTotalCO2(res.data.stats.co2?.val || res.data.totalCo2 || 0);
      } else if (consumptions.length > 0) {
        const stats = calculateStatsFromData(consumptions);
        if (stats) {
          setImpactStats(stats.impactStats);
          setTotalCO2(stats.totalCO2);
        }
      }

      // Données graphiques
      if (res.data?.graphique && res.data.graphique.length > 0) {
        setGraphData(res.data.graphique);
      } else if (consumptions.length > 0) {
        setGraphData(generateGraphData(consumptions, parseInt(timeRange)));
      }

      // Données camembert
      if (consumptions.length > 0) {
        setPieData(generatePieData(consumptions));
      }

      // Historique récent
      if (res.data?.history) {
        setRecentHistory(Array.isArray(res.data.history) ? res.data.history.slice(0, 7) : []);
      } else if (consumptions.length > 0) {
        setRecentHistory(consumptions.slice(0, 7));
      }

    } catch (mainError) {
      console.error("❌ Erreur statistiques:", mainError);
      
      if (mainError.response) {
        if (mainError.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else if (mainError.response.status === 404) {
          setError("API introuvable. Vérifiez l'URL du serveur.");
        } else if (mainError.response.status === 500) {
          setError("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setError(mainError.response.data?.message || `Erreur ${mainError.response.status}`);
        }
      } else if (mainError.request) {
        setError("🚫 Serveur injoignable. Vérifiez que le backend tourne sur le port 5000.");
      } else {
        setError(mainError.message || "Une erreur inattendue est survenue.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthToken, navigate, timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // ==================== FONCTIONS DE CALCUL ====================
  
  const calculateStatsFromData = (data) => {
    if (!Array.isArray(data)) return null;

    const stats = {
      electricite: { val: 0, trend: 0, co2: 0 },
      eau: { val: 0, trend: 0, co2: 0 },
      dechets: { val: 0, trend: 0, co2: 0 }
    };
    let totalCO2 = 0;

    data.forEach(item => {
      const val = Number(item?.valeur) || 0;
      const co2 = Number(item?.co2) || 0;
      const type = (item?.type || '').toLowerCase().trim();

      if (type === "energie" || type === "electricite") {
        stats.electricite.val += val;
        stats.electricite.co2 += co2;
      } else if (type === "eau") {
        stats.eau.val += val;
        stats.eau.co2 += co2;
      } else if (type === "dechets") {
        stats.dechets.val += val;
        stats.dechets.co2 += co2;
      }
      totalCO2 += co2;
    });

    return {
      impactStats: {
        electricite: { 
          val: parseFloat(stats.electricite.val.toFixed(1)), 
          trend: 0,
          co2: parseFloat(stats.electricite.co2.toFixed(1)) 
        },
        eau: { 
          val: parseFloat(stats.eau.val.toFixed(1)), 
          trend: 0,
          co2: parseFloat(stats.eau.co2.toFixed(1)) 
        },
        dechets: { 
          val: parseFloat(stats.dechets.val.toFixed(1)), 
          trend: 0,
          co2: parseFloat(stats.dechets.co2.toFixed(1)) 
        },
        co2: { 
          val: parseFloat(totalCO2.toFixed(1)), 
          trend: 0 
        }
      },
      totalCO2: parseFloat(totalCO2.toFixed(1))
    };
  };

  const generateGraphData = (data, days) => {
    if (!Array.isArray(data)) return [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    
    const filtered = data.filter(item => {
      const date = new Date(item.dateConsommation);
      return !isNaN(date.getTime()) && date >= startDate;
    });
    
    // Grouper par jour
    const grouped = {};
    filtered.forEach(item => {
      const date = new Date(item.dateConsommation);
      const key = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      
      if (!grouped[key]) {
        grouped[key] = { date: displayDate, valeur: 0, rawDate: key };
      }
      grouped[key].valeur += Number(item.valeur) || 0;
    });

    return Object.values(grouped)
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .map(({ date, valeur }) => ({ date, valeur: parseFloat(valeur.toFixed(1)) }));
  };

  const generatePieData = (data) => {
    if (!Array.isArray(data)) return [];

    const totals = { Énergie: 0, Eau: 0, Déchets: 0 };
    
    data.forEach(item => {
      const type = (item?.type || '').toLowerCase().trim();
      const val = Number(item?.valeur) || 0;
      
      if (type === "energie" || type === "electricite") totals.Énergie += val;
      else if (type === "eau") totals.Eau += val;
      else if (type === "dechets") totals.Déchets += val;
    });

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }));
  };

  // ==================== ACTIONS ====================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  const handleShare = async () => {
    const text = `🌱 Mon impact GreenLife :
⚡ Énergie: ${impactStats.electricite.val} kWh
💧 Eau: ${impactStats.eau.val} m³
🗑️ Déchets: ${impactStats.dechets.val} kg
🌍 CO2: ${totalCO2} kg`;

    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: 'Mon impact GreenLife', 
          text: text 
        });
        console.log("✅ Partage réussi");
      } catch (shareError) {
        // Vérifier si c'est une annulation utilisateur ou une vraie erreur
        if (shareError.name === 'AbortError') {
          console.log("ℹ️ Partage annulé par l'utilisateur");
        } else {
          console.error("❌ Erreur lors du partage:", shareError.message);
          // Fallback: copier dans le presse-papier
          try {
            await navigator.clipboard.writeText(text);
            alert("📋 Résumé copié dans le presse-papier !");
          } catch (clipboardError) {
            console.error("❌ Erreur presse-papier:", clipboardError.message);
            // Dernier recours: afficher dans une alerte
            alert("📊 Voici votre résumé :\n\n" + text);
          }
        }
      }
    } else {
      // Navigateur ne supporte pas Web Share API
      try {
        await navigator.clipboard.writeText(text);
        alert("📋 Résumé copié dans le presse-papier !");
      } catch (clipboardError) {
        console.error("❌ Erreur presse-papier:", clipboardError.message);
        // Dernier recours: afficher dans une alerte
        alert("📊 Voici votre résumé :\n\n" + text);
      }
    }
  };

  const handleExport = () => {
    try {
      const exportData = {
        stats: impactStats,
        totalCO2,
        graphData,
        history: recentHistory,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const fileName = `greenlife-stats-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      linkElement.click();
    } catch (exportError) {
      console.error("❌ Erreur export:", exportError.message);
      alert("Erreur lors de l'exportation des données.");
    }
  };

  // ==================== ÉQUIVALENCES CO2 ====================
  const co2Equivalents = useMemo(() => {
    if (!totalCO2 || totalCO2 <= 0) return [];
    
    return [
      { icon: "🌳", text: `${Math.round(totalCO2 * 0.05)} arbres nécessaires par an` },
      { icon: "🚗", text: `${Math.round(totalCO2 * 5)} km en voiture` },
      { icon: "💡", text: `${Math.round(totalCO2 * 10)} heures d'éclairage` },
      { icon: "📱", text: `${Math.round(totalCO2 * 20)} recharges de smartphone` }
    ];
  }, [totalCO2]);

  // ==================== RENDU ====================
  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* ========== HEADER ========== */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4 hover:text-emerald-700 transition group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Retour au Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Analyse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600">GreenLife</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Statistiques détaillées de votre impact environnemental
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Rafraîchir */}
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white text-slate-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 px-4"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              <span className="font-bold text-sm">{refreshing ? "..." : "Actu."}</span>
            </button>

            {/* Exporter */}
            <button 
              onClick={handleExport}
              className="p-3 bg-white text-slate-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 px-4"
            >
              <Download size={18} />
              <span className="font-bold text-sm">Export</span>
            </button>

            {/* Partager */}
            <button 
              onClick={handleShare}
              className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 px-6"
            >
              <Share2 size={18} />
              <span className="font-bold text-sm">Partager</span>
            </button>
          </div>
        </header>

        {/* ========== ERREUR ========== */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <p className="font-medium text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-lg">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ========== GRILLE DE KPI ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Électricité" 
            value={impactStats.electricite.val} 
            unit="kWh" 
            icon={<Zap size={22} className="text-white" />} 
            trend={impactStats.electricite.trend} 
            color="from-amber-400 to-amber-600"
            bgColor="bg-amber-50"
            co2={impactStats.electricite.co2}
          />
          <StatCard 
            title="Eau" 
            value={impactStats.eau.val} 
            unit="m³" 
            icon={<Droplets size={22} className="text-white" />} 
            trend={impactStats.eau.trend} 
            color="from-blue-400 to-blue-600"
            bgColor="bg-blue-50"
            co2={impactStats.eau.co2}
          />
          <StatCard 
            title="Déchets" 
            value={impactStats.dechets.val} 
            unit="kg" 
            icon={<Trash2 size={22} className="text-white" />} 
            trend={impactStats.dechets.trend} 
            color="from-red-400 to-red-600"
            bgColor="bg-red-50"
            co2={impactStats.dechets.co2}
          />
          <StatCard 
            title="Empreinte CO₂" 
            value={totalCO2 || impactStats.co2.val} 
            unit="kg" 
            icon={<Leaf size={22} className="text-white" />} 
            trend={impactStats.co2.trend} 
            color="from-emerald-500 to-emerald-600"
            bgColor="bg-emerald-500"
            isMain 
          />
        </div>

        {/* ========== ÉQUIVALENCES CO2 ========== */}
        {co2Equivalents.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target size={20} /> Équivalences de votre impact
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {co2Equivalents.map((eq, i) => (
                <div key={i} className="bg-white/10 p-4 rounded-xl text-center">
                  <div className="text-2xl mb-1">{eq.icon}</div>
                  <p className="text-xs text-emerald-100">{eq.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* ========== GRAPHIQUE PRINCIPAL ========== */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Activity className="text-emerald-500" size={22} />
                Évolution de la Consommation
              </h3>
              
              <div className="flex items-center gap-2">
                {/* Sélecteur période */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                </select>

                {/* Type de graphique */}
                <button
                  onClick={() => setChartType(prev => prev === "area" ? "bar" : "area")}
                  className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  title={chartType === "area" ? "Passer en barres" : "Passer en aires"}
                >
                  {chartType === "area" ? <BarChart3 size={16} /> : <Activity size={16} />}
                </button>

                {/* Afficher/masquer camembert */}
                <button
                  onClick={() => setShowPieChart(prev => !prev)}
                  className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  title="Vue par type"
                >
                  <PieChart size={16} />
                </button>
              </div>
            </div>

            {graphData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={graphData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '15px', 
                          border: 'none', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          backgroundColor: 'white'
                        }}
                      />
                      <Area type="monotone" dataKey="valeur" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '15px', 
                          border: 'none', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          backgroundColor: 'white'
                        }}
                      />
                      <Bar dataKey="valeur" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Aucune donnée graphique</p>
                  <p className="text-sm">Ajoutez des relevés pour voir l'évolution</p>
                </div>
              </div>
            )}
          </div>

          {/* ========== PANNEAU LATÉRAL ========== */}
          <div className="space-y-6">
            {/* Camembert */}
            {showPieChart && pieData.length > 0 && (
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="text-emerald-500" size={20} />
                  Répartition
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-3 flex-wrap">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs font-medium">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique récent */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History className="text-emerald-500" size={20} />
                Journal récent
              </h3>
              
              {recentHistory.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {recentHistory.map((item, index) => (
                    <div key={item._id || index} className="flex justify-between items-center group hover:bg-gray-50 p-2 rounded-xl transition cursor-default">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.type === "energie" || item.type === "electricite" ? "bg-amber-100 text-amber-600" :
                          item.type === "eau" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                        }`}>
                          {item.type === "energie" || item.type === "electricite" ? <Zap size={16} /> :
                           item.type === "eau" ? <Droplets size={16} /> : <Trash2 size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-xs capitalize">
                            {item.type === "electricite" ? "Énergie" : item.type}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(item.dateConsommation || item.date_saisie || item.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-600">
                          {item.valeur}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">{item.unite || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <History size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Aucun historique</p>
                </div>
              )}

              <button 
                onClick={() => navigate("/dashboard")}
                className="w-full mt-4 py-3 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all"
              >
                Voir tous les relevés
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANTS ====================

function StatCard({ title, value, unit, icon, trend, color, bgColor, isMain, co2 }) {
  const trendValue = trend || 0;
  const isTrendPositive = trendValue > 0;
  
  return (
    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-lg ${
      isMain 
        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-500/20' 
        : `${bgColor} border-gray-100`
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} ${isMain ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
          {icon}
        </div>
        {trendValue !== 0 && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
            isMain 
              ? 'bg-white/20 text-white' 
              : (isTrendPositive ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600')
          }`}>
            {isTrendPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
        isMain ? 'text-emerald-100' : 'text-gray-400'
      }`}>
        {title}
      </p>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black">
          {Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
        </span>
        <span className="text-xs font-bold opacity-70">{unit}</span>
      </div>
      
      {co2 > 0 && !isMain && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
          <Leaf size={10} />
          {Number(co2).toFixed(1)} kg CO₂
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 font-black text-sm text-gray-400 uppercase tracking-[0.3em] animate-pulse">
        Analyse en cours...
      </p>
    </div>
  );
}