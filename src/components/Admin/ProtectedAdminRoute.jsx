import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../pages/context/ContextApi";

const ProtectedAdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;