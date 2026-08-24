import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CryptoIcon } from '../CryptoIcon';
import {
  TrendingUp,
  Users,
  Coins,
  ArrowLeftRight,
  CreditCard,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewProps {
  stats: any;
  setActiveTab: (tab: AdminTab) => void;
  onRefresh: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  setActiveTab,
  onRefresh,
}) => {
  const { markets, allUsers, futuresPositions, formatIdr, formatUsdt } = useApp();

  const [pumpSymbol, setPumpSymbol] = useState(markets[0]?.symbol || 'BTC');
  const [pumpPercent, setPumpPercent] = useState('10');
  const [pumpLoading, setPumpLoading] = useState(false);
  const [pumpMessage, setPumpMessage] = useState('');

  const handleQuickPump = async (isPump: boolean) => {
    setPumpLoading(true);
    const p = (isPump ? Math.abs(Number(pumpPercent)) : -Math.abs(Number(pumpPercent))) || 5;
    try {
      const res = await fetch('/api/admin/markets/pump-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: pumpSymbol, percentage: p }),
      });
      const data = await res.json();
      if (data.success) {
        setPumpMessage(`${isPump ? '🚀 PUMP' : '🔻 DUMP'} ${pumpSymbol} sebesar ${p > 0 ? '+' : ''}${p}% berhasil!`);
        setTimeout(() => setPumpMessage(''), 4000);
        onRefresh();
      }
    } catch (e: any) {
      setPumpMessage('Gagal mengeksekusi simulasi harga');
    } finally {
      setPumpLoading(false);
    }
  };

  const metricCards = [
    {
      label: 'Total Volume Transaksi (24h)',
      value: formatIdr(stats?.totalVolumeIdr || 1450000000),
      subtext: 'Trading spot & derivatif 24 jam',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      action: () => setActiveTab('markets'),
    },
    {
      label: 'Total Akun Pengguna',
      value: `${allUsers.length} Akun`,
      subtext: `${allUsers.filter((u) => u.isVerified).length} Terverifikasi KYC`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      action: () => setActiveTab('users'),
    },
    {
      label: 'Aset Aktif di Pasar',
      value: `${markets.length} Aset`,
      subtext: 'Kripto, Saham AS & Tokenized',
      icon: Coins,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      action: () => setActiveTab('markets'),
    },
    {
      label: 'Verifikasi Deposit & WD',
      value: `${stats?.pendingDeposits || 0} Pending`,
      subtext: 'Permintaan verifikasi transaksi',
      icon: CreditCard,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      action: () => setActiveTab('finance'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Operasi Master Exchange</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Pusat Pengendali Ekosistem Trading Pintu
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Akses kontrol penuh CRUD untuk seluruh modul aplikasi: manipulasi harga pasar live, manipulasi saldo pengguna, upload gambar koin, audit transaksi, dan publikasi konten.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('markets')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Kelola Koin & Gambar</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Pengguna & Saldo</span>
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Audit Keuangan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={c.action}
              className={`p-5 rounded-2xl border ${c.bg} shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600">{c.label}</span>
                <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 mb-1">{c.value}</p>
                <p className="text-[11px] text-gray-500 flex items-center justify-between">
                  <span>{c.subtext}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Card & Quick Market Live Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Price Manipulation Simulator */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Simulasi Volatilitas Pasar</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Uji pergerakan chart dan reaksi likuidasi dengan memompa atau menurunkan harga aset seketika.
            </p>

            {pumpMessage && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl animate-fade-in">
                {pumpMessage}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Pilih Aset Target</label>
                <select
                  value={pumpSymbol}
                  onChange={(e) => setPumpSymbol(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {markets.map((m) => (
                    <option key={m.id} value={m.symbol}>
                      {m.symbol} - {m.name} (${formatUsdt(m.priceUsdt)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Persentase Perubahan (%)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['5', '10', '25', '50'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPumpPercent(val)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        pumpPercent === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleQuickPump(true)}
              disabled={pumpLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pump (+{pumpPercent}%)</span>
            </button>
            <button
              onClick={() => handleQuickPump(false)}
              disabled={pumpLoading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20 disabled:opacity-50"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Dump (-{pumpPercent}%)</span>
            </button>
          </div>
        </div>

        {/* Live Market Watch Snapshot */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Live Snapshot Pasar Real-Time</h3>
                <p className="text-xs text-gray-500">Harga dan persentase perubahan 24 jam saat ini</p>
              </div>
              <button
                onClick={() => setActiveTab('markets')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Kelola Semua ({markets.length}) &rarr;
              </button>
            </div>

            <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {markets.slice(0, 6).map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={m.symbol} name={m.name} src={m.icon} className="w-7 h-7 rounded-full" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-gray-900">{m.symbol}</span>
                        <span className="text-[10px] text-gray-400 font-medium">/ IDR</span>
                        {m.isHot && (
                          <span className="text-[9px] uppercase font-extrabold bg-amber-100 text-amber-700 px-1 rounded">
                            Hot
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{m.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-gray-900">
                      {formatIdr(m.priceIdr)}
                    </p>
                    <p
                      className={`text-[11px] font-bold font-mono ${
                        m.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.change24h >= 0 ? '+' : ''}
                      {m.change24h.toFixed(2)}% (${formatUsdt(m.priceUsdt)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Interval update live server: 3 detik</span>
            <span className="font-mono text-emerald-600 font-bold">● Streaming WebSocket Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
