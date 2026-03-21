import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Foyer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);

      // ✅ save user (important)
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Login successful ✅");

      // ✅ redirect حسب role
      if (form.role === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe incorrect ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex overflow-hidden">

        {/* LEFT */}
        <div className="w-1/2 bg-gradient-to-br from-green-500 to-green-700 text-white p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">WELCOME BACK</h1>
          <p className="mb-6">
            Connectez-vous pour suivre vos consommations et alertes écologiques.
          </p>

          <div className="space-y-2 text-sm">
            <p>✔ Connexion sécurisée</p>
            <p>📧 support@demo.com</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/2 p-10">
          <h2 className="text-sm text-gray-400">LOGIN ACCOUNT</h2>
          <h1 className="text-2xl font-bold mb-6">GreenLife</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="foyer@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />

            {/* Role */}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option>Foyer</option>
              <option>Admin</option>
            </select>

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />

            {/* Button */}
            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* 🔗 REGISTER LINK */}
          <p className="mt-4 text-sm text-center">
            Pas de compte ?
            <span
              onClick={() => navigate("/register")}
              className="text-green-600 cursor-pointer ml-1"
            >
              S'inscrire
            </span>
          </p>

          {/* DEMO */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
            <p className="font-semibold">Accès démo</p>
            <p>Email: admin@demo.com</p>
            <p>Mot de passe: Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
