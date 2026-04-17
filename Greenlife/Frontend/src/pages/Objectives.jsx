import React, { useState, useEffect } from "react";
import {
  Zap, Droplets, Recycle, Target,
  Trash2, CheckCircle, XCircle, Award
} from "lucide-react";
import axios from "axios";

export default function Objectives() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ecoScore, setEcoScore] = useState(0);

  const fetchObjectives = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const { data } = await axios.get("http://localhost:5000/api/objectives", {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });

      const goalsData = data.goals || [];
      setGoals(goalsData);

      // ECO SCORE
      const good = goalsData.filter(g => g.current <= g.target).length;
      const total = goalsData.length || 1;
      setEcoScore(Math.round((good / total) * 100));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchObjectives(); }, []);

  const getIcon = (type) => {
    if (type === "energy") return <Zap />;
    if (type === "water") return <Droplets />;
    if (type === "waste") return <Recycle />;
    return <Target />;
  };

  const deleteGoal = async (id) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    await axios.delete(`http://localhost:5000/api/objectives/${id}`, {
      headers: { Authorization: `Bearer ${userInfo?.token}` }
    });
    fetchObjectives();
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-green-700">
          🌱 GreenLife Dashboard
        </h1>

        {/* ECO SCORE */}
        <div className="bg-white shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3">
          <Award className="text-yellow-500"/>
          <div>
            <p className="text-sm text-gray-500">Eco Score</p>
            <p className="font-bold text-xl">{ecoScore}%</p>
          </div>
        </div>
      </div>

      {/* ALERT */}
      {ecoScore < 50 && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 text-center">
          ⚠️ Attention ! Votre consommation est élevée
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {goals.map(goal => {
          const current = Number(goal.current || 0);
          const target = Number(goal.target || 1);
          const percent = Math.min((current / target) * 100, 100);
          const isGood = current <= target;

          return (
            <div key={goal._id}
              className="bg-white/70 backdrop-blur-lg border shadow-xl rounded-3xl p-6 hover:scale-105 transition duration-300">

              {/* HEADER */}
              <div className="flex justify-between mb-4">
                <div className="flex gap-2 text-green-700">
                  {getIcon(goal.type)}
                  <h2 className="font-bold capitalize">{goal.type}</h2>
                </div>

                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="text-red-400 hover:text-red-600">
                  <Trash2 />
                </button>
              </div>

              {/* CIRCLE PROGRESS */}
              <div className="flex justify-center items-center mb-4">
                <svg width="100" height="100">
                  <circle cx="50" cy="50" r="40"
                    stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40"
                    stroke={isGood ? "#22C55E" : "#EF4444"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251"
                    strokeDashoffset={251 - (percent / 100) * 251}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)" />
                </svg>
                <span className="absolute text-lg font-bold">
                  {Math.round(percent)}%
                </span>
              </div>

              {/* STATUS */}
              <div className="text-center mb-2">
                {isGood ? (
                  <span className="text-green-600 flex justify-center gap-1">
                    <CheckCircle/> Stable
                  </span>
                ) : (
                  <span className="text-red-600 flex justify-center gap-1">
                    <XCircle/> Alerte
                  </span>
                )}
              </div>

              {/* VALUES */}
              <p className="text-center text-gray-500 text-sm">
                {current} / {target}
              </p>

            </div>
          );
        })}

      </div>

      {/* BADGES */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-green-700">🏆 Badges</h2>

        <div className="flex gap-4 flex-wrap">
          {ecoScore >= 80 && (
            <div className="bg-green-100 px-4 py-2 rounded-full">
              🌟 Eco Master
            </div>
          )}

          {ecoScore >= 50 && (
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              💧 Saver
            </div>
          )}

          {ecoScore < 50 && (
            <div className="bg-red-100 px-4 py-2 rounded-full">
              ⚠️ Needs Improvement
            </div>
          )}
        </div>
      </div>

    </div>
  );
}