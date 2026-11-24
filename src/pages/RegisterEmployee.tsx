import { useState, type FormEvent } from "react";
import axios from "axios";
import API from "../api/api";
import { getUserRole } from "../utils/auth";
import "../styles/dashboard.css";

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function RegisterEmployee() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="dashboardContent">
        <div className="card">
          <div className="alert alertError">
            Access Denied: Only administrators have permission to register new employees.
          </div>
        </div>
      </div>
    );
  }

  const registerEmployee = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedDept = department.trim();

    if (!trimmedName) {
      setErrorMessage("Employee name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedDept) {
      setErrorMessage("Department is required.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/employees", {
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDept,
      });

      setName("");
      setEmail("");
      setDepartment("");
      setSuccessMessage("Employee added successfully!");
    } catch (err: unknown) {
      let msg = "Failed to register employee.";
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
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboardContent">
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Add Employee</h2>
          <p className="cardSubtitle">Register a new employee into the system</p>
        </div>

        {successMessage && (
          <div className="alert alertSuccess">{successMessage}</div>
        )}

        {errorMessage && <div className="alert alertError">{errorMessage}</div>}

        <form onSubmit={registerEmployee}>
          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">Full Name</label>
            <input
              className="inputField"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">Email Address</label>
            <input
              type="email"
              className="inputField"
              placeholder="e.g. jane.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="formLabel">Department</label>
            <input
              className="inputField"
              placeholder="e.g. Engineering, Sales, Human Resources"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="primaryButton"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Registering Employee..." : "Register Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterEmployee;
