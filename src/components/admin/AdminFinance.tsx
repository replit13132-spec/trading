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
} from 'lucide-react';

interface AdminFinanceProps {
  onRefresh: () => void;
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({ onRefresh }) => {
  const { allUsers, formatIdr, formatUsdt } = useApp();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Create Modal
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
      const res = await fetch(`/api/admin/transactions/${txId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Status transaksi berhasil diubah menjadi ${status}!`);
        fetchTransactions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
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
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

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
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tipe ({transactions.length})</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAW">Withdraw</option>
            <option value="TRANSFER">Transfer Dompet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING (Menunggu)</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
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
          <button onClick={fetchTransactions} className="text-xs font-bold text-blue-600 hover:underline">
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
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    <span
                      className={
                        tx.type === 'DEPOSIT'
                          ? 'text-emerald-600'
                          : tx.type === 'WITHDRAW'
                          ? 'text-rose-600'
                          : 'text-blue-600'
                      }
                    >
                      {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAW' ? '-' : ''}
                      {tx.currency === 'IDR' ? formatIdr(tx.amount) : `$${formatUsdt(tx.amount)} USDT`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{tx.method || 'Bank Transfer'}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-xs">{tx.description || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {tx.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Setujui (Approve)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Tolak (Reject)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Tidak ada riwayat transaksi keuangan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Suntik Transaksi Keuangan</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Pengguna</label>
                  <select
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tipe Mutasi</label>
                  <select
                    value={createForm.type}
                    onChange={(e: any) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DEPOSIT">Deposit (Kredit Masuk)</option>
                    <option value="WITHDRAW">Withdraw (Debit Keluar)</option>
                    <option value="TRANSFER">Transfer Internal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mata Uang</label>
                  <select
                    value={createForm.currency}
                    onChange={(e: any) => setCreateForm({ ...createForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USDT">Tether (USDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nominal Jumlah</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                <input
                  type="text"
                  value={createForm.method}
                  onChange={(e) => setCreateForm({ ...createForm, method: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Suntikkan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
