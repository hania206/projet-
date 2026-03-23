import React, { useState } from 'react';
import { Zap, Droplets, Trash2, AlertTriangle } from 'lucide-react';

export default function Alerts ()  {
  const [thresholds, setThresholds] = useState([
    { id: 'energy', label: 'Énergie', current: 1250, unit: 'kWh', limit: 1500, active: true, icon: <Zap size={20} className="text-yellow-500" /> },
    { id: 'water', label: 'Eau', current: 45, unit: 'm³', limit: 60, active: true, icon: <Droplets size={20} className="text-blue-500" /> },
    { id: 'waste', label: 'Déchets', current: 12, unit: 'kg', limit: 20, active: true, icon: <Trash2 size={20} className="text-orange-600" /> }
  ]);

  const [recentAlerts] = useState([
    { id: 1, type: 'Énergie', msg: 'Consommation élevée détectée', date: '10 fév 2024 à 18:30', critical: true },
    { id: 2, type: 'Eau', msg: 'Seuil d\'eau approché', date: '8 fév 2024 à 14:15', critical: false }
  ]);

  // Fonction pour toggle active
  const handleToggle = (id) => {
    setThresholds(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  // Fonction pour changer la limite
  const handleLimitChange = (id, value) => {
    setThresholds(prev => prev.map(t => t.id === id ? { ...t, limit: Number(value) } : t));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">Gestion des alertes</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Configuration des Seuils */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-8">Seuils</h3>
            
            <div className="space-y-8">
              {thresholds.map((t) => (
                <div key={t.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {t.icon}
                      <div>
                        <h4 className="font-bold text-gray-800">{t.label}</h4>
                        <p className="text-xs text-gray-400">Valeur actuelle: {t.current} {t.unit}</p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.active}
                        className="sr-only peer"
                        onChange={() => handleToggle(t.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  <input 
                    type="number" 
                    value={t.limit}
                    onChange={(e) => handleLimitChange(t.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  
                  {t.active && t.current >= t.limit && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                      <AlertTriangle size={14} /> Alerte active
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-10 hover:bg-emerald-700 transition">
              Enregistrer
            </button>
          </div>
        </div>

        {/* Colonne Droite : Alertes récentes */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-6">Alertes récentes</h3>
          <div className="space-y-4">
            {recentAlerts.map((a) => (
              <div key={a.id} className={`p-4 rounded-xl ${a.critical ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold uppercase ${a.critical ? 'text-red-600' : 'text-gray-500'}`}>{a.type}</span>
                  {a.critical && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                </div>
                <p className="text-sm font-bold text-gray-800">{a.msg}</p>
                <p className="text-[10px] text-gray-400 mt-1">{a.date.split(' à ')[0]}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

