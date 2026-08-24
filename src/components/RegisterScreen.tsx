import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Gift,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterScreen: React.FC = () => {
  const {
    setAuthScreen,
    setIsOnboarded,
    registerUser,
    loginWithSocial,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('PINTU2026');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;
  const passwordsMatch = password && password === confirmPassword;

  const handleBack = () => {
    setAuthScreen('none');
  };

  const handleGoToLogin = () => {
    setAuthScreen('login');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setErrorMsg('Email atau Nomor HP wajib diisi');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('Password harus minimal 8 karakter dengan kombinasi huruf dan angka');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('Konfirmasi password tidak cocok');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Anda harus menyetujui Syarat & Ketentuan Pintu');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser(
        name,
        email,
        phone,
        referralCode ? referralCode.trim() : undefined
      );

      if (res.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg(res.message || 'Pendaftaran berhasil! Selamat datang di Pintu.');
        setTimeout(() => {
          setIsOnboarded(true);
          setAuthScreen('none');
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Gagal melakukan pendaftaran.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithSocial(provider);
      if (res.success) {
        confetti({ particleCount: 70, spread: 60 });
        setSuccessMsg(`Pendaftaran cepat dengan ${provider === 'google' ? 'Google' : 'Apple ID'} berhasil!`);
        setTimeout(() => {
          setIsOnboarded(true);
          setAuthScreen('none');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg('Gagal mendaftar via media sosial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-lg md:max-w-xl mx-auto font-sans antialiased text-gray-900 shadow-xl relative overflow-x-hidden border-x border-gray-100">
      {/* 1. Header with Back Navigation & Pintu Brand */}
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <button
          id="btn-register-back"
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
          id="btn-register-to-login"
          onClick={handleGoToLogin}
          className="text-xs font-bold text-[#0052FF] hover:text-blue-700 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Masuk
        </button>
      </div>

      {/* 2. Welcome Promo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-extrabold tracking-wide text-amber-300 uppercase">
            Promo Pendaftar Baru
          </p>
          <p className="text-xs font-semibold text-blue-50">
            Dapatkan bonus saldo hingga <b>Rp 10.000.000</b> & <b>100 USDT</b> gratis!
          </p>
        </div>
      </div>

      {/* 3. Form Body */}
      <div className="px-6 py-6 flex-1 flex flex-col justify-center">
        {/* Title */}
        <div className="mb-5 text-left">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Buat Akun Pintu
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Mulai beli Bitcoin, Ethereum, Solana, dan 200+ aset crypto dengan mudah & aman.
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

        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Lengkap (Sesuai KTP)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alamat Email Aktif
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Nomor HP */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nomor Handphone (WhatsApp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Kata Sandi / PIN Akun
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-white border border-gray-200 focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-gray-900 outline-none transition-all"
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

            {/* Password Criteria checklist */}
            {password && (
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] text-gray-500">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-500' : 'text-gray-300'}`} />
                  8+ Karakter
                </span>
                <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasLetter ? 'text-emerald-500' : 'text-gray-300'}`} />
                  Ada Huruf
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? 'text-emerald-500' : 'text-gray-300'}`} />
                  Ada Angka
                </span>
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className={`w-full bg-white border ${
                  confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-200'
                } focus:border-[#0052FF] focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all`}
                required
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-[10px] text-red-500 mt-1">Kata sandi tidak sesuai</p>
            )}
          </div>

          {/* Referral Code Toggle */}
          <div>
            {!showReferralInput ? (
              <button
                type="button"
                onClick={() => setShowReferralInput(true)}
                className="text-xs font-bold text-[#0052FF] hover:underline flex items-center gap-1 pt-1"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Punya Kode Referral? (Dapatkan Bonus Tambahan)</span>
              </button>
            ) : (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Kode Referral
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: PINTU2026"
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-900 tracking-wider uppercase outline-none"
                  />
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center">
                    ✓ Aktif
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              id="register-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-[#0052FF] focus:ring-blue-500"
            />
            <label htmlFor="register-terms" className="text-[11px] text-gray-600 leading-snug">
              Saya berusia minimal 17 tahun dan menyetujui{' '}
              <span className="text-[#0052FF] font-semibold hover:underline cursor-pointer">
                Syarat & Ketentuan
              </span>{' '}
              serta{' '}
              <span className="text-[#0052FF] font-semibold hover:underline cursor-pointer">
                Kebijakan Privasi
              </span>{' '}
              Pintu.
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="btn-register-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052FF] hover:bg-blue-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-slate-50 px-3 text-gray-400 font-semibold">
              atau daftar dengan
            </span>
          </div>
        </div>

        {/* Social Register */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-register-google"
            onClick={() => handleSocialRegister('google')}
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
            id="btn-register-apple"
            onClick={() => handleSocialRegister('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 active:scale-[0.98] py-2.5 px-3 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
          >
            <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.95-1 .04-2.13.67-2.79 1.45-.58.67-1.1 1.76-.96 2.82 1.11.09 2.16-.54 2.79-1.32z" />
            </svg>
            <span>Apple ID</span>
          </button>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="bg-white px-6 py-5 border-t border-gray-100 text-center space-y-4">
        <p className="text-xs text-gray-600">
          Sudah punya akun Pintu?{' '}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="font-bold text-[#0052FF] hover:underline"
          >
            Masuk di sini
          </button>
        </p>

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
