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

  const [loginMethod, setLoginMethod] = useState<'input' | 'admin_portal' | 'quick_select'>('input');
  const [identifier, setIdentifier] = useState('budi.demo@pintu.co.id');
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
    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan email atau nomor HP Anda');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser(identifier, password);
      if (res.success) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        const isAdmin = res.user?.role === 'admin' || identifier.toLowerCase().includes('admin');
        setSuccessMsg(
          isAdmin
            ? 'Berhasil masuk ke Portal Admin! Mengalihkan ke Dashboard Administrator...'
            : (res.message || 'Berhasil masuk ke akun Pintu!')
        );
        setTimeout(() => {
          setIsOnboarded(true);
          setAuthScreen('none');
          if (isAdmin) {
            setActiveTab('admin');
          }
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Gagal masuk. Periksa kembali akun Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectUser = async (userId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const targetUser = allUsers.find((u) => u.id === userId);
      const isAdmin = targetUser?.role === 'admin';
      await switchUser(userId);
      confetti({ particleCount: 50, spread: 50 });
      setSuccessMsg(
        isAdmin
          ? 'Berhasil masuk sebagai Admin Demo! Membuka Dashboard Admin...'
          : 'Berhasil masuk sebagai Akun Pengguna Demo!'
      );
      setTimeout(() => {
        setIsOnboarded(true);
        setAuthScreen('none');
        if (isAdmin) {
          setActiveTab('admin');
        } else {
          setActiveTab('beranda');
        }
      }, 900);
    } catch (err: any) {
      setErrorMsg('Gagal mengganti akun');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDirectLogin = async () => {
    const adminUser = allUsers.find((u) => u.role === 'admin') || { id: 'user_admin' };
    await handleQuickSelectUser(adminUser.id);
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
      {/* 1. Header with Back Navigation & Pintu Brand */}
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

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            <span className="font-extrabold text-base lowercase tracking-tighter">∩</span>
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">pintu</span>
        </div>

        <button
          id="btn-login-to-register"
          onClick={handleGoToRegister}
          className="text-xs font-bold text-[#0052FF] hover:text-blue-700 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Daftar
        </button>
      </div>

      {/* 2. Main Content Body */}
      <div className="px-5 sm:px-6 py-5 flex-1 flex flex-col justify-center">
        {/* Title & Subtitle */}
        <div className="mb-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0052FF] text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autentikasi Akun Aman</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Masuk ke Ekosistem Pintu
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Pilih portal akses sesuai kebutuhan akun Anda: Trader Pengguna atau Konsol Manajemen Administrator.
          </p>
        </div>

        {/* Tab switch: Manual Input vs Admin Portal vs Quick Demo Select */}
        <div className="grid grid-cols-3 bg-gray-200/70 p-1 rounded-xl mb-4 text-[11px] font-bold gap-1">
          <button
            type="button"
            onClick={() => setLoginMethod('input')}
            className={`py-2 rounded-lg transition-all ${
              loginMethod === 'input'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email / HP
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('admin_portal')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              loginMethod === 'admin_portal'
                ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Portal Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('quick_select')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              loginMethod === 'quick_select'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Pilih Demo</span>
          </button>
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
        {loginMethod === 'input' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Input Email/HP */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email atau Nomor HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@pintu.co.id atau budi.demo@pintu.co.id"
                  className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password / PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  PIN / Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Credentials:\n• Admin: admin@pintu.co.id (PIN: 123456)\n• User: budi.demo@pintu.co.id (PIN: 123456)')}
                  className="text-[11px] font-semibold text-[#0052FF] hover:underline"
                >
                  Lihat Kredensial Demo?
                </button>
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
                  placeholder="Masukkan 6 digit PIN atau Password (default: 123456)"
                  className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-gray-900 outline-none transition-all"
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

            {/* Auto-fill buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin@pintu.co.id');
                  setPassword('123456');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3 text-blue-400" />
                Isi Admin (admin@pintu.co.id)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('budi.demo@pintu.co.id');
                  setPassword('123456');
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Isi User (budi.demo@pintu.co.id)
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: DEDICATED ADMIN PORTAL LOGIN */}
        {loginMethod === 'admin_portal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Enterprise Admin Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Portal Admin Bursa (Console)</h3>
                    <p className="text-[11px] text-slate-300">Akses kontrol super admin & manajemen ekosistem</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ROOT ADMIN
                </span>
              </div>

              {/* Feature Checklist inside Admin */}
              <div className="grid grid-cols-2 gap-2 my-3.5 text-[11px] text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>CRUD Pasar & Koin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CRUD Saldo & KYC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Futures & Likuidator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>CMS Berita & Audit</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mb-4 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <p className="font-mono text-slate-300 font-semibold">Akun: admin@pintu.co.id</p>
                <p className="text-[10px] text-slate-400">Setelah login, Anda langsung dialihkan ke Dashboard Admin dengan sidebar dan kendali penuh.</p>
              </div>

              <button
                id="btn-direct-admin-login"
                type="button"
                onClick={handleAdminDirectLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Buka Admin Dashboard Sekarang</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: QUICK DEMO SELECTOR */}
        {loginMethod === 'quick_select' && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <p className="text-[11px] text-gray-500 mb-1">
              Pilih profil demo untuk langsung masuk secara instan:
            </p>
            {allUsers.map((user) => {
              const isAdmin = user.role === 'admin';
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSelectUser(user.id)}
                  disabled={loading}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-between border ${
                    isAdmin
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 hover:border-blue-400 hover:shadow-md'
                      : 'bg-white hover:bg-blue-50/60 border-gray-200 hover:border-blue-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
                        isAdmin
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isAdmin ? <ShieldAlert className="w-4 h-4" /> : user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h4>
                      <p className={`text-[11px] font-mono ${isAdmin ? 'text-slate-400' : 'text-gray-500'}`}>
                        {user.email}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isAdmin ? 'text-blue-300' : 'text-emerald-600'}`}>
                        {isAdmin ? '→ Masuk langsung ke Dashboard Admin' : '→ Masuk ke Aplikasi Konsumen Pintu'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isAdmin ? 'Super Admin' : 'User Trader'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Divider */}
        {loginMethod !== 'admin_portal' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-slate-50 px-3 text-gray-400 font-semibold">
                  atau masuk dengan
                </span>
              </div>
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-login-google"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 active:scale-[0.98] py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                id="btn-login-apple"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 active:scale-[0.98] py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
              >
                <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.95-1 .04-2.13.67-2.79 1.45-.58.67-1.1 1.76-.96 2.82 1.11.09 2.16-.54 2.79-1.32z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 3. Footer with Registration Link & Compliance Badges */}
      <div className="bg-white px-6 py-4 border-t border-gray-100 text-center space-y-3">
        <p className="text-xs text-gray-600">
          Belum memiliki akun Pintu?{' '}
          <button
            type="button"
            onClick={handleGoToRegister}
            className="font-bold text-[#0052FF] hover:underline"
          >
            Daftar Sekarang
          </button>
        </p>

        {/* Regulatory & Security Badges */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-3 text-[10px] text-gray-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Terdaftar Bappebti
          </span>
          <span>•</span>
          <span>Kominfo</span>
          <span>•</span>
          <span>ISO 27001</span>
        </div>
      </div>
    </div>
  );
};

