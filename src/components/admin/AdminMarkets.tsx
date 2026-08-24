import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CryptoIcon } from '../CryptoIcon';
import { Asset } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  Flame,
  Check,
  X,
  AlertCircle,
  Sliders,
  DollarSign,
  Layers,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminMarketsProps {
  onRefresh: () => void;
}

export const AdminMarkets: React.FC<AdminMarketsProps> = ({ onRefresh }) => {
  const { markets, formatIdr, formatUsdt } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Image Upload helper
  const handleImageFileUpload = (file: File, isEdit: boolean) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, icon: base64String }));
      } else {
        setCreateForm((prev) => ({ ...prev, icon: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    symbol: '',
    name: '',
    category: 'crypto' as 'crypto' | 'stocks' | 'tokenized' | 'komoditas' | 'etf',
    priceUsdt: '',
    icon: '',
    change24h: '0.00',
    volume24hIdr: '1,2B',
    isHot: false,
    isGainer: false,
    isLoser: false,
  });

  // Edit Modal state
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'crypto' as 'crypto' | 'stocks' | 'tokenized' | 'komoditas' | 'etf',
    priceUsdt: '',
    change24h: '',
    high24h: '',
    low24h: '',
    volume24hIdr: '',
    icon: '',
    isHot: false,
    isGainer: false,
    isLoser: false,
  });

  // Filtered markets
  const filteredMarkets = markets.filter((m) => {
    const matchSearch =
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.symbol || !createForm.name || !createForm.priceUsdt) {
      alert('Mohon lengkapi simbol, nama, dan harga aset.');
      return;
    }

    try {
      const res = await fetch('/api/admin/markets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Aset ${createForm.symbol.toUpperCase()} berhasil ditambahkan!`);
        setShowCreateModal(false);
        setCreateForm({
          symbol: '',
          name: '',
          category: 'crypto',
          priceUsdt: '',
          icon: '',
          change24h: '0.00',
          volume24hIdr: '1,2B',
          isHot: false,
          isGainer: false,
          isLoser: false,
        });
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Gagal menambahkan aset');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan sistem');
    }
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditForm({
      name: asset.name,
      category: asset.category,
      priceUsdt: String(asset.priceUsdt),
      change24h: String(asset.change24h),
      high24h: String(asset.high24h),
      low24h: String(asset.low24h),
      volume24hIdr: asset.volume24hIdr || '1,2B',
      icon: asset.icon || '',
      isHot: Boolean(asset.isHot),
      isGainer: Boolean(asset.isGainer),
      isLoser: Boolean(asset.isLoser),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      const res = await fetch(`/api/admin/markets/${editingAsset.symbol}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Aset ${editingAsset.symbol} berhasil diperbarui!`);
        setEditingAsset(null);
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Gagal memperbarui aset');
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (symbol: string) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS aset ${symbol} dari pasar?`)) return;

    try {
      const res = await fetch(`/api/admin/markets/${symbol}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Aset ${symbol} berhasil dihapus dari pasar!`);
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Gagal menghapus aset');
      }
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert / Feedback message */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filter, Add Coin Button */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari simbol atau koin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori ({markets.length})</option>
            <option value="crypto">Kripto</option>
            <option value="stocks">Saham AS / Tokenized</option>
            <option value="etf">ETF</option>
          </select>
        </div>

        {/* Add Asset Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aset / Koin Baru</span>
        </button>
      </div>

      {/* Markets Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            Daftar Aset Pasar ({filteredMarkets.length} dari {markets.length})
          </h3>
          <span className="text-xs text-gray-400">Klik 'Edit' untuk manipulasi harga & status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Aset & Simbol</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Harga (USDT)</th>
                <th className="px-4 py-3 text-right">Harga (IDR)</th>
                <th className="px-4 py-3 text-right">24h Change</th>
                <th className="px-4 py-3 text-center">Tag Status</th>
                <th className="px-4 py-3 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMarkets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CryptoIcon
                        symbol={asset.symbol}
                        name={asset.name}
                        src={asset.icon}
                        className="w-7 h-7 rounded-full"
                      />
                      <div>
                        <span className="font-bold text-gray-900">{asset.symbol}</span>
                        <p className="text-[11px] text-gray-400">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                    ${formatUsdt(asset.priceUsdt)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    {formatIdr(asset.priceIdr)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        asset.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {asset.change24h >= 0 ? '+' : ''}
                      {asset.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {asset.isHot && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
                          HOT
                        </span>
                      )}
                      {asset.isGainer && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                          GAINER
                        </span>
                      )}
                      {asset.isLoser && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                          LOSER
                        </span>
                      )}
                      {!asset.isHot && !asset.isGainer && !asset.isLoser && (
                        <span className="text-[10px] text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(asset)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Aset"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.symbol)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Aset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Tambah Aset Baru ke Pasar</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Simbol Token/Koin *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PEPE, NVDA"
                    value={createForm.symbol}
                    onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pepe Coin, NVIDIA Corp"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={createForm.category}
                    onChange={(e: any) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="crypto">Kripto</option>
                    <option value="stocks">Saham AS (Tokenized)</option>
                    <option value="etf">ETF</option>
                    <option value="komoditas">Komoditas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Awal (USDT) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 1.25"
                    value={createForm.priceUsdt}
                    onChange={(e) => setCreateForm({ ...createForm, priceUsdt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Upload Gambar / Ikon Aset dari Device</label>
                <div className="flex items-center gap-3 mb-2">
                  {createForm.icon ? (
                    <img
                      src={createForm.icon}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFileUpload(e.target.files[0], false);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (https://...)"
                  value={createForm.icon}
                  onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isHot}
                    onChange={(e) => setCreateForm({ ...createForm, isHot: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Tandai HOT 🔥</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isGainer}
                    onChange={(e) => setCreateForm({ ...createForm, isGainer: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Tandai Top Gainer 🚀</span>
                </label>
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
                  Simpan Aset Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <CryptoIcon
                  symbol={editingAsset.symbol}
                  name={editingAsset.name}
                  src={editingAsset.icon}
                  className="w-6 h-6 rounded-full"
                />
                <h3 className="font-extrabold text-base text-gray-900">
                  Edit Aset: {editingAsset.symbol}
                </h3>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nama Aset</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={editForm.category}
                    onChange={(e: any) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="crypto">Kripto</option>
                    <option value="stocks">Saham AS (Tokenized)</option>
                    <option value="etf">ETF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Real-Time (USDT)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editForm.priceUsdt}
                    onChange={(e) => setEditForm({ ...editForm, priceUsdt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Perubahan 24 Jam (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.change24h}
                    onChange={(e) => setEditForm({ ...editForm, change24h: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Upload Gambar / Ikon Aset dari Device</label>
                <div className="flex items-center gap-3 mb-2">
                  {editForm.icon ? (
                    <img
                      src={editForm.icon}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFileUpload(e.target.files[0], true);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (https://...)"
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isHot}
                    onChange={(e) => setEditForm({ ...editForm, isHot: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Badge HOT</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isGainer}
                    onChange={(e) => setEditForm({ ...editForm, isGainer: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Top Gainer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isLoser}
                    onChange={(e) => setEditForm({ ...editForm, isLoser: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Top Loser</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Perbarui Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
