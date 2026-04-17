import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.mdp) {
      setError("Tous les champs sont obligatoires ❌");
      return;
    }

    if (formData.mdp !== formData.confirm) {
      setError("Les mots de passe ne correspondent pas ❌");
      return;
    }

    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim().toLowerCase(),
      mdp: formData.mdp,
      // ❌ ما عادش نبعث role
    };

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/users/register",
        payload
      );

      alert("Inscription réussie ✅");
      navigate("/login");

    } catch (err) {
      const message =
        err.response?.data?.message || "Erreur serveur ❌";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden min-h-[650px]">
        
        {/* LEFT */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-600 to-green-400 p-12 text-white flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">GreenLife 🌱</h2>
          <p className="text-lg">
            Commencez votre voyage vers un mode de vie durable.
          </p>
        </div>

        {/* RIGHT */}
        <div className="md:w-7/12 p-8 md:p-14 bg-white">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Créer un compte
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 border rounded-lg md:col-span-2"
            />

            <input
              type="password"
              name="mdp"
              placeholder="Mot de passe"
              value={formData.mdp}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="password"
              name="confirm"
              placeholder="Confirmation"
              value={formData.confirm}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 p-4 bg-green-600 text-white rounded-xl font-bold"
            >
              {loading ? "Création..." : "S'inscrire"}
            </button>
          </form>

          <p className="mt-6 text-center">
            Déjà un compte ?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-600 font-bold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}