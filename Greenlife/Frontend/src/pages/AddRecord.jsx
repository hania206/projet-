import React, { useState, useEffect } from "react";
import { Zap, Droplets, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddRecord() {
  const navigate = useNavigate();
  const [type, setType] = useState("Energie");
  const [formData, setFormData] = useState({
    value: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/readings");
      setRecentReadings(res.data);
    } catch (err) {
      console.log(err);
      setRecentReadings([
        { id: 1, type: "Energie", value: "1250", unit: "kWh", date: "12 fév 2024" },
        { id: 2, type: "Eau", value: "45", unit: "m³", date: "11 fév 2024" },
        { id: 3, type: "Déchets", value: "12", unit: "kg", date: "10 fév 2024" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { type, ...formData, unit: getUnit() };
    try {
      await axios.post("http://localhost:5000/api/readings", payload);
      alert("Relevé enregistré ✅");
      setFormData({ value: "", date: new Date().toISOString().split("T")[0], notes: "" });
      fetchData();
    } catch (err) {
      console.log(err);
      alert("Erreur ❌");
    }
  };

  const getUnit = () => (type === "Energie" ? "kWh" : type === "Eau" ? "m³" : "kg");

  const getIcon = (type) => {
    if (type === "Energie") return <Zap className="text-yellow-500" size={18} />;
    if (type === "Eau") return <Droplets className="text-blue-500" size={18} />;
    return <Trash2 className="text-orange-500" size={18} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TITRE DANS MAIN, pas dans header */}
      <main className="max-w-5xl mx-auto p-8">

        <h1 className="text-2xl font-bold text-center mb-8">
          GreenLife - Nouveau Relevé
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-emerald-600 font-bold mb-8 hover:underline"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow border">
            <h2 className="text-2xl font-bold mb-6">Enregistrer un relevé</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-3">Type de consommation</label>
                <div className="grid grid-cols-3 gap-4">
                  <TypeButton active={type==="Energie"} onClick={()=>setType("Energie")} icon={<Zap size={22}/>} label="Énergie"/>
                  <TypeButton active={type==="Eau"} onClick={()=>setType("Eau")} icon={<Droplets size={22}/>} label="Eau"/>
                  <TypeButton active={type==="Déchets"} onClick={()=>setType("Déchets")} icon={<Trash2 size={22}/>} label="Déchets"/>
                </div>
              </div>

              <input type="number" name="value" value={formData.value} onChange={handleChange}
                     className="w-full p-4 border rounded-xl bg-gray-50"
                     placeholder={`Valeur (${getUnit()})`} required />

              <input type="date" name="date" value={formData.date} onChange={handleChange}
                     className="w-full p-4 border rounded-xl bg-gray-50" />

              <textarea name="notes" value={formData.notes} onChange={handleChange}
                        placeholder="Notes..." className="w-full p-4 border rounded-xl bg-gray-50 h-28" />

              <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700">
                Enregistrer
              </button>
            </form>
          </div>

          {/* RECENT */}
          <div className="bg-white p-6 rounded-2xl shadow border h-fit">
            <h3 className="font-bold mb-6">Relevés récents</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {recentReadings.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
                    <div className="p-2 bg-gray-100 rounded">{getIcon(r.type)}</div>
                    <div>
                      <p className="font-bold">{r.value} {r.unit}</p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

const TypeButton = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`p-4 rounded-xl border text-center transition ${active ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
    <div className="flex justify-center">{icon}</div>
    <p className="text-sm font-bold mt-2">{label}</p>
  </button>
);