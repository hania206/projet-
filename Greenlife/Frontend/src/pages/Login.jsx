import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, ArrowRight, Leaf, Loader2, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", mdp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        mdp: form.mdp.trim(),
      };

      const res = await axios.post("http://localhost:5000/api/users/login", payload);
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      // Redirection intelligente
      if (res.data.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants invalides ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fee7] relative overflow-hidden font-sans">
      
      {/* 🍃 Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-green-200/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-emerald-200/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse delay-1000"></div>

      {/* 🟢 Conteneur Principal */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row m-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-3xl border border-white/50">
        
        {/* Section Gauche : Visuelle & Message */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">GreenLife</span>
            </div>
            <h2 className="text-5xl font-black leading-tight mb-6">Faisons un geste pour la planète.</h2>
            <p className="text-green-100 text-lg font-medium leading-relaxed">
              Suivez votre consommation, réduisez votre impact carbone et recevez des conseils personnalisés par IA.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <CheckCircle className="text-green-300" />
              <span className="text-sm font-bold">Analyse IA en temps réel</span>
            </div>
          </div>

          {/* Décoration abstraite interne */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Section Droite : Formulaire */}
        <div className="w-full md:w-1/2 bg-white/80 p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h3 className="text-3xl font-black text-slate-800 mb-2">Bon retour !</h3>
            <p className="text-slate-500 font-semibold uppercase text-xs tracking-[0.2em]">Accédez à votre espace vert</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-8 font-bold text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-600 transition-colors w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
                <button type="button" className="text-[10px] font-black text-green-600 hover:text-green-800 transition-colors">Oublié ?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-600 transition-colors w-5 h-5" />
                <input
                  type="password"
                  name="mdp"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={form.mdp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative bg-slate-900 text-white py-5 rounded-2xl font-black text-lg overflow-hidden transition-all duration-300 hover:bg-green-600 hover:shadow-[0_20px_40px_-10px_rgba(22,163,74,0.4)] active:scale-[0.98] disabled:bg-slate-300"
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>Se connecter <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold text-sm">
              Nouveau ici ?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-green-600 hover:text-green-800 underline decoration-2 underline-offset-8 transition-all"
              >
                Rejoignez le mouvement
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}