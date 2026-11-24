import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import API from "../api/api";
import { isAuthenticated } from "../utils/auth";
import "../styles/login.css";

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard/employees", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      // Safe token extraction
      const token = res.data?.token ?? res.data;
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received from server.");
      }

      localStorage.setItem("token", token);
      navigate("/dashboard/employees");
    } catch (err: unknown) {
      let serverMessage = "Invalid username or password.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        serverMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          serverMessage;
      } else if (err instanceof Error) {
        serverMessage = err.message;
      }
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="card loginCard">
        <h1 className="loginTitle">Employee Portal</h1>
        <p className="loginSubtitle">Secure management system</p>

        {successMessage && (
          <div className="alert alertSuccess">{successMessage}</div>
        )}

        {errorMessage && <div className="alert alertError">{errorMessage}</div>}

        <form onSubmit={handleLogin}>
          <input
            className="inputField"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
            required
          />

          <input
            type="password"
            className="inputField"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="primaryButton"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="authLinkContainer">
          <span>Don't have an account? </span>
          <Link to="/signup" className="authLink">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
