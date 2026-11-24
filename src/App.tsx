import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Employees from "./pages/Employees";
import RegisterEmployee from "./pages/RegisterEmployee";
import Profile from "./pages/Profile";
import ManageUsers from "./pages/ManageUsers";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/employees" replace />} />
          <Route path="employees" element={<Employees />} />
          <Route path="profile" element={<Profile />} />

          {/* ADMIN-only Pages */}
          <Route element={<AdminRoute />}>
            <Route path="register" element={<RegisterEmployee />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
