import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Lock, Sparkles, TrendingUp, Users, Globe
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <Sparkles size={20} />, title: "IA Prédictive", desc: "Analyse intelligente de vos consommations" },
    { icon: <TrendingUp size={20} />, title: "Suivi Temps Réel", desc: "Dashboard dynamique et interactif" },
    { icon: <Users size={20} />, title: "Communauté", desc: "Classement et défis entre utilisateurs" },
    { icon: <Globe size={20} />, title: "Écologie", desc: "Réduisez votre empreinte carbone" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex flex-col justify-center">
      
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT - TEXT CONTENT */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Propulsé par l'Intelligence Artificielle</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                Votre impact
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  écologique
                </span>
                <br />
                simplifié
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                Suivez, analysez et réduisez votre consommation d'énergie, d'eau et de déchets grâce à notre plateforme intelligente.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 group"
              >
                Se connecter
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate("/register")}
                className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                Créer un compte
              </button>
            </div>
          </div>

          {/* RIGHT - VISUAL CARD */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200 rounded-full blur-[100px] opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200 rounded-full blur-[100px] opacity-50" />
            
            {/* Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Lock className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Espace Sécurisé</h3>
                    <p className="text-sm text-slate-400">Connexion requise</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => navigate("/login")}
                    readOnly
                  />
                  <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => navigate("/login")}
                    readOnly
                  />
                  <button 
                    onClick={() => navigate("/login")}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                  >
                    Se connecter
                  </button>
                </div>

                <p className="text-center text-sm text-slate-400">
                  Pas encore de compte ?{" "}
                  <button onClick={() => navigate("/register")} className="text-emerald-600 font-medium hover:underline">
                    S'inscrire
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Une plateforme complète pour comprendre et réduire votre impact environnemental
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all group">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
