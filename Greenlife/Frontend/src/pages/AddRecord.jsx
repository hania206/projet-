import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Zap, Droplets, ArrowLeft, History, Upload, Sparkles, 
  Edit3, Settings, Plus, Loader2, Trash2, Camera, 
  Leaf, TrendingDown, Award, AlertTriangle, X,
  Calendar, Clock, BarChart3, Target, CheckCircle2,
  FileText, Image, Mic, Send, MapPin, Thermometer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ==================== CONSTANTES ====================
const API_URL = "http://localhost:5000/api/consumptions";

const TYPE_CONFIG = {
  Energie: {
    icon: Zap,
    color: "yellow",
    unit: "kWh",
    co2Factor: 0.5,
    label: "Électricité",
    devices: ["Climatisation", "Chauffage", "Frigo", "Lave-linge", "Four", "Éclairage", "TV", "Ordinateur", "Box Internet", "Lave-vaisselle", "Sèche-linge"]
  },
  Eau: {
    icon: Droplets,
    color: "blue",
    unit: "m³",
    co2Factor: 0.3,
    label: "Eau",
    devices: ["Douche", "Bain", "Jardin", "Piscine", "Lave-vaisselle", "Toilettes", "Lave-linge", "Robinet", "Arrosage"]
  },
  Dechets: {
    icon: Trash2,
    color: "emerald",
    unit: "kg",
    co2Factor: 2.0,
    label: "Déchets",
    devices: ["Plastique", "Papier/Carton", "Verre", "Métal", "Organique", "Non-recyclable", "Textile", "Électronique", "Piles", "Médicaments"]
  }
};

// ==================== COMPOSANT PRINCIPAL ====================
export default function AddRecord() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // ==================== ÉTATS ====================
  const [method, setMethod] = useState("manual"); 
  const [typeLabel, setTypeLabel] = useState("Energie");
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [customDevice, setCustomDevice] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null);
  const [notes, setNotes] = useState("");
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState(false);

  const [formData, setFormData] = useState({
    value: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    manualCO2: "",
    temperature: ""
  });

  const config = TYPE_CONFIG[typeLabel];

  // ==================== CALCULS MÉMOSÉS ====================
  
  // Calcul CO2 automatique
  const autoCO2 = useMemo(() => {
    const val = parseFloat(formData.value);
    if (isNaN(val) || val <= 0) return 0;
    return parseFloat((val * config.co2Factor).toFixed(2));
  }, [formData.value, config.co2Factor]);

  // CO2 final (manuel ou auto)
  const finalCO2 = useMemo(() => {
    const manual = parseFloat(formData.manualCO2);
    return !isNaN(manual) && manual >= 0 ? manual : autoCO2;
  }, [formData.manualCO2, autoCO2]);

  // Suggestions d'économies
  const ecoTips = useMemo(() => {
    const tips = {
      Energie: [
        "💡 Éteignez les lumières en quittant une pièce",
        "🌡️ Réglez le thermostat à 19°C",
        "🔌 Débranchez les appareils en veille",
        "🪟 Fermez les volets la nuit pour isoler"
      ],
      Eau: [
        "🚿 Préférez une douche (60L) au bain (150L)",
        "💧 Installez des mousseurs sur les robinets",
        "🌧️ Récupérez l'eau de pluie pour le jardin",
        "🔧 Réparez les fuites rapidement"
      ],
      Dechets: [
        "♻️ Triez vos déchets systématiquement",
        "🛍️ Utilisez des sacs réutilisables",
        "🍎 Compostez vos déchets organiques",
        "📦 Achetez en vrac pour réduire les emballages"
      ]
    };
    return tips[typeLabel] || [];
  }, [typeLabel]);

  // Équivalences CO2 pour sensibilisation
  const co2Equivalent = useMemo(() => {
    if (finalCO2 <= 0) return null;
    
    const equivalents = [];
    if (finalCO2 >= 0.5) equivalents.push(`🌳 ${Math.round(finalCO2 * 0.05)} arbre(s) nécessaire(s) pour absorber ce CO2 en un an`);
    if (finalCO2 >= 1) equivalents.push(`🚗 ${Math.round(finalCO2 * 5)} km en voiture essence`);
    if (finalCO2 >= 0.1) equivalents.push(`📱 ${Math.round(finalCO2 * 20)} recharges de smartphone`);
    
    return equivalents;
  }, [finalCO2]);

  // ==================== GESTION AUTH - CORRIGÉ ====================
  const getAuthHeader = useCallback(() => {
    try {
      // Essayer d'abord le token direct
      const token = localStorage.getItem("token");
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
      
      // Essayer userInfo
      const userStored = localStorage.getItem("userInfo");
      if (userStored) {
        const userData = JSON.parse(userStored);
        if (userData?.token) {
          return { Authorization: `Bearer ${userData.token}` };
        }
      }
      
      // Essayer user (nouveau format)
      const user = localStorage.getItem("user");
      if (user) {
        const tokenFromUser = localStorage.getItem("token");
        if (tokenFromUser) {
          return { Authorization: `Bearer ${tokenFromUser}` };
        }
      }
      
      return null;
    } catch (e) {
      console.error("❌ Erreur récupération token:", e);
      return null;
    }
  }, []);

  // ==================== RÉCUPÉRATION DONNÉES ====================
  const fetchData = useCallback(async () => {
    const headers = getAuthHeader();
    if (!headers) return;
    
    try {
      const res = await axios.get(API_URL, { headers });
      const data = res.data?.consumptions || res.data?.data || res.data;
      setRecentReadings(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (err) { 
      console.error("Erreur chargement:", err); 
    }
  }, [getAuthHeader]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // ==================== GESTION FICHIERS ====================
  
  // Prévisualisation image
  const handleFilePreview = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setBillPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setBillPreview(null);
    }
  };

  // Upload facture
  const handleFileUpload = (file) => {
    if (!file) return;
    setBillFile(file);
    handleFilePreview(file);
    
    if (method === "auto") {
      handleAutoAnalyse(file);
    }
  };

  // Capture photo
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  // Analyse OCR automatique
  const handleAutoAnalyse = async (file) => {
    if (!file) return;
    
    const headers = getAuthHeader();
    if (!headers) {
      setErrors({ scan: "Veuillez vous connecter" });
      return;
    }

    setIsAnalyzing(true);
    const scanData = new FormData();
    scanData.append("bill", file);

    try {
      const res = await axios.post(`${API_URL}/scan`, scanData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" }
      });

      if (res.data?.value) {
        setFormData(prev => ({
          ...prev,
          value: res.data.value.toString()
        }));
        setSuggestions(["✅ Valeur détectée automatiquement", "📊 Vérifiez et ajustez si nécessaire"]);
      } else {
        setSuggestions(["⚠️ Aucune valeur détectée", "Veuillez saisir manuellement"]);
      }
    } catch (err) {
      console.error("Erreur OCR:", err);
      setErrors({ scan: "Échec de l'analyse. Saisissez manuellement." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Veuillez entrer une valeur valide";
    }
    
    if (!formData.date) {
      newErrors.date = "La date est requise";
    }
    
    if (formData.manualCO2 && parseFloat(formData.manualCO2) < 0) {
      newErrors.manualCO2 = "Le CO2 ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== SOUMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const headers = getAuthHeader();
    if (!headers) {
      setErrors({ submit: "Session expirée. Veuillez vous reconnecter." });
      return;
    }
    
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append("type", typeLabel.toLowerCase());
      data.append("valeur", formData.value);
      data.append("unite", config.unit);
      data.append("dateConsommation", `${formData.date}T${formData.time}:00`);
      data.append("co2", finalCO2);
      
      // Détails enrichis
      const allDevices = [...selectedDevices];
      if (customDevice.trim()) allDevices.push(customDevice.trim());
      
      const detailsObj = {
        method,
        devices: allDevices.length > 0 ? allDevices : ["Général"],
        notes: notes.trim(),
        temperature: formData.temperature || null,
        location: location || null,
        time: formData.time
      };
      
      data.append("details", JSON.stringify(detailsObj));

      if (billFile) {
        data.append("billImage", billFile);
      }

      await axios.post(API_URL, data, { 
        headers: { ...headers, "Content-Type": "multipart/form-data" } 
      });

      // Succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset formulaire
      setFormData({
        value: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        manualCO2: "",
        temperature: ""
      });
      setSelectedDevices([]);
      setCustomDevice("");
      setBillFile(null);
      setBillPreview(null);
      setNotes("");
      setSuggestions([]);
      setErrors({});
      
      // Rafraîchir l'historique
      fetchData();
      
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'enregistrement";
      setErrors({ submit: message });
    } finally { 
      setLoading(false); 
    }
  };

  // ==================== SAISIE VOCALE (BONUS) ====================
  const startVoiceInput = () => {
    // Vérifier la compatibilité
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrors({ voice: "La reconnaissance vocale n'est pas supportée par votre navigateur" });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        const number = speechResult.match(/\d+([.,]\d+)?/);
        if (number) {
          setFormData(prev => ({ ...prev, value: number[0].replace(",", ".") }));
        }
      };

      recognition.onerror = (event) => {
        console.error("Erreur vocale:", event.error);
        setErrors({ voice: `Erreur: ${event.error}` });
      };

      recognition.onend = () => setIsVoiceInput(false);

      setIsVoiceInput(true);
      recognition.start();
    } catch (err) {
      console.error("Erreur initialisation vocale:", err);
      setErrors({ voice: "Impossible de démarrer la reconnaissance vocale" });
      setIsVoiceInput(false);
    }
  };

  // ==================== GÉOLOCALISATION (BONUS) ====================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ location: "Géolocalisation non supportée" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Erreur géolocalisation:", error);
        setErrors({ location: "Impossible d'obtenir votre position" });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ========== EN-TÊTE ========== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-semibold transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour au tableau de bord
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuickAddMode(!quickAddMode)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                quickAddMode 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {quickAddMode ? "Mode détaillé" : "Mode rapide"}
            </button>
          </div>
        </div>

        {/* ========== ALERTE SUCCÈS ========== */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-slide-in flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-bold">✅ Enregistrement réussi !</span>
            <button onClick={() => setShowSuccess(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ========== CONTENU PRINCIPAL ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ========== FORMULAIRE (2 colonnes) ========== */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Leaf className="text-emerald-500" size={32} />
                Nouveau Relevé
              </h1>
              
              {finalCO2 > 0 && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Target size={16} />
                  {finalCO2} kg CO₂
                </div>
              )}
            </div>
            
            {/* ========== SÉLECTEUR MÉTHODE ========== */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
              <button 
                onClick={() => setMethod("auto")} 
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  method === "auto" 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sparkles size={16} /> Auto (IA)
              </button>
              <button 
                onClick={() => setMethod("manual")} 
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  method === "manual" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Edit3 size={16} /> Manuel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* ========== SÉLECTEUR TYPE ========== */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = typeLabel === key;
                  
                  return (
                    <button 
                      key={key}
                      type="button" 
                      onClick={() => { 
                        setTypeLabel(key); 
                        setSelectedDevices([]); 
                        setFormData(prev => ({ ...prev, manualCO2: "" }));
                      }} 
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isActive 
                          ? `border-${cfg.color}-400 bg-${cfg.color}-50 shadow-md` 
                          : "border-slate-100 opacity-60 hover:opacity-80 hover:border-slate-200"
                      }`}
                    >
                      <Icon size={24} className={isActive ? `text-${cfg.color}-500` : "text-slate-400"} />
                      <span className="font-bold text-xs text-center">{cfg.label}</span>
                      <span className="text-[10px] text-slate-400">({cfg.unit})</span>
                    </button>
                  );
                })}
              </div>

              {/* ========== ZONE SCAN (MODE AUTO) ========== */}
              {method === "auto" && (
                <div className="space-y-3">
                  <div 
                    className={`relative border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isAnalyzing 
                        ? "border-emerald-500 bg-emerald-50" 
                        : billPreview 
                          ? "border-blue-300 bg-blue-50" 
                          : "border-slate-200 bg-slate-50 hover:border-emerald-300"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      onChange={(e) => handleFileUpload(e.target.files[0])} 
                      className="hidden" 
                      accept="image/*,.pdf" 
                      disabled={isAnalyzing} 
                    />
                    
                    {isAnalyzing ? (
                      <div className="text-center">
                        <Loader2 className="animate-spin text-emerald-500 mb-3 mx-auto" size={40} />
                        <span className="font-bold text-emerald-600 animate-pulse">Analyse IA en cours...</span>
                        <p className="text-xs text-slate-400 mt-1">Détection des valeurs sur votre facture</p>
                      </div>
                    ) : billPreview ? (
                      <div className="text-center">
                        <img src={billPreview} alt="Aperçu facture" className="max-h-40 rounded-xl mb-3 mx-auto" />
                        <span className="font-bold text-slate-600 text-sm">{billFile?.name}</span>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setBillFile(null); setBillPreview(null); }}
                          className="text-red-400 hover:text-red-600 text-xs mt-1 block mx-auto"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={36} className="text-slate-300 mb-3" />
                        <span className="font-bold text-slate-500 text-sm text-center">
                          Scanner une facture ou prendre une photo
                        </span>
                        <span className="text-xs text-slate-400 mt-1">JPG, PNG ou PDF</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      <Camera size={16} /> Photo
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      onChange={handleCameraCapture}
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                    />
                    
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        isVoiceInput 
                          ? "bg-red-100 text-red-600 animate-pulse" 
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      <Mic size={16} /> {isVoiceInput ? "Écoute..." : "Vocal"}
                    </button>
                  </div>
                </div>
              )}

              {/* ========== APPAREILS/DISPOSITIFS ========== */}
              {!quickAddMode && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={12} /> 
                    {typeLabel === "Dechets" ? "Catégories de déchets" : "Appareils concernés"}
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                    {config.devices.map(d => (
                      <button 
                        key={d} 
                        type="button" 
                        onClick={() => {
                          setSelectedDevices(prev => 
                            prev.includes(d) ? prev.filter(i => i !== d) : [...prev, d]
                          );
                        }} 
                        className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                          selectedDevices.includes(d) 
                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {selectedDevices.includes(d) && <CheckCircle2 size={12} className="inline mr-1" />}
                        {d}
                      </button>
                    ))}
                  </div>
                  
                  {/* Ajout appareil personnalisé */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDevice}
                      onChange={(e) => setCustomDevice(e.target.value)}
                      placeholder="+ Ajouter un appareil..."
                      className="flex-1 p-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customDevice.trim()) {
                          setSelectedDevices(prev => [...prev, customDevice.trim()]);
                          setCustomDevice("");
                        }
                      }}
                      className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* ========== VALEURS ========== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={12} />
                    Quantité ({config.unit})
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={formData.value} 
                      onChange={(e) => {
                        setFormData({ ...formData, value: e.target.value });
                        setErrors(prev => ({ ...prev, value: undefined }));
                      }} 
                      className={`w-full p-4 bg-slate-50 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        errors.value ? "ring-2 ring-red-400 bg-red-50" : ""
                      }`}
                      placeholder={`Ex: ${typeLabel === "Energie" ? "150" : typeLabel === "Eau" ? "2.5" : "5"}`}
                      required 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      {config.unit}
                    </span>
                  </div>
                  {errors.value && (
                    <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={12} /> {errors.value}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Leaf size={12} />
                    CO₂ estimé (kg)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.manualCO2} 
                    onChange={(e) => {
                      setFormData({ ...formData, manualCO2: e.target.value });
                      setErrors(prev => ({ ...prev, manualCO2: undefined }));
                    }} 
                    className={`w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-lg outline-none border border-emerald-100 focus:ring-2 focus:ring-emerald-500 ${
                      errors.manualCO2 ? "ring-2 ring-red-400" : ""
                    }`}
                    placeholder={`Auto: ${autoCO2}`}
                  />
                  {!formData.manualCO2 && autoCO2 > 0 && (
                    <p className="text-[10px] text-emerald-500 font-medium">
                      Calcul automatique basé sur {config.co2Factor} kg CO₂/{config.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* ========== DATE & HEURE ========== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                    max={new Date().toISOString().split("T")[0]}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Heure
                  </label>
                  <input 
                    type="time" 
                    value={formData.time} 
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>

              {/* ========== CHAMPS SUPPLÉMENTAIRES (MODE DÉTAILLÉ) ========== */}
              {!quickAddMode && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} /> Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes personnelles..."
                      className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20 text-sm"
                      maxLength={200}
                    />
                    <p className="text-[10px] text-slate-400 text-right">{notes.length}/200</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Thermometer size={12} /> Température (°C)
                      </label>
                      <input 
                        type="number"
                        step="0.1"
                        value={formData.temperature} 
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} 
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="Optionnel"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Localisation
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none hover:bg-slate-100 transition-all flex items-center gap-2"
                      >
                        <MapPin size={16} />
                        {location ? "📍 Position enregistrée" : "Obtenir ma position"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ========== ERREUR GLOBALE ========== */}
              {errors.submit && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-center gap-2">
                  <AlertTriangle size={18} />
                  {errors.submit}
                </div>
              )}
              
              {/* ========== ERREUR VOCALE ========== */}
              {errors.voice && (
                <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl font-bold text-sm flex items-center gap-2">
                  <Mic size={18} />
                  {errors.voice}
                </div>
              )}

              {/* ========== ÉQUIVALENCES CO2 ========== */}
              {co2Equivalent && finalCO2 > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <TrendingDown size={14} /> Impact environnemental
                  </p>
                  {co2Equivalent.map((eq, i) => (
                    <p key={i} className="text-sm text-amber-800">{eq}</p>
                  ))}
                </div>
              )}

              {/* ========== BOUTON SOUMISSION ========== */}
              <button 
                type="submit" 
                disabled={loading || isAnalyzing} 
                className="w-full bg-gradient-to-r from-slate-900 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-black p-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Enregistrer
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ========== PANNEAU LATÉRAL (1 colonne) ========== */}
          <div className="space-y-6">
            
            {/* ========== CONSEILS ÉCO ========== */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-emerald-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Award className="text-emerald-500" size={20} />
                Éco-conseils
              </h2>
              <div className="space-y-3">
                {ecoTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== SUGGESTIONS ========== */}
            {suggestions.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-200">
                <h3 className="text-sm font-bold text-blue-700 mb-3">💡 Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <p key={i} className="text-sm text-blue-800">{s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* ========== HISTORIQUE RÉCENT ========== */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <History className="text-slate-400" size={20} />
                Historique récent
              </h2>
              
              {recentReadings.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentReadings.map((r) => {
                    const typeInfo = Object.values(TYPE_CONFIG).find(
                      t => t.label.toLowerCase() === r.type?.toLowerCase()
                    ) || TYPE_CONFIG.Energie;
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div 
                        key={r._id} 
                        className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-${typeInfo.color}-100`}>
                            <Icon size={18} className={`text-${typeInfo.color}-600`} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">
                              {r.valeur} {r.unite}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase">
                              {r.co2?.toFixed(1)} kg CO₂
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400">
                            {new Date(r.dateConsommation).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </p>
                          <p className="text-[10px] text-slate-300">
                            {new Date(r.dateConsommation).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <History size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun relevé</p>
                  <p className="text-xs mt-1">Commencez à enregistrer vos consommations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== STYLES ANIMATION ========== */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}