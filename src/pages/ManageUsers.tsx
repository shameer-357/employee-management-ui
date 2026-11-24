import { useState, useEffect, type FormEvent } from "react";
import axios from "axios";
import API from "../api/api";
import { getUserRole } from "../utils/auth";
import "../styles/dashboard.css";

interface UserItem {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
}

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function ManageUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // New user form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const currentUserRole = getUserRole();
  const isAdmin = currentUserRole === "ADMIN";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setListError(null);
      const res = await API.get<UserItem[]>("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      let msg = "Failed to load users.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        msg = err.response?.data?.message || err.response?.data?.error || msg;
      }
      setListError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="dashboardContent">
        <div className="card">
          <div className="alert alertError">
            Access Denied: Only administrators have permission to manage users.
          </div>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setFormError("Username cannot be blank.");
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      setFormError("Username must be between 3 and 50 characters.");
      return;
    }

    if (!password) {
      setFormError("Password cannot be blank.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/users", {
        username: trimmedUsername,
        password: password,
        role: role,
      });

      setFormSuccess(`User "${trimmedUsername}" created successfully with role ${role}!`);
      setUsername("");
      setPassword("");
      setRole("USER");
      await fetchUsers();
    } catch (err: unknown) {
      let msg = "Failed to create user.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          msg = errors[firstKey];
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err.response?.data?.error) {
          msg = err.response.data.error;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboardContent">
      {/* CREATE NEW USER CARD */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <div className="cardHeader">
          <h2 className="cardTitle">Create New User</h2>
          <p className="cardSubtitle">Add a new portal user and assign their access role</p>
        </div>

        {formSuccess && (
          <div className="alert alertSuccess">{formSuccess}</div>
        )}

        {formError && (
          <div className="alert alertError">{formError}</div>
        )}

        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">Username</label>
            <input
              className="inputField"
              placeholder="Username (3-50 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">Password</label>
            <input
              type="password"
              className="inputField"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="formLabel">Role</label>
            <select
              className="selectField"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
              disabled={submitting}
            >
              <option value="USER">USER (Standard Employee Access)</option>
              <option value="ADMIN">ADMIN (Full Administrative Access)</option>
            </select>
          </div>

          <button
            type="submit"
            className="primaryButton"
            disabled={submitting}
            style={{ width: "100%" }}
          >
            {submitting ? "Creating User..." : "Create User"}
          </button>
        </form>
      </div>

      {/* ALL USERS LIST CARD */}
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">System Users</h2>
          <p className="cardSubtitle">All registered user accounts</p>
        </div>

        {listError && <div className="alert alertError">{listError}</div>}

        <div className="tableResponsive">
          <table className="employeeTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "30px" }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "30px", opacity: 0.7 }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "ADMIN" ? "badgeAdmin" : "badgeUser"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
