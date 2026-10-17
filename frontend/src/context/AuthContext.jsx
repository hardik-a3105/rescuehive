import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, getCurrentUser } from '../services/api/authApi.js';
import { getStoredToken, clearStoredToken } from '../services/api/client.js';

const AuthContext = createContext();

/**
 * AuthProvider — manages JWT token, current user, and role-based access.
 * Listens for 'rescuehive:auth-expired' events dispatched by the API client
 * when a 401 is received, triggering automatic logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check in progress
  const [authError, setAuthError] = useState(null);

  // ─── Bootstrap: check if we already have a valid token ─────────────
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Token expired or invalid — clear it
        clearStoredToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ─── Listen for forced logout (401 from API client) ────────────────
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setAuthError('Session expired. Please log in again.');
    };
    window.addEventListener('rescuehive:auth-expired', handler);
    return () => window.removeEventListener('rescuehive:auth-expired', handler);
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    const tokenData = await apiLogin(email, password);
    // After login, fetch user profile
    const userData = await getCurrentUser();
    setUser(userData);
    return userData;
  }, []);

  // ─── Register ──────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, role }) => {
    setAuthError(null);
    const userData = await apiRegister({ name, email, password, role });
    return userData;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setAuthError(null);
  }, []);

  // ─── Role utilities ────────────────────────────────────────────────
  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const isAdmin = user?.role === 'ADMIN';
  const isCommander = user?.role === 'INCIDENT_COMMANDER' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
        isAdmin,
        isCommander,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
