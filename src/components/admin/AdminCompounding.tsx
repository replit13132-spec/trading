import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Percent,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Zap,
  Coins,
  Trash2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminCompoundingProps {
  onRefresh?: () => void;
}

export const AdminCompounding: React.FC<AdminCompoundingProps> = ({ onRefresh }) => {
  const { allUsers, formatIdr, formatUsdt } = useApp();

  const [, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [enabled, setEnabled] = useState(true);
  const [dailyRate, setDailyRate] = useState<number>(1.0);
  const [minBalanceRequirement, setMinBalanceRequirement] = useState<number>(100000);
  const [applyToRole, setApplyToRole] = useState('ALL_USERS');
  const [lastDistributedAt, setLastDistributedAt] = useState('-');
  const [totalProfitDistributedIdr, setTotalProfitDistributedIdr] = useState(0);

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);

  // Fetch Settings & Logs from backend
  const fetchCompoundingData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/compounding');
      const data = await res.json();
      if (data.success && data.settings) {
        setEnabled(data.settings.enabled ?? true);
        setDailyRate(data.settings.dailyRate ?? 1.0);
        setMinBalanceRequirement(data.settings.minBalanceRequirement ?? 100000);
        setApplyToRole(data.settings.applyToRole || 'ALL_USERS');
        setLastDistributedAt(data.settings.lastDistributedAt || '-');
        setTotalProfitDistributedIdr(data.settings.totalProfitDistributedIdr || 0);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed fetching compounding data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompoundingData();
  }, []);

  // Trigger Instant Compounding Payout
  const handleTriggerPayout = async () => {
    if (!window.confirm(`Konfirmasi: Jalankan pembagian compounding bunga ${dailyRate}% per hari ke seluruh akun pengguna sekarang?`)) {
      return;
    }

    setTriggering(true);
    try {
      const res = await fetch('/api/admin/compounding/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'ADMIN_MANUAL' }),
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setStatusMsg({
          type: 'success',
          text: data.message || `Compounding ${dailyRate}%/hari berhasil dibagikan!`,
        });
        fetchCompoundingData();
        if (onRefresh) onRefresh();
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Gagal mengeksekusi compounding' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Gagal mengeksekusi compounding' });
    } finally {
      setTriggering(false);
    }
  };

  // Delete log entry
  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/compounding/logs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLogs(logs.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate total eligible users count from allUsers
  const eligibleUsersCount = allUsers.filter((u) => {
    if (applyToRole === 'USER_ONLY' && u.role === 'admin') return false;
    const hasEnoughIdr = u.balances?.idr >= minBalanceRequirement;
    const minUsdt = minBalanceRequirement > 0 ? minBalanceRequirement / 15000 : 1;
    const hasEnoughUsdt = u.balances?.usdt >= minUsdt;
    return hasEnoughIdr || hasEnoughUsdt;
  }).length;

  return (
    <div className="space-y-6">
      {/* Alert / Status Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modul Compounding Bunga Harian (Yield Engine)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sistem Compounding Bunga Harian (Fixed 1.0% / Hari)
            </h2>
            <p className="text-xs text-blue-200 leading-relaxed">
              Sistem memberikan imbal hasil compounding harian sebesar 1.0% secara otomatis pada saldo hasil pembelian pengguna.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rate Compounding</p>
            <p className="text-xl font-black text-gray-900">{dailyRate}% <span className="text-xs font-semibold text-gray-500">/ hari</span></p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Otomatis</p>
            <p className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {enabled ? 'Aktif (Berjalan)' : 'Nonaktif'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Profit IDR</p>
            <p className="text-sm font-extrabold text-purple-700 font-mono">
              {formatIdr(totalProfitDistributedIdr)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Eksekusi Terakhir</p>
            <p className="text-xs font-extrabold text-gray-800 font-mono truncate max-w-[120px]">
              {lastDistributedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Execution History / Logs Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-extrabold text-base text-gray-900">Riwayat Distribusi Compounding</h3>
          </div>

          <button
            onClick={fetchCompoundingData}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider bg-gray-50">
                <th className="px-4 py-3 rounded-l-xl">User</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Saldo Hari Ini</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Saldo Hari Selanjutnya Setelah Compounding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allUsers.map((u) => {
                const currentCmpBalance =
                  (u.compoundingBalances?.idr || 0) + (u.compoundingBalances?.usdt || 0) * 17584;
                const nextDayBalance = Math.round(currentCmpBalance * (1 + (dailyRate || 1.0) / 100));

                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900">
                      <div>
                        <span>{u.name}</span>
                        <p className="text-[10px] text-gray-400 font-normal">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-blue-600 font-mono">
                      {dailyRate}%
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">
                      {formatIdr(currentCmpBalance)}
                    </td>
                    <td className="px-4 py-3 font-mono font-extrabold text-emerald-600 text-right">
                      {formatIdr(nextDayBalance)}
                    </td>
                  </tr>
                );
              })}

              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
