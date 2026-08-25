import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Server,
  Database,
  Sliders,
  TrendingUp,
  FileText,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoginScreen: React.FC = () => {
  const {
    setAuthScreen,
    setIsOnboarded,
    loginUser,
    loginWithSocial,
    allUsers,
    switchUser,
    setActiveTab,
  } = useApp();

  const [loginMethod, setLoginMethod] = useState<'input'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleBack = () => {
    setAuthScreen('none');
  };

  const handleGoToRegister = () => {
    setAuthScreen('register');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Silakan masukkan email Anda');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan password Anda');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser(email.trim(), password);
      if (res.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        const isAdmin = res.user?.role === 'admin' || email.toLowerCase().includes('admin');
        setSuccessMsg(
          isAdmin
            ? 'Berhasil masuk ke Portal Admin! Mengalihkan ke Dashboard Administrator...'
            : (res.message || 'Berhasil masuk ke akun!')
        );
        setTimeout(() => {
          setIsOnboarded(true);
          setAuthScreen('none');
          if (isAdmin) {
            setActiveTab('admin');
          }
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithSocial(provider);
      if (res.success) {
        confetti({ particleCount: 60, spread: 70 });
        setSuccessMsg(`Berhasil masuk dengan ${provider === 'google' ? 'Google' : 'Apple ID'}!`);
        setTimeout(() => {
          setIsOnboarded(true);
          setAuthScreen('none');
          setActiveTab('beranda');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg('Gagal masuk dengan penyedia sosial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-lg md:max-w-xl mx-auto font-sans antialiased text-gray-900 shadow-xl relative overflow-x-hidden border-x border-gray-100">
      {/* 1. Header with Back Navigation & Brand Logo */}
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <button
          id="btn-login-back"
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold sm:inline">Kembali</span>
        </button>

        <div className="flex items-center justify-center py-1">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
        </div>

        <button
          id="btn-login-to-register"
          onClick={handleGoToRegister}
          className="text-xs font-bold text-violet-900 hover:text-violet-800 py-1.5 px-2.5 rounded-lg hover:bg-violet-50 transition-colors"
        >
          Daftar
        </button>
      </div>

      {/* 2. Main Content Body */}
      <div className="px-5 sm:px-6 py-5 flex-1 flex flex-col justify-center">
        {/* Title & Subtitle */}
        <div className="mb-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-900 text-[11px] font-bold mb-2 border border-violet-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autentikasi Akun Aman</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Silakan masukkan alamat email dan password akun Anda untuk melanjutkan.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug font-medium">{successMsg}</p>
          </div>
        )}

        {/* TAB 1: FORM INPUT */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: user@email.com"
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password Anda (default: 123456)"
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-gray-900 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-400 active:scale-[0.99] text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>
      </div>

      {/* 3. Footer with Registration Link */}
      <div className="bg-white px-6 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Belum memiliki akun?{' '}
          <button
            type="button"
            onClick={handleGoToRegister}
            className="font-bold text-violet-800 hover:underline"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
};

