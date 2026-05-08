import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function DashboardNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "📊 Dashboard" },
    { path: "/add-record", label: "➕ Ajouter un record" },
    { path: "/objectives", label: "🎯 Objectifs" },
    { path: "/alerts", label: "⚠️ Alertes" },
    { path: "/rapports", label: "📄 Rapports" },
    { path: "/recommandations", label: "💡 Recommandations" },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-600">GreenLife</span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === item.path
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Déconnexion */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem("userInfo");
                navigate("/login");
              }}
              className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🚪 Déconnexion
            </button>
          </div>

          {/* Menu mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  localStorage.removeItem("userInfo");
                  navigate("/login");
                }}
                className="px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}