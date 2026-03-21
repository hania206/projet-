import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

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
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/objectives" element={<Objectives />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/addRecord" element={<AddRecord />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rapports" element={<Rapports />} />
        <Route path="/recommandations" element={<Recommandations />} />
      </Routes>

      <Footer />
    </>
  );
}