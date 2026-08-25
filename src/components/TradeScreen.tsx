import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CandleChart } from './CandleChart';
import { CryptoIcon } from './CryptoIcon';
import {
  Menu,
  Star,
  MoreVertical,
  ChevronDown,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Info,
  DollarSign,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveTrade {
  id: string;
  price: number;
  amount: string;
  time: string;
  side: 'BUY' | 'SELL';
}

export const TradeScreen: React.FC = () => {
  const {
    markets,
    selectedMarket,
    setSelectedMarket,
    currentUser,
    executeSpotTrade,
    formatIdr,
    formatUsdt,
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
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  // Live Simulated Trades Stream
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);

  // Available balances
  const userRupiah = currentUser?.balances?.idr || 0;
  const userTokenBalance = currentUser?.balances?.tokens?.[currentAsset.symbol] || 0;

  const currentPrice = currentAsset.priceIdr;

  // Initialize live trades and simulate real-time transactions
  useEffect(() => {
    const baseP = currentAsset.priceIdr;
    const initialTrades: LiveTrade[] = [
      {
        id: 't_1',
        price: baseP,
        amount: (Math.random() * 0.4 + 0.01).toFixed(4),
        time: new Date(Date.now() - 3000).toTimeString().substring(0, 8),
        side: 'BUY',
      },
      {
        id: 't_2',
        price: Math.round(baseP * 0.9998),
        amount: (Math.random() * 0.6 + 0.02).toFixed(4),
        time: new Date(Date.now() - 7000).toTimeString().substring(0, 8),
        side: 'SELL',
      },
      {
        id: 't_3',
        price: Math.round(baseP * 1.0003),
        amount: (Math.random() * 0.8 + 0.05).toFixed(4),
        time: new Date(Date.now() - 12000).toTimeString().substring(0, 8),
        side: 'BUY',
      },
      {
        id: 't_4',
        price: Math.round(baseP * 1.0001),
        amount: (Math.random() * 0.3 + 0.01).toFixed(4),
        time: new Date(Date.now() - 18000).toTimeString().substring(0, 8),
        side: 'BUY',
      },
    ];
    setLiveTrades(initialTrades);

    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.45;
      const variation = (Math.random() - 0.49) * 0.003;
      const tradePrice = Math.round(baseP * (1 + variation));
      const tradeAmount =
        currentAsset.priceIdr > 10000000
          ? (Math.random() * 0.35 + 0.002).toFixed(4)
          : (Math.random() * 50 + 2).toFixed(2);

      const newTrade: LiveTrade = {
        id: 'trade_' + Date.now(),
        price: tradePrice,
        amount: tradeAmount,
        time: new Date().toTimeString().substring(0, 8),
        side: isBuy ? 'BUY' : 'SELL',
      };

      setLiveTrades((prev) => [newTrade, ...prev.slice(0, 14)]);
      setPriceFlash(isBuy ? 'up' : 'down');
      setTimeout(() => setPriceFlash(null), 800);
    }, 1800);

    return () => clearInterval(interval);
  }, [currentAsset.symbol, currentAsset.priceIdr]);

  const totalCostIdr =
    (Number(amountCoin) || 0) *
    (orderType === 'MARKET' ? currentAsset.priceIdr : Number(limitPriceIdr) || currentAsset.priceIdr);

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

  // Mock spot orderbook in IDR with percentage bars
  const baseIdr = currentAsset.priceIdr;
  const asks = [
    { price: Math.round(baseIdr * 1.0025), amount: '0.1620', percent: 85 },
    { price: Math.round(baseIdr * 1.0018), amount: '0.4680', percent: 62 },
    { price: Math.round(baseIdr * 1.0012), amount: '0.9025', percent: 92 },
    { price: Math.round(baseIdr * 1.0006), amount: '0.3300', percent: 45 },
    { price: Math.round(baseIdr * 1.0002), amount: '0.1250', percent: 30 },
  ];

  const bids = [
    { price: Math.round(baseIdr * 0.9998), amount: '0.2510', percent: 38 },
    { price: Math.round(baseIdr * 0.9994), amount: '0.6402', percent: 74 },
    { price: Math.round(baseIdr * 0.9988), amount: '1.2000', percent: 95 },
    { price: Math.round(baseIdr * 0.9982), amount: '0.8800', percent: 68 },
    { price: Math.round(baseIdr * 0.9976), amount: '0.4500', percent: 50 },
  ];

  return (
    <div className="pb-24 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white min-h-screen select-none w-full overflow-hidden">
      {/* 1. Header: Asset Selector & Actions */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssetSelector(true)}
            className="flex items-center gap-1.5 sm:gap-2 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
          >
            <Menu className="w-4 h-4 text-gray-700" />
            <CryptoIcon
              src={currentAsset?.icon}
              symbol={currentAsset?.symbol}
              name={currentAsset?.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="font-extrabold text-xs sm:text-sm text-gray-900">{currentAsset?.symbol}/IDR</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
            <Activity className="w-3 h-3" />
            <span>Simulasi Live</span>
          </div>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 cursor-pointer" />
        </div>
      </div>

      {/* 2. Price Header & 24h Stats */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight transition-colors duration-300 ${
                priceFlash === 'up'
                  ? 'text-emerald-600 bg-emerald-50 px-1 rounded'
                  : priceFlash === 'down'
                  ? 'text-red-500 bg-red-50 px-1 rounded'
                  : 'text-gray-900'
              }`}
            >
              {formatIdr(currentAsset.priceIdr).replace('Rp ', '')}
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
              {currentAsset.change24h >= 0 ? '+' : ''}
              {currentAsset.change24h.toFixed(2)}% (24 Jam)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-right text-[9px] sm:text-[10px] flex-shrink-0">
            <div>
              <span className="text-gray-400 block">24H High</span>
              <span className="font-bold text-gray-800">
                {formatIdr(currentAsset.high24h || currentAsset.priceIdr * 1.02).replace('Rp ', '')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Vol 24H (IDR)</span>
              <span className="font-bold text-gray-800">{currentAsset.volume24hIdr}</span>
            </div>
            <div>
              <span className="text-gray-400 block">24H Low</span>
              <span className="font-bold text-gray-800">
                {formatIdr(currentAsset.low24h || currentAsset.priceIdr * 0.98).replace('Rp ', '')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Vol 24H (USDT)</span>
              <span className="font-bold text-gray-800">{currentAsset.volume24hUsdt}</span>
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
                  ? 'text-gray-900 font-bold border-b-2 border-amber-500'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-gray-400">Orderbook Real-Time</span>
      </div>

      {/* 4. Chart View */}
      {(topTab === 'Grafik' || topTab === 'Depth') && (
        <CandleChart
          symbol={currentAsset.symbol}
          currentPrice={currentAsset.priceIdr}
          currencyPrefix="Rp "
          isIdr={true}
        />
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mx-3 sm:mx-4 my-2 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
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

      {/* SPOT TRADING PANEL */}
      <div className="p-3 sm:p-4 bg-gray-50/50 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-900">Eksekusi Pasar Spot</span>
          <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setTradeSide('BUY')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tradeSide === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Beli
            </button>
            <button
              onClick={() => setTradeSide('SELL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                tradeSide === 'SELL' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              Jual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Jumlah ({currentAsset.symbol})</span>
              <span className="font-mono text-gray-700">
                Saldo: {tradeSide === 'BUY' ? formatIdr(userRupiah) : `${userTokenBalance} ${currentAsset.symbol}`}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amountCoin}
                onChange={(e) => setAmountCoin(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-400">
                {currentAsset.symbol}
              </span>
            </div>

            {/* Quick % buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {['25%', '50%', '75%', '100%'].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const ratio = parseInt(pct) / 100;
                    if (tradeSide === 'BUY') {
                      const maxCoins = (userRupiah * ratio) / currentAsset.priceIdr;
                      setAmountCoin(maxCoins > 0 ? maxCoins.toFixed(4) : '0.01');
                    } else {
                      setAmountCoin((userTokenBalance * ratio).toFixed(4));
                    }
                  }}
                  className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold transition-all"
                >
                  {pct}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-between">
            <div className="text-[10px] text-gray-400">
              <span>Total Estimasi Transaksi</span>
              <p className="text-sm font-extrabold text-gray-900 font-mono mt-1">
                {formatIdr(totalCostIdr)}
              </p>
            </div>

            <button
              onClick={handleExecuteTrade}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all ${
                tradeSide === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
              }`}
            >
              {tradeSide === 'BUY' ? `Beli ${currentAsset.symbol}` : `Jual ${currentAsset.symbol}`}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Order Book & Live Trades Feed (Two-column layout) */}
      <div className="p-3 sm:p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Order Book */}
          <div className="border border-gray-200 rounded-2xl p-3 bg-white text-[10px] sm:text-xs shadow-sm">
            <div className="flex items-center justify-between text-gray-400 font-bold pb-2 border-b border-gray-100 mb-2">
              <span>Buku Order (Harga IDR)</span>
              <span>Jumlah ({currentAsset.symbol})</span>
            </div>

            {/* Red Asks */}
            <div className="space-y-1">
              {asks.map((ask, idx) => (
                <div key={idx} className="relative flex items-center justify-between font-mono py-0.5 px-1">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-red-50 rounded"
                    style={{ width: `${ask.percent}%` }}
                  />
                  <span className="text-red-500 font-bold relative z-10">{formatIdr(ask.price)}</span>
                  <span className="text-gray-600 font-semibold relative z-10">{ask.amount}</span>
                </div>
              ))}
            </div>

            {/* Center Current Price */}
            <div className="py-2 text-center my-1.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-black text-emerald-600 font-mono">
                {formatIdr(currentAsset.priceIdr)}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">
                {currentAsset.change24h >= 0 ? '▲' : '▼'} {currentAsset.change24h}%
              </span>
            </div>

            {/* Green Bids */}
            <div className="space-y-1">
              {bids.map((bid, idx) => (
                <div key={idx} className="relative flex items-center justify-between font-mono py-0.5 px-1">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-50 rounded"
                    style={{ width: `${bid.percent}%` }}
                  />
                  <span className="text-emerald-600 font-bold relative z-10">{formatIdr(bid.price)}</span>
                  <span className="text-gray-600 font-semibold relative z-10">{bid.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Recent Trades Tape */}
          <div className="border border-gray-200 rounded-2xl p-3 bg-white text-[10px] sm:text-xs shadow-sm">
            <div className="flex items-center justify-between text-gray-400 font-bold pb-2 border-b border-gray-100 mb-2">
              <span>Transaksi Terkini (Live)</span>
              <span>Waktu</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {liveTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between font-mono py-0.5 px-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        trade.side === 'BUY' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {formatIdr(trade.price)}
                    </span>
                    <span className="text-gray-400 text-[9px]">
                      {trade.amount} {currentAsset.symbol}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[9px]">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-4 max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Pilih Aset Kripto & Saham</h3>
                <p className="text-[10px] text-gray-400">Pilih dari {markets.length} aset terdaftar</p>
              </div>
              <button onClick={() => setShowAssetSelector(false)} className="p-1 rounded-full hover:bg-gray-100">
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
                  className={`w-full p-2.5 flex items-center justify-between rounded-2xl transition-colors text-left ${
                    currentAsset.id === m.id ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon
                      src={m.icon}
                      symbol={m.symbol}
                      name={m.name}
                      className="w-7 h-7 rounded-full"
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
                      {m.change24h >= 0 ? '+' : ''}
                      {m.change24h.toFixed(2)}%
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
