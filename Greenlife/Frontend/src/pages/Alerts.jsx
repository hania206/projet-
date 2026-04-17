import React, { useState, useEffect } from 'react';
import { Zap, Droplets, Trash2, AlertTriangle, Bell, CheckCircle, Save } from 'lucide-react';
import axios from 'axios';

export default function Alerts() {
  const [thresholds, setThresholds] = useState([
    { id: 'electricity', label: 'Énergie', current: 0, unit: 'kWh', limit: 1500, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'water', label: 'Eau', current: 0, unit: 'm³', limit: 60, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'waste', label: 'Déchets', current: 0, unit: 'kg', limit: 20, color: 'text-orange-600', bg: 'bg-orange-50' }
  ]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const mapTypeFront = { electricity: "energy", water: "water", waste: "waste" };

  // 🔄 Fetch current objectives
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo?.token) throw new Error("Token non trouvé");

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/objectives", config);

        setThresholds(prev =>
          prev.map(t => {
            const serverGoal = data.goals.find(g => g.type_conso === mapTypeFront[t.id]);
            return {
              ...t,
              current: serverGoal ? Number(serverGoal.current) : 0,
              limit: serverGoal ? Number(serverGoal.target) : t.limit
            };
          })
        );
      } catch (err) {
        console.error("Erreur de chargement:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Save all thresholds
  const handleSave = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) throw new Error("Token manquant");

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await Promise.all(
        thresholds.map(t =>
          axios.post(
            "http://localhost:5000/api/objectives",
            {
              type_conso: mapTypeFront[t.id],
              valeur_cible: Number(t.limit),
              date_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
            },
            config
          )
        )
      );

      setStatus({ type: 'success', msg: 'Objectifs synchronisés !' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde:", err.response?.data?.message || err.message);
      setStatus({ type: 'error', msg: 'Erreur lors de la mise à jour' });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-emerald-600 font-black animate-pulse text-xl">
        CHARGEMENT DU SYSTÈME...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <Bell className="text-emerald-500 animate-bounce" /> Configuration des Alertes
            </h1>
            <p className="text-slate-500 font-medium">Ajustez vos limites pour recevoir des notifications en temps réel.</p>
          </div>
          {status.msg && (
            <div className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-fade-in ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              <CheckCircle size={18} /> {status.msg}
            </div>
          )}
        </div>

        {/* Threshold Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {thresholds.map(t => {
            const isOver = t.current >= t.limit;
            const percent = Math.min((t.current / t.limit) * 100, 100);

            return (
              <div key={t.id} className={`bg-white/80 backdrop-blur-md p-8 rounded-[40px] border-2 transition-all hover:shadow-2xl ${isOver ? 'border-red-200 shadow-red-50' : 'border-transparent'}`}>
                
                <div className={`w-16 h-16 rounded-3xl ${t.bg} ${t.color} flex items-center justify-center mb-6`}>
                  {t.id === 'electricity' ? <Zap size={30} /> : t.id === 'water' ? <Droplets size={30} /> : <Trash2 size={30} />}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-1">{t.label}</h3>
                <p className="text-slate-400 text-sm mb-4 font-bold uppercase tracking-wider">
                  Limite: {t.limit} {t.unit}
                </p>

                <div className="w-full h-4 bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div style={{ width: `${percent}%` }} className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} />
                </div>

                <input
                  type="range"
                  min="0"
                  max={t.id === 'water' ? 200 : 3000}
                  value={t.limit}
                  onChange={(e) => setThresholds(prev => prev.map(item => item.id === t.id ? { ...item, limit: Number(e.target.value) } : item))}
                  className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-emerald-500 mb-6"
                />

                {isOver && (
                  <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                    <AlertTriangle className="text-red-500 shrink-0" size={18} />
                    <p className="text-xs text-red-700 font-bold leading-tight">
                      Attention : Seuil dépassé de {Math.round(t.current - t.limit)} {t.unit} !
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="mt-12 w-full bg-slate-900 text-white py-6 rounded-[30px] font-black text-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-emerald-200"
        >
          <Save className="group-hover:rotate-12 transition-transform" /> Enregistrer les nouveaux plafonds
        </button>
      </div>
    </div>
  );
}