import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Eye,
  EyeOff,
  Plus,
  ArrowDownToLine,
  FileText,
  Search,
  ChevronRight,
  ArrowUpDown,
  Lock,
  Sparkles,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export const WalletScreen: React.FC = () => {
  const {
    currentUser,
    walletData,
    formatIdr,
    formatUsdt,
    markets,
    setIsDepositModalOpen,
    setIsWithdrawModalOpen,
    recompoundProfit,
  } = useApp();

  const [showBalance, setShowBalance] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | '1Y'>('7D');
  const [searchAsset, setSearchAsset] = useState('');
  const [isRecompounding, setIsRecompounding] = useState(false);
  const [recompoundMsg, setRecompoundMsg] = useState('');

  const profitAmount = walletData?.compoundingProfitIdr ?? currentUser?.compoundingProfitIdr ?? 0;
  const compoundingCapital = (walletData?.compoundingBalances?.idr ?? currentUser?.compoundingBalances?.idr ?? 0);

  const handleRecompound = async () => {
    if (profitAmount <= 0) return;
    if (!confirm(`Gabungkan profit Rp ${profitAmount.toLocaleString('id-ID')} ke Modal Awal (ASET)? Profit akan bertumbuh 1%/hari.`)) return;
    
    setIsRecompounding(true);
    const res = await recompoundProfit();
    setIsRecompounding(false);

    if (res.success) {
      setRecompoundMsg(res.message || 'Profit berhasil digabungkan ke Modal!');
      setTimeout(() => setRecompoundMsg(''), 4000);
    } else {
      alert(res.message || 'Gagal re-compound profit');
    }
  };

  // Combined Wallet Values Calculation
  const calculateTotalFromUser = (user: any) => {
    if (!user) return 0;
    let total = (user.balances?.idr || 0) + (user.balances?.usdt || 0) * 17584;
    for (const [sym, qty] of Object.entries(user.balances?.tokens || {})) {
      const m = markets.find((mk) => mk.symbol === sym);
      if (m) total += (qty as number) * m.priceIdr;
    }
    total += (user.compoundingBalances?.idr || 0) + (user.compoundingBalances?.usdt || 0) * 17584;
    for (const [sym, qty] of Object.entries(user.compoundingBalances?.tokens || {})) {
      const m = markets.find((mk) => mk.symbol === sym);
      if (m) total += (qty as number) * m.priceIdr;
    }
    total += (user.proBalances?.idr || 0) + (user.proBalances?.usdt || 0) * 17584;
    for (const [sym, qty] of Object.entries(user.proBalances?.tokens || {})) {
      const m = markets.find((mk) => mk.symbol === sym);
      if (m) total += (qty as number) * m.priceIdr;
    }
    total += (user.futuresBalances?.usdt || 0) * 17584;
    return Math.round(total);
  };

  const currentDisplayTotal = walletData
    ? (walletData.totalIdr || 0) +
      (walletData.totalCompoundingIdr || 0) +
      (walletData.proTotalIdr || 0) +
      (walletData.futuresTotalUsdt || 0) * 17584
    : calculateTotalFromUser(currentUser);

  // Consolidated Tokens across all wallets
  const tokens: Record<string, number> = {};
  if (currentUser?.balances?.tokens) {
    for (const [s, q] of Object.entries(currentUser.balances.tokens)) {
      tokens[s] = (tokens[s] || 0) + (q as number);
    }
  }
  if (currentUser?.compoundingBalances?.tokens) {
    for (const [s, q] of Object.entries(currentUser.compoundingBalances.tokens)) {
      tokens[s] = (tokens[s] || 0) + (q as number);
    }
  }
  if (currentUser?.proBalances?.tokens) {
    for (const [s, q] of Object.entries(currentUser.proBalances.tokens)) {
      tokens[s] = (tokens[s] || 0) + (q as number);
    }
  }

  const idrCash =
    (currentUser?.balances?.idr || 0) +
    (currentUser?.compoundingBalances?.idr || 0) +
    (currentUser?.proBalances?.idr || 0);

  const usdtCash =
    (currentUser?.balances?.usdt || 0) +
    (currentUser?.compoundingBalances?.usdt || 0) +
    (currentUser?.proBalances?.usdt || 0) +
    (currentUser?.futuresBalances?.usdt || 0);

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-black text-white min-h-screen select-none w-full overflow-hidden">
      {/* 1. Top Tab Header (Ringkasan) */}
      <div className="px-4 pt-3 border-b border-gray-800 flex items-center justify-center text-xs sm:text-sm font-semibold">
        <span className="pb-2.5 text-white font-bold border-b-2 border-amber-500">
          Ringkasan
        </span>
      </div>

      {/* 2. Wallet Balance Overview */}
      <div className="p-4 sm:p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <span>Saldo dan Aset</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="hover:text-white transition-colors p-1"
          >
            {showBalance ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {showBalance ? formatIdr(currentDisplayTotal) : '••••••••'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          {showBalance ? formatIdr(currentDisplayTotal) : '••••••'}
        </p>

        {/* 3. Green Balance Trend SVG Graphic */}
        <div className="h-32 sm:h-36 w-full my-4 relative flex flex-col justify-end">
          <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 100 Q 150 90 250 80 T 360 20 L 400 10"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
            <path
              d="M 0 100 Q 150 90 250 80 T 360 20 L 400 10 L 400 120 L 0 120 Z"
              fill="url(#balanceGrad)"
            />
            <circle cx="360" cy="20" r="3" fill="#10b981" />
          </svg>

          {/* Time range filters */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-400 px-2 pt-2 border-t border-gray-800/80">
            {(['7D', '1M', '3M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === range ? 'bg-gray-800 text-white' : 'hover:text-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. White Bottom Card Section */}
      <div className="bg-white text-gray-900 rounded-t-3xl p-4 sm:p-5 min-h-[400px] shadow-2xl">
        {recompoundMsg && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{recompoundMsg}</span>
          </div>
        )}

        {/* 3 Breakdown Cards: SALDO, ASET (Modal Pokok), PROFIT COMPOUNDING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
          {/* 1. SALDO KAS */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-amber-950">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">💳 SALDO</span>
              <span className="text-[10px] font-extrabold text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full">Kas</span>
            </div>
            <p className="text-lg font-extrabold text-gray-900">
              {showBalance ? formatIdr(currentUser?.balances?.idr || 0) : '••••••••'}
            </p>
            <p className="text-[10px] text-gray-600">Saldo tunai bebas transaksi</p>
          </div>

          {/* 2. ASET (Modal Pokok) */}
          <div className="bg-yellow-50/90 border border-yellow-200/90 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-amber-950">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">📈 ASET</span>
              <span className="text-[10px] font-bold text-amber-900 bg-yellow-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> 3 Bulan
              </span>
            </div>
            <p className="text-lg font-extrabold text-amber-950">
              {showBalance ? formatIdr(compoundingCapital) : '••••••••'}
            </p>
            <p className="text-[10px] text-amber-800">Modal utama compounding</p>
          </div>
        </div>

        {/* PROFIT COMPOUNDING CARD */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 my-3 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">PROFIT COMPOUNDING</span>
            </div>
            <span className="bg-white/20 backdrop-blur-md text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white">
              Bisa Ditarik Kapan Saja
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black">
                {showBalance ? formatIdr(profitAmount) : '••••••••'}
              </p>
              <p className="text-[11px] text-emerald-100/90 mt-0.5">
                Minimal penarikan: Rp 100.000
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold px-3 py-2 rounded-xl shadow transition-all active:scale-95"
              >
                Tarik Profit
              </button>

              <button
                onClick={handleRecompound}
                disabled={isRecompounding || profitAmount <= 0}
                className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-white/30 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50 active:scale-95"
                title="Gabungkan profit kembali ke Modal Awal agar ikut bertumbuh 1%/hari"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecompounding ? 'animate-spin' : ''}`} />
                <span>Re-Compound</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar (Hanya Deposit & Tarik) */}
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-100 text-center">
          <button
            id="wallet-deposit-btn"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-amber-50 hover:border-amber-300 transition-colors group bg-white"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-800">Deposit</span>
          </button>

          <button
            id="wallet-withdraw-btn"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-amber-50 hover:border-amber-300 transition-colors group bg-white"
          >
            <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            <span className="text-xs sm:text-sm font-bold text-gray-800">Tarik</span>
          </button>
        </div>

        {/* 4. Information/Rules Section */}
        <div className="py-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Panduan Operasional & Ketentuan Sistem</h3>
          <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
            <p>Selamat datang di platform trading Pintu Pro. Demi kenyamanan dan keamanan transaksi, harap mematuhi panduan operasional berikut:</p>
            
            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">1. Prosedur Top-Up (Deposit)</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Minimal deposit adalah Rp 50.000 (atau sesuai ketentuan terkini).</li>
                <li>Transfer hanya ke nomor rekening resmi yang tertera di menu deposit.</li>
                <li>Setelah transfer, pastikan untuk mengunggah bukti transfer agar saldo diproses otomatis oleh sistem.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">2. Prosedur Penarikan (Withdrawal)</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Minimal penarikan adalah Rp 100.000.</li>
                <li>Penarikan diproses setiap hari kerja. Estimasi waktu cair maksimal 1x24 jam.</li>
                <li>Setiap penarikan akan dikenakan biaya admin dan pajak penarikan sesuai pengaturan sistem yang berlaku.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">3. Sistem Compounding & Trading</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Profit compounding sebesar 1% per hari dihitung berdasarkan modal yang diaktifkan.</li>
                <li>Profit harian akan masuk ke dompet profit setiap hari pukul 00:00 WIB.</li>
                <li>Gunakan fitur "Re-Compound" untuk menggabungkan profit ke modal agar profit hari berikutnya lebih besar.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-800">4. Keamanan & Layanan Pelanggan</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>KYC:</strong> Wajib melakukan verifikasi identitas (KYC) untuk membuka akses penarikan dana.</li>
                <li><strong>Anti-Phishing:</strong> CS resmi tidak pernah meminta kata sandi atau kode OTP Anda.</li>
                <li><strong>Bantuan:</strong> Hubungi Customer Service resmi hanya melalui link Telegram yang tersedia di menu Pengaturan.</li>
              </ul>
            </div>

            <p className="pt-2 border-t mt-2">Dengan melanjutkan penggunaan platform, Anda dianggap telah membaca, memahami, dan menyetujui seluruh aturan dan ketentuan sistem Pintu Pro.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
