import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = getUserRole();
  if (role !== "ADMIN") {
    return <Navigate to="/dashboard/employees" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
