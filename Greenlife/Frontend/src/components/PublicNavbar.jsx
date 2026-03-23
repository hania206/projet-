import { useNavigate } from "react-router-dom";

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-green-200 px-12 py-4 flex justify-between">
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold text-green-700 cursor-pointer"
      >
        GreenLife
      </h1>

      <nav className="flex gap-6 items-center">
        <button>Fonctionnalités</button>
        <button>Impact</button>
        <button onClick={() => navigate("/login")}>Connexion</button>

        <button className="bg-green-600 text-white px-4 py-2 rounded-full">
          S'inscrire
        </button>
      </nav>
    </header>
  );
}