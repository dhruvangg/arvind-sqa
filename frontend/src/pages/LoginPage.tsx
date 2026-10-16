import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSupervisor } from '../services/api';
import { SupervisorProfile } from '../types';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (profile: SupervisorProfile) => void;
}

const DEMO_SUPERVISORS = [
  {
    username: 'ramesh',
    password: 'arvind123',
    name: 'Ramesh Patel',
    role: 'Weaving Shift Supervisor',
    plant: 'Naroda Unit',
  },
  {
    username: 'pooja',
    password: 'arvind123',
    name: 'Pooja Shah',
    role: 'Plant Quality Lead',
    plant: 'Santej Plant',
  },
  {
    username: 'vikram',
    password: 'arvind123',
    name: 'Vikram Desai',
    role: 'Spinning Shift Supervisor',
    plant: 'Naroda Unit',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const profile = await loginSupervisor(username.trim(), password);
      onLoginSuccess(profile);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demo: typeof DEMO_SUPERVISORS[0]) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const profile = await loginSupervisor(demo.username, demo.password);
      onLoginSuccess(profile);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden animate-fadeIn">
        {/* Brand Accent Top Stripe */}
        <div className="h-2 bg-arvind-700 w-full" />

        <div className="p-6 sm:p-8">
          {/* Arvind Corporate Logo & Monogram */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-arvind-700 flex items-center justify-center text-white font-extrabold text-xl tracking-wider shadow-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Arvind
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-bold uppercase tracking-wider text-arvind-700">
                  Shop-floor Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Quality Inspection Tracker
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Supervisor Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to record and manage fabric defect logs.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-arvind-50 border border-arvind-200 text-arvind-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-arvind-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ramesh or pooja"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none placeholder-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter supervisor password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none placeholder-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-arvind-700 hover:bg-arvind-800 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 touch-target mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Reviewer Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-arvind-700" />
                Demo Supervisor Accounts
              </span>
              <span className="text-[10px] text-slate-400 font-mono">pwd: arvind123</span>
            </div>

            <div className="space-y-2">
              {DEMO_SUPERVISORS.map((demo) => (
                <button
                  key={demo.username}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemoLogin(demo)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-arvind-50 hover:border-arvind-200 transition-colors text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-arvind-800">
                      {demo.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {demo.role} · {demo.plant}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-arvind-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md group-hover:border-arvind-300">
                    Sign in
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
