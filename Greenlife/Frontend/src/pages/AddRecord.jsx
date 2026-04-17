import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Zap, Droplets, ArrowLeft, History, Upload, Sparkles, Edit3, Settings, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddRecord() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("auto"); 
  const [typeLabel, setTypeLabel] = useState("Energie");
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [customDevice, setCustomDevice] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);

  const [formData, setFormData] = useState({
    value: "",
    date: new Date().toISOString().split("T")[0],
    manualCO2: "" 
  });

  const API_URL = useMemo(() => "http://localhost:5000/api/consumptions", []);

  const deviceOptions = {
    Energie: ["Climatisation", "Chauffage", "Frigo", "Lave-linge", "Four", "Éclairage"],
    Eau: ["Douche", "Jardin", "Piscine", "Lave-vaisselle", "Toilettes"]
  };

  const toggleDevice = (device) => {
    setSelectedDevices(prev => 
      prev.includes(device) ? prev.filter(d => d !== device) : [...prev, device]
    );
  };

  // Calcul automatique du CO2 basé sur la valeur saisie
  const autoCO2 = useMemo(() => {
    const val = parseFloat(formData.value);
    if (isNaN(val) || val <= 0) return 0;
    return parseFloat((val * (typeLabel === "Energie" ? 0.4 : 0.2)).toFixed(2));
  }, [formData.value, typeLabel]);

  const finalCO2 = useMemo(() => {
    const manual = parseFloat(formData.manualCO2);
    return !isNaN(manual) ? manual : autoCO2;
  }, [formData.manualCO2, autoCO2]);

  const getAuthHeader = useCallback(() => {
    const userStored = localStorage.getItem("userInfo");
    if (!userStored) return null;
    const userData = JSON.parse(userStored);
    return userData?.token ? { Authorization: `Bearer ${userData.token}` } : null;
  }, []);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      const res = await axios.get(API_URL, { headers });
      const data = res.data?.consumptions || res.data?.data || res.data;
      setRecentReadings(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Erreur fetch:", err); }
  }, [getAuthHeader, API_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- NOUVELLE FONCTION D'ANALYSE OCR ---
  const handleAutoAnalyse = async (file) => {
    if (!file) return;
    const headers = getAuthHeader();
    if (!headers) return;

    setIsAnalyzing(true);
    setBillFile(file);

    const scanData = new FormData();
    scanData.append("bill", file); // "bill" correspond au nom dans upload.single("bill") de votre route /scan

    try {
      const res = await axios.post(`${API_URL}/scan`, scanData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" }
      });

      if (res.data && res.data.value) {
        setFormData(prev => ({
          ...prev,
          value: res.data.value.toString(),
          date: new Date().toISOString().split("T")[0]
        }));
      }
    } catch (err) {
      console.error("Erreur OCR:", err);
      alert("Impossible d'analyser la facture automatiquement. Veuillez entrer la valeur manuellement.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = getAuthHeader();
    if (!headers) return;
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append("type", typeLabel);
      data.append("valeur", formData.value);
      data.append("unite", typeLabel === "Energie" ? "kWh" : "m³");
      data.append("dateConsommation", formData.date);
      data.append("co2", finalCO2);
      
      const allDevices = [...selectedDevices];
      if (customDevice.trim()) allDevices.push(customDevice.trim());

      data.append("details", JSON.stringify({
        method,
        devices: allDevices.length > 0 ? allDevices : ["Général"]
      }));

      // Ici on utilise "billImage" pour correspondre à la route POST principale du backend
      if (billFile) data.append("billImage", billFile);

      await axios.post(API_URL, data, { 
        headers: { ...headers, "Content-Type": "multipart/form-data" } 
      });

      alert("✅ Enregistré avec succès !");
      setFormData({ value: "", date: new Date().toISOString().split("T")[0], manualCO2: "" });
      setSelectedDevices([]);
      setCustomDevice("");
      setBillFile(null);
      fetchData();
    } catch (err) {
      alert(`❌ Erreur : ${err.response?.data?.message || "Vérifiez votre connexion au serveur"}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto mb-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-semibold transition-all">
          <ArrowLeft size={20} /> Retour au tableau de bord
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h1 className="text-3xl font-black mb-6 tracking-tight">Nouveau Relevé</h1>
          
          {/* SÉLECTEUR DE MÉTHODE */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button onClick={() => setMethod("auto")} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${method === "auto" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>
              <Sparkles size={16} /> Auto (IA)
            </button>
            <button onClick={() => setMethod("manual")} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${method === "manual" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              <Edit3 size={16} /> Manuel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TYPE : ÉNERGIE OU EAU */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => { setTypeLabel("Energie"); setSelectedDevices([]); }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${typeLabel === "Energie" ? "border-yellow-400 bg-yellow-50" : "border-slate-100 opacity-50"}`}>
                <Zap className={typeLabel === "Energie" ? "text-yellow-500" : ""} />
                <span className="font-bold text-xs mt-2">Électricité</span>
              </button>
              <button type="button" onClick={() => { setTypeLabel("Eau"); setSelectedDevices([]); }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${typeLabel === "Eau" ? "border-blue-400 bg-blue-50" : "border-slate-100 opacity-50"}`}>
                <Droplets className={typeLabel === "Eau" ? "text-blue-500" : ""} />
                <span className="font-bold text-xs mt-2">Eau</span>
              </button>
            </div>

            {/* ZONE D'UPLOAD / ANALYSE OCR */}
            {method === "auto" && (
              <div className={`relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50 transition-all ${isAnalyzing ? "border-emerald-500 bg-emerald-50" : "hover:border-emerald-300"}`}>
                <input 
                  type="file" 
                  onChange={(e) => handleAutoAnalyse(e.target.files[0])} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*,.pdf" 
                  disabled={isAnalyzing}
                />
                {isAnalyzing ? (
                  <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-500 mb-2 mx-auto" size={32} />
                    <span className="font-bold text-emerald-600 animate-pulse text-sm">IA analyse votre facture...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-300 mb-2" />
                    <span className="font-bold text-slate-500 text-sm text-center">
                      {billFile ? billFile.name : "Cliquez ou glissez votre facture ici"}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* SÉLECTION DES APPAREILS (Visible en manuel ou après analyse auto) */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings size={12} /> Appareils responsables
              </label>
              <div className="flex flex-wrap gap-2">
                {deviceOptions[typeLabel].map(d => (
                  <button 
                    key={d} 
                    type="button" 
                    onClick={() => toggleDevice(d)} 
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedDevices.includes(d) ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Plus size={14} className="absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Autre machine non listée..." 
                  value={customDevice} 
                  onChange={(e) => setCustomDevice(e.target.value)} 
                  className="w-full p-3 pl-9 bg-slate-50 rounded-xl border border-dashed border-slate-300 outline-none text-sm focus:border-emerald-500 transition-colors" 
                />
              </div>
            </div>

            {/* CHAMPS VALEUR ET CO2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consommation ({typeLabel === "Energie" ? "kWh" : "m³"})</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.value} 
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })} 
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CO₂ calculé (kg)</label>
                <input 
                  type="number" 
                  value={formData.manualCO2} 
                  onChange={(e) => setFormData({ ...formData, manualCO2: e.target.value })} 
                  className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold outline-none border border-emerald-100" 
                  placeholder={autoCO2} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date du relevé</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || isAnalyzing} 
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black p-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Enregistrer le relevé"}
            </button>
          </form>
        </div>

        {/* HISTORIQUE À DROITE */}
        <div className="lg:py-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-8"><History className="text-slate-400" /> Vos derniers relevés</h2>
          <div className="space-y-4">
            {recentReadings.length > 0 ? (
              recentReadings.slice(0, 5).map((r) => (
                <div key={r._id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-50 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${r.type.toLowerCase() === "energie" ? "bg-yellow-50 text-yellow-600" : "bg-blue-50 text-blue-600"}`}>
                      {r.type.toLowerCase() === "energie" ? <Zap size={20} /> : <Droplets size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{r.valeur} {r.unite}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{r.co2} kg co2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{new Date(r.dateConsommation).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 font-medium italic">Aucun relevé enregistré pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}