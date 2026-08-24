import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoIcon } from './CryptoIcon';
import {
  Eye,
  EyeOff,
  Plus,
  ArrowDownToLine,
  ArrowRightLeft,
  FileText,
  Search,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
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
    setIsTransferModalOpen,
  } = useApp();

  const [activeTab, setActiveWalletTab] = useState<'Ringkasan' | 'Pro Spot' | 'Futures'>('Pro Spot');
  const [showBalance, setShowBalance] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | '1Y'>('7D');
  const [searchAsset, setSearchAsset] = useState('');

  // Values
  const spotTotalIdr = walletData?.totalIdr || 0;
  const proTotalIdr = walletData?.proTotalIdr || 0;
  const futuresUsdt = walletData?.futuresTotalUsdt || 0;

  const currentDisplayTotal =
    activeTab === 'Pro Spot'
      ? proTotalIdr
      : activeTab === 'Futures'
      ? futuresUsdt * 17584
      : spotTotalIdr + proTotalIdr + futuresUsdt * 17584;

  const tokens =
    activeTab === 'Pro Spot'
      ? currentUser?.proBalances?.tokens || {}
      : currentUser?.balances?.tokens || {};

  const idrCash =
    activeTab === 'Pro Spot'
      ? currentUser?.proBalances?.idr || 0
      : currentUser?.balances?.idr || 0;

  const usdtCash =
    activeTab === 'Pro Spot'
      ? currentUser?.proBalances?.usdt || 0
      : activeTab === 'Futures'
      ? currentUser?.futuresBalances?.usdt || 0
      : currentUser?.balances?.usdt || 0;

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-black text-white min-h-screen select-none w-full overflow-hidden">
      {/* 1. Top Tabs (Ringkasan, Pro Spot, Futures) */}
      <div className="px-4 pt-3 border-b border-gray-800 flex items-center justify-around text-xs sm:text-sm font-semibold">
        {(['Ringkasan', 'Pro Spot', 'Futures'] as const).map((tab) => (
          <button
            key={tab}
            id={`wallet-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveWalletTab(tab)}
            className={`pb-2.5 transition-colors relative ${
              activeTab === tab
                ? 'text-white font-bold border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Wallet Balance Overview */}
      <div className="p-4 sm:p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <span>Nilai Wallet {activeTab}</span>
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

        {/* Transfer prompt */}
        {currentDisplayTotal === 0 && (
          <div className="text-center py-3 bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-3">
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Transfer dana untuk mulai trading di Pintu {activeTab === 'Futures' ? 'Futures' : 'Pro'}.
            </p>
            <button
              id="wallet-transfer-center-btn"
              onClick={() => setIsTransferModalOpen(true)}
              className="w-full bg-[#0052FF] hover:bg-blue-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. White Bottom Card Section */}
      <div className="bg-white text-gray-900 rounded-t-3xl p-4 sm:p-5 min-h-[400px] shadow-2xl">
        {/* Action Bar (Deposit, Tarik, Transfer, Riwayat) */}
        <div className="grid grid-cols-4 gap-2 pb-4 border-b border-gray-100 text-center">
          <button
            id="wallet-deposit-btn"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex flex-col items-center group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 mt-1">Deposit</span>
          </button>

          <button
            id="wallet-withdraw-btn"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex flex-col items-center group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 mt-1">Tarik</span>
          </button>

          <button
            id="wallet-transfer-btn"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex flex-col items-center group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 mt-1">Transfer</span>
          </button>

          <button
            id="wallet-history-btn"
            onClick={() => alert('Riwayat transaksi tersimpan lengkap pada log.')}
            className="flex flex-col items-center group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 mt-1">Riwayat</span>
          </button>
        </div>

        {/* Search & Lihat Order */}
        <div className="flex items-center gap-2 py-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset"
              value={searchAsset}
              onChange={(e) => setSearchAsset(e.target.value)}
              className="w-full bg-gray-100 text-xs sm:text-sm pl-8 pr-3 py-2 sm:py-2.5 rounded-xl outline-none"
            />
          </div>

          <button
            onClick={() => alert('Daftar order aktif dapat dilihat di menu Trade / Futures.')}
            className="border border-gray-200 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1 hover:bg-gray-50 flex-shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lihat Order</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-gray-400 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <span>ASET</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <span>TOTAL</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 w-16 justify-end">
              <span>TERSEDIA</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Asset Rows */}
        <div className="divide-y divide-gray-100">
          {/* Rupiah Balance Row */}
          <div className="py-3 flex items-center justify-between hover:bg-gray-50 px-1 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                Rp
              </div>
              <div>
                <p className="font-bold text-xs text-gray-900">Rupiah</p>
                <p className="text-[10px] text-gray-400">IDR</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-gray-900">{formatIdr(idrCash)}</p>
              <p className="text-[10px] text-gray-400">{formatIdr(idrCash)}</p>
            </div>
          </div>

          {/* USDT Balance Row */}
          <div className="py-3 flex items-center justify-between hover:bg-gray-50 px-1 rounded-xl">
            <div className="flex items-center gap-3">
              <CryptoIcon
                src="https://assets.coingecko.com/coins/images/325/small/Tether.png"
                symbol="USDT"
                name="Tether USD"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-bold text-xs text-gray-900">Tether USD</p>
                <p className="text-[10px] text-gray-400">USDT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xs text-gray-900">{formatUsdt(usdtCash)} USDT</p>
              <p className="text-[10px] text-gray-400">{formatIdr(usdtCash * 17584)}</p>
            </div>
          </div>

          {/* User Crypto & Stock Tokens */}
          {markets
            .filter((m) => {
              if (searchAsset) {
                return (
                  m.name.toLowerCase().includes(searchAsset.toLowerCase()) ||
                  m.symbol.toLowerCase().includes(searchAsset.toLowerCase())
                );
              }
              return true;
            })
            .map((asset) => {
              const qty = tokens[asset.symbol] || 0;
              const valueIdr = qty * asset.priceIdr;
              return (
                <div
                  key={asset.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-1 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CryptoIcon
                      src={asset.icon}
                      symbol={asset.symbol}
                      name={asset.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-900">{asset.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-gray-900">
                      {qty} {asset.symbol}
                    </p>
                    <p className="text-[10px] text-gray-400">{formatIdr(valueIdr)}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
