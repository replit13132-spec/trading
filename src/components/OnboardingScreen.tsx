import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { setIsOnboarded, setAuthScreen } = useApp();
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);

  // Auto-switch slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-cycle or touch swipe support
  const handleNext = () => setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
  const handlePrev = () => setCurrentSlide((prev) => (prev === 1 ? 0 : 1));

  const handleRegister = () => {
    setAuthScreen('register');
  };

  const handleLogin = () => {
    setAuthScreen('login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between max-w-md mx-auto px-6 py-6 select-none font-sans relative overflow-hidden">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Subtle XMoney Brand Icon */}
          <div className="w-20 h-20 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
        </div>
      </div>

      {/* 2. Interactive Slide Content */}
      <div className="my-auto py-6 flex flex-col items-center text-center">
        {currentSlide === 0 ? (
          /* Slide 1: "Crypto App Paling Simpel" (Screenshot 20260823-200119.png) */
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* Visual: 4 Overlapping Circular Token Badges */}
            <div className="relative w-56 h-56 flex items-center justify-center my-6">
              {/* Top: Bitcoin */}
              <div className="absolute top-1 w-16 h-16 rounded-full bg-[#F7931A] text-white flex items-center justify-center shadow-lg font-bold text-2xl z-20 hover:scale-105 transition-transform">
                <span className="font-mono">₿</span>
              </div>

              {/* Left: Solana */}
              <div className="absolute left-2 w-16 h-16 rounded-full bg-gradient-to-tr from-[#00D18B] to-[#14F195] text-white flex items-center justify-center shadow-lg z-10 hover:scale-105 transition-transform p-3.5">
                <svg viewBox="0 0 397 311" className="w-full h-full fill-current">
                  <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zM332.4 115.8c-2.4-2.4-5.7-3.8-9.2-3.8H5.8c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
                </svg>
              </div>

              {/* Right: Ethereum */}
              <div className="absolute right-2 w-16 h-16 rounded-full bg-[#627EEA] text-white flex items-center justify-center shadow-lg z-10 hover:scale-105 transition-transform p-3">
                <svg viewBox="0 0 784.37 1277.39" className="w-7 h-10 fill-current">
                  <path d="M392.07 0L383.5 29.11V873.74L392.07 882.29L784.13 650.54L392.07 0Z" fillOpacity="0.6" />
                  <path d="M392.07 0L0 650.54L392.07 882.29V472.33V0Z" />
                  <path d="M392.07 956.52L387.24 962.41V1263.28L392.07 1277.38L784.37 724.89L392.07 956.52Z" fillOpacity="0.6" />
                  <path d="M392.07 1277.38V956.52L0 724.89L392.07 1277.38Z" />
                </svg>
              </div>

              {/* Bottom: XMoney Logo */}
              <div className="absolute bottom-1 w-24 h-24 flex items-center justify-center z-20 hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
              </div>
            </div>

            {/* Typography */}
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mt-4">
              Crypto App Paling Simpel
            </h1>
            <p className="text-sm text-gray-600 mt-3 px-3 leading-relaxed max-w-sm">
              Nikmati investasi crypto paling simpel. Harga mulai dari Rp 11.000, kembangkan asetmu dengan Earn.
            </p>
          </div>
        ) : (
          /* Slide 2: "Trading dengan XMoney Pro" (Screenshot 20260823-200127.png) */
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* Visual: 4 Floating Dark Cards */}
            <div className="relative w-full max-w-[280px] h-60 my-4">
              {/* Card 1: BTC/IDR (Top Left) */}
              <div className="absolute top-0 left-0 bg-[#16181C] text-white p-3 rounded-2xl shadow-xl border border-gray-800 w-32 text-left transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#F7931A] text-[9px] font-bold flex items-center justify-center text-white">
                    ₿
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">BTC/IDR</span>
                </div>
                <p className="text-xs font-extrabold tracking-tight text-white">807.733.200</p>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5 inline-block">
                  +2,2%
                </span>
              </div>

              {/* Card 2: ETH/IDR (Top Right) */}
              <div className="absolute top-4 right-0 bg-[#16181C] text-white p-3 rounded-2xl shadow-xl border border-gray-800 w-32 text-left transform rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#627EEA] text-[9px] font-bold flex items-center justify-center text-white">
                    ♦
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">ETH/IDR</span>
                </div>
                <p className="text-xs font-extrabold tracking-tight text-white">45.981.400</p>
                <span className="text-[10px] font-bold text-red-400 mt-0.5 inline-block">
                  -0,42%
                </span>
              </div>

              {/* Card 3: USDT/IDR (Bottom Left) */}
              <div className="absolute bottom-4 left-0 bg-[#16181C] text-white p-3 rounded-2xl shadow-xl border border-gray-800 w-32 text-left transform rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#26A17B] text-[9px] font-bold flex items-center justify-center text-white">
                    ₮
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">USDT/IDR</span>
                </div>
                <p className="text-xs font-extrabold tracking-tight text-white">15.662</p>
                <span className="text-[10px] font-bold text-red-400 mt-0.5 inline-block">
                  -1,54%
                </span>
              </div>

              {/* Card 4: PTU/IDR (Bottom Right) */}
              <div className="absolute bottom-0 right-0 bg-[#16181C] text-white p-3 rounded-2xl shadow-xl border border-gray-800 w-32 text-left transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 flex items-center justify-center">
                     <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300">PTU/IDR</span>
                </div>
                <p className="text-xs font-extrabold tracking-tight text-white">6.978</p>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5 inline-block">
                  +1,05%
                </span>
              </div>
            </div>

            {/* Typography */}
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mt-4">
              Trading dengan XMoney Pro
            </h1>
            <p className="text-sm text-gray-600 mt-3 px-3 leading-relaxed max-w-sm">
              Maksimalkan keuntungan crypto kamu dengan likuiditas tinggi, eksekusi yang cepat, dan beragam fitur Pro.
            </p>
          </div>
        )}

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`transition-all duration-200 rounded-full ${
              currentSlide === 0
                ? 'w-3 h-3 bg-amber-500'
                : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Slide 1"
          />
          <button
            onClick={() => setCurrentSlide(1)}
            className={`transition-all duration-200 rounded-full ${
              currentSlide === 1
                ? 'w-3 h-3 bg-amber-500'
                : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Slide 2"
          />
        </div>
      </div>

      {/* 3. Bottom Action Buttons (Daftar & Masuk) */}
      <div className="space-y-2.5 pb-2 w-full">
        <button
          id="btn-onboarding-daftar"
          onClick={handleRegister}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center"
        >
          Daftar
        </button>

        <button
          id="btn-onboarding-masuk"
          onClick={handleLogin}
          className="w-full bg-white hover:bg-amber-50 active:scale-[0.99] border-2 border-amber-500 text-amber-900 font-extrabold py-3 px-4 rounded-2xl text-sm transition-all flex items-center justify-center"
        >
          Masuk
        </button>
      </div>
    </div>
  );
};
