import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Landmark,
  QrCode,
  CreditCard,
  Wallet,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  category: 'Virtual Account' | 'Transfer Bank' | 'E-Wallet' | 'QRIS' | string;
  isActive: boolean;
  notes: string;
  createdAt: string;
}

interface AdminAccountsProps {
  onRefresh?: () => void;
}

const DEFAULT_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank_1',
    bankName: 'Bank Central Asia (BCA)',
    bankCode: 'BCA',
    accountNumber: '8820 1948 2109 0012',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'Virtual Account',
    isActive: true,
    notes: 'Transfer via BCA Mobile / ATM / Internet Banking 24 jam.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_2',
    bankName: 'Bank Mandiri',
    bankCode: 'MANDIRI',
    accountNumber: '1370 0098 7654 3',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'Transfer Bank',
    isActive: true,
    notes: 'Transfer via Livin by Mandiri atau ATM Mandiri.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_3',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    bankCode: 'BRI',
    accountNumber: '0123 0100 9876 501',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'Transfer Bank',
    isActive: true,
    notes: 'Transfer via BRImo / ATM BRI.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_4',
    bankName: 'Bank Negara Indonesia (BNI)',
    bankCode: 'BNI',
    accountNumber: '0987 6543 210',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'Virtual Account',
    isActive: true,
    notes: 'Transfer via BNI Mobile Banking / ATM BNI.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_5',
    bankName: 'QRIS Standar Nasional',
    bankCode: 'QRIS',
    accountNumber: 'ID1029384756102',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'QRIS',
    isActive: true,
    notes: 'Pindai kode QR menggunakan GoPay, OVO, ShopeePay, Dana, LinkAja, atau m-Banking.',
    createdAt: '2026-08-01 00:00:00',
  },
];

export const AdminAccounts: React.FC<AdminAccountsProps> = ({ onRefresh }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>(DEFAULT_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Delete Confirm State
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bankName: '',
    bankCode: 'BCA',
    accountNumber: '',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    category: 'Virtual Account',
    isActive: true,
    notes: '',
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bank-accounts');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAccounts(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch bank accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedAccountId(null);
    setFormData({
      bankName: '',
      bankCode: 'BCA',
      accountNumber: '',
      accountHolder: 'PT CRYPTO INDONESIA',
      category: 'Virtual Account',
      isActive: true,
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (acc: BankAccount) => {
    setModalMode('edit');
    setSelectedAccountId(acc.id);
    setFormData({
      bankName: acc.bankName,
      bankCode: acc.bankCode,
      accountNumber: acc.accountNumber,
      accountHolder: acc.accountHolder,
      category: acc.category,
      isActive: acc.isActive,
      notes: acc.notes,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankName.trim() || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      alert('Mohon isi nama bank, nomor rekening, dan nama pemilik rekening.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/bank-accounts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage('✅ Rekening bank baru berhasil ditambahkan!');
          fetchAccounts();
          if (onRefresh) onRefresh();
        } else {
          alert(json.message || 'Gagal menambahkan rekening');
        }
      } else if (modalMode === 'edit' && selectedAccountId) {
        const res = await fetch(`/api/admin/bank-accounts/${selectedAccountId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setStatusMessage('✅ Data rekening bank berhasil diperbarui!');
          fetchAccounts();
          if (onRefresh) onRefresh();
        } else {
          alert(json.message || 'Gagal mengedit rekening');
        }
      }
    } catch (err) {
      console.error(err);
      // Local fallback if server fails
      if (modalMode === 'create') {
        const newAcc: BankAccount = {
          id: `bank_${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setAccounts((prev) => [newAcc, ...prev]);
        setStatusMessage('✅ Rekening bank berhasil ditambahkan (Lokal)!');
      } else if (selectedAccountId) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === selectedAccountId ? { ...a, ...formData } : a))
        );
        setStatusMessage('✅ Rekening bank berhasil diperbarui (Lokal)!');
      }
    } finally {
      setShowModal(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}/toggle`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        fetchAccounts();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
      );
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    try {
      const res = await fetch(`/api/admin/bank-accounts/${accountToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage('🗑️ Rekening berhasil dihapus');
        fetchAccounts();
        if (onRefresh) onRefresh();
      } else {
        alert(json.message || 'Gagal menghapus rekening');
      }
    } catch (e) {
      setAccounts((prev) => prev.filter((a) => a.id !== accountToDelete.id));
      setStatusMessage('🗑️ Rekening berhasil dihapus (Lokal)');
    } finally {
      setAccountToDelete(null);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchSearch =
      acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.bankCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      categoryFilter === 'all' || acc.category.toLowerCase().replace(/\s+/g, '') === categoryFilter;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && acc.isActive) ||
      (statusFilter === 'inactive' && !acc.isActive);

    return matchSearch && matchCategory && matchStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Virtual Account':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      case 'QRIS':
        return <QrCode className="w-4 h-4 text-emerald-600" />;
      case 'E-Wallet':
        return <Wallet className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Message */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>Manajemen Rekening Deposit & Pembayaran</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar rekening bank tujuan transfer deposit, virtual account, dan QRIS untuk transaksi pengguna platform.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              fetchAccounts();
              if (onRefresh) onRefresh();
            }}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-500/20 text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rekening Baru</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Bank, No. Rekening, atau Atas Nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="virtualaccount">Virtual Account</option>
            <option value="transferbank">Transfer Bank</option>
            <option value="qris">QRIS</option>
            <option value="e-wallet">E-Wallet</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Dipakai</option>
            <option value="inactive">Non-Aktif (Sembunyikan)</option>
          </select>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => (
          <div
            key={acc.id}
            className={`bg-white border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md ${
              acc.isActive ? 'border-slate-200 hover:border-amber-300' : 'border-slate-200/60 bg-slate-50/50 opacity-75'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(acc.category)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{acc.bankName}</h3>
                  <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                    {acc.category}
                  </span>
                </div>
              </div>

              {/* Status Badge Toggle */}
              <button
                onClick={() => handleToggleActive(acc.id)}
                title="Klik untuk mengubah status aktif"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                  acc.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {acc.isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>AKTIF</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>OFF</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 my-2 space-y-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Nomor Rekening / Virtual Account
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono font-extrabold text-sm text-slate-900 tracking-wide">
                    {acc.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(acc.accountNumber, acc.id)}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                    title="Salin Nomor"
                  >
                    {copiedId === acc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200/60">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Atas Nama / Pemilik Rekening
                </span>
                <span className="font-bold text-xs text-amber-900 block mt-0.5 truncate">
                  {acc.accountHolder}
                </span>
              </div>
            </div>

            {/* Notes */}
            {acc.notes && (
              <p className="text-[11px] text-slate-500 italic line-clamp-2 mb-3">
                "{acc.notes}"
              </p>
            )}

            {/* Actions Bottom Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium">
                {acc.createdAt ? `Dibuat: ${acc.createdAt.split(' ')[0]}` : ''}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(acc)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setAccountToDelete(acc)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors"
                  title="Hapus Rekening"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada rekening ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>{modalMode === 'create' ? 'Tambah Rekening Bank Baru' : 'Edit Rekening Bank'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank / Metode Pembayaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Central Asia (BCA) / Mandiri / QRIS"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Singkat Bank</label>
                  <input
                    type="text"
                    placeholder="BCA / MANDIRI / BRI / QRIS"
                    value={formData.bankCode}
                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Pembayaran</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="Virtual Account">Virtual Account</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening / Virtual Account</label>
                <input
                  type="text"
                  placeholder="Contoh: 8820 1948 2109 0012"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atas Nama Pemilik Rekening</label>
                <input
                  type="text"
                  placeholder="Contoh: PT CRYPTO INDONESIA"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Petunjuk Deposit</label>
                <textarea
                  placeholder="Instruksi singkat bagi pengguna saat melakukan transfer..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-800 cursor-pointer">
                  Aktifkan rekening ini untuk menerima deposit pengguna
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold shadow-md shadow-amber-500/20"
                >
                  {modalMode === 'create' ? 'Simpan Rekening Baru' : 'Perbarui Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Rekening Bank Ini?</h3>
              <p className="text-xs text-slate-500">
                Anda akan menghapus rekening <span className="font-bold text-slate-800">{accountToDelete.bankName}</span> ({accountToDelete.accountNumber}).
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Ya, Hapus Rekening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
