import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkline } from './Sparkline';
import { CryptoIcon } from './CryptoIcon';
import {
  TrendingUp,
  Vault,
  Diamond,
  Gamepad2,
  Coins,
  Calendar,
  Bell,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BookOpen,
  Sparkles,
  FileText,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    markets,
    setSelectedMarket,
    setActiveTab,
    setMode,
    formatIdr,
    announcements,
    newsList,
    academyList,
    setIsKYCModalOpen,
    setIsDepositModalOpen,
  } = useApp();

  const [topMoversFilter, setTopMoversFilter] = useState<'spot' | 'tokenized'>('spot');
  const [spotlightTab, setSpotlightTab] = useState<'Watchlist' | 'Crypto' | 'Stocks' | 'Komoditas' | 'ETF'>('Crypto');
  const [spotlightFilter, setSpotlightFilter] = useState<'top' | 'gainers' | 'losers'>('top');
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(false);

  // Filter top movers
  const topMoversList = markets.filter((m) => {
    if (topMoversFilter === 'tokenized') return m.category === 'stocks';
    return m.category === 'crypto';
  });

  // Spotlight assets
  const spotlightList = markets.filter((m) => {
    if (spotlightTab === 'Stocks') return m.category === 'stocks';
    if (spotlightTab === 'Crypto') return m.category === 'crypto';
    return true;
  }).sort((a, b) => {
    if (spotlightFilter === 'gainers') return b.change24h - a.change24h;
    if (spotlightFilter === 'losers') return a.change24h - b.change24h;
    return Math.abs(b.change24h) - Math.abs(a.change24h);
  }).slice(0, 6);

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white min-h-screen w-full overflow-hidden pt-2">
      {/* Quick Action Grid (2 rows x 4 icons) */}
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="bg-white border-2 border-violet-500 rounded-none p-3 sm:p-4 shadow-sm grid grid-cols-4 gap-y-4 gap-x-2 text-center relative overflow-visible">
          {/* Futures Lite */}
          <button
            id="quick-futures"
            onClick={() => {
              const btc = markets.find((m) => m.symbol === 'BTC');
              if (btc) setSelectedMarket(btc);
              setActiveTab('trade');
            }}
            className="flex flex-col items-center group p-1 relative"
          >
            {/* New Red Badge */}
            <span className="absolute -top-1.5 -left-1 sm:left-1 bg-red-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none tracking-wider scale-90 z-20 shadow-sm">
              New
            </span>
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <TrendingUp className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Futures Lite</span>
          </button>

          {/* Earn */}
          <button
            id="quick-earn"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <Vault className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Earn</span>
          </button>

          {/* XMoney VIP */}
          <button
            id="quick-vip"
            onClick={() => setActiveTab('wallet')}
            className="flex flex-col items-center group p-1 relative"
          >
            {/* Personal RM Badge */}
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-[#E8F1FF] text-[#1A73E8] text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap scale-90 z-20 shadow-sm">
              Personal RM
            </span>
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <Diamond className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">XMoney VIP</span>
          </button>

          {/* BTC Game */}
          <button
            id="quick-btc-game"
            onClick={() => {
              setActiveTab('market');
            }}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <Gamepad2 className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">BTC Game</span>
          </button>

          {/* PTU Staking */}
          <button
            id="quick-ptu-staking"
            onClick={() => {
              const ptu = markets.find((m) => m.symbol === 'PTU');
              if (ptu) setSelectedMarket(ptu);
              setActiveTab('market');
            }}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              {/* Custom outline circle-N icon */}
              <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full border-2 border-gray-900 flex items-center justify-center font-black text-gray-900 text-[10px] sm:text-[11px] leading-none">
                N
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">PTU Staking</span>
          </button>

          {/* Auto Invest */}
          <button
            id="quick-dca"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <Calendar className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Auto Invest</span>
          </button>

          {/* Price Alert */}
          <button
            id="quick-alert"
            onClick={() => setActiveTab('market')}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Price Alert</span>
          </button>

          {/* More */}
          <button
            id="quick-more"
            onClick={() => setActiveTab('market')}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2.5 rounded-xl bg-white group-hover:bg-violet-50 transition-colors">
              <ChevronDown className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">More</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Asset Price Tracker (EXACTLY matching screenshot) */}
      <div className="px-3 sm:px-4 py-3">
        <div className="grid grid-cols-12 gap-3.5">
          {/* LEFT SIDE: Bitcoin Card (Tall, span 5/12) */}
          <div
            onClick={() => {
              const btc = markets.find((m) => m.symbol === 'BTC');
              if (btc) {
                setSelectedMarket(btc);
                setActiveTab('market');
              }
            }}
            className="col-span-5 bg-white border-2 border-violet-500 rounded-none p-3 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] min-h-[290px] relative overflow-hidden"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-[#F7931A] flex items-center justify-center text-white font-black text-xs shadow-sm">
                B
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="font-bold text-xs text-gray-900 leading-tight">Bitcoin</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">BTC</p>
              </div>
            </div>

            <div className="my-2">
              <p className="text-xs font-semibold text-gray-900">Rp</p>
              <p className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight leading-none">
                1.422.091.500
              </p>
            </div>

            {/* Golden Rising Sparkline with beautiful Area Gradient fill */}
            <div className="w-full h-20 my-1">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="btc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7931A" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F7931A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 C15,22 25,28 40,20 C55,12 65,18 80,10 C90,6 95,14 100,5"
                  fill="none"
                  stroke="#F7931A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M0,25 C15,22 25,28 40,20 C55,12 65,18 80,10 C90,6 95,14 100,5 L100,30 L0,30 Z"
                  fill="url(#btc-grad)"
                />
              </svg>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-emerald-600">
              <span>▲</span> 3,75%
            </div>
          </div>

          {/* RIGHT SIDE: Apple, Nvidia, Alphabet (span 7/12) */}
          <div className="col-span-7 flex flex-col gap-3">
            {/* Apple Card (Horizontal Layout) */}
            <div
              onClick={() => {
                const aapl = markets.find((m) => m.symbol === 'AAPL');
                if (aapl) {
                  setSelectedMarket(aapl);
                  setActiveTab('market');
                }
              }}
              className="bg-white border-2 border-violet-500 rounded-none p-3 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] h-[90px]"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 leading-tight truncate">Apple</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase">AAPLX</p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5 truncate">Rp 5.489.912</p>
                </div>
              </div>

              {/* Gray SVG Sparkline & rate */}
              <div className="flex flex-col items-end gap-1 w-20 sm:w-24 shrink-0">
                <div className="w-full h-7">
                  <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="aapl-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8E8E93" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#8E8E93" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,15 C10,12 20,18 30,10 C40,2 50,14 60,8 C70,2 75,5 80,4"
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,15 C10,12 20,18 30,10 C40,2 50,14 60,8 C70,2 75,5 80,4 L80,20 L0,20 Z"
                      fill="url(#aapl-grad)"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] font-black text-emerald-600">
                  <span>▲</span> 0,01%
                </div>
              </div>
            </div>

            {/* Row of NVIDIA & Alphabet (2 Equal columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* NVIDIA Card */}
              <div
                onClick={() => {
                  const nvda = markets.find((m) => m.symbol === 'NVDA');
                  if (nvda) {
                    setSelectedMarket(nvda);
                    setActiveTab('market');
                  }
                }}
                className="bg-white border-2 border-violet-500 rounded-none p-2.5 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] min-h-[185px]"
              >
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#76B900] flex items-center justify-center text-white text-[9px] font-black shadow-sm shrink-0">
                    NV
                  </div>
                  <div className="mt-1">
                    <p className="font-bold text-[11px] text-gray-900 leading-tight">NVIDIA</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">NVDAX</p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 mt-1 truncate">Rp 3.727.274</p>
                </div>

                {/* Green SVG Sparkline */}
                <div className="w-full h-8 my-1">
                  <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="nvda-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,4 C10,5 20,12 30,14 C40,16 50,8 60,15 C70,22 75,18 80,18"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,4 C10,5 20,12 30,14 C40,16 50,8 60,15 C70,22 75,18 80,18 L80,20 L0,20 Z"
                      fill="url(#nvda-grad)"
                    />
                  </svg>
                </div>

                <div className="flex items-center gap-0.5 text-[9px] font-black text-red-500">
                  <span>▼</span> 2,12%
                </div>
              </div>

              {/* Alphabet Card */}
              <div
                onClick={() => {
                  const googl = markets.find((m) => m.symbol === 'GOOGL');
                  if (googl) {
                    setSelectedMarket(googl);
                    setActiveTab('market');
                  }
                }}
                className="bg-white border-2 border-violet-500 rounded-none p-2.5 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98] min-h-[185px]"
              >
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-[9px] font-black shadow-sm shrink-0">
                    G
                  </div>
                  <div className="mt-1">
                    <p className="font-bold text-[11px] text-gray-900 leading-tight">Alphabet</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">GOOGLX</p>
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 mt-1 truncate">Rp 6.166.271</p>
                </div>

                {/* Blue SVG Sparkline */}
                <div className="w-full h-8 my-1">
                  <svg viewBox="0 0 80 20" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="googl-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,16 C10,18 20,17 30,12 C40,7 50,14 60,5 C70,2 75,8 80,7"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,16 C10,18 20,17 30,12 C40,7 50,14 60,5 C70,2 75,8 80,7 L80,20 L0,20 Z"
                      fill="url(#googl-grad)"
                    />
                  </svg>
                </div>

                <div className="flex items-center gap-0.5 text-[9px] font-black text-emerald-600">
                  <span>▲</span> 1,47%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Market Spotlight */}
      <div className="px-3 sm:px-4 py-4 border-t border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Market Spotlight</h2>

        {/* Spotlight Category Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-100 overflow-x-auto text-xs font-semibold pb-2 scrollbar-none mb-3">
          {(['Watchlist', 'Crypto', 'Stocks', 'Komoditas', 'ETF'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSpotlightTab(tab)}
              className={`pb-1 whitespace-nowrap transition-colors relative ${
                spotlightTab === tab
                  ? 'text-gray-900 font-bold border-b-2 border-violet-500'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Spotlight Filter Chips */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSpotlightFilter('top')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 whitespace-nowrap transition-all ${
              spotlightFilter === 'top'
                ? 'border-violet-500 text-violet-800 bg-violet-50 font-bold'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🔥</span> Top Movers
          </button>
          <button
            onClick={() => setSpotlightFilter('gainers')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              spotlightFilter === 'gainers'
                ? 'border-violet-500 text-violet-800 bg-violet-50 font-bold'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setSpotlightFilter('losers')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              spotlightFilter === 'losers'
                ? 'border-violet-500 text-violet-800 bg-violet-50 font-bold'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Losers
          </button>
        </div>

        {/* Spotlight Asset List */}
        <div className="space-y-1 divide-y divide-gray-100">
          {spotlightList.map((asset) => {
            const isPos = asset.change24h >= 0;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedMarket(asset);
                  setActiveTab('market');
                }}
                className="py-3 flex items-center justify-between hover:bg-gray-50 px-1 sm:px-2 rounded-xl transition-colors cursor-pointer gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <CryptoIcon
                    src={asset.icon}
                    symbol={asset.symbol}
                    name={asset.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">{asset.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium uppercase">{asset.symbol}</p>
                  </div>
                </div>

                <div className="hidden sm:block flex-shrink-0">
                  <Sparkline
                    data={asset.sparkline}
                    isPositive={isPos}
                    width={70}
                    height={22}
                  />
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {formatIdr(asset.priceIdr)}
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs font-bold flex items-center justify-end gap-0.5 ${
                      isPos ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isPos ? '▲' : '▼'} {Math.abs(asset.change24h).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lihat Semua Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => setActiveTab('market')}
            className="text-violet-600 font-bold text-sm hover:underline"
          >
            Lihat Semua
          </button>
        </div>
      </div>

      {/* 6. Info dan Promo Spesial */}
      <div className="px-4 py-4 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Info dan Promo Spesial</h2>
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl p-4 text-slate-950 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-slate-950/20 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Program Utama
            </span>
            <h3 className="text-base font-extrabold mt-2 text-slate-950">Compounding Modal & Keuntungan 1% Setiap Hari</h3>
            <p className="text-xs text-violet-950/90 font-medium mt-1">Pantau riwayat modal, penyimpanan compounding, dan hasil profit harian Anda.</p>
            <button
              onClick={() => {
                setActiveTab('transaksi');
              }}
              className="mt-3 bg-slate-950 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow hover:bg-slate-800 transition-colors"
            >
              Lihat Transaksi
            </button>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 w-28 h-28 text-slate-950/10" />
        </div>
      </div>

      {/* 7. Academy Minggu Ini */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Academy Minggu Ini</h2>
          <button
            onClick={() => setActiveTab('market')}
            className="text-violet-600 font-bold text-xs hover:underline"
          >
            Pelajari Kripto
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {academyList.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab('market')}
              className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="h-28 bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <BookOpen className="w-8 h-8 text-violet-500/60 absolute" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-2">{item.readTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Berita Terkini */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Berita Terkini</h2>
          <button
            onClick={() => setActiveTab('market')}
            className="text-violet-600 font-bold text-xs hover:underline"
          >
            Lihat Analisis Pasar
          </button>
        </div>

        <div className="space-y-3 divide-y divide-gray-100">
          {newsList.slice(0, 3).map((news) => (
            <div
              key={news.id}
              onClick={() => setActiveTab('market')}
              className="pt-3 flex gap-3 items-start cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-50 to-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-gray-100">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <TrendingUp className="w-6 h-6 text-violet-300 absolute" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-violet-600 transition-colors leading-snug">
                  {news.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1">
                  {news.source} • {news.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Panduan Trading (4-card grid) */}
      <div className="px-4 py-4 border-t border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-gray-800" />
          <h2 className="text-lg font-bold text-gray-900">Panduan Trading</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {academyList.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab('market')}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-24 bg-gradient-to-br from-slate-100 to-indigo-50 overflow-hidden relative flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <BookOpen className="w-6 h-6 text-slate-400 absolute" />
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
