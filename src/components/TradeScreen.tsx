import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CandleChart } from './CandleChart';
import { CryptoIcon } from './CryptoIcon';
import { Menu, Star, MoreVertical, ChevronDown, Check, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TradeScreen: React.FC = () => {
  const {
    markets,
    selectedMarket,
    setSelectedMarket,
    currentUser,
    executeSpotTrade,
    formatIdr,
    setIsDepositModalOpen,
  } = useApp();

  const currentAsset = selectedMarket || markets[0];
  const [topTab, setTopTab] = useState<'Grafik' | 'Depth' | 'Trade' | 'Info'>('Grafik');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [amountCoin, setAmountCoin] = useState<string>('0.01');
  const [limitPriceIdr, setLimitPriceIdr] = useState<string>('');
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  // Available balances
  const userRupiah = currentUser?.balances?.idr || 0;
  const userTokenBalance = currentUser?.balances?.tokens?.[currentAsset.symbol] || 0;

  const totalCostIdr = (Number(amountCoin) || 0) * (orderType === 'MARKET' ? currentAsset.priceIdr : (Number(limitPriceIdr) || currentAsset.priceIdr));

  const handleExecuteTrade = async () => {
    const qty = Number(amountCoin);
    if (!qty || qty <= 0) {
      setFeedback({ text: 'Masukkan jumlah aset yang valid', isError: true });
      return;
    }

    const res = await executeSpotTrade(
      currentAsset.symbol,
      tradeSide,
      orderType,
      qty,
      orderType === 'LIMIT' ? Number(limitPriceIdr) : undefined
    );

    if (res.success) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      setFeedback({
        text: `Berhasil ${tradeSide === 'BUY' ? 'Membeli' : 'Menjual'} ${qty} ${currentAsset.symbol}`,
        isError: false,
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ text: res.message || 'Transaksi gagal', isError: true });
    }
  };

  // Mock spot orderbook in IDR
  const baseIdr = currentAsset.priceIdr;
  const asks = [
    { price: Math.round(baseIdr * 1.002), amount: '0,000162' },
    { price: Math.round(baseIdr * 1.0015), amount: '0,001468' },
    { price: Math.round(baseIdr * 1.001), amount: '0,902250' },
    { price: Math.round(baseIdr * 1.0005), amount: '0,033000' },
    { price: Math.round(baseIdr * 1.0002), amount: '0,033000' },
  ];

  const bids = [
    { price: Math.round(baseIdr * 0.9998), amount: '0,025100' },
    { price: Math.round(baseIdr * 0.9995), amount: '0,140200' },
    { price: Math.round(baseIdr * 0.999), amount: '0,520000' },
    { price: Math.round(baseIdr * 0.9985), amount: '1,120000' },
    { price: Math.round(baseIdr * 0.998), amount: '0,880000' },
  ];

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white min-h-screen select-none w-full overflow-hidden">
      {/* 1. Header: Asset Selector & Actions */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssetSelector(true)}
            className="flex items-center gap-1.5 sm:gap-2 hover:bg-gray-100 p-1 rounded-xl transition-colors"
          >
            <Menu className="w-4 h-4 text-gray-700" />
            <CryptoIcon
              src={currentAsset?.icon}
              symbol={currentAsset?.symbol}
              name={currentAsset?.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="font-bold text-xs sm:text-sm text-gray-900">{currentAsset?.symbol}/IDR</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-gray-600">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 cursor-pointer" />
          <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* 2. Price Header & 24h Stats */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {formatIdr(currentAsset.priceIdr).replace('Rp ', '')}
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-0.5">
              +{Math.round(currentAsset.priceIdr * 0.0004).toLocaleString('id-ID')} ({currentAsset.change24h.toFixed(2)}%)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-right text-[9px] sm:text-[10px] flex-shrink-0">
            <div>
              <span className="text-gray-400 block">24H High</span>
              <span className="font-bold text-gray-800">
                {formatIdr(currentAsset.priceIdr * 1.015).replace('Rp ', '')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Vol 24H (IDR)</span>
              <span className="font-bold text-gray-800">{currentAsset.volume24hIdr}</span>
            </div>
            <div>
              <span className="text-gray-400 block">24H Low</span>
              <span className="font-bold text-gray-800">
                {formatIdr(currentAsset.priceIdr * 0.985).replace('Rp ', '')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Vol 24H ({currentAsset.symbol})</span>
              <span className="font-bold text-gray-800">4,010373</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabs: Grafik | Depth | Trade | Info */}
      <div className="px-3 sm:px-4 border-b border-gray-100 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-4 sm:gap-5">
          {(['Grafik', 'Depth', 'Trade', 'Info'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTopTab(t)}
              className={`py-2 sm:py-2.5 transition-colors relative ${
                topTab === t
                  ? 'text-gray-900 font-bold border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {/* 4. Chart */}
      <CandleChart
        symbol={currentAsset.symbol}
        currentPrice={currentAsset.priceIdr}
        currencyPrefix="Rp "
        isIdr={true}
      />

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mx-3 sm:mx-4 my-2 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}

      {/* 5. Trade Panel & Order Book */}
      <div className="p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-3">
        {/* Left Column: Buy / Sell Form (7 cols) */}
        <div className="col-span-7 space-y-2.5 sm:space-y-3">
          {/* Buy / Sell Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              id="spot-tab-buy"
              onClick={() => setTradeSide('BUY')}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                tradeSide === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Beli
            </button>
            <button
              id="spot-tab-sell"
              onClick={() => setTradeSide('SELL')}
              className={`flex-1 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                tradeSide === 'SELL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jual
            </button>
          </div>

          {/* Order Type */}
          <div className="relative">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full bg-gray-100 hover:bg-gray-200/70 text-gray-900 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl outline-none appearance-none cursor-pointer"
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Field */}
          {orderType === 'LIMIT' ? (
            <div>
              <label className="text-[10px] text-gray-400 font-medium block mb-1">Harga (IDR)</label>
              <input
                type="number"
                placeholder="Harga Beli/Jual"
                value={limitPriceIdr}
                onChange={(e) => setLimitPriceIdr(e.target.value)}
                className="w-full bg-gray-100 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] text-gray-400 font-medium block mb-1">Harga</label>
              <div className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl">
                Market Price
              </div>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="text-[10px] text-gray-400 font-medium block mb-1">
              Jumlah ({currentAsset.symbol})
            </label>
            <input
              type="number"
              step="any"
              value={amountCoin}
              onChange={(e) => setAmountCoin(e.target.value)}
              className="w-full bg-gray-100 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl border border-transparent focus:border-blue-500 outline-none"
            />
          </div>

          {/* Quick Balance Fill */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 pt-0.5">
            <span>Tersedia:</span>
            <span className="font-bold text-gray-900 truncate max-w-[100px] sm:max-w-none">
              {tradeSide === 'BUY'
                ? formatIdr(userRupiah)
                : `${userTokenBalance} ${currentAsset.symbol}`}
            </span>
          </div>

          {/* Total Cost Estimate */}
          <div className="bg-gray-50 p-2 rounded-xl text-[10px] sm:text-[11px] space-y-0.5">
            <div className="flex justify-between text-gray-500 text-[9px] sm:text-[10px]">
              <span>Total Estimasi:</span>
              <span className="font-bold text-gray-900">{formatIdr(totalCostIdr)}</span>
            </div>
          </div>

          {/* Big Execute Button */}
          <button
            id="spot-execute-btn"
            onClick={handleExecuteTrade}
            className={`w-full font-bold py-2.5 sm:py-3 rounded-xl shadow-md text-white text-xs transition-all active:scale-[0.99] ${
              tradeSide === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {tradeSide === 'BUY' ? `Beli ${currentAsset.symbol}` : `Jual ${currentAsset.symbol}`}
          </button>
        </div>

        {/* Right Column: Order Book Table (5 cols) */}
        <div className="col-span-5 border-l border-gray-100 pl-1.5 sm:pl-2 text-[9px] sm:text-[10px]">
          <div className="flex items-center justify-between text-gray-400 font-bold pb-1 sm:pb-1.5">
            <span>Harga (IDR)</span>
            <span>Jumlah</span>
          </div>

          {/* Red Asks */}
          <div className="space-y-0.5 sm:space-y-1">
            {asks.map((ask, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono">
                <span className="text-red-500 font-semibold">
                  {(ask.price / 1000).toFixed(0)}K
                </span>
                <span className="text-gray-600">{ask.amount}</span>
              </div>
            ))}
          </div>

          {/* Center Current Price */}
          <div className="py-1.5 sm:py-2 text-center my-1 bg-gray-50 rounded-lg">
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 font-mono">
              {(currentAsset.priceIdr / 1000).toFixed(0)}K
            </p>
          </div>

          {/* Green Bids */}
          <div className="space-y-0.5 sm:space-y-1">
            {bids.map((bid, idx) => (
              <div key={idx} className="flex items-center justify-between font-mono">
                <span className="text-emerald-600 font-semibold">
                  {(bid.price / 1000).toFixed(0)}K
                </span>
                <span className="text-gray-600">{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Pilih Aset Spot</h3>
              <button onClick={() => setShowAssetSelector(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto divide-y divide-gray-100 py-2 space-y-1">
              {markets.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMarket(m);
                    setShowAssetSelector(false);
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
                      <p className="font-bold text-xs text-gray-900">{m.symbol}/IDR</p>
                      <p className="text-[10px] text-gray-400">{m.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-gray-900">{formatIdr(m.priceIdr)}</p>
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
