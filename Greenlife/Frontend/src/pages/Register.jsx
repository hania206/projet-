import React, { useState } from "react";
import { 
  ArrowLeft, User, Mail, Lock, Loader2, CheckCircle2,
  AlertTriangle, Eye, EyeOff, Leaf
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    confirmMdp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      setMessage({ type: "error", text: "Le nom est requis" });
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "L'email est requis" });
      return;
    }
    if (!formData.mdp || formData.mdp.length < 6) {
      setMessage({ type: "error", text: "Mot de passe: 6 caractères minimum" });
      return;
    }
    if (formData.mdp !== formData.confirmMdp) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(`${API_URL}/api/users/register`, {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim().toLowerCase(),
        mdp: formData.mdp,
        role: "client"
      });

      localStorage.setItem("userInfo", JSON.stringify({
        user: data.user,
        token: data.token
      }));
      localStorage.setItem("token", data.token);

      setMessage({ type: "success", text: "Compte créé ! Redirection..." });
      
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error) {
      let errorText = "Erreur serveur";
      if (error.response?.data?.message) {
        errorText = error.response.data.message;
      }
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-6 hover:text-emerald-700">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-emerald-600 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-800">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-2">Rejoignez GreenLife</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
              message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Nom *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Prénom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Votre prénom" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? "text" : "password"} name="mdp" value={formData.mdp} onChange={handleChange} placeholder="Min. 6 caractères" className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Confirmer *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" name="confirmMdp" value={formData.confirmMdp} onChange={handleChange} placeholder="Répétez le mot de passe" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-medium" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="animate-spin" size={20} /> Inscription...</> : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{" "}
              <button onClick={() => navigate("/login")} className="text-emerald-600 hover:text-emerald-700 font-bold">Se connecter</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}