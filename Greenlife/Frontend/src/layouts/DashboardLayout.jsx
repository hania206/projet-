import React, { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  Leaf, Home, BarChart3, Settings, LogOut, 
  Target, AlertTriangle, FileText, Lightbulb,
  PlusCircle, Trophy, Bell, Menu, X
} from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainMenu = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/add-record", label: "Ajouter", icon: <PlusCircle size={20} /> },
    { path: "/objectives", label: "Objectifs", icon: <Target size={20} /> },
    { path: "/alerts", label: "Alertes", icon: <AlertTriangle size={20} /> },
    { path: "/rapports", label: "Rapports", icon: <FileText size={20} /> },
    { path: "/recommandations", label: "Recommandations", icon: <Lightbulb size={20} /> },
  ];

  const bottomMenu = [
    { path: "/ranking", label: "Classement", icon: <Trophy size={20} /> },
    { path: "/statistics", label: "Analyses", icon: <BarChart3 size={20} /> },
    { path: "/notifications", label: "Notifications", icon: <Bell size={20} /> },
    { path: "/settings", label: "Réglages", icon: <Settings size={20} /> },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} h-full bg-white shadow-lg flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl flex-shrink-0">
              <Leaf size={20} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent whitespace-nowrap">
                GreenLife
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
          >
            {sidebarOpen ? <Menu size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu principal */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mainMenu.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                location.pathname === item.path
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Menu du bas */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          {bottomMenu.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                location.pathname === item.path
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Déconnexion */}
        <div className="p-3 border-t border-gray-100">
          <button 
            onClick={() => { localStorage.removeItem("userInfo"); navigate("/login"); }} 
            className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all overflow-hidden"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}