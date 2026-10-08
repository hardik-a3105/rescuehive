import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, Mail, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('commander@rescuehive.io');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Instant simulation login flow
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <ShieldAlert className="w-8 h-8 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-wider text-white">
              RESCUEHIVE
            </h1>
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
              Command Core // Phase 1 Simulation
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            AI-Powered Multi-Robot Disaster Intelligence & Autonomous Search and Rescue Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-400">OPERATOR ACCESS</span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PORTAL READY
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Access Token / Passcode:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-mono text-xs gap-2 py-3"
              disabled={loading}
            >
              {loading ? 'Authorizing Station...' : 'Authenticate Incident Commander'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Access Note */}
          <div className="pt-4 border-t border-slate-800 text-center font-mono text-[11px] text-slate-500">
            <span className="text-amber-400/90 font-semibold block mb-1">
              [Phase 1 Demo Mode Active]
            </span>
            Clicking authenticate will directly initialize the Command Center without requiring a live backend session.
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-mono text-slate-600">
          RescueHive Autonomous Fleet Interface • Built for Emergency US&amp;R Sorties
        </div>
      </div>
    </div>
  );
}
