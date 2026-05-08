import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Loader2, Mail, ArrowRight } from "lucide-react";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    mdp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔐 Mot de passe oublié
  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Veuillez saisir votre email d'abord 📧");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email: form.email.trim().toLowerCase() }
      );

      console.log("✅ Réponse forgot password:", res.data);
      setMessage(res.data.message || "Lien envoyé ! Vérifiez votre boîte mail 📥");
      
    } catch (err) {
      console.error("❌ Erreur forgot password:", err);
      const errorMsg = err.response?.data?.message || "Erreur lors de l'envoi. Vérifiez votre connexion.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        mdp: form.mdp.trim(),
      };

      const res = await axios.post("http://localhost:5000/api/users/login", payload);

      console.log('📥 Réponse login:', res.data);

      // Sauvegarder dans localStorage
      localStorage.setItem("userInfo", JSON.stringify({
        ...res.data.user,
        token: res.data.token
      }));

      // Appeler onLogin si fourni
      if (onLogin) {
        onLogin(res.data.user, res.data.token);
      }

      // Redirection selon le rôle
      const role = res.data.user?.role || res.data.role;
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      
    } catch (err) {
      console.error("❌ Erreur login:", err);
      const errorMsg = err.response?.data?.message || "Email ou mot de passe incorrect";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fee7] p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 border border-green-100">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-green-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-green-800">GreenLife</h1>
          <p className="text-slate-500 font-medium mt-1">Heureux de vous revoir !</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold text-sm border-l-4 border-red-500">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold text-sm border-l-4 border-green-500">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              name="mdp"
              placeholder="Mot de passe"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={form.mdp}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-xs text-green-600 font-bold hover:underline disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "Mot de passe oublié ?"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              Se connecter <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-sm text-slate-500 font-semibold hover:text-green-600"
          >
            Nouveau ici ? <span className="text-green-600 font-bold">Créer un compte</span>
          </button>
        </div>
      </form>
    </div>
  );
}