// components/PublicNavbar.jsx
import { useNavigate } from "react-router-dom";

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-emerald-600 cursor-pointer hover:text-emerald-700 transition-colors"
      >
        🌿 GreenLife
      </h1>

      <nav className="flex gap-4 md:gap-6 items-center flex-wrap justify-center">
        <button 
          onClick={() => navigate("/features")}
          className="text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Fonctionnalités
        </button>
        <button 
          onClick={() => navigate("/impact")}
          className="text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Impact
        </button>
        <button 
          onClick={() => navigate("/login")}
          className="text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Connexion
        </button>

        <button 
          onClick={() => navigate("/register")}
          className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors shadow-md"
        >
          S'inscrire
        </button>
      </nav>
    </header>
  );
}