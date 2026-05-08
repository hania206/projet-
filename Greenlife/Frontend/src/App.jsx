import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import DashboardNavbar from './components/DashboardNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Objectives from './pages/Objectives';
import Ranking from './pages/Ranking';
import Rapports from './pages/Rapports';
import Recommandations from './pages/Recommandations';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Alerts from './pages/Alerts';
import AddRecord from './pages/AddRecord';
import ResetPassword from './pages/ResetPassword';
import './App.css';

// Layout avec DashboardNavbar
const DashboardPage = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <DashboardNavbar />
    <main className="flex-1 bg-gray-50">
      {children}
    </main>
  </div>
);

// Layout avec PublicNavbar + Footer (uniquement Home)
const HomePage = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <PublicNavbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== PAGES SANS HEADER/FOOTER (LAYOUT INTERNE) ==================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ==================== PAGE D'ACCUEIL avec PublicNavbar + Footer ==================== */}
        <Route path="/" element={<HomePage><Home /></HomePage>} />

        {/* ==================== PAGES AVEC LEUR PROPRE HEADER (SANS DashboardNavbar) ==================== */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />

        {/* ==================== PAGES AVEC DashboardNavbar ==================== */}
        <Route path="/dashboard" element={<DashboardPage><Dashboard /></DashboardPage>} />
        <Route path="/add-record" element={<DashboardPage><AddRecord /></DashboardPage>} />
        <Route path="/objectives" element={<DashboardPage><Objectives /></DashboardPage>} />
        <Route path="/alerts" element={<DashboardPage><Alerts /></DashboardPage>} />
        <Route path="/rapports" element={<DashboardPage><Rapports /></DashboardPage>} />
        <Route path="/recommandations" element={<DashboardPage><Recommandations /></DashboardPage>} />
        <Route path="/ranking" element={<DashboardPage><Ranking /></DashboardPage>} />
        <Route path="/notifications" element={<DashboardPage><Notifications /></DashboardPage>} />
      </Routes>
    </Router>
  );
}

export default App;