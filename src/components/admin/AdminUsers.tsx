import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Check,
  X,
  LogIn,
  Layers,
  Wallet,
} from 'lucide-react';

interface AdminUsersProps {
  onRefresh: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onRefresh }) => {
  const { allUsers, currentUser, switchUser, formatIdr, formatUsdt } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    initialIdr: '50000000',
    initialUsdt: '2500',
  });

  // Edit Modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    isVerified: true,
    idr: '',
    usdt: '',
    futuresUsdt: '',
  });

  const filteredUsers = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) {
      alert('Nama pengguna wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email || `${createForm.name.toLowerCase().replace(/\s+/g, '')}@pintu.co.id`,
          role: createForm.role,
          initialIdr: Number(createForm.initialIdr) || 10000000,
          initialUsdt: Number(createForm.initialUsdt) || 500,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Akun baru "${createForm.name}" berhasil dibuat!`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          role: 'user',
          initialIdr: '50000000',
          initialUsdt: '2500',
        });
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Gagal membuat akun');
    }
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: (user as any).phone || '',
      role: user.role,
      isVerified: Boolean(user.isVerified),
      idr: String(user.balances?.idr || 0),
      usdt: String(user.balances?.usdt || 0),
      futuresUsdt: String(user.futuresBalances?.usdt || 0),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          role: editForm.role,
          isVerified: editForm.isVerified,
          balances: {
            idr: Number(editForm.idr),
            usdt: Number(editForm.usdt),
          },
          futuresBalances: {
            usdt: Number(editForm.futuresUsdt),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Akun ${editingUser.name} berhasil diperbarui!`);
        setEditingUser(null);
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Gagal memperbarui pengguna');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    }
  };

  const handleToggleKYC = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-kyc`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS akun ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Akun ${name} berhasil dihapus dari sistem!`);
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Gagal menghapus akun');
      }
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback message */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Controls: Search, Filter, Add User */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Role ({allUsers.length})</option>
            <option value="admin">Administrator</option>
            <option value="user">User Biasa</option>
          </select>
        </div>

        {/* Add User Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Akun Baru</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            Daftar Pengguna Sistem ({filteredUsers.length} Akun)
          </h3>
          <span className="text-xs text-gray-400">Total saldo tersimpan di platform</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Nama & Identitas</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Status KYC</th>
                <th className="px-4 py-3 text-right">Saldo Rupiah</th>
                <th className="px-4 py-3 text-right">Saldo USDT (Spot)</th>
                <th className="px-4 py-3 text-right">Saldo Futures</th>
                <th className="px-4 py-3 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isCurrent = user.id === currentUser?.id;
                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 font-extrabold text-white px-1.5 py-0.2 rounded-md">
                                AKTIF
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400">{user.email}</p>
                          {user.nik && (
                            <p className="text-[10px] text-slate-500 font-mono font-medium">NIK: {user.nik}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleKYC(user.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          user.isVerified
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title="Klik untuk ubah status KYC"
                      >
                        {user.isVerified ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                      {formatIdr(user.balances?.idr || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-800">
                      ${formatUsdt(user.balances?.usdt || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-purple-600">
                      ${formatUsdt(user.futuresBalances?.usdt || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isCurrent && (
                          <button
                            onClick={() => switchUser(user.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ganti ke Akun Ini"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Akun & Saldo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={allUsers.length <= 1}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Buat Akun Pengguna Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="budi@gmail.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role Akun</label>
                  <select
                    value={createForm.role}
                    onChange={(e: any) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="user">User Biasa (Trader)</option>
                    <option value="admin">Administrator Master</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Saldo Awal IDR</label>
                  <input
                    type="number"
                    value={createForm.initialIdr}
                    onChange={(e) => setCreateForm({ ...createForm, initialIdr: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Saldo Awal USDT</label>
                  <input
                    type="number"
                    value={createForm.initialUsdt}
                    onChange={(e) => setCreateForm({ ...createForm, initialUsdt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Edit Akun & Saldo: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role Akun</label>
                  <select
                    value={editForm.role}
                    onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="user">User Biasa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Verifikasi KYC</label>
                  <select
                    value={editForm.isVerified ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="true">Terverifikasi (KYC Approved)</option>
                    <option value="false">Belum Verifikasi (Unverified)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <p className="font-extrabold text-[11px] text-gray-800 uppercase tracking-wide">
                  Manipulasi Saldo Dompet
                </p>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Saldo Rupiah (IDR)</label>
                  <input
                    type="number"
                    value={editForm.idr}
                    onChange={(e) => setEditForm({ ...editForm, idr: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Saldo USDT (Spot)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.usdt}
                      onChange={(e) => setEditForm({ ...editForm, usdt: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Saldo USDT (Futures)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.futuresUsdt}
                      onChange={(e) => setEditForm({ ...editForm, futuresUsdt: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Perbarui Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
