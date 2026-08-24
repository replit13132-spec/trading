import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CandleChart } from './CandleChart';
import { CryptoIcon } from './CryptoIcon';
import {
  ChevronDown,
  Star,
  Gamepad2,
  ChevronRight,
  Plus,
  Info,
  Sliders,
  Check,
  TrendingUp,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FuturesScreen: React.FC = () => {
  const {
    markets,
    selectedMarket,
    setSelectedMarket,
    futuresPositions,
    currentUser,
    walletData,
    openFuturesPosition,
    closeFuturesPosition,
    setIsTransferModalOpen,
    formatUsdt,
  } = useApp();

  // Selected coin (defaults to BTC)
  const currentAsset =
    selectedMarket && selectedMarket.category === 'crypto'
      ? selectedMarket
      : markets.find((m) => m.symbol === 'BTC') || markets[0];

  const [topTab, setTopTab] = useState<'Grafik' | 'Depth' | 'Trade' | 'Funding' | 'Asuransi'>('Grafik');
  const [showChart, setShowChart] = useState(true);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState<number>(25);
  const [marginMode, setMarginMode] = useState<'CROSS' | 'ISOLATED'>('CROSS');
  const [amountUsdt, setAmountUsdt] = useState<string>('50');
  const [sliderPct, setSliderPct] = useState<number>(25);
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [isReduceOnly, setIsReduceOnly] = useState(false);
  const [priceProtection, setPriceProtection] = useState('0,2%');
  const [activeBottomTab, setActiveBottomTab] = useState<'positions' | 'orders' | 'history'>('positions');

  // Modals
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [showMarginModeModal, setShowMarginModeModal] = useState(false);
  const [showCoinPickerModal, setShowCoinPickerModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Available margin in futures
  const availableMargin = currentUser?.futuresBalances?.usdt || 0;

  // Sync slider with amount
  const handleSliderChange = (pct: number) => {
    setSliderPct(pct);
    if (availableMargin > 0) {
      const calc = (availableMargin * (pct / 100)).toFixed(1);
      setAmountUsdt(calc);
    }
  };

  const handleOpenTrade = async (side: 'LONG' | 'SHORT') => {
    const val = Number(amountUsdt);
    if (!val || val <= 0) {
      setFeedbackMsg({ text: 'Masukkan jumlah margin yang valid', isError: true });
      return;
    }
    if (val > availableMargin) {
      setFeedbackMsg({
        text: `Saldo margin tidak cukup (${formatUsdt(availableMargin)} USDT)`,
        isError: true,
      });
      return;
    }

    const res = await openFuturesPosition({
      symbol: currentAsset.symbol,
      side,
      leverage,
      marginMode,
      amountUsdt: val,
      tpPrice: enableTPSL && tpPrice ? Number(tpPrice) : undefined,
      slPrice: enableTPSL && slPrice ? Number(slPrice) : undefined,
    });

    if (res.success) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setFeedbackMsg({
        text: `Sukses membuka posisi ${side} ${currentAsset.symbol} (${leverage}x)`,
        isError: false,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ text: res.message || 'Gagal membuka posisi', isError: true });
    }
  };

  // Orderbook mock generation for right column
  const baseP = currentAsset?.priceUsdt || 77250.7;
  const asks = [
    { price: (baseP + 129.3).toFixed(1), amount: '1,08K' },
    { price: (baseP + 125.3).toFixed(1), amount: '35,28K' },
    { price: (baseP + 122.3).toFixed(1), amount: '67,39K' },
    { price: (baseP + 25.4).toFixed(1), amount: '62,98K' },
    { price: (baseP + 9.3).toFixed(1), amount: '35,30K' },
    { price: (baseP - 7.7).toFixed(1), amount: '16,53K' },
    { price: (baseP - 7.7).toFixed(1), amount: '49,97K' },
  ];

  const bids = [
    { price: (baseP - 28.8).toFixed(1), amount: '77,2' },
    { price: (baseP - 72.2).toFixed(1), amount: '49,93K' },
    { price: (baseP - 72.3).toFixed(1), amount: '18,59K' },
    { price: (baseP - 72.5).toFixed(1), amount: '17,82K' },
    { price: (baseP - 101.2).toFixed(1), amount: '462,8' },
    { price: (baseP - 113.7).toFixed(1), amount: '27,53K' },
    { price: (baseP - 144.8).toFixed(1), amount: '22,51K' },
  ];

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white min-h-screen select-none w-full overflow-hidden">
      {/* 1. Header: Coin Selector & Perp Ticker */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCoinPickerModal(true)}
            className="flex items-center gap-1.5 hover:bg-gray-100 p-1 rounded-lg transition-colors"
          >
            <CryptoIcon
              src={currentAsset?.icon}
              symbol={currentAsset?.symbol}
              name={currentAsset?.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="font-bold text-xs sm:text-sm text-gray-900">{currentAsset?.name}</span>
            <span className="bg-gray-100 text-gray-700 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded">
              {leverage}x
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
          <span className="text-[10px] sm:text-[11px] font-mono text-gray-400">
            {currentAsset.symbol}USDT-PERP
          </span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <Gamepad2 className="w-4 h-4 text-gray-600 hover:text-black cursor-pointer" />
        </div>
      </div>

      {/* 2. Top Stats Banner */}
      <div className="px-3 sm:px-4 py-2 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Harga Terakhir</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                {currentAsset.priceUsdt.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600">
              +{Math.abs(currentAsset.change24h).toFixed(2)} ({currentAsset.change24h}%)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-right text-[9px] sm:text-[10px] flex-shrink-0">
            <div>
              <span className="text-gray-400 block">24H High</span>
              <span className="font-bold text-gray-800">
                {(currentAsset.priceUsdt * 1.01).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Open Interest (BTC)</span>
              <span className="font-bold text-gray-800">44,186</span>
            </div>
            <div>
              <span className="text-gray-400 block">24H Low</span>
              <span className="font-bold text-gray-800">
                {(currentAsset.priceUsdt * 0.985).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Vol 24H (USDT)</span>
              <span className="font-bold text-gray-800">{currentAsset.volume24hUsdt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Tabs (Grafik, Depth, Trade, Funding, Asuransi) */}
      <div className="px-3 sm:px-4 border-b border-gray-100 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
          {(['Grafik', 'Depth', 'Trade', 'Funding', 'Asuransi'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTopTab(tab);
                setShowChart(tab === 'Grafik');
              }}
              className={`py-2 whitespace-nowrap transition-colors relative ${
                topTab === tab
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowChart(!showChart)}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 flex-shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showChart ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 4. Interactive Candlestick Chart */}
      {showChart && (
        <CandleChart
          symbol={currentAsset.symbol}
          currentPrice={currentAsset.priceUsdt}
          currencyPrefix=""
          isIdr={false}
        />
      )}

      {/* 5. Feedback Alert Toast */}
      {feedbackMsg && (
        <div
          className={`mx-3 sm:mx-4 my-2 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedbackMsg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}

      {/* 6. Trading Controls & Orderbook (2-Column Grid) */}
      <div className="p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-3">
        {/* Left Column: Order Form (7 cols) */}
        <div className="col-span-7 space-y-2 sm:space-y-2.5">
          {/* Leverage & Margin Mode Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowLeverageModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-gray-800 flex items-center justify-between min-w-0"
            >
              <span className="truncate">Lev <b className="text-blue-600">{leverage}x</b></span>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            </button>
            <button
              onClick={() => setShowMarginModeModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-gray-800 flex items-center justify-between min-w-0"
            >
              <span className="truncate">{marginMode === 'CROSS' ? 'Cross' : 'Iso'}</span>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            </button>
          </div>

          {/* Order Type Dropdown */}
          <div className="relative">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full bg-gray-100 hover:bg-gray-200/80 text-gray-900 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl outline-none appearance-none cursor-pointer"
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Input (Market / Limit) */}
          {orderType === 'LIMIT' ? (
            <div>
              <input
                type="number"
                placeholder="Harga Limit (USDT)"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-gray-100 font-semibold text-xs px-2.5 sm:px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
              />
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-400 text-xs px-2.5 sm:px-3 py-2 rounded-xl font-medium">
              Harga Market
            </div>
          )}

          {/* Amount Input */}
          <div className="relative">
            <input
              type="number"
              placeholder="Jumlah Margin (USDT)"
              value={amountUsdt}
              onChange={(e) => setAmountUsdt(e.target.value)}
              className="w-full bg-gray-100 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl border border-transparent focus:border-blue-500 outline-none pr-12 sm:pr-14"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
              USDT
            </div>
          </div>

          {/* Percentage Slider */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={sliderPct}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
              <span onClick={() => handleSliderChange(0)} className="cursor-pointer">0%</span>
              <span onClick={() => handleSliderChange(25)} className="cursor-pointer">25%</span>
              <span onClick={() => handleSliderChange(50)} className="cursor-pointer">50%</span>
              <span onClick={() => handleSliderChange(75)} className="cursor-pointer">75%</span>
              <span onClick={() => handleSliderChange(100)} className="cursor-pointer">100%</span>
            </div>
          </div>

          {/* Available Margin */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 pt-0.5">
            <span>Margin Tersedia</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 truncate max-w-[90px] sm:max-w-none">
                USDT {formatUsdt(availableMargin)}
              </span>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                title="Transfer Margin"
                className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* TP/SL Checkbox */}
          <div className="space-y-1.5 pt-0.5">
            <label className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-700 cursor-pointer">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <input
                  type="checkbox"
                  checked={enableTPSL}
                  onChange={(e) => setEnableTPSL(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="font-medium">TP/SL</span>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-blue-600 text-[9px] sm:text-[10px] font-semibold">Lanjutan &gt;</span>
            </label>

            {enableTPSL && (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                <input
                  type="number"
                  placeholder="TP Price"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  className="bg-gray-100 text-[10px] px-2 py-1 rounded-lg outline-none"
                />
                <input
                  type="number"
                  placeholder="SL Price"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  className="bg-gray-100 text-[10px] px-2 py-1 rounded-lg outline-none"
                />
              </div>
            )}

            <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isReduceOnly}
                onChange={(e) => setIsReduceOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span className="font-medium">Reduce-Only</span>
              <Info className="w-3 h-3 text-gray-400" />
            </label>
          </div>

          {/* Price Protection */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-600 pt-0.5">
            <span>Price Protection</span>
            <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              <span>{priceProtection}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Biaya Margin */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500">
            <span>Biaya Margin</span>
            <span className="font-medium">USDT {amountUsdt || '0'}</span>
          </div>

          {/* Dual Action Buttons: Beli (Long) & Jual (Short) */}
          <div className="space-y-1.5 sm:space-y-2 pt-1">
            <button
              id="futures-buy-long-btn"
              onClick={() => handleOpenTrade('LONG')}
              className="w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.99] text-white font-bold py-2 sm:py-2.5 rounded-xl shadow transition-all text-xs flex flex-col items-center"
            >
              <span>Beli (Long)</span>
              <span className="text-[8px] sm:text-[9px] font-normal opacity-80">
                Posisi: {(Number(amountUsdt || 0) * leverage).toFixed(1)} USDT
              </span>
            </button>

            <button
              id="futures-sell-short-btn"
              onClick={() => handleOpenTrade('SHORT')}
              className="w-full bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.99] text-white font-bold py-2 sm:py-2.5 rounded-xl shadow transition-all text-xs flex flex-col items-center"
            >
              <span>Jual (Short)</span>
              <span className="text-[8px] sm:text-[9px] font-normal opacity-80">
                Posisi: {(Number(amountUsdt || 0) * leverage).toFixed(1)} USDT
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Book & Funding (5 cols) */}
        <div className="col-span-5 border-l border-gray-100 pl-1.5 sm:pl-2 flex flex-col justify-between text-[9px] sm:text-[10px]">
          {/* Funding countdown */}
          <div className="text-right pb-1 border-b border-gray-100">
            <span className="text-gray-400 block text-[8px] sm:text-[9px]">Funding / Countdown</span>
            <span className="font-mono font-bold text-gray-800 text-[9px] sm:text-[10px]">
              0,0100% / 02:54:45
            </span>
          </div>

          {/* Orderbook Header */}
          <div className="flex items-center justify-between text-gray-400 font-bold py-1">
            <span>Harga (USDT)</span>
            <span>Jumlah</span>
          </div>

          {/* Red Asks */}
          <div className="space-y-0.5 sm:space-y-1">
            {asks.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono">
                <span className="text-red-500 font-semibold">{item.price}</span>
                <span className="text-gray-600">{item.amount}</span>
              </div>
            ))}
          </div>

          {/* Center Current Price */}
          <div className="py-1.5 sm:py-2 text-center my-1 bg-gray-50 rounded-lg">
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 font-mono">
              {currentAsset.priceUsdt.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
            </p>
            <p className="text-[8px] sm:text-[9px] text-gray-400 font-mono">
              {(currentAsset.priceUsdt * 0.999).toFixed(1)}
            </p>
          </div>

          {/* Green Bids */}
          <div className="space-y-0.5 sm:space-y-1">
            {bids.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono">
                <span className="text-emerald-600 font-semibold">{item.price}</span>
                <span className="text-gray-600">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Bottom Tabs: Posisi (N) | Open Order (N) | Riwayat Order */}
      <div className="border-t border-gray-200 mt-2">
        <div className="px-4 border-b border-gray-100 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveBottomTab('positions')}
              className={`py-3 relative ${
                activeBottomTab === 'positions'
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              Posisi ({futuresPositions.length})
            </button>
            <button
              onClick={() => setActiveBottomTab('orders')}
              className={`py-3 relative ${
                activeBottomTab === 'orders'
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              Open Order (0)
            </button>
            <button
              onClick={() => setActiveBottomTab('history')}
              className={`py-3 relative ${
                activeBottomTab === 'history'
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
                  : 'text-gray-400'
              }`}
            >
              Riwayat Order
            </button>
          </div>
        </div>

        {/* Positions Content */}
        <div className="p-4 space-y-3">
          {activeBottomTab === 'positions' && (
            <>
              {futuresPositions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <p>Tidak ada posisi futures aktif.</p>
                  <p className="text-[11px] mt-1 text-gray-500">
                    Buka posisi Long atau Short di atas untuk mulai bertransaksi.
                  </p>
                </div>
              ) : (
                futuresPositions.map((pos) => {
                  const isLong = pos.side === 'LONG';
                  const isProfitable = pos.pnlUsdt >= 0;
                  return (
                    <div
                      key={pos.id}
                      className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm space-y-2.5"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isLong ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {pos.side}
                          </span>
                          <span className="font-bold text-xs text-gray-900">
                            {pos.symbol}USDT Perpetual
                          </span>
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {pos.leverage}x
                          </span>
                        </div>

                        <button
                          onClick={() => closeFuturesPosition(pos.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Tutup Posisi
                        </button>
                      </div>

                      {/* PnL & ROE Display */}
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-xs">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">PnL (USDT)</p>
                          <p
                            className={`font-bold font-mono ${
                              isProfitable ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {isProfitable ? '+' : ''}{pos.pnlUsdt} USDT
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-medium">ROE (%)</p>
                          <p
                            className={`font-bold font-mono ${
                              isProfitable ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {isProfitable ? '+' : ''}{pos.pnlPercentage}%
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600">
                        <div>
                          <span className="text-gray-400 block">Entry Price</span>
                          <span className="font-semibold text-gray-900">{pos.entryPrice}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Mark Price</span>
                          <span className="font-semibold text-gray-900">{pos.markPrice}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 block">Harga Likuidasi</span>
                          <span className="font-bold text-red-600">{pos.liquidationPrice}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                        <span>Margin: <b className="text-gray-800">{pos.margin} USDT</b></span>
                        <span>Ukuran: <b className="text-gray-800">{pos.sizeUsdt} USDT</b></span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeBottomTab === 'orders' && (
            <div className="text-center py-8 text-gray-400 text-xs">
              <p>Tidak ada open order tertunda.</p>
            </div>
          )}

          {activeBottomTab === 'history' && (
            <div className="text-center py-8 text-gray-400 text-xs">
              <p>Riwayat order trading tercatat otomatis pada sistem.</p>
            </div>
          )}
        </div>
      </div>

      {/* Leverage Selector Modal */}
      {showLeverageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Atur Leverage</h3>
              <button onClick={() => setShowLeverageModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Pilih pengali leverage untuk memperbesar modal trading Anda:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 15, 20, 25].map((lev) => (
                <button
                  key={lev}
                  onClick={() => {
                    setLeverage(lev);
                    setShowLeverageModal(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    leverage === lev
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Margin Mode Modal */}
      {showMarginModeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Margin Mode</h3>
              <button onClick={() => setShowMarginModeModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMarginMode('CROSS');
                  setShowMarginModeModal(false);
                }}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-colors ${
                  marginMode === 'CROSS'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Cross Margin</span>
                  {marginMode === 'CROSS' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[10px] text-gray-500 font-normal mt-1">
                  Berbagi margin di seluruh akun untuk mencegah likuidasi.
                </p>
              </button>

              <button
                onClick={() => {
                  setMarginMode('ISOLATED');
                  setShowMarginModeModal(false);
                }}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-colors ${
                  marginMode === 'ISOLATED'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Isolated Margin</span>
                  {marginMode === 'ISOLATED' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[10px] text-gray-500 font-normal mt-1">
                  Risiko dibatasi hanya pada margin yang dialokasikan untuk posisi ini.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Picker Modal */}
      {showCoinPickerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Pilih Kontrak Futures</h3>
              <button onClick={() => setShowCoinPickerModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto divide-y divide-gray-100 py-2 space-y-1">
              {markets
                .filter((m) => m.category === 'crypto')
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMarket(m);
                      setShowCoinPickerModal(false);
                    }}
                    className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <CryptoIcon
                        src={m.icon}
                        symbol={m.symbol}
                        name={m.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-xs text-gray-900">{m.symbol}USDT-PERP</p>
                        <p className="text-[10px] text-gray-400">{m.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-gray-900">{m.priceUsdt}</p>
                      <p
                        className={`text-[10px] font-bold ${
                          m.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
