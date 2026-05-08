import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple côté client
    if (newPassword.length < 8) {
      return toast.error("Le mot de passe doit contenir au moins 8 caractères 🔒");
    }

    setLoading(true);
    try {
      // Appel au backend
      const response = await axios.post("http://localhost:5000/api/users/reset-password", {
        token,
        newPassword
      });

      // On utilise le message de succès envoyé par le controller
      toast.success(response.data.message || "Mot de passe réinitialisé ! ✅");
      
      // Petite pause pour laisser l'utilisateur lire le message avant redirection
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      // Gestion de l'expiration du token ou erreur serveur
      const errorMsg = err.response?.data?.message || "Le lien a expiré ou est invalide ❌";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md border border-green-100 transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-green-700">
            GreenLife 🍃
          </h2>
          <p className="text-gray-500 mt-2">Réinitialisation sécurisée</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
              placeholder="Minimum 8 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-95"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mise à jour...
              </span>
            ) : (
              "Confirmer le changement"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Sécurité renforcée par chiffrement SSL GreenLife.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;