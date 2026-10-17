import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  UserCheck, 
  AlertCircle, 
  Loader2, 
  Radio, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, authError } = useAuth();

  // If already authenticated, redirect immediately
  const from = location.state?.from?.pathname || '/dashboard';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // View state: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form states
  const [email, setEmail] = useState('commander@rescuehive.dev');
  const [password, setPassword] = useState('commander123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('FIELD_OPERATOR');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(authError || null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Preset demo accounts
  const demoAccounts = [
    {
      label: 'Incident Commander',
      role: 'INCIDENT_COMMANDER',
      email: 'commander@rescuehive.dev',
      pass: 'commander123',
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20',
    },
    {
      label: 'Field Operator',
      role: 'FIELD_OPERATOR',
      email: 'operator@rescuehive.dev',
      pass: 'operator123',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
    },
    {
      label: 'System Admin',
      role: 'ADMIN',
      email: 'admin@rescuehive.dev',
      pass: 'admin123',
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
    },
  ];

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setMode('login');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await register({ name, email, password, role });
        setSuccessMessage('Registration successful! Logging in with your new credentials...');
        await login(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-xl shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <ShieldAlert className="w-9 h-9 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-wider text-white">
              RESCUEHIVE
            </h1>
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
              Disaster Intelligence Command Core
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-sans">
            AI-Powered Multi-Robot Autonomous Search and Rescue Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all font-semibold ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all font-semibold ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Operator
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Full Operator Name:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Commander Sarah Vance"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Command Station Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@rescuehive.dev"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Passcode / Access Token:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Assigned Operational Role:
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FIELD_OPERATOR">Field Operator (Telemetry & Detections)</option>
                    <option value="INCIDENT_COMMANDER">Incident Commander (Sortie Authority)</option>
                    <option value="ADMIN">System Administrator (Full Oversight)</option>
                  </select>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full font-mono text-xs gap-2 py-3 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Authorizing Station...' : 'Registering Credentials...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Authenticate Terminal' : 'Create Operator Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              Quick Demo Accounts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`p-2 rounded-lg border text-[11px] font-mono text-left transition-all ${acc.color}`}
                >
                  <div className="font-bold truncate">{acc.label}</div>
                  <div className="text-[9.5px] opacity-75 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-mono text-slate-600">
          RescueHive Fleet Overwatch • Connected to FastAPI REST Core
        </div>
      </div>
    </div>
  );
}
