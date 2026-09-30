import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  Building,
  User,
  CreditCard,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Lock,
  FileText,
  Filter,
} from 'lucide-react';

interface AdminWithdrawalsProps {
  onRefresh: () => void;
}

export const AdminWithdrawals: React.FC<AdminWithdrawalsProps> = ({ onRefresh }) => {
  const { formatIdr } = useApp();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalPendingCount: 0,
    totalPendingAmountIdr: 0,
    totalProfitWithdrawnIdr: 0,
    totalCapitalWithdrawnIdr: 0,
    totalCompletedAmountIdr: 0,
    totalCompletedCount: 0,
    totalRejectedCount: 0,
    totalAllCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'WITHDRAW_PROFIT' | 'WITHDRAW_CAPITAL'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected withdrawal for detail / action modal
  const [selectedWd, setSelectedWd] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.data.withdrawals || []);
        setStats(data.data.stats || {});
      }
    } catch (e) {
      console.error('Failed to fetch admin withdrawals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleCopyText = (text: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusUpdate = async (txId: string, newStatus: 'COMPLETED' | 'REJECTED') => {
    setIsProcessingAction(true);
    try {
      const payload = {
        id: txId,
        txId: txId,
        status: newStatus,
        adminNote: adminNote.trim() || undefined,
      };

      const candidateUrls = [
        `/api/admin/transactions/${encodeURIComponent(txId)}/status`,
        `/api/admin/transactions/status`,
        `/api/admin/transactions/${encodeURIComponent(txId)}`,
        `/api/admin/transactions`,
        `/api/admin/withdrawals/${encodeURIComponent(txId)}/status`,
        `/api/admin/withdrawals/status`,
      ];

      let lastError = '';
      let isSuccess = false;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json().catch(() => null);

          if (res.ok && data?.success) {
            isSuccess = true;
            break;
          } else if (res.status === 404) {
            // If 404, try next candidate route
            lastError = data?.message || `404 Not Found pada ${url}`;
            continue;
          } else {
            // Other status code (e.g. 400 validation error)
            lastError = data?.message || `Error status ${res.status}`;
            break;
          }
        } catch (fetchErr: any) {
          lastError = fetchErr?.message || 'Gagal menghubungi server';
        }
      }

      if (isSuccess) {
        setToastMessage({
          text:
            newStatus === 'COMPLETED'
              ? '✅ Penarikan dana berhasil disetujui (ACC) & status COMPLETED!'
              : '⚠️ Penarikan dana ditolak dan saldo telah otomatis di-refund ke akun pengguna.',
          type: newStatus === 'COMPLETED' ? 'success' : 'error',
        });
        setSelectedWd(null);
        setActionType(null);
        setAdminNote('');
        await fetchWithdrawals();
        if (onRefresh) onRefresh();
        setTimeout(() => setToastMessage(null), 4500);
      } else {
        alert(lastError || 'Gagal memperbarui status penarikan');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan sistem saat memproses transaksi');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filtered withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      (w.userName && w.userName.toLowerCase().includes(query)) ||
      (w.userEmail && w.userEmail.toLowerCase().includes(query)) ||
      (w.method && w.method.toLowerCase().includes(query)) ||
      (w.accountNumber && w.accountNumber.includes(query)) ||
      (w.accountHolder && w.accountHolder.toLowerCase().includes(query)) ||
      (w.id && w.id.toLowerCase().includes(query));

    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchType = typeFilter === 'all' || w.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold shadow-lg flex items-center justify-between transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Withdrawals */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              Menunggu Verifikasi (Pending)
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {stats.totalPendingCount || 0} Antrean
            </span>
          </div>
          <p className="text-2xl font-black text-white">{formatIdr(stats.totalPendingAmountIdr || 0)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Perlu diverifikasi & ditransfer oleh Admin</p>
        </div>

        {/* Profit Compounding Withdrawals */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Profit Compounding (ACC)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              1%/Hari + 5% Ref
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatIdr(stats.totalProfitWithdrawnIdr || 0)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total profit harian & komisi yang disetujui</p>
        </div>

        {/* Capital (Aset) Withdrawals */}
        <div className="bg-slate-900/90 border border-violet-500/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Modal Pokok (Aset ACC)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Lock 3 Bulan
            </span>
          </div>
          <p className="text-2xl font-black text-violet-300">{formatIdr(stats.totalCapitalWithdrawnIdr || 0)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Penarikan modal pokok setelah 3 bulan</p>
        </div>

        {/* Total Transferred */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Total Dana Ditransfer
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
              {stats.totalCompletedCount || 0} Selesai
            </span>
          </div>
          <p className="text-2xl font-black text-white">{formatIdr(stats.totalCompletedAmountIdr || 0)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ditolak (Refund): {stats.totalRejectedCount || 0}</p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari user, nomor rekening, nama penerima..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Type Selector (Profit vs Capital) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto text-xs font-bold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Jenis
            </button>
            <button
              onClick={() => setTypeFilter('WITHDRAW_PROFIT')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                typeFilter === 'WITHDRAW_PROFIT'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Profit Compounding
            </button>
            <button
              onClick={() => setTypeFilter('WITHDRAW_CAPITAL')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                typeFilter === 'WITHDRAW_CAPITAL' ? 'bg-violet-700 text-white' : 'text-slate-400 hover:text-violet-300'
              }`}
            >
              <TrendingUp className="w-3 h-3" /> Modal Pokok (ASET)
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => {
              fetchWithdrawals();
              onRefresh();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all self-end md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 text-xs font-bold">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              statusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({withdrawals.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white font-black'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi ({stats.totalPendingCount || 0})</span>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white font-black'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai / Ditransfer ({stats.totalCompletedCount || 0})</span>
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white font-black'
                : 'bg-slate-950 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Ditolak / Refund ({stats.totalRejectedCount || 0})</span>
          </button>
        </div>
      </div>

      {/* 3. Withdrawals Table & Cards List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-black text-white">Daftar Pengajuan Penarikan Dana Pengguna</h3>
          </div>
          <span className="text-xs text-slate-400">
            Menampilkan <b>{filteredWithdrawals.length}</b> transaksi
          </span>
        </div>

        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <ArrowUpRight className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-300">Tidak ada data penarikan ditemukan</p>
            <p className="text-xs">Pengajuan penarikan dana oleh pengguna akan muncul di halaman ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Pengguna / Pemohon</th>
                  <th className="p-4">Jenis Penarikan</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Rekening Tujuan Transfer</th>
                  <th className="p-4">Waktu Pengajuan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {filteredWithdrawals.map((wd) => {
                  const isProfit = wd.type === 'WITHDRAW_PROFIT';
                  const isCapital = wd.type === 'WITHDRAW_CAPITAL';
                  const isPending = wd.status === 'PENDING';

                  return (
                    <tr
                      key={wd.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isPending ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-900/60 border border-violet-500/30 flex items-center justify-center font-bold text-violet-200">
                            {wd.userName ? wd.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-xs">{wd.userName || 'Pengguna'}</p>
                            <p className="text-[10px] text-slate-400">{wd.userEmail || '-'}</p>
                            {wd.userNik && wd.userNik !== '-' && (
                              <p className="text-[9px] text-slate-500">NIK: {wd.userNik}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-4">
                        {isProfit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <Sparkles className="w-3 h-3" /> Profit Compounding
                          </span>
                        ) : isCapital ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                            <TrendingUp className="w-3 h-3" /> Modal Pokok (ASET)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                            <CreditCard className="w-3 h-3" /> Penarikan Kas
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <p className="font-black text-sm text-white">{formatIdr(Number(wd.amount))}</p>
                        <span className="text-[10px] text-slate-400">
                          {wd.currency || 'IDR'}
                        </span>
                      </td>

                      {/* Destination Account */}
                      <td className="p-4">
                        <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl max-w-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                            <span className="flex items-center gap-1 text-violet-300">
                              <Building className="w-3 h-3" />
                              {wd.bankName || 'Bank / E-Wallet'}
                            </span>
                            {wd.accountNumber && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(wd.accountNumber, wd.id)}
                                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                                title="Salin nomor rekening"
                              >
                                {copiedId === wd.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          <p className="font-mono text-xs font-black text-amber-300">
                            {wd.accountNumber || wd.method || '-'}
                          </p>

                          <p className="text-[10px] text-slate-400 truncate">
                            a/n <b>{wd.accountHolder || wd.userName || '-'}</b>
                          </p>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-[11px] text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{wd.timestamp || '-'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {wd.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 animate-pulse" /> Menunggu ACC
                          </span>
                        )}
                        {wd.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" /> Berhasil Ditransfer
                          </span>
                        )}
                        {wd.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <XCircle className="w-3 h-3" /> Ditolak (Refund)
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedWd(wd);
                                setActionType('APPROVE');
                                setAdminNote('');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all flex items-center gap-1 active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ACC & Transfer</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedWd(wd);
                                setActionType('REJECT');
                                setAdminNote('');
                              }}
                              className="px-2.5 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak (Refund)</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedWd(wd);
                              setActionType(null);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Action / Detail Modal */}
      {selectedWd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200 relative">
            <button
              onClick={() => {
                setSelectedWd(null);
                setActionType(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : actionType === 'REJECT'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                }`}
              >
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : actionType === 'REJECT' ? (
                  <XCircle className="w-6 h-6" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-base font-black text-white">
                  {actionType === 'APPROVE' && 'Konfirmasi Persetujuan & Transfer'}
                  {actionType === 'REJECT' && 'Konfirmasi Penolakan & Refund'}
                  {!actionType && 'Detail Pengajuan Penarikan Dana'}
                </h3>
                <p className="text-xs text-slate-400">ID Transaksi: {selectedWd.id}</p>
              </div>
            </div>

            {/* Withdrawal Details Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Pemohon (User)</span>
                <span className="font-extrabold text-white">
                  {selectedWd.userName} ({selectedWd.userEmail})
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Kategori Penarikan</span>
                <span
                  className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedWd.type === 'WITHDRAW_PROFIT'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-violet-500/20 text-violet-300'
                  }`}
                >
                  {selectedWd.type === 'WITHDRAW_PROFIT' ? '✨ Profit Compounding' : '📈 Modal Pokok (ASET)'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Nominal Penarikan</span>
                <span className="text-base font-black text-emerald-400">
                  {formatIdr(Number(selectedWd.amount))}
                </span>
              </div>

              {/* Destination Bank details */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span>Tujuan Transfer:</span>
                  <span className="text-violet-400">{selectedWd.bankName || 'Bank Transfer'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">No. Rekening / HP:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-300 text-sm">
                      {selectedWd.accountNumber || selectedWd.method}
                    </span>
                    {selectedWd.accountNumber && (
                      <button
                        onClick={() => handleCopyText(selectedWd.accountNumber, 'modal')}
                        className="text-slate-400 hover:text-white p-1 rounded bg-slate-800"
                        title="Salin"
                      >
                        {copiedId === 'modal' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Atas Nama (A.N):</span>
                  <span className="font-extrabold text-white">
                    {selectedWd.accountHolder || selectedWd.userName}
                  </span>
                </div>
              </div>

              {/* Balances Context */}
              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                <span>Sisa Saldo Profit User:</span>
                <b className="text-slate-200">{formatIdr(selectedWd.userCurrentProfitIdr || 0)}</b>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Sisa Modal Aset User:</span>
                <b className="text-slate-200">{formatIdr(selectedWd.userCurrentCapitalIdr || 0)}</b>
              </div>
            </div>

            {/* Action explanation & Note */}
            {actionType === 'APPROVE' && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Pastikan Anda telah mentransfer nominal <b>{formatIdr(Number(selectedWd.amount))}</b> ke rekening tujuan di atas. Setelah disetujui, status transaksi menjadi COMPLETED dan notifikasi dikirimkan ke pengguna.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Catatan Admin / No. Ref Transfer (Opsional)</label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Contoh: Transfer via KlikBCA Ref #TRX-98129"
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleStatusUpdate(selectedWd.id, 'COMPLETED')}
                    className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isProcessingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>ACC & Konfirmasi Transfer</span>
                  </button>
                </div>
              </div>
            )}

            {actionType === 'REJECT' && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Jika ditolak, saldo sebesar <b>{formatIdr(Number(selectedWd.amount))}</b> akan <b>otomatis dikembalikan (refund)</b> ke saldo akun pengguna secara utuh.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Alasan Penolakan (Wajib Diisi)</label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Contoh: Nomor rekening tidak valid / nama tidak sesuai"
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleStatusUpdate(selectedWd.id, 'REJECTED')}
                    className="flex-2 bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isProcessingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>Tolak & Refund Saldo</span>
                  </button>
                </div>
              </div>
            )}

            {!actionType && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWd(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
