import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoIcon } from './CryptoIcon';
import {
  X,
  CheckCircle2,
  Building,
  QrCode,
  Smartphone,
  ArrowRightLeft,
  ShieldCheck,
  Coins,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Modals: React.FC = () => {
  const {
    isDepositModalOpen,
    setIsDepositModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isKYCModalOpen,
    setIsKYCModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    depositFunds,
    withdrawFunds,
    transferFunds,
    currentUser,
    formatIdr,
    formatUsdt,
  } = useApp();

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('10000000');
  const [depositCurrency, setDepositCurrency] = useState<'IDR' | 'USDT'>('IDR');
  const [depositMethod, setDepositMethod] = useState('BCA Virtual Account');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('5000000');
  const [withdrawCurrency, setWithdrawCurrency] = useState<'IDR' | 'USDT'>('IDR');
  const [withdrawDest, setWithdrawDest] = useState('BCA - 8820194821');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  // Transfer state
  const [transferFrom, setTransferFrom] = useState('spot');
  const [transferTo, setTransferTo] = useState('futures');
  const [transferAmount, setTransferAmount] = useState('500');
  const [transferCurrency, setTransferCurrency] = useState('USDT');
  const [transferMsg, setTransferMsg] = useState('');

  // KYC state
  const [kycStep, setKycStep] = useState(1);
  const [kycName, setKycName] = useState('Budi Santoso');
  const [kycNik, setKycNik] = useState('3171048291040001');

  // Handle Deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await depositFunds(Number(depositAmount), depositCurrency, depositMethod);
    if (ok) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setIsDepositModalOpen(false);
      }, 2000);
    }
  };

  // Handle Withdraw
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await withdrawFunds(Number(withdrawAmount), withdrawCurrency, withdrawDest);
    if (res.success) {
      alert(`Penarikan dana sebesar ${withdrawCurrency === 'IDR' ? formatIdr(Number(withdrawAmount)) : withdrawAmount + ' USDT'} berhasil diproses!`);
      setIsWithdrawModalOpen(false);
    } else {
      setWithdrawMsg(res.message || 'Penarikan gagal');
    }
  };

  // Handle Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await transferFunds(transferFrom, transferTo, Number(transferAmount), transferCurrency);
    if (res.success) {
      confetti({ particleCount: 30, spread: 50 });
      alert(`Transfer ${transferAmount} ${transferCurrency} berhasil!`);
      setIsTransferModalOpen(false);
    } else {
      setTransferMsg(res.message || 'Transfer gagal');
    }
  };

  return (
    <>
      {/* 1. Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {depositSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900">Deposit Berhasil!</h3>
                <p className="text-xs text-gray-500">
                  Saldo telah ditambahkan ke portofolio akun Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Deposit Saldo</h3>
                  <p className="text-xs text-gray-500">Tambah saldo IDR atau USDT secara instan</p>
                </div>

                {/* Currency Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setDepositCurrency('IDR');
                      setDepositAmount('10000000');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      depositCurrency === 'IDR'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rupiah (IDR)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDepositCurrency('USDT');
                      setDepositAmount('500');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      depositCurrency === 'USDT'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tether (USDT)
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Deposit</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {(depositCurrency === 'IDR'
                      ? [1000000, 5000000, 10000000, 50000000]
                      : [100, 500, 1000, 5000]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset.toString())}
                        className="flex-1 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-[10px] font-bold py-1 rounded-lg text-gray-700"
                      >
                        {preset.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Metode Pembayaran</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  >
                    <option value="BCA Virtual Account">BCA Virtual Account</option>
                    <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                    <option value="BRI Virtual Account">BRI Virtual Account</option>
                    <option value="QRIS Instant (GoPay / OVO / DANA)">QRIS Instant (GoPay / OVO / DANA)</option>
                    <option value="Crypto USDT (TRC-20 / BEP-20)">Crypto USDT (TRC-20 / BEP-20)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors"
                >
                  Konfirmasi Deposit
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Penarikan Dana (Withdraw)</h3>
                <p className="text-xs text-gray-500">Tarik saldo ke rekening bank atau alamat kripto</p>
              </div>

              {withdrawMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                  {withdrawMsg}
                </div>
              )}

              {/* Currency */}
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setWithdrawCurrency('IDR')}
                  className={`flex-1 py-1.5 rounded-lg ${
                    withdrawCurrency === 'IDR' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Rupiah (IDR)
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawCurrency('USDT')}
                  className={`flex-1 py-1.5 rounded-lg ${
                    withdrawCurrency === 'USDT' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  USDT
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Penarikan</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Saldo Tersedia:{' '}
                  <b className="text-gray-700">
                    {withdrawCurrency === 'IDR'
                      ? formatIdr(currentUser?.balances?.idr)
                      : formatUsdt(currentUser?.balances?.usdt) + ' USDT'}
                  </b>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tujuan Penarikan</label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  placeholder="Nomor Rekening / Alamat Wallet"
                  className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors"
              >
                Proses Penarikan Dana
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Internal Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Transfer Dana Internal</h3>
                <p className="text-xs text-gray-500">Pindahkan saldo antar dompet Pintu instan tanpa biaya</p>
              </div>

              {transferMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                  {transferMsg}
                </div>
              )}

              {/* From & To Selectors */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">DARI</span>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-gray-900 text-xs outline-none"
                  >
                    <option value="spot">Pintu Spot Wallet</option>
                    <option value="pro">Pintu Pro Spot</option>
                    <option value="futures">Futures Margin Wallet</option>
                  </select>
                </div>

                <div className="flex justify-center my-1">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600 rotate-90" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">KE</span>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-gray-900 text-xs outline-none"
                  >
                    <option value="futures">Futures Margin Wallet</option>
                    <option value="pro">Pintu Pro Spot</option>
                    <option value="spot">Pintu Spot Wallet</option>
                  </select>
                </div>
              </div>

              {/* Currency & Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Mata Uang & Jumlah</label>
                  <select
                    value={transferCurrency}
                    onChange={(e) => setTransferCurrency(e.target.value)}
                    className="bg-gray-100 font-bold text-xs px-2 py-0.5 rounded-lg outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="IDR">IDR</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors"
              >
                Konfirmasi Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. KYC Verification Modal */}
      {isKYCModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsKYCModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Verifikasi Akun (KYC)</h3>
              <p className="text-xs text-gray-500">
                Akun simulasi Anda telah terverifikasi secara instan dengan status <b>Verified Tier 2</b>.
              </p>

              <div className="bg-gray-50 p-3 rounded-2xl text-left text-xs space-y-1.5 border border-gray-200/80">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Lengkap:</span>
                  <span className="font-bold text-gray-800">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Verifikasi:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Batas Trading:</span>
                  <span className="font-bold text-gray-800">Unlimited (Rp 2 Miliar/hari)</span>
                </div>
              </div>

              <button
                onClick={() => setIsKYCModalOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors"
              >
                Selesai & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Auth / Onboarding Modal (Matching Screenshot 20260823-200119.png and 200127.png) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {authModalMode === 'onboarding' ? (
              <div className="text-center space-y-4 pt-2">
                {/* 4 Token Icons Circle */}
                <div className="flex justify-center items-center gap-2 my-2">
                  <CryptoIcon symbol="BTC" name="Bitcoin" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="ETH" name="Ethereum" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="SOL" name="Solana" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="PTU" name="Pintu Token" className="w-8 h-8 rounded-full shadow" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Crypto App Paling Simpel
                  </h2>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed px-2">
                    Nikmati investasi crypto paling simpel. Harga mulai dari Rp 11.000, kembangkan asetmu dengan Earn & Futures 25x.
                  </p>
                </div>

                <div className="space-y-2 pt-3">
                  <button
                    id="onboarding-register-btn"
                    onClick={() => setAuthModalMode('register')}
                    className="w-full bg-[#0052FF] hover:bg-blue-700 text-white font-bold py-3 rounded-2xl shadow-md text-xs transition-colors"
                  >
                    Daftar
                  </button>

                  <button
                    id="onboarding-login-btn"
                    onClick={() => setAuthModalMode('login')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-2xl text-xs transition-colors"
                  >
                    Masuk
                  </button>

                  <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-700 pt-2 block mx-auto"
                  >
                    Jelajahi Dulu
                  </button>
                </div>
              </div>
            ) : authModalMode === 'register' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Buat Akun Personal</h3>
                  <p className="text-xs text-gray-500">Pilih metode pendaftaran yang Anda inginkan</p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      alert('Login simulasi via Google berhasil!');
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full border border-gray-200 hover:bg-gray-50 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="font-bold text-red-500">G</span>
                    <span>Daftar dengan Google</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Login simulasi via Apple ID berhasil!');
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full border border-gray-200 hover:bg-gray-50 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span></span>
                    <span>Daftar dengan Apple ID</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow transition-colors"
                  >
                    Buat Akun Pintu
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Masuk ke Akun Pintu</h3>
                  <p className="text-xs text-gray-500">Masukkan email dan PIN akun Anda</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Alamat Email"
                    defaultValue="budi.demo@pintu.co.id"
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="PIN / Password"
                    defaultValue="123456"
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow text-xs transition-colors"
                  >
                    Masuk Sekarang
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
