import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  // Si no hay token, redirige al login
  if (!token || token.trim() === "") {
    return <Navigate to="/" replace />;
  }
  
  if (!rol || !allowedRoles || !allowedRoles.includes(rol)) {
    return <Navigate to="/unauthorized" />;
  }

  // Si hay token, renderiza lo que se le pasó como children
  return children;
};

export default PrivateRoute;
