import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "client", // ⚠️ مهم: نفس backend (مش Foyer)
    mdp: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mettre à jour les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Soumission du formulaire
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Vérification des champs
    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.email ||
      !formData.mdp
    ) {
      setError("Tous les champs sont obligatoires ❌");
      return;
    }

    // Vérifier les mots de passe
    if (formData.mdp !== formData.confirm) {
      setError("Les mots de passe ne correspondent pas ❌");
      return;
    }

    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim(),
      mdp: formData.mdp,
      role: formData.role,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        payload
      );

      console.log("Réponse backend:", response.data);

      alert("Inscription réussie ✅");

      // Redirection vers login
      navigate("/login");

    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Impossible de contacter le serveur ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden min-h-[650px]">

        {/* Partie gauche */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 to-green-400 p-12 text-white flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">Créer un compte</h2>
          <p>Commencez votre suivi écologique 🌱</p>
        </div>

        {/* Partie droite */}
        <div className="md:w-7/12 p-8 md:p-14 bg-white">
          <h1 className="text-2xl font-bold mb-6">Inscription</h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-4">

            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full p-3 border rounded"
            />

            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full p-3 border rounded"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border rounded"
            />

            {/* Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            >
              <option value="client">Client</option>
              <option value="Admin">Admin</option>
            </select>

            <input
              type="password"
              name="mdp"
              value={formData.mdp}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full p-3 border rounded"
            />

            <input
              type="password"
              name="confirm"
              value={formData.confirm}
              onChange={handleChange}
              placeholder="Confirmer le mot de passe"
              className="w-full p-3 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>

            <p className="text-sm text-center mt-4">
              Déjà un compte ?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-green-600 cursor-pointer underline"
              >
                Se connecter
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}