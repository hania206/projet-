import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, ShieldCheck, Info, Leaf, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  // État dynamique pour tous les champs
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    email: '',
    type: 'foyer', // Valeur par défaut
    pass: '',
    confirm: ''
  });

  const [showPass, setShowPass] = useState(false);

  // Fonction de mise à jour universelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.pass !== formData.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    console.log("Données envoyées :", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[32px] shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden min-h-[650px]">
        
        {/* Panneau Gauche (Identique à l'image) */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-400 p-12 text-white flex flex-col justify-center relative">
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-8">
              <Leaf size={14} fill="currentColor" /> GreenLife
            </div>
            <h2 className="text-5xl font-black mb-6 leading-tight uppercase tracking-tight">Créer un compte</h2>
            <p className="text-emerald-50 opacity-90 text-lg mb-8 font-light leading-relaxed">
              Créez votre espace foyer et commencez le suivi écologique.
            </p>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3"><ShieldCheck size={20} className="text-emerald-200" /> Profil vérifié (UI)</li>
              <li className="flex items-center gap-3"><Mail size={20} className="text-emerald-200" /> Confirmation email (mock)</li>
            </ul>
          </div>
        </div>

        {/* Panneau Droit (Formulaire Dynamique) */}
        <div className="md:w-7/12 p-8 md:p-14 bg-white relative">
          <div className="absolute top-8 right-8 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <User size={18} />
          </div>

          <header className="mb-8">
            <span className="text-[10px] uppercase tracking-[3px] font-bold text-gray-400 block mb-1 italic">Inscription</span>
            <h1 className="text-2xl font-extrabold text-slate-800">GreenLife</h1>
          </header>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Ligne Nom & Ville */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Nom</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" name="nom" value={formData.nom} onChange={handleChange} required
                    placeholder="Ex: Famille Durand" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Ville</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" name="ville" value={formData.ville} onChange={handleChange} required
                    placeholder="Ex: Nantes" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="foyer@exemple.com" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" 
                />
              </div>
            </div>

            {/* Type de compte */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Type de compte</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500" size={18} />
                <select 
                  name="type" value={formData.type} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition appearance-none text-slate-600"
                >
                  <option value="foyer">Espace Foyer</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            {/* Mots de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-emerald-500" size={18} />
                  <input 
                    type={showPass ? "text" : "password"} name="pass" value={formData.pass} onChange={handleChange} required
                    placeholder="********" 
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                  />
                  <button 
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-emerald-500"
                  >
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Confirmer</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" name="confirm" value={formData.confirm} onChange={handleChange} required
                    placeholder="********" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] mt-6">
              S'inscrire
            </button>

            <div className="flex justify-between items-center text-xs font-medium text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" required className="accent-emerald-600 w-4 h-4 cursor-pointer" /> 
                <span className="group-hover:text-emerald-600 transition">J'accepte les conditions</span>
              </label>
              <button type="button" className="text-slate-800 font-bold hover:text-emerald-600 underline underline-offset-4 transition">
                Déjà un compte ?
              </button>
            </div>

            {/* Bloc Info */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 mt-6 flex gap-4 transition-all hover:bg-emerald-50">
              <div className="bg-white p-2 rounded-lg shadow-sm self-start"><Info size={18} className="text-emerald-600" /></div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-0.5">Conseil</h4>
                <p className="text-[11px] text-emerald-700/80 leading-tight italic">
                  Renseignez votre ville pour recevoir des recommandations IA adaptées à votre climat local.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
