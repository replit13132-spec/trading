import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkline } from './Sparkline';
import { CryptoIcon } from './CryptoIcon';
import { Search, Star, ArrowUpDown, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Asset } from '../types';

export const MarketScreen: React.FC = () => {
  const { markets, setSelectedMarket, setActiveTab, setMode, formatIdr } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [marketTab, setMarketTab] = useState<'Watchlist' | 'Pro Spot' | 'Tokenized Assets' | 'Futures' | 'Stocks'>('Pro Spot');
  const [filterPill, setFilterPill] = useState<'Semua' | 'Trending' | 'Gainers' | 'Losers'>('Semua');

  // Filter top highlight cards (PTU, BTC, ETH)
  const topHighlights = markets.filter((m) => ['PTU', 'BTC', 'ETH'].includes(m.symbol));

  // Filter table assets
  const filteredAssets = markets
    .filter((asset) => {
      // Tab filter
      if (marketTab === 'Stocks' || marketTab === 'Tokenized Assets') {
        if (asset.category !== 'stocks') return false;
      } else if (marketTab === 'Pro Spot' || marketTab === 'Futures') {
        if (asset.category !== 'crypto') return false;
      } else if (marketTab === 'Watchlist') {
        if (!asset.isFavorite) return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          asset.name.toLowerCase().includes(term) ||
          asset.symbol.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filterPill === 'Trending') return Math.abs(b.change24h) - Math.abs(a.change24h);
      if (filterPill === 'Gainers') return b.change24h - a.change24h;
      if (filterPill === 'Losers') return a.change24h - b.change24h;
      return 0;
    });

  const handleSelectAsset = (asset: Asset) => {
    setSelectedMarket(asset);
    setMode('pro');
    setActiveTab('trade');
  };

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white min-h-screen w-full overflow-hidden">
      {/* 1. Search Bar */}
      <div className="p-3 sm:p-4 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-market-input"
            type="text"
            placeholder="Cari aset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-gray-900 placeholder-gray-400 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-amber-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* 2. Main Tabs (Watchlist, Pro Spot, Tokenized Assets, Futures, Stocks) */}
      <div className="px-3 sm:px-4 border-b border-gray-100 flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none text-xs font-semibold">
        {(['Watchlist', 'Pro Spot', 'Tokenized Assets', 'Futures', 'Stocks'] as const).map((tab) => (
          <button
            key={tab}
            id={`market-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setMarketTab(tab)}
            className={`pb-2.5 whitespace-nowrap transition-colors relative ${
              marketTab === tab
                ? 'text-gray-900 font-bold border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Filter Pills (Semua, 🔥 Trending, Gainers, Losers) */}
      <div className="p-3 sm:p-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilterPill('Semua')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
            filterPill === 'Semua'
              ? 'border-amber-500 text-amber-800 bg-amber-50 font-bold'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilterPill('Trending')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 whitespace-nowrap transition-all ${
            filterPill === 'Trending'
              ? 'border-amber-500 text-amber-800 bg-amber-50 font-bold'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>🔥</span> Trending
        </button>
        <button
          onClick={() => setFilterPill('Gainers')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
            filterPill === 'Gainers'
              ? 'border-amber-500 text-amber-800 bg-amber-50 font-bold'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Gainers
        </button>
        <button
          onClick={() => setFilterPill('Losers')}
          className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
            filterPill === 'Losers'
              ? 'border-amber-500 text-amber-800 bg-amber-50 font-bold'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Losers
        </button>
      </div>

      {/* 4. Top 3 Highlight Cards (PTU/IDR, BTC/IDR, ETH/IDR) */}
      <div className="px-3 sm:px-4 py-2">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {topHighlights.map((asset) => {
            const isPos = asset.change24h >= 0;
            return (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className="bg-white border border-gray-200/80 rounded-2xl p-2 sm:p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-w-0"
              >
                <div>
                  <div className="flex items-center gap-1 mb-1 min-w-0">
                    <CryptoIcon
                      src={asset.icon}
                      symbol={asset.symbol}
                      name={asset.name}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 truncate">
                      {asset.symbol}/<span className="text-gray-400 font-normal">IDR</span>
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-900 mt-0.5 truncate">
                    {formatIdr(asset.priceIdr).replace('Rp ', '')}
                  </p>
                  <p
                    className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${
                      isPos ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isPos ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </p>
                </div>

                <div className="mt-1.5 pt-1 border-t border-gray-50 flex justify-end">
                  <Sparkline
                    data={asset.sparkline}
                    isPositive={isPos}
                    width={55}
                    height={18}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Asset Table Header */}
      <div className="px-3 sm:px-4 pt-3 pb-1 border-b border-gray-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <div className="flex items-center gap-1">
          <span>NAMA / VOL</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1">
            <span>HARGA (IDR)</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1 w-16 sm:w-20 justify-end">
            <span>24H</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 6. Asset Table List */}
      <div className="divide-y divide-gray-100">
        {filteredAssets.map((asset) => {
          const isPos = asset.change24h >= 0;
          return (
            <div
              key={asset.id}
              onClick={() => handleSelectAsset(asset)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer gap-2"
            >
              {/* Asset Name & Vol */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <CryptoIcon
                  src={asset.icon}
                  symbol={asset.symbol}
                  name={asset.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-gray-900 truncate">{asset.symbol}</span>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">/IDR</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <span className="truncate">Vol. {asset.volume24hIdr}</span>
                  </div>
                </div>
              </div>

              {/* Price & 24H Change Pill */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {formatIdr(asset.priceIdr).replace('Rp ', '')}
                  </p>
                </div>

                <div
                  className={`w-16 sm:w-20 py-1 sm:py-1.5 rounded-lg text-center font-bold text-[11px] sm:text-xs flex-shrink-0 ${
                    isPos
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {isPos ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
