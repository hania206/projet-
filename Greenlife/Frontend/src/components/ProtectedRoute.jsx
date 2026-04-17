// src/components/ProtectedRoute.jsx
/*import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("userInfo"); // vérifie si utilisateur connecté

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />; // redirige vers login si non connecté
  }

  return children; // sinon rend le contenu protégé
}*/