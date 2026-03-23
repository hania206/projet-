import React, { useState, useEffect } from "react";
import {
  Zap,
  Droplets,
  Trash2,
  Plus,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err);

      setData({
        stats: [
          { id: 1, type: "Énergie", current: 1250, unit: "kWh", lastMonth: 1400, trend: "10.7%", color: "green" },
          { id: 2, type: "Eau", current: 45, unit: "m³", lastMonth: 52, trend: "13.5%", color: "blue" },
          { id: 3, type: "Déchets", current: 12, unit: "kg", lastMonth: 15, trend: "20%", color: "orange" },
        ],
        evolution: [
          { name: "Jan", Energie: 1400, Eau: 52, Dechets: 15 },
          { name: "Fév", Energie: 1250, Eau: 45, Dechets: 12 },
        ],
        impact: {
          co2: "2.1 tonnes",
          economies: "€145",
          arbres: "87",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );

  const getBorderColor = (color) => {
    if (color === "green") return "border-green-500";
    if (color === "blue") return "border-blue-500";
    return "border-orange-500";
  };

  const getBgColor = (color) => {
    if (color === "green") return "bg-green-50 text-green-600";
    if (color === "blue") return "bg-blue-50 text-blue-600";
    return "bg-orange-50 text-orange-600";
  };

  const getIcon = (type) => {
    if (type === "Énergie") return <Zap size={24} />;
    if (type === "Eau") return <Droplets size={24} />;
    return <Trash2 size={24} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* CONTENT ONLY */}
      <main className="max-w-7xl mx-auto px-12 py-10">

        <div className="flex justify-between mb-8">
          <h2 className="text-3xl font-bold">
            Suivi de consommation
          </h2>

          <button
            onClick={() => navigate("/add-record")}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-emerald-700"
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {data.stats.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-2xl shadow border-l-4 ${getBorderColor(item.color)}`}
            >
              <div className="flex justify-between mb-4">
                <div className={`p-3 rounded-xl ${getBgColor(item.color)}`}>
                  {getIcon(item.type)}
                </div>

                <span className="text-green-500 text-sm flex items-center">
                  <TrendingDown size={16} /> {item.trend}
                </span>
              </div>

              <p className="text-gray-400 text-sm">{item.type}</p>

              <h1 className="text-3xl font-bold">
                {item.current} {item.unit}
              </h1>

              <p className="text-xs text-gray-400 mt-2">
                vs {item.lastMonth} {item.unit}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow mb-10">
          <h3 className="font-bold mb-6">Évolution</h3>

          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={data.evolution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Energie" fill="#22c55e" />
                <Bar dataKey="Eau" fill="#3b82f6" />
                <Bar dataKey="Dechets" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ImpactItem label="CO2 évité" value={data.impact.co2} />
          <ImpactItem label="Économies" value={data.impact.economies} />
          <ImpactItem label="Arbres" value={data.impact.arbres} />
        </div>

      </main>
    </div>
  );
}

const ImpactItem = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <p className="text-gray-400 text-sm">{label}</p>
    <h1 className="text-2xl font-bold text-emerald-600">{value}</h1>
  </div>
);

