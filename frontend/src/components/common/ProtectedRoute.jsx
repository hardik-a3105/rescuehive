import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — wraps child routes requiring authentication.
 * Shows a full-screen loader during the initial auth bootstrap,
 * then redirects unauthenticated users to /login.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Still checking stored token — show branded loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest uppercase text-slate-500">
          Authenticating Operator Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
