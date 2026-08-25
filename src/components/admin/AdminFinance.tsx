import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  X,
  Check,
  FileCheck,
  Eye,
  Maximize2,
  ShieldCheck,
  DollarSign,
  Receipt,
  FileText,
} from 'lucide-react';

interface AdminFinanceProps {
  onRefresh: () => void;
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ onRefresh }) => {
  const { allUsers, formatIdr, formatUsdt } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'proofs'>('audit');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Selected Proof for Lightbox Inspection Modal
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Create Manual Transaction Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: allUsers[0]?.id || '',
    type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER',
    amount: '10000000',
    currency: 'IDR' as 'IDR' | 'USDT',
    method: 'BCA Virtual Account',
    status: 'COMPLETED' as 'COMPLETED' | 'PENDING' | 'REJECTED',
    description: 'Deposit Rupiah via VA BCA',
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTxs = transactions.filter((t) => {
    const matchSearch =
      (t.userName && t.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.method && t.method.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Proofs specific list (Deposits or transactions with proofImage)
  const proofTxs = transactions.filter(
    (t) => t.type === 'DEPOSIT' || t.proofImage
  );
  const filteredProofTxs = proofTxs.filter((t) => {
    const matchSearch =
      (t.userName && t.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.method && t.method.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingProofsCount = proofTxs.filter((t) => t.status === 'PENDING').length;
  const completedProofsCount = proofTxs.filter((t) => t.status === 'COMPLETED').length;
  const rejectedProofsCount = proofTxs.filter((t) => t.status === 'REJECTED').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Transaksi keuangan baru berhasil dicatat!');
        setShowCreateModal(false);
        fetchTransactions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Gagal membuat transaksi');
    }
  };

  const handleUpdateStatus = async (txId: string, status: 'COMPLETED' | 'REJECTED') => {
    try {
      const targetTx = transactions.find((t) => t.id === txId);
      const res = await fetch(`/api/admin/transactions/${txId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        if (status === 'COMPLETED') {
          if (targetTx?.type === 'DEPOSIT') {
            setStatusMessage('✅ Deposit BERHASIL di-ACC! Saldo akun trader telah otomatis ditambahkan.');
          } else {
            setStatusMessage('✅ Penarikan dana BERHASIL di-ACC & status transaksi telah selesai.');
          }
        } else {
          if (targetTx?.type === 'WITHDRAW') {
            setStatusMessage('⚠️ Penarikan ditolak. Saldo akun trader telah otomatis dikembalikan (Refund).');
          } else {
            setStatusMessage('❌ Transaksi deposit telah ditolak.');
          }
        }
        if (selectedTx && selectedTx.id === txId) {
          setSelectedTx({ ...selectedTx, status });
        }
        fetchTransactions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (txId: string) => {
    if (!confirm('Hapus log transaksi ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Log transaksi berhasil dihapus!');
        fetchTransactions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Sub-Header Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-3xl p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'audit'
              ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Keuangan & Mutasi Transaksi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('proofs')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 relative ${
            activeSubTab === 'proofs'
              ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Cek & Verifikasi Bukti Transfer</span>
          {pendingProofsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
              {pendingProofsCount} Perlu Cek
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: AUDIT KEUANGAN */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          {/* Control Bar */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari trader atau metode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Tipe ({transactions.length})</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAW">Withdraw</option>
                <option value="TRANSFER">Transfer Dompet</option>
                <option value="REWARD">Bunga Compounding / Reward</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Status</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING (Menunggu)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Suntik Transaksi Manual</span>
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Log Audit Keuangan & Mutasi Saldo ({filteredTxs.length} Transaksi)
              </h3>
              <button onClick={fetchTransactions} className="text-xs font-bold text-amber-800 hover:underline">
                Refresh Table
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3 text-center">Tipe Mutasi</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3">Metode & Keterangan</th>
                    <th className="px-4 py-3 text-center">Bukti Resi</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900">{tx.userName || 'Trader'}</span>
                        <p className="text-[10px] text-gray-400 font-mono">{tx.timestamp}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'DEPOSIT'
                              ? 'bg-emerald-100 text-emerald-700'
                              : tx.type === 'WITHDRAW'
                              ? 'bg-rose-100 text-rose-700'
                              : tx.type === 'REWARD'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        <span
                          className={
                            tx.type === 'DEPOSIT' || tx.type === 'REWARD'
                              ? 'text-emerald-600'
                              : tx.type === 'WITHDRAW'
                              ? 'text-rose-600'
                              : 'text-amber-800'
                          }
                        >
                          {tx.type === 'DEPOSIT' || tx.type === 'REWARD' ? '+' : tx.type === 'WITHDRAW' ? '-' : ''}
                          {tx.currency === 'IDR' ? formatIdr(tx.amount) : `$${formatUsdt(tx.amount)} USDT`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900">{tx.method || 'Bank Transfer'}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">{tx.description || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.proofImage ? (
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[10px] font-extrabold transition-all inline-flex items-center gap-1 border border-amber-200"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Resi</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {tx.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                                className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs transition-colors"
                                title="Setujui"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                                className="p-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs transition-colors"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTxs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Tidak ada catatan transaksi keuangan yang sesuai dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VERIFIKASI BUKTI TRANSFER DEPOSIT */}
      {activeSubTab === 'proofs' && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Permintaan</p>
                <p className="text-lg font-extrabold text-gray-900">{proofTxs.length}</p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-3xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Perlu Verifikasi</p>
                <p className="text-lg font-extrabold text-amber-800">{pendingProofsCount} Bukti</p>
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-3xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui</p>
                <p className="text-lg font-extrabold text-emerald-800">{completedProofsCount}</p>
              </div>
            </div>

            <div className="bg-white border border-rose-200 rounded-3xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Ditolak</p>
                <p className="text-lg font-extrabold text-rose-800">{rejectedProofsCount}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari trader, bank, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(['all', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Proof Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProofTxs.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-3.5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* User info header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">{tx.userName || 'Trader'}</h4>
                      <p className="text-[10px] text-gray-400">{tx.userEmail || 'user@trade.co.id'}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {/* Amount & Method */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Nominal Deposit</p>
                      <p className="text-base font-extrabold text-emerald-600 font-mono">
                        +{tx.currency === 'IDR' ? formatIdr(tx.amount) : `$${formatUsdt(tx.amount)} USDT`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Metode Transfer</p>
                      <p className="text-xs font-extrabold text-gray-800">{tx.method || 'Bank Transfer'}</p>
                    </div>
                  </div>

                  {/* Proof Image Preview Box */}
                  {tx.proofImage ? (
                    <div
                      onClick={() => setSelectedTx(tx)}
                      className="relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-900/5 group cursor-pointer h-36 flex items-center justify-center transition-all hover:border-amber-400"
                    >
                      <img
                        src={tx.proofImage}
                        alt="Bukti Transfer"
                        className="max-h-36 object-contain w-full transition-all group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                        <Maximize2 className="w-4 h-4" />
                        <span>Cek Foto Bukti Perbesar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-2xl p-4 text-center text-xs text-gray-400">
                      Tidak ada lampiran gambar bukti transfer
                    </div>
                  )}

                  {/* Timestamp & Note */}
                  <div className="text-[11px] text-gray-500 space-y-1">
                    <p className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3 text-gray-400" /> Waktu Submit: {tx.timestamp}
                    </p>
                    {tx.note && (
                      <p className="bg-gray-50 p-2 rounded-xl text-[11px] font-medium text-gray-700 italic border border-gray-100">
                        "{tx.note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTx(tx)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                    <span>Detail Bukti</span>
                  </button>

                  {tx.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                        className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center"
                        title="Tolak Deposit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredProofTxs.length === 0 && (
              <div className="col-span-full bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3">
                <FileCheck className="w-12 h-12 text-gray-300 mx-auto" />
                <h4 className="font-extrabold text-sm text-gray-700">Tidak Ada Bukti Transfer Deposit</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Belum ada permohonan deposit baru yang dilampirkan bukti transfer bank.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Proof Inspection */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Inspeksi & Verifikasi Bukti Transfer</h3>
                  <p className="text-[11px] text-gray-400">ID Transaksi: {selectedTx.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 max-h-[80vh] overflow-y-auto">
              {/* Left: Full Image View */}
              <div className="p-5 bg-slate-900 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
                {selectedTx.proofImage ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black/40 p-2 shadow-2xl max-h-[420px] flex items-center justify-center w-full">
                    <img
                      src={selectedTx.proofImage}
                      alt="Resi Bukti Transfer"
                      className="max-h-[380px] object-contain rounded-xl w-full"
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs text-center">Tidak ada foto resi</div>
                )}
                <p className="text-[10px] text-slate-400">Tampilan Asli Bukti Transfer Pengguna</p>
              </div>

              {/* Right: Trader Details & Action Controls */}
              <div className="p-5 space-y-4 bg-white flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Trader Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Detail Akun Trader</p>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{selectedTx.userName || 'Trader'}</h4>
                      <p className="text-xs text-gray-500">{selectedTx.userEmail || '-'}</p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Nominal Deposit:</span>
                      <span className="font-extrabold text-emerald-600 font-mono text-sm">
                        {selectedTx.currency === 'IDR'
                          ? formatIdr(selectedTx.amount)
                          : `$${formatUsdt(selectedTx.amount)} USDT`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Metode Pembayaran:</span>
                      <span className="font-bold text-gray-900">{selectedTx.method || 'Bank Transfer'}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Tanggal Submit:</span>
                      <span className="font-mono text-gray-700">{selectedTx.timestamp}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Status Saat Ini:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          selectedTx.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedTx.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedTx.status}
                      </span>
                    </div>

                    {selectedTx.note && (
                      <div className="pt-2">
                        <span className="text-gray-500 block mb-1">Catatan Pengirim:</span>
                        <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-gray-800 font-medium italic">
                          "{selectedTx.note}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions inside Lightbox Modal */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {selectedTx.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedTx.id, 'COMPLETED')}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui & Tambah Saldo Trader</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedTx.id, 'REJECTED')}
                        className="py-3 px-4 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-all"
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-xl text-center text-xs text-gray-600 font-bold">
                      Transaksi telah diproses dengan status: {selectedTx.status}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Tutup Pratinjau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Manual Injection */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-gray-900 mb-1">Catat Mutasi Keuangan Manual</h3>
            <p className="text-xs text-gray-500 mb-4">
              Suntik transaksi kredit/debit secara langsung ke sistem dan saldo akun trader.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Pilih Akun Pengguna</label>
                <select
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-amber-500"
                  required
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipe Transaksi</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-amber-500"
                  >
                    <option value="DEPOSIT">DEPOSIT</option>
                    <option value="WITHDRAW">WITHDRAW</option>
                    <option value="TRANSFER">TRANSFER</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mata Uang</label>
                  <select
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-amber-500"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USDT">USDT (Tether)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nominal Transaksi</label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl text-xs font-extrabold text-gray-900 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Metode Pembayaran</label>
                <input
                  type="text"
                  value={createForm.method}
                  onChange={(e) => setCreateForm({ ...createForm, method: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl text-xs font-semibold text-gray-900 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl text-xs font-semibold text-gray-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
