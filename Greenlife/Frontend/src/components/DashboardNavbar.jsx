import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  Bell, 
  FileText, 
  Lightbulb 
} from "lucide-react";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // On garde seulement les liens qui ne sont pas "Statistiques" ou "Paramètres"
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={16}/> },
    { name: "Relevés", path: "/add-record", icon: <PlusCircle size={16}/> },
    { name: "Objectifs", path: "/objectives", icon: <Target size={16}/> },
    { name: "Alertes", path: "/alerts", icon: <Bell size={16}/> },
    { name: "Rapports", path: "/rapports", icon: <FileText size={16}/> },
    { name: "Conseils", path: "/recommandations", icon: <Lightbulb size={16}/> },
  ];

  const linkClass = (path) =>
    location.pathname === path
      ? "text-emerald-600 border-b-2 border-emerald-600 pb-1 font-bold flex items-center gap-2"
      : "text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-2";

  return (
    <header className="bg-white px-8 py-4 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">

        {/* LOGO & NAVIGATION CENTRALE */}
        <div className="flex gap-10 items-center">
          <h1
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-black text-emerald-600 cursor-pointer tracking-tighter flex items-center gap-2"
          >
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
               <span className="block w-4 h-4 bg-white rounded-full opacity-20"></span>
            </div>
            GreenLife
          </h1>

          <nav className="hidden xl:flex gap-8 text-sm font-medium">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={linkClass(item.path)}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* SECTION DROITE (Espace vide ou bouton d'ajout rapide uniquement) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/add-record")}
            className="hidden sm:flex bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl items-center gap-2 hover:bg-emerald-100 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <PlusCircle size={16} /> 
            Nouveau
          </button>
        </div>

      </div>
    </header>
  );
}