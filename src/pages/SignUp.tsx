import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API from "../api/api";
import { isAuthenticated } from "../utils/auth";
import "../styles/login.css";

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function SignUp() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard/employees", { replace: true });
    }
  }, [navigate]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage("Username cannot be blank.");
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      setErrorMessage("Username must be between 3 and 50 characters.");
      return;
    }

    if (!password) {
      setErrorMessage("Password cannot be blank.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", {
        username: trimmedUsername,
        password: password,
      });

      // Redirect to login on success with success notification
      navigate("/", {
        state: { message: "Account created successfully! Please sign in." },
      });
    } catch (err: unknown) {
      let message = "Registration failed. Please try again.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        if (err.response?.data?.errors) {
          const errors = err.response.data.errors;
          const firstErrorKey = Object.keys(errors)[0];
          message = errors[firstErrorKey];
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.response?.data?.error) {
          message = err.response.data.error;
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="card loginCard">
        <h1 className="loginTitle">Create Account</h1>
        <p className="loginSubtitle">Sign up for Employee Portal access</p>

        {errorMessage && <div className="alert alertError">{errorMessage}</div>}

        <form onSubmit={handleSignUp}>
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          <input
            type="password"
            className="inputField"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            className="primaryButton"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="authLinkContainer">
          <span>Already have an account? </span>
          <Link to="/" className="authLink">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
