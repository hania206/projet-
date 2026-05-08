import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserCheck, Shield, Activity,
  Trash2, LogOut, Search, UserPlus, 
  X, CheckCircle, AlertCircle, RefreshCw,
  Mail, Lock, User
} from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, clients: 0 });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ nom: "", prenom: "", email: "", mdp: "", role: "client" });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.nom?.toLowerCase().includes(term) ||
        user.prenom?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, users]);

  const checkAdminAccess = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const role = userInfo.user?.role || userInfo.role;
      if (role !== "admin") {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Erreur checkAdminAccess:", err.message);
      navigate("/login");
    }
  };

  const getToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return userInfo.token || null;
    } catch (err) {
      console.error("Erreur getToken:", err.message);
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get("http://localhost:5000/api/users/stats/global", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Erreur fetchStats:", err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const list = data.users || (Array.isArray(data) ? data : []);
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      console.error("Erreur fetchUsers:", err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("Accès refusé. Droits admin requis.");
      } else if (err.request) {
        setError("Serveur injoignable.");
      } else {
        setError(err.response?.data?.message || "Erreur chargement utilisateurs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;

    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(prev => prev.filter(u => u._id !== userId));
      fetchStats();
      setSuccess("Utilisateur supprimé !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur handleDeleteUser:", err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("userInfo");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Utilisateur introuvable.");
        fetchUsers();
      } else if (err.request) {
        setError("Serveur injoignable.");
      } else {
        setError(err.response?.data?.message || "Erreur suppression.");
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newUser.nom?.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (!newUser.email?.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!newUser.mdp?.trim()) {
      setError("Le mot de passe est requis");
      return;
    }
    if (newUser.mdp.trim().length < 6) {
      setError("6 caractères minimum");
      return;
    }

    try {
      setAddingUser(true);

      const payload = {
        nom: newUser.nom.trim(),
        prenom: newUser.prenom.trim(),
        email: newUser.email.trim().toLowerCase(),
        mdp: newUser.mdp.trim(),
        role: newUser.role
      };

      const { data } = await axios.post("http://localhost:5000/api/users/register", payload);

      if (data.success) {
        setSuccess(`"${newUser.nom}" ajouté !`);
        setShowAddModal(false);
        setNewUser({ nom: "", prenom: "", email: "", mdp: "", role: "client" });
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Erreur inconnue.");
      }
    } catch (err) {
      console.error("Erreur handleAddUser:", err.message);
      if (err.response) {
        setError(err.response.data?.message || `Erreur ${err.response.status}`);
      } else if (err.request) {
        setError("Serveur injoignable. Vérifiez que le backend est démarré.");
      } else {
        setError(err.message || "Erreur inconnue.");
      }
    } finally {
      setAddingUser(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("userInfo");
    } catch (err) {
      console.error("Erreur handleLogout:", err.message);
    }
    navigate("/login");
  };

  const statCards = [
    { title: "Total", value: stats.totalUsers, icon: <Users size={24} className="text-white" />, color: "bg-blue-500" },
    { title: "Admins", value: stats.admins, icon: <Shield size={24} className="text-white" />, color: "bg-purple-500" },
    { title: "Clients", value: stats.clients, icon: <UserCheck size={24} className="text-white" />, color: "bg-emerald-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-600" size={28} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Administration</h1>
              <p className="text-xs text-gray-500">Panneau de contrôle</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={20} /><span className="font-medium text-sm">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={18} /></button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle size={20} /><span className="font-medium text-sm">{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600"><X size={18} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
                <Activity className="text-gray-300" size={20} />
              </div>
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value || 0}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Rechercher..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchUsers} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-lg text-sm">
                <RefreshCw size={16} /> Actualiser
              </button>
              <button onClick={() => { setError(null); setShowAddModal(true); }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 text-sm">
                <UserPlus size={18} /> Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              <Users size={20} className="text-emerald-500 inline mr-2" />
              Liste ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === "admin" ? "bg-purple-500" : "bg-emerald-500"}`}>
                            {user.nom?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{user.nom} {user.prenom || ""}</p>
                            <p className="text-xs text-gray-400">ID: {user._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs text-green-600">● Actif</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== "admin" && (
                          <button onClick={() => handleDeleteUser(user._id)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">{searchTerm ? "Aucun résultat" : "Aucun utilisateur"}</div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold"><UserPlus className="text-emerald-500 inline mr-2" size={22} />Ajouter</h3>
              <button onClick={() => { setShowAddModal(false); setError(null); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={newUser.nom} onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={newUser.prenom} onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="password" value={newUser.mdp} onChange={(e) => setNewUser({ ...newUser, mdp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setNewUser({ ...newUser, role: "client" })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${newUser.role === "client" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}>
                    <UserCheck size={20} className="mx-auto mb-1" /><span className="text-xs font-bold">Client</span>
                  </button>
                  <button type="button" onClick={() => setNewUser({ ...newUser, role: "admin" })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${newUser.role === "admin" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500"}`}>
                    <Shield size={20} className="mx-auto mb-1" /><span className="text-xs font-bold">Admin</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addingUser} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm disabled:opacity-50">
                  {addingUser ? "Ajout..." : `Ajouter ${newUser.role === "admin" ? "Admin" : "Client"}`}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setError(null); }} className="px-4 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


