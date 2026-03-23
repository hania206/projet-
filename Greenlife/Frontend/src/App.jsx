import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardNavbar from "./components/DashboardNavbar"; // 👈 نزيدوه

import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Objectives from "./pages/Objectives";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddRecord from "./pages/AddRecord";
import Dashboard from "./pages/Dashboard";
import Rapports from "./pages/Rapports";
import Recommandations from "./pages/Recommandations";

export default function App() {
  return (
    <Routes>

      {/* 🌍 Public pages */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <Home />
            <Footer />
          </>
        }
      />

      <Route
        path="/login"
        element={
          <>
            <Header />
            <Login />
          </>
        }
      />

      <Route
        path="/register"
        element={
          <>
            <Header />
            <Register />
          </>
        }
      />

      {/* 🔐 Dashboard pages */}
      <Route
        path="/dashboard"
        element={
          <>
            <DashboardNavbar />
            <Dashboard />
          </>
        }
      />

      <Route
        path="/objectives"
        element={
          <>
            <DashboardNavbar />
            <Objectives />
          </>
        }
      />

      <Route
        path="/alerts"
        element={
          <>
            <DashboardNavbar />
            <Alerts />
          </>
        }
      />

      <Route
        path="/add-record"
        element={
          <>
            <DashboardNavbar />
            <AddRecord />
          </>
        }
      />

      <Route
        path="/rapports"
        element={
          <>
            <DashboardNavbar />
            <Rapports />
          </>
        }
      />

      <Route
        path="/recommandations"
        element={
          <>
            <DashboardNavbar />
            <Recommandations />
          </>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h1>404 Not Found</h1>} />

    </Routes>
  );
}