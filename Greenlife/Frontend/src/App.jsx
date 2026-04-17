import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardNavbar from "./components/DashboardNavbar";

// Pages Publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Pages Dashboard
import Dashboard from "./pages/Dashboard";
import AddRecord from "./pages/AddRecord";
import Alerts from "./pages/Alerts";
import Objectives from "./pages/Objectives";
import Rapports from "./pages/Rapports";
import Recommandations from "./pages/Recommandations";
import Notifications from "./pages/Notifications"; // 🔥 AJOUT IMPORTANT

// Pages pro
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

// AUTH CHECK
const RequireAuth = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("userInfo");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route path="/" element={<><Header /><Home /><Footer /></>} />
      <Route path="/login" element={<><Header /><Login /></>} />
      <Route path="/register" element={<><Header /><Register /></>} />

      {/* 🔐 DASHBOARD ROUTES */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/add-record"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <AddRecord />
          </RequireAuth>
        }
      />

      <Route
        path="/statistics"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Statistics />
          </RequireAuth>
        }
      />

      <Route
        path="/settings"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Settings />
          </RequireAuth>
        }
      />

      <Route
        path="/objectives"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Objectives />
          </RequireAuth>
        }
      />

      <Route
        path="/alerts"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Alerts />
          </RequireAuth>
        }
      />

      <Route
        path="/rapports"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Rapports />
          </RequireAuth>
        }
      />

      <Route
        path="/recommandations"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Recommandations />
          </RequireAuth>
        }
      />

      
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <DashboardNavbar />
            <Notifications />
          </RequireAuth>
        }
      />

      {/* 👑 ADMIN */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      />

      {/* ❌ 404 */}
      <Route
        path="*"
        element={
          <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
            <h1 className="text-9xl font-black text-slate-200">404</h1>
            <p className="text-slate-500 font-bold -mt-4">
              Page introuvable
            </p>

            <button
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Retour
            </button>
          </div>
        }
      />
    </Routes>
  );
}