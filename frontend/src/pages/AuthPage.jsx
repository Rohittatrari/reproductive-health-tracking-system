import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Lock, Mail, User, ArrowRight, Shield } from 'lucide-react';
import { api } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await api.register(email, password, fullName);
      } else {
        await api.login(email, password);
      }
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    try {
      await api.login(demoEmail, demoPassword);
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-tr from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-300 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-purple-950 tracking-tight">
            AuraHealth
          </h1>
          <p className="text-sm font-medium text-purple-600 mt-1">
            Reproductive Health Tracking & Clinical Awareness System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-100 border border-purple-100">
          <div className="flex rounded-2xl bg-purple-50 p-1 mb-6 border border-purple-100">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isRegister ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isRegister ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@health.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength="6"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-200 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-purple-50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 text-center mb-3">
              One-Click Instant Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('demo@health.org', 'Demo@12345')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Demo User</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@health.org', 'Admin@12345')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-purple-500 mt-6">
          🔒 Encrypted & Private • HIPAA Compliant Architecture
        </p>
      </div>
    </div>
  );
}
