import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedSuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  if (role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedSuperAdminRoute;