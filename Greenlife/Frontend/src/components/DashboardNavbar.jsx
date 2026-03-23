import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    location.pathname === path
      ? "text-emerald-600 border-b-2 border-emerald-600 pb-1"
      : "hover:text-emerald-600";

  return (
    <header className="bg-white px-12 py-4 shadow border-b">
      <div className="flex justify-between items-center">

        {/* LEFT */}
        <div className="flex gap-12 items-center">
          <h1
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold text-emerald-600 cursor-pointer"
          >
            GreenLife
          </h1>

          {/* NAV */}
          <nav className="flex gap-6 text-gray-600 flex-wrap">

            <button
              onClick={() => navigate("/dashboard")}
              className={linkClass("/dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/add-record")}
              className={linkClass("/add-record")}
            >
              Relevés
            </button>

            <button
              onClick={() => navigate("/objectives")}
              className={linkClass("/objectives")}
            >
              Objectifs
            </button>

            <button
              onClick={() => navigate("/alerts")}
              className={linkClass("/alerts")}
            >
              Alertes
            </button>

            <button
              onClick={() => navigate("/rapports")}
              className={linkClass("/rapports")}
            >
              Rapports
            </button>

            <button
              onClick={() => navigate("/recommandations")}
              className={linkClass("/recommandations")}
            >
              Recommandations
            </button>

          </nav>
        </div>

        {/* RIGHT */}
        <button
          onClick={() => navigate("/login")}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full flex gap-2 hover:bg-emerald-700"
        >
          <User size={18} /> Mon compte
        </button>

      </div>
    </header>
  );
}