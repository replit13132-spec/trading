import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  ArrowDownToLine,
  ArrowUpRight,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  History,
  Info
} from 'lucide-react';

export const TransactionScreen: React.FC = () => {
  const { currentUser, walletData, formatIdr } = useApp();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'topup' | 'compounding' | 'profit' | 'withdraw'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const capitalBatches = walletData?.capitalBatches || currentUser?.capitalBatches || [];
  const compoundingProfit = walletData?.compoundingProfitIdr ?? currentUser?.compoundingProfitIdr ?? 0;
  const compoundingCapital = walletData?.compoundingBalances?.idr ?? currentUser?.compoundingBalances?.idr ?? 0;

  // Helper date formatter in Indonesian
  const formatDateTimeIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { date: '24', day: 'Senin', month: 'Agustus 2026', time: '12:00', full: '24 Agustus 2026 12:00' };
      }
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return {
        date: String(d.getDate()).padStart(2, '0'),
        day: days[d.getDay()],
        month: `${months[d.getMonth()]} ${d.getFullYear()}`,
        full: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        year: d.getFullYear(),
      };
    } catch {
      return { date: '24', day: 'Senin', month: 'Agustus 2026', time: '12:00', full: '24 Agustus 2026 12:00' };
    }
  };

  // Filter transactions
  const filteredTxs = transactions.filter((t) => {
    if (activeSubTab === 'topup') return t.type === 'DEPOSIT';
    if (activeSubTab === 'compounding') return t.type === 'RECOMPOUND';
    if (activeSubTab === 'profit') return t.type === 'REWARD' || t.description?.toLowerCase().includes('1%') || t.description?.toLowerCase().includes('profit');
    if (activeSubTab === 'withdraw') return t.type === 'WITHDRAW' || t.type === 'WITHDRAW_PROFIT' || t.type === 'WITHDRAW_CAPITAL';
    return true;
  });

  return (
    <div className="pb-28 max-w-lg md:max-w-xl lg:max-w-3xl mx-auto bg-slate-50 min-h-screen text-slate-900 select-none">
      {/* Top Header */}
      <div className="bg-slate-950 text-white px-5 pt-6 pb-8 rounded-b-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="bg-violet-500/20 text-violet-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-violet-500/30">
              <History className="w-3.5 h-3.5 text-violet-400" /> Pusat Transaksi & Compounding
            </span>
            <span className="text-xs text-slate-400 font-medium">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Riwayat Transaksi
          </h1>
          <p className="text-xs text-slate-300 max-w-md">
            Pantau rincian top-up modal, tanggal modal awal bisa ditarik (lock 3 bulan), penyimpanan compounding, profit 1%/hari, dan penarikan dana.
          </p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="px-4 -mt-4 relative z-20 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Aset Compounding</span>
            <Lock className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatIdr(compoundingCapital)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Tumbuh 1% / Hari
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Profit Compounding</span>
            <Sparkles className="w-3 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700">
            {formatIdr(compoundingProfit)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Bisa ditarik kapan saja
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Transaction Categories */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'Semua Riwayat' },
            { id: 'topup', label: 'TopUp Modal' },
            { id: 'compounding', label: 'Simpan Compounding' },
            { id: 'profit', label: 'Profit 1%/Hari' },
            { id: 'withdraw', label: 'Penarikan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                activeSubTab === tab.id
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 mt-4 space-y-4">
        {/* 1. Modal / Capital Batches Section (TopUp & Lock status info) */}
        {(activeSubTab === 'all' || activeSubTab === 'topup' || activeSubTab === 'compounding') && capitalBatches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" /> Rincian Tanggal & Masa Lock Modal (3 Bulan)
              </h3>
              <span className="text-[10px] bg-violet-100 text-violet-900 font-bold px-2 py-0.5 rounded-md">
                {capitalBatches.length} Batch Aktif
              </span>
            </div>

            {capitalBatches.map((batch: any, index: number) => {
              const dt = formatDateTimeIndo(batch.createdAt);
              const unlockDt = formatDateTimeIndo(batch.unlockDate);
              const isUnlocked = batch.isUnlocked || new Date(batch.unlockDate) <= new Date();

              return (
                <div key={batch.id || index} className="bg-white rounded-2xl p-4 shadow-sm border border-violet-200/70 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-black text-sm">
                        {dt.date}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500">{dt.day}, {dt.month}</p>
                        <h4 className="text-base font-black text-slate-900">{formatIdr(batch.amount)}</h4>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-900'
                    }`}>
                      {isUnlocked ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Lock className="w-3 h-3 text-violet-800" />}
                      {isUnlocked ? 'Modal Dapat Ditarik' : 'Terkunci 3 Bulan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Tanggal Setor:</p>
                      <p className="font-bold text-slate-800">{dt.full}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold">Modal Bisa Ditarik:</p>
                      <p className={`font-bold ${isUnlocked ? 'text-emerald-700' : 'text-violet-700'}`}>
                        {unlockDt.full}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Transaction List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-700" /> Riwayat Log Aktivitas & Transaksi
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {filteredTxs.length} Transaksi Ditemukan
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
              <p className="text-xs">Memuat riwayat transaksi...</p>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200/80 space-y-2">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Belum ada riwayat transaksi pada kategori ini.</p>
              <p className="text-xs text-slate-400">Lakukan top-up modal atau aktivitas compounding untuk melihat riwayat rincinya di sini.</p>
            </div>
          ) : (
            filteredTxs.map((tx) => {
              const dt = formatDateTimeIndo(tx.timestamp);
              const isDeposit = tx.type === 'DEPOSIT';
              const isRecompound = tx.type === 'RECOMPOUND';
              const isWithdraw = tx.type?.includes('WITHDRAW');
              const isReward = tx.type === 'REWARD' || tx.description?.toLowerCase().includes('1%');

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        isDeposit
                          ? 'bg-blue-100 text-blue-700'
                          : isRecompound
                          ? 'bg-violet-100 text-violet-800'
                          : isWithdraw
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isDeposit ? <ArrowDownToLine className="w-5 h-5" /> :
                         isRecompound ? <RefreshCw className="w-5 h-5" /> :
                         isWithdraw ? <ArrowUpRight className="w-5 h-5" /> :
                         <Sparkles className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                            {tx.type === 'DEPOSIT' ? 'TopUp Modal' :
                             tx.type === 'RECOMPOUND' ? 'Simpan Compounding' :
                             tx.type === 'WITHDRAW_PROFIT' ? 'Penarikan Profit' :
                             tx.type === 'WITHDRAW_CAPITAL' ? 'Penarikan Modal' :
                             tx.type === 'WITHDRAW' ? 'Penarikan Dana' : 'Keuntungan 1% / Hari'}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'PENDING' ? 'bg-violet-100 text-violet-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {tx.status || 'COMPLETED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {dt.day}, {dt.full} • {tx.method || 'Sistem Transfer'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-base font-black ${
                        isWithdraw ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {isWithdraw ? '-' : '+'}{formatIdr(tx.amount || 0)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{tx.currency || 'IDR'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {tx.description || tx.note || 'Transaksi sukses diproses oleh sistem.'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
