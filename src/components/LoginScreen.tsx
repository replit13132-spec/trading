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
  const [email, setEmail] = useState('budi.demo@pintu.co.id');
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
        setErrorMsg(res.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
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
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-sm">
            <span className="font-extrabold text-base lowercase tracking-tighter">∩</span>
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">pintu</span>
        </div>

        <button
          id="btn-login-to-register"
          onClick={handleGoToRegister}
          className="text-xs font-bold text-amber-900 hover:text-amber-800 py-1.5 px-2.5 rounded-lg hover:bg-amber-50 transition-colors"
        >
          Daftar
        </button>
      </div>

      {/* 2. Main Content Body */}
      <div className="px-5 sm:px-6 py-5 flex-1 flex flex-col justify-center">
        {/* Title & Subtitle */}
        <div className="mb-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold mb-2 border border-amber-200/60">
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
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('quick_select')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              loginMethod === 'quick_select'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
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
                  placeholder="Contoh: budi.demo@pintu.co.id"
                  className="w-full bg-white border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
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
                <button
                  type="button"
                  onClick={() => alert('Kredensial Demo:\n• Admin: admin@pintu.co.id (Password: 123456)\n• User: budi.demo@pintu.co.id (Password: 123456)')}
                  className="text-[11px] font-semibold text-amber-900 hover:underline"
                >
                  Kredensial Demo?
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
                  placeholder="Masukkan Password Anda (default: 123456)"
                  className="w-full bg-white border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl py-3 pl-10 pr-10 text-xs font-medium text-gray-900 outline-none transition-all"
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
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-5 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Portal Admin Bursa (Console)</h3>
                    <p className="text-[11px] text-slate-300">Akses kontrol super admin & manajemen ekosistem</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ROOT ADMIN
                </span>
              </div>

              {/* Feature Checklist inside Admin */}
              <div className="grid grid-cols-2 gap-2 my-3.5 text-[11px] text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 hover:border-amber-400 hover:shadow-md'
                      : 'bg-white hover:bg-amber-50/60 border-gray-200 hover:border-amber-300 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
                        isAdmin
                          ? 'bg-amber-500 text-slate-950 font-black'
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
                      <p className={`text-[10px] mt-0.5 ${isAdmin ? 'text-amber-300' : 'text-emerald-600'}`}>
                        {isAdmin ? '→ Masuk langsung ke Dashboard Admin' : '→ Masuk ke Aplikasi Konsumen Pintu'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
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
      </div>

      {/* 3. Footer with Registration Link */}
      <div className="bg-white px-6 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Belum memiliki akun Pintu?{' '}
          <button
            type="button"
            onClick={handleGoToRegister}
            className="font-bold text-amber-800 hover:underline"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
};

