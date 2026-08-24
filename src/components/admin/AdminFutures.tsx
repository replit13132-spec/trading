import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CryptoIcon } from '../CryptoIcon';
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

interface AdminFuturesProps {
  onRefresh: () => void;
}

export const AdminFutures: React.FC<AdminFuturesProps> = ({ onRefresh }) => {
  const { markets, allUsers, formatUsdt } = useApp();

  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | 'LONG' | 'SHORT'>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: allUsers[0]?.id || '',
    symbol: 'BTC',
    side: 'LONG' as 'LONG' | 'SHORT',
    leverage: '10',
    margin: '100',
    entryPrice: '',
  });

  // Edit Modal
  const [editingPos, setEditingPos] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    leverage: '',
    margin: '',
    liquidationPrice: '',
    pnlUsdt: '',
    pnlPercentage: '',
  });

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/futures/positions');
      const data = await res.json();
      if (data.success) {
        setPositions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const filteredPositions = positions.filter((p) => {
    const matchSearch =
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.userName && p.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSide = sideFilter === 'all' || p.side === sideFilter;
    return matchSearch && matchSide;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/futures/positions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Posisi futures berhasil disuntikkan!');
        setShowCreateModal(false);
        fetchPositions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Gagal membuat posisi futures');
    }
  };

  const handleOpenEdit = (pos: any) => {
    setEditingPos(pos);
    setEditForm({
      leverage: String(pos.leverage),
      margin: String(pos.margin),
      liquidationPrice: String(pos.liquidationPrice),
      pnlUsdt: String(pos.pnlUsdt),
      pnlPercentage: String(pos.pnlPercentage),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPos) return;

    try {
      const res = await fetch(`/api/admin/futures/positions/${editingPos.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Posisi futures berhasil disesuaikan!');
        setEditingPos(null);
        fetchPositions();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    }
  };

  const handleForceClose = async (posId: string) => {
    if (!confirm('Tutup paksa / Likuidasi posisi derivatif ini sekarang?')) return;
    try {
      const res = await fetch(`/api/trade/futures/close/${posId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Posisi futures berhasil ditutup paksa!');
        fetchPositions();
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
              placeholder="Cari simbol atau trader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sideFilter}
            onChange={(e: any) => setSideFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Sisi ({positions.length})</option>
            <option value="LONG">LONG (Beli Naik)</option>
            <option value="SHORT">SHORT (Jual Turun)</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Suntikkan Kontrak Futures</span>
        </button>
      </div>

      {/* Positions Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            Daftar Kontrak Futures Terbuka ({filteredPositions.length} Kontrak)
          </h3>
          <button onClick={fetchPositions} className="text-xs font-bold text-blue-600 hover:underline">
            Refresh Table
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Trader</th>
                <th className="px-4 py-3">Kontrak & Sisi</th>
                <th className="px-4 py-3 text-center">Leverage</th>
                <th className="px-4 py-3 text-right">Entry / Mark Price</th>
                <th className="px-4 py-3 text-right">Margin / Size</th>
                <th className="px-4 py-3 text-right">Harga Likuidasi</th>
                <th className="px-4 py-3 text-right">PnL (ROE %)</th>
                <th className="px-4 py-3 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPositions.map((pos) => {
                const isLong = pos.side === 'LONG';
                return (
                  <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{pos.userName || 'Trader'}</span>
                      <p className="text-[10px] text-gray-400 font-mono">{pos.timestamp}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={pos.symbol} className="w-5 h-5 rounded-full" />
                        <div>
                          <span className="font-bold text-gray-900">{pos.symbol} Perp</span>
                          <span
                            className={`ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                              isLong ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {pos.side}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-blue-600">
                      {pos.leverage}x
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <p className="font-bold text-gray-900">${formatUsdt(pos.entryPrice)}</p>
                      <p className="text-[10px] text-gray-400">Mark: ${formatUsdt(pos.markPrice || pos.entryPrice)}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <p className="font-bold text-gray-900">${formatUsdt(pos.margin)}</p>
                      <p className="text-[10px] text-gray-400">Size: ${formatUsdt(pos.sizeUsdt)}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">
                      ${formatUsdt(pos.liquidationPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          (pos.pnlUsdt || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }
                      >
                        {(pos.pnlUsdt || 0) >= 0 ? '+' : ''}
                        ${formatUsdt(pos.pnlUsdt || 0)} ({(pos.pnlPercentage || 0).toFixed(2)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(pos)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sesuaikan Margin / Likuidasi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleForceClose(pos.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[10px]"
                          title="Tutup Paksa (Force Liquidate)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPositions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    Tidak ada posisi futures aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Position Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Suntikkan Kontrak Futures Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Trader</label>
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
                  <label className="block font-bold text-gray-700 mb-1">Kontrak Pasangan</label>
                  <select
                    value={createForm.symbol}
                    onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.symbol}>
                        {m.symbol} Perpetual (${formatUsdt(m.priceUsdt)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sisi Posisi</label>
                  <select
                    value={createForm.side}
                    onChange={(e: any) => setCreateForm({ ...createForm, side: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LONG">LONG (Beli Naik)</option>
                    <option value="SHORT">SHORT (Jual Turun)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leverage (x)</label>
                  <select
                    value={createForm.leverage}
                    onChange={(e) => setCreateForm({ ...createForm, leverage: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2">2x</option>
                    <option value="5">5x</option>
                    <option value="10">10x</option>
                    <option value="20">20x</option>
                    <option value="25">25x</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Margin (USDT)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={createForm.margin}
                    onChange={(e) => setCreateForm({ ...createForm, margin: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Entry (Kosong = Market)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Auto mark price"
                    value={createForm.entryPrice}
                    onChange={(e) => setCreateForm({ ...createForm, entryPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Buka Posisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {editingPos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Sesuaikan Kontrak: {editingPos.symbol} Perp
              </h3>
              <button onClick={() => setEditingPos(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leverage Multiplier</label>
                  <input
                    type="number"
                    value={editForm.leverage}
                    onChange={(e) => setEditForm({ ...editForm, leverage: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Margin Tersedia (USDT)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.margin}
                    onChange={(e) => setEditForm({ ...editForm, margin: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Level Harga Likuidasi ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.liquidationPrice}
                    onChange={(e) => setEditForm({ ...editForm, liquidationPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PnL Berjalan (USDT)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.pnlUsdt}
                    onChange={(e) => setEditForm({ ...editForm, pnlUsdt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPos(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Perbarui Posisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
