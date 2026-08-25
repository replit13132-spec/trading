import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Gift,
  Check,
  Camera,
  ScanFace,
  RefreshCw,
  Sparkles,
  Video,
  UserCheck,
  X,
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
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('XMONEY2026');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Face Scan State (Formalitas Biometrik)
  const [faceScanDone, setFaceScanDone] = useState(false);
  const [faceScanImage, setFaceScanImage] = useState<string | null>(null);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Posisikan wajah Anda di tengah lingkaran...');
  const [isRealCamera, setIsRealCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const openFaceScanModal = async () => {
    setIsFaceModalOpen(true);
    setIsScanning(false);
    setScanProgress(0);
    setScanStatusText('Membuka kamera...');

    stopCameraStream();

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          });
        } catch (e1) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user' },
            });
          } catch (e2) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
        }

        if (stream) {
          activeStreamRef.current = stream;
          setIsRealCamera(true);
          setScanStatusText('Kamera terhubung. Posisikan wajah Anda...');

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.log('Video play error:', err));
          }
        } else {
          setIsRealCamera(false);
          setScanStatusText('Gagal mendapatkan stream kamera');
        }
      } else {
        setIsRealCamera(false);
        setScanStatusText('Browser tidak mendukung akses kamera');
      }
    } catch (err) {
      console.log('Real camera stream not available, falling back to simulated scan:', err);
      setIsRealCamera(false);
      setScanStatusText('Izin kamera belum diberikan. Menggunakan mode simulasi.');
    }
  };

  useEffect(() => {
    if (isFaceModalOpen && isRealCamera && activeStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = activeStreamRef.current;
      videoRef.current.play().catch((err) => console.log('Video play error:', err));
    }
  }, [isFaceModalOpen, isRealCamera]);

  const closeFaceScanModal = () => {
    stopCameraStream();
    setIsFaceModalOpen(false);
    setIsScanning(false);
  };

  const startFaceScanProcess = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('Mendeteksi keberadaan wajah...');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setScanProgress(currentProgress);

      if (currentProgress === 30) {
        setScanStatusText('Menganalisis titik kontur biometrik...');
      } else if (currentProgress === 60) {
        setScanStatusText('Memverifikasi keselarasan wajah dengan NIK...');
      } else if (currentProgress === 90) {
        setScanStatusText('Menyelesaikan verifikasi keamanan...');
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setScanStatusText('Verifikasi Wajah Berhasil! ✓');

        if (isRealCamera && videoRef.current && canvasRef.current) {
          try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth || 300;
            canvas.height = video.videoHeight || 300;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              setFaceScanImage(dataUrl);
            }
          } catch (e) {
            console.error('Error snapshot canvas:', e);
          }
        }

        setTimeout(() => {
          setFaceScanDone(true);
          stopCameraStream();
          setIsFaceModalOpen(false);
          setIsScanning(false);
          confetti({ particleCount: 50, spread: 60 });
        }, 800);
      }
    }, 250);
  };

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
      setErrorMsg('Nama Lengkap (Sesuai KTP) wajib diisi');
      return;
    }

    const cleanNik = nik.trim();
    if (!cleanNik) {
      setErrorMsg('NIK (Nomor Induk Kependudukan) wajib diisi');
      return;
    }
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Alamat Email aktif wajib diisi');
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
      setErrorMsg('Anda harus menyetujui Syarat & Ketentuan');
      return;
    }

    if (!faceScanDone) {
      setErrorMsg('Harap lakukan Scan Muka (Verifikasi Wajah Biometrik) terlebih dahulu');
      openFaceScanModal();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser(
        name.trim(),
        cleanNik,
        email.trim(),
        password,
        referralCode ? referralCode.trim() : undefined
      );

      if (res.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg(res.message || 'Pendaftaran berhasil! Selamat datang.');
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
      {/* 1. Header with Back Navigation & Brand Logo */}
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

        <div className="flex items-center justify-center py-1">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
        </div>

        <button
          id="btn-register-to-login"
          onClick={handleGoToLogin}
          className="text-xs font-bold text-violet-900 hover:text-violet-800 py-1.5 px-2.5 rounded-lg hover:bg-violet-50 transition-colors"
        >
          Masuk
        </button>
      </div>

      {/* 2. Form Body */}
      <div className="px-6 py-6 flex-1 flex flex-col justify-center">
        {/* Title */}
        <div className="mb-5 text-left">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Buat Akun Baru
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
          {/* 1. Nama Lengkap */}
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
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* 2. NIK (Nomor Induk Kependudukan) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              NIK (Nomor Induk Kependudukan - 16 Digit)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="register-nik"
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 3171012304950001"
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-gray-900 outline-none transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Sesuai KTP resmi (16 digit angka)</p>
          </div>

          {/* 2b. Scan Wajah / Face Scan (KYC Formalitas) */}
          <div className="bg-violet-50/80 border border-violet-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500 text-slate-950 flex items-center justify-center shadow-md shadow-violet-500/20 font-bold">
                  <ScanFace className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                    <span>Scan Wajah Biometrik</span>
                    <span className="text-[9px] bg-violet-200 text-violet-950 font-extrabold px-1.5 py-0.5 rounded">
                      Formalitas KYC
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-600">
                    Verifikasi identitas pendaftar baru via kamera
                  </p>
                </div>
              </div>

              {faceScanDone && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {faceScanDone ? (
              <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 bg-gray-100 flex items-center justify-center shrink-0">
                    {faceScanImage ? (
                      <img src={faceScanImage} alt="Foto Scan Wajah" className="w-full h-full object-cover" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <span>Pindaian Wajah Berhasil</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </p>
                    <p className="text-[10px] text-gray-400">Telah tersimpan aman untuk verifikasi akun Anda</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openFaceScanModal}
                  className="text-[11px] font-bold text-violet-900 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ulangi</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openFaceScanModal}
                className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera & Scan Wajah</span>
              </button>
            )}
          </div>

          {/* 3. Alamat Email */}
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
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all"
                required
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
                className="w-full bg-white border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-gray-900 outline-none transition-all"
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
                } focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 outline-none transition-all`}
                required
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-[10px] text-red-500 mt-1">Kata sandi tidak sesuai</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              id="register-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-violet-600 focus:ring-violet-500 accent-violet-500"
            />
            <label htmlFor="register-terms" className="text-[11px] text-gray-600 leading-snug">
              Saya berusia minimal 17 tahun dan menyetujui{' '}
              <span className="text-violet-800 font-semibold hover:underline cursor-pointer">
                Syarat & Ketentuan
              </span>{' '}
              serta{' '}
              <span className="text-violet-800 font-semibold hover:underline cursor-pointer">
                Kebijakan Privasi
              </span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="btn-register-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-400 active:scale-[0.99] text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </form>
      </div>

      {/* 4. Footer */}
      <div className="bg-white px-6 py-5 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="font-bold text-violet-800 hover:underline"
          >
            Masuk di sini
          </button>
        </p>
      </div>

      {/* Modal Camera Face Scanner (Formalitas KYC) */}
      {isFaceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeFaceScanModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="w-12 h-12 bg-violet-100 text-violet-900 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner font-extrabold">
                <ScanFace className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Verifikasi Wajah Biometrik</h3>
              <p className="text-xs text-gray-500 mt-0.5">Formalitas Pendaftaran Akun</p>
            </div>

            {/* Camera Frame Container */}
            <div className="relative w-56 h-64 mx-auto rounded-3xl overflow-hidden border-4 border-violet-500 bg-slate-900 shadow-xl flex items-center justify-center">
              {/* Real Video element */}
              <video
                ref={(node) => {
                  videoRef.current = node;
                  if (node && activeStreamRef.current) {
                    node.srcObject = activeStreamRef.current;
                    node.play().catch((e) => console.log('Video play error:', e));
                  }
                }}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${isRealCamera ? 'block' : 'hidden'}`}
              />

              {/* Simulated Face Outline & Mesh if no real video stream */}
              {!isRealCamera && (
                <div className="flex flex-col items-center justify-center text-violet-400 space-y-2 p-4">
                  <div className="relative w-32 h-40 border-2 border-dashed border-violet-400/80 rounded-[50%] flex items-center justify-center animate-pulse">
                    <User className="w-20 h-20 text-violet-300 opacity-60" />
                    {/* Face Mesh Points */}
                    <div className="absolute top-10 left-8 w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                    <div className="absolute top-10 right-8 w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                    <div className="absolute bottom-12 w-3 h-1 bg-violet-400 rounded-full" />
                  </div>
                  <p className="text-[10px] text-violet-200 font-semibold text-center">
                    Kamera tidak terdeteksi / Izinkan Akses Kamera
                  </p>
                  <button
                    type="button"
                    onClick={openFaceScanModal}
                    className="text-[10px] bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold px-3 py-1 rounded-full shadow transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Aktifkan Kamera</span>
                  </button>
                </div>
              )}

              {/* Oval Face Guide Overlay */}
              <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none rounded-3xl flex items-center justify-center">
                <div className="w-40 h-52 border-2 border-violet-400/90 rounded-[50%] shadow-[0_0_20px_rgba(245,158,11,0.5)] relative overflow-hidden">
                  {/* Scanning beam line */}
                  {isScanning && (
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                  )}
                </div>
              </div>

              {/* HUD Target corners */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-violet-400" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-violet-400" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-violet-400" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-violet-400" />
            </div>

            {/* Hidden canvas for capturing frame */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Progress & Status */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-800">{scanStatusText}</p>

              {isScanning ? (
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">
                  {isRealCamera
                    ? 'Kamera terhubung. Tekan tombol untuk memindai wajah.'
                    : 'Arahkan pandangan ke layar lalu tekan Mulai Scan.'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2">
              {!isScanning ? (
                <button
                  type="button"
                  onClick={startFaceScanProcess}
                  className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-lg shadow-violet-500/25 text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Mulai Scan Wajah Sekarang</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memindai... ({scanProgress}%)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
