import { useState, useEffect, type FormEvent } from "react";
import axios from "axios";
import API from "../api/api";
import "../styles/dashboard.css";

interface UserProfile {
  id: number;
  username: string;
  role: string;
}

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const res = await API.get<UserProfile>("/users/me");
      setProfile(res.data);
    } catch (err: unknown) {
      let msg = "Failed to load user profile.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        msg = err.response?.data?.message || err.response?.data?.error || msg;
      }
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Current password cannot be blank.");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password cannot be blank.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await API.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      const msg = res.data?.message || "Password changed successfully.";
      setPasswordSuccess(msg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      let msg = "Failed to change password.";
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
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboardContent">
      {/* USER DETAILS CARD */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <div className="cardHeader">
          <h2 className="cardTitle">User Profile</h2>
          <p className="cardSubtitle">Your account information</p>
        </div>

        {profileLoading ? (
          <p style={{ opacity: 0.7, padding: "20px 0" }}>Loading profile details...</p>
        ) : profileError ? (
          <div className="alert alertError">{profileError}</div>
        ) : profile ? (
          <div className="profileDetailsGrid">
            <div className="profileItem">
              <div className="profileItemLabel">Username</div>
              <div className="profileItemValue">{profile.username}</div>
            </div>

            <div className="profileItem">
              <div className="profileItemLabel">User ID</div>
              <div className="profileItemValue">#{profile.id}</div>
            </div>

            <div className="profileItem">
              <div className="profileItemLabel">Role</div>
              <div className="profileItemValue">
                <span
                  className={`badge ${
                    profile.role === "ADMIN" ? "badgeAdmin" : "badgeUser"
                  }`}
                >
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* CHANGE PASSWORD CARD */}
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Change Password</h2>
          <p className="cardSubtitle">Ensure your account is using a secure password</p>
        </div>

        {passwordSuccess && (
          <div className="alert alertSuccess">{passwordSuccess}</div>
        )}

        {passwordError && (
          <div className="alert alertError">{passwordError}</div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">Current Password</label>
            <input
              type="password"
              className="inputField"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label className="formLabel">New Password (min 6 characters)</label>
            <input
              type="password"
              className="inputField"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="formLabel">Confirm New Password</label>
            <input
              type="password"
              className="inputField"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={passwordLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="primaryButton"
            disabled={passwordLoading}
            style={{ width: "100%" }}
          >
            {passwordLoading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
