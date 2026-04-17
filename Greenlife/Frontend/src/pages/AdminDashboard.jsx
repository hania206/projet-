import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users, Leaf, LogOut, Loader2, Trash2, 
  Plus, Pencil, Search, X, ShieldCheck, UserPlus
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // États pour les données
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // États de l'interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // État du formulaire
  const [formUser, setFormUser] = useState({
    _id: "",
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    role: "client",
  });

  const API = "http://localhost:5000/api";

  // ================= RÉCUPÉRATION DES DONNÉES =================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const stored = localStorage.getItem("userInfo");
      if (!stored) return navigate("/login");

      const user = JSON.parse(stored);

      if (!user?.token || user?.role !== "admin") {
        return navigate("/dashboard");
      }

      const res = await axios.get(`${API}/users/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError(err.response?.data?.message || "Erreur de chargement ❌");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= FILTRAGE (RECHERCHE & RÔLE) =================
  useEffect(() => {
    let data = [...users];

    if (search) {
      data = data.filter(u =>
        u.nom.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.prenom && u.prenom.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (roleFilter !== "all") {
      data = data.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(data);
  }, [search, roleFilter, users]);

  // ================= SOUMISSION DU FORMULAIRE (CORRIGÉ) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const stored = localStorage.getItem("userInfo");
      const admin = JSON.parse(stored);

      // Préparation du Payload (données envoyées)
      const payload = { ...formUser };
      
      if (editMode) {
        // En mode édition, si le mot de passe est vide, on ne l'envoie pas
        if (!payload.mdp) delete payload.mdp;
        
        await axios.put(`${API}/users/${formUser._id}`, payload, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });
      } else {
        // En mode création, l'ID doit être supprimé pour laisser MongoDB le générer
        delete payload._id;
        
        if (!payload.mdp) {
          setError("Le mot de passe est requis pour un nouveau compte ❌");
          return;
        }

        await axios.post(`${API}/users/register`, payload, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });
      }

      await fetchData(); // Rafraîchir la liste
      closeModal();      // Fermer et réinitialiser
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement ❌");
    }
  };

  // ================= SUPPRESSION =================
  const deleteUser = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      const admin = JSON.parse(localStorage.getItem("userInfo"));
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de suppression ❌");
    }
  };

  // ================= GESTION MODAL =================
  const openEditModal = (user) => {
    setEditMode(true);
    setFormUser({ ...user, mdp: "" }); // On ne charge pas le hash du mot de passe
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormUser({ _id: "", nom: "", prenom: "", email: "", mdp: "", role: "client" });
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-green-50">
        <Loader2 className="animate-spin text-green-600 w-16 h-16 mb-4" />
        <p className="text-green-800 font-bold animate-pulse">Chargement de GreenLife...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white shadow-2xl flex flex-col border-r border-green-100">
        <div className="p-8">
          <h1 className="text-3xl font-black text-green-600 flex items-center gap-2">
            <Leaf className="w-8 h-8" /> GreenLife
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Administration</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="bg-green-600 text-white flex items-center gap-4 px-6 py-4 rounded-2xl font-bold shadow-lg shadow-green-200">
            <Users /> Utilisateurs
          </div>
          {/* Autres liens futurs du projet GreenLife */}
        </nav>

        <div className="p-6 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
            <LogOut /> Déconnexion
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Gestion des Comptes</h2>
            <p className="text-gray-500 mt-2 font-medium">Contrôlez les accès et les rôles de votre plateforme.</p>
          </div>

          <button
            onClick={() => { setEditMode(false); setShowModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1"
          >
            <UserPlus /> Ajouter un membre
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-xl flex items-center gap-3 shadow-sm">
            <X className="bg-red-500 text-white rounded-full p-1 w-5 h-5" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* FILTERS SECTION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all outline-none font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="client">Clients</option>
          </select>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[11px] font-black tracking-[0.2em]">
                <th className="px-10 py-6">Identité</th>
                <th className="px-10 py-6">Coordonnées</th>
                <th className="px-10 py-6">Rôle</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-green-50/40 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform uppercase">
                        {u.nom[0]}
                      </div>
                      <span className="font-bold text-gray-800 text-lg">{u.nom} {u.prenom}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-semibold text-gray-500">{u.email}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(u)} className="p-3 bg-white border border-gray-200 text-blue-500 rounded-xl hover:bg-blue-50 transition-all shadow-sm">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="p-3 bg-white border border-gray-200 text-red-500 rounded-xl hover:bg-red-50 transition-all shadow-sm">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-20 text-center text-gray-400 font-bold">Aucun utilisateur trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL (AJOUT / EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-green-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">{editMode ? "Modifier le profil" : "Nouveau compte"}</h3>
                <p className="text-green-100 text-sm mt-1">{editMode ? "Mise à jour des informations" : "Ajouter un membre à GreenLife"}</p>
              </div>
              <button onClick={closeModal} className="hover:rotate-90 transition-transform"><X size={30} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Nom</label>
                  <input
                    required
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    value={formUser.nom}
                    onChange={(e) => setFormUser({ ...formUser, nom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Prénom</label>
                  <input
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                    value={formUser.prenom}
                    onChange={(e) => setFormUser({ ...formUser, prenom: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Email professionnel</label>
                <input
                  type="email" required
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">
                  {editMode ? "Changer mot de passe (laisser vide si inchangé)" : "Mot de passe"}
                </label>
                <input
                  type="password"
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  value={formUser.mdp}
                  onChange={(e) => setFormUser({ ...formUser, mdp: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Rôle système</label>
                <select
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-600"
                  value={formUser.role}
                  onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
                >
                  <option value="client">Client (Utilisateur standard)</option>
                  <option value="admin">Administrateur (Contrôle total)</option>
                </select>
              </div>

              <button className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-700 transition-all mt-6 flex items-center justify-center gap-3">
                {editMode ? <ShieldCheck /> : <UserPlus />}
                {editMode ? "Enregistrer les modifications" : "Créer le compte"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}