import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

export const getDecodedToken = (): DecodedToken | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return null;
    }
    return decoded;
  } catch {
    localStorage.clear();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getDecodedToken() !== null;
};

export const getUserRole = (): string | null => {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
};

export const getUsername = (): string | null => {
  const decoded = getDecodedToken();
  return decoded?.sub ?? null;
};

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/";
};
