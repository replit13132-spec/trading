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
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm grid grid-cols-4 gap-y-3 sm:gap-y-4 gap-x-1 sm:gap-x-2 text-center">
          {/* Futures Lite */}
          <button
            id="quick-futures-lite"
            onClick={() => {
              setMode('pro');
              setActiveTab('futures');
            }}
            className="flex flex-col items-center group p-1"
          >
            <div className="relative p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                Baru
              </span>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Futures Lite</span>
          </button>

          {/* Earn */}
          <button
            id="quick-earn"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <Vault className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Earn</span>
          </button>

          {/* Pintu VIP */}
          <button
            id="quick-vip"
            onClick={() => setActiveTab('wallet')}
            className="flex flex-col items-center group p-1"
          >
            <div className="relative p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <span className="absolute -top-1.5 -right-2 bg-blue-100 text-blue-700 text-[7px] sm:text-[8px] font-bold px-1 py-0.2 rounded-full whitespace-nowrap">
                RM
              </span>
              <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Pintu VIP</span>
          </button>

          {/* BTC Game */}
          <button
            id="quick-btc-game"
            onClick={() => {
              setActiveTab('market');
            }}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">BTC Game</span>
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
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">PTU Staking</span>
          </button>

          {/* Investasi Rutin */}
          <button
            id="quick-dca"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Investasi Rutin</span>
          </button>

          {/* Price Alert */}
          <button
            id="quick-alert"
            onClick={() => setActiveTab('market')}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Price Alert</span>
          </button>

          {/* Lainnya */}
          <button
            id="quick-more"
            onClick={() => setActiveTab('market')}
            className="flex flex-col items-center group p-1"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-800 mt-1 sm:mt-1.5 truncate max-w-full">Lainnya</span>
          </button>
        </div>
      </div>

      {/* 4. Top Movers (24H) Section */}
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Top Movers (24H)</h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setTopMoversFilter('spot')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              topMoversFilter === 'spot'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => setTopMoversFilter('tokenized')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              topMoversFilter === 'tokenized'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
            }`}
          >
            Tokenized Assets
          </button>
        </div>

        {/* Horizontal Card Carousel */}
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {topMoversList.map((asset) => {
            const isPos = asset.change24h >= 0;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedMarket(asset);
                  setActiveTab('market');
                }}
                className="min-w-[145px] sm:min-w-[155px] flex-shrink-0 bg-white border border-gray-200/80 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer snap-start"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CryptoIcon
                    src={asset.icon}
                    symbol={asset.symbol}
                    name={asset.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="overflow-hidden min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{asset.symbol}</p>
                    <p className="text-[10px] text-gray-400 truncate">{asset.name}</p>
                  </div>
                </div>

                <div className="my-1.5">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {formatIdr(asset.priceIdr)}
                  </p>
                  <p
                    className={`text-[11px] font-bold mt-0.5 flex items-center gap-0.5 ${
                      isPos ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isPos ? '▲' : '▼'} {Math.abs(asset.change24h).toFixed(2)}%
                  </p>
                </div>

                <div className="mt-2 pt-1 border-t border-gray-50 flex justify-end">
                  <Sparkline
                    data={asset.sparkline}
                    isPositive={isPos}
                    width={85}
                    height={22}
                  />
                </div>
              </div>
            );
          })}
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
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
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
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🔥</span> Top Movers
          </button>
          <button
            onClick={() => setSpotlightFilter('gainers')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              spotlightFilter === 'gainers'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setSpotlightFilter('losers')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
              spotlightFilter === 'losers'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
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
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            Lihat Semua
          </button>
        </div>
      </div>

      {/* 6. Info dan Promo Spesial */}
      <div className="px-4 py-4 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Info dan Promo Spesial</h2>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Event Spesial
            </span>
            <h3 className="text-base font-bold mt-2">Trading Futures & Dapatkan Cashback hingga 100 USDT</h3>
            <p className="text-xs text-blue-100 mt-1">Mulai trading BTC/USDT dengan leverage hingga 25x sekarang.</p>
            <button
              onClick={() => {
                setMode('pro');
                setActiveTab('futures');
              }}
              className="mt-3 bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition-colors"
            >
              Mulai Trading
            </button>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
        </div>
      </div>

      {/* 7. Academy Minggu Ini */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Academy Minggu Ini</h2>
          <button
            onClick={() => setActiveTab('market')}
            className="text-blue-600 font-bold text-xs hover:underline"
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
              <div className="h-28 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <BookOpen className="w-8 h-8 text-blue-400/60 absolute" />
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
            className="text-blue-600 font-bold text-xs hover:underline"
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-gray-100">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <TrendingUp className="w-6 h-6 text-blue-300 absolute" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
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
