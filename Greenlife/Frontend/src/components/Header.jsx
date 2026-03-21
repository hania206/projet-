import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-green-100 border-b-4 border-green-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        
        {/* Logo */}
        <h1 className="text-green-700 font-bold text-xl">GreenLife</h1>

        {/* Menu */}
        <nav className="hidden md:flex space-x-8 text-gray-700">
          <a href="#features" className="hover:text-green-600">Fonctionnalités</a>
          <a href="#impact" className="hover:text-green-600">Impact</a>
          <Link to="/login" className="hover:text-green-600">Connexion</Link>
        </nav>

        {/* Button */}
        <Link
          to="/register"
          className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700"
        >
          S'inscrire
        </Link>
      </div>
    </header>
  );
}



























