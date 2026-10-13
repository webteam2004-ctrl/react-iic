import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          color: "#2E2A8F",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        Authenticating...
      </div>
    );
  }

  const storedToken = token || localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin");

  if (!storedToken || (isAdmin !== "true" && !user)) {
    return <Navigate to="/admin-portal-login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;