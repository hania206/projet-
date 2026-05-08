import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Crown, Loader2, Star, TrendingUp, 
  Users, Flame, Sparkles, Target, Award, Leaf,
  Medal, Zap, Heart, Shield
} from "lucide-react";

export default function Ranking() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const session = useMemo(() => {
    try {
      const savedInfo = localStorage.getItem("userInfo");
      return savedInfo ? JSON.parse(savedInfo) : {};
    } catch { 
      return {}; 
    }
  }, []);

  const fetchRanking = useCallback(async () => {
    try {
      if (!session?.token) {
        navigate("/login");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get("http://localhost:5000/api/ranking", {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      
      const rankingData = data.ranking || (Array.isArray(data) ? data : []);
      setUsers(rankingData);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [session, navigate]);

  useEffect(() => { 
    fetchRanking(); 
  }, [fetchRanking]);

  const isAdmin = useMemo(() => {
    const role = session.user?.role || session.role;
    return role === "admin";
  }, [session]);

  const myRank = useMemo(() => {
    if (isAdmin) return null;
    const myUser = users.find(u => u._id === session._id || u.email === session.email);
    return myUser ? users.indexOf(myUser) + 1 : null;
  }, [users, session, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={56} />
            <Crown className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400" size={24} />
          </div>
          <p className="text-gray-600 font-bold text-lg">Chargement des champions...</p>
          <p className="text-gray-400 text-sm mt-1">Préparation du classement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* 🌟 HEADER SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-bold mb-4 border border-white/20">
            <Trophy size={18} className="text-amber-300" />
            <span>Compétition Écologique</span>
          </div>
          
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            Classement des <span className="text-amber-300">Champions</span>
          </h1>
          <p className="text-emerald-100 text-lg max-w-xl mx-auto">
            {isAdmin 
              ? "En tant qu'administrateur, vous supervisez la compétition."
              : "Chaque geste compte. Gravissez les échelons du classement !"}
          </p>
          
          {/* Stats rapides */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-black">{users.length}</p>
              <p className="text-xs text-emerald-200 uppercase tracking-wider">Participants</p>
            </div>
            {!isAdmin && myRank && (
              <div className="text-center px-6 py-2 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20">
                <p className="text-4xl font-black text-amber-300">#{myRank}</p>
                <p className="text-xs text-emerald-100">Votre position</p>
              </div>
            )}
            {users.length > 0 && (
              <div className="text-center">
                <p className="text-3xl font-black text-amber-300">{users[0]?.score || 0}%</p>
                <p className="text-xs text-emerald-200 uppercase tracking-wider">Top Score</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-center font-medium flex items-center justify-center gap-2">
          <Shield size={18} /> {error}
        </div>
      )}

      {/* 🏆 PODIUM TOP 3 */}
      {users.length >= 3 && (
        <div className="relative">
          <h2 className="text-center text-lg font-bold text-gray-500 uppercase tracking-wider mb-6">Podium</h2>
          
          <div className="flex items-end justify-center gap-4 max-w-lg mx-auto">
            {/* 2ème place */}
            <div className="text-center flex-1">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl p-5 shadow-lg border-2 border-gray-300 relative hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg">2</div>
                <div className="text-5xl mb-3 mt-2">🥈</div>
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-2xl font-black text-white">
                    {users[1]?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <h3 className="font-bold text-gray-700 text-sm truncate">{users[1]?.name || "Inconnu"}</h3>
                <p className="text-lg font-black text-gray-500 mt-1">{users[1]?.score || 0}%</p>
                <p className="text-xs text-gray-400 mt-1">Score éco</p>
              </div>
            </div>

            {/* 1ère place */}
            <div className="text-center flex-1 -mt-8">
              <div className="bg-gradient-to-b from-amber-400 to-yellow-500 rounded-2xl p-6 shadow-2xl border-2 border-amber-300 relative transform scale-110 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-xl">
                  <Crown size={18} />
                </div>
                <div className="text-6xl mb-3 mt-3 animate-bounce">👑</div>
                <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl border-4 border-white">
                  <span className="text-3xl font-black text-amber-700">
                    {users[0]?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <h3 className="font-black text-amber-900 text-sm truncate">{users[0]?.name || "Inconnu"}</h3>
                <p className="text-2xl font-black text-amber-900 mt-1">{users[0]?.score || 0}%</p>
                <p className="text-xs text-amber-700 font-bold">Score éco</p>
                <div className="mt-3 bg-white/30 backdrop-blur-sm text-amber-900 text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles size={12} /> CHAMPION
                </div>
              </div>
            </div>

            {/* 3ème place */}
            <div className="text-center flex-1">
              <div className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-2xl p-5 shadow-lg border-2 border-orange-300 relative hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg">3</div>
                <div className="text-5xl mb-3 mt-2">🥉</div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-2xl font-black text-white">
                    {users[2]?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <h3 className="font-bold text-orange-700 text-sm truncate">{users[2]?.name || "Inconnu"}</h3>
                <p className="text-lg font-black text-orange-500 mt-1">{users[2]?.score || 0}%</p>
                <p className="text-xs text-orange-400 mt-1">Score éco</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 CLASSEMENT COMPLET */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-lg font-bold text-gray-500 uppercase tracking-wider mb-4">
          Classement complet
        </h2>
        
        <div className="space-y-2">
          {users.length > 0 ? (
            users.map((user, index) => {
              const isMe = user._id === session._id || user.email === session.email;
              
              // Niveaux avec couleurs
              const getLevel = (score) => {
                if (score >= 80) return { label: "Expert", bg: "bg-purple-100 text-purple-700 border-purple-200", icon: <Sparkles size={12} />, stars: "⭐⭐⭐⭐⭐" };
                if (score >= 60) return { label: "Avancé", bg: "bg-blue-100 text-blue-700 border-blue-200", icon: <Star size={12} />, stars: "⭐⭐⭐⭐" };
                if (score >= 40) return { label: "Intermédiaire", bg: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Target size={12} />, stars: "⭐⭐⭐" };
                if (score >= 20) return { label: "Débutant", bg: "bg-amber-100 text-amber-700 border-amber-200", icon: <Leaf size={12} />, stars: "⭐⭐" };
                return { label: "Novice", bg: "bg-gray-100 text-gray-600 border-gray-200", icon: <Heart size={12} />, stars: "⭐" };
              };
              const level = getLevel(user.score || 0);
              
              // Rang
              const rankBadge = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
              
              return (
                <div 
                  key={user._id || index} 
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                    isMe 
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-400 shadow-lg shadow-emerald-100" 
                      : "bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                  }`}
                >
                  {/* Barre de progression subtile */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500/5 to-transparent transition-all"
                    style={{ width: `${user.score || 0}%` }}
                  />
                  
                  <div className="relative flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Rang */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-md ${
                        index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-2xl" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                        index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {rankBadge}
                      </div>
                      
                      {/* Avatar + Nom */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                          isMe 
                            ? "bg-emerald-500 text-white ring-2 ring-emerald-300" 
                            : index < 3 
                              ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}>
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            {user.name || "Utilisateur"}
                            {isMe && (
                              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                VOUS
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{level.stars}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Niveau */}
                      <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${level.bg}`}>
                        {level.icon}
                        {level.label}
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-emerald-400" size={16} />
                          <span className="text-xl font-black text-emerald-600">{user.score || 0}%</span>
                        </div>
                        <p className="text-xs text-gray-400">Score</p>
                      </div>
                      
                      {/* Barre de score */}
                      <div className="hidden md:block w-20">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (user.score || 0) >= 80 ? "bg-purple-500" :
                              (user.score || 0) >= 60 ? "bg-blue-500" :
                              (user.score || 0) >= 40 ? "bg-emerald-500" :
                              "bg-amber-500"
                            }`}
                            style={{ width: `${user.score || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Users className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg font-medium">Aucun participant</p>
              <p className="text-gray-400 text-sm mt-2">
                Ajoutez des relevés de consommation pour apparaître ici !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}