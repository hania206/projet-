import { useState } from "react";
import { registerUser } from "../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("nom", formData.nom);
      data.append("prenom", formData.prenom);
      data.append("email", formData.email);
      data.append("mdp", formData.mdp);

      const res = await registerUser(data);
      setMessage(res.data.message);
      setFormData({ nom: "", prenom: "", email: "", mdp: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 pt-20">
      {/* Form container */}
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-green-200">
        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className="border border-green-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            className="border border-green-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-green-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            name="mdp"
            placeholder="Mot de passe"
            value={formData.mdp}
            onChange={handleChange}
            required
            className="border border-green-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            S'inscrire
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}