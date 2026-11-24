import { NavLink, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import "../styles/dashboard.css";

function Sidebar() {
  const navigate = useNavigate();
  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="sidebarTitle">Portal</div>

      <div className="sidebarMenu">
        <NavLink
          to="/dashboard/employees"
          className={({ isActive }) =>
            `sidebarItem ${isActive ? "sidebarItemActive" : ""}`
          }
        >
          Employees
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/dashboard/register"
            className={({ isActive }) =>
              `sidebarItem ${isActive ? "sidebarItemActive" : ""}`
            }
          >
            Register Employee
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/dashboard/users"
            className={({ isActive }) =>
              `sidebarItem ${isActive ? "sidebarItemActive" : ""}`
            }
          >
            Manage Users
          </NavLink>
        )}

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `sidebarItem ${isActive ? "sidebarItemActive" : ""}`
          }
        >
          Profile
        </NavLink>
      </div>

      <div className="sidebarLogout">
        <div className="sidebarItem" onClick={logout}>
          Logout
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
