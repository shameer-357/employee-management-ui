import { getUsername, getUserRole } from "../utils/auth";
import "../styles/dashboard.css";

function Header() {
  const username = getUsername();
  const role = getUserRole();

  return (
    <div className="header">
      <h2>Employee Management</h2>
      {username && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", color: "#cbd5e1" }}>
            Welcome, <strong>{username}</strong>
          </span>
          {role && (
            <span
              className={`badge ${
                role === "ADMIN" ? "badgeAdmin" : "badgeUser"
              }`}
            >
              {role}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
