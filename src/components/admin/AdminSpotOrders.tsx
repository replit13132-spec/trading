import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CryptoIcon } from '../CryptoIcon';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Layers,
} from 'lucide-react';

interface AdminSpotOrdersProps {
  onRefresh: () => void;
}

export const AdminSpotOrders: React.FC<AdminSpotOrdersProps> = ({ onRefresh }) => {
  const { markets, allUsers, formatIdr, formatUsdt } = useApp();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'FILLED' | 'OPEN' | 'CANCELLED'>('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: allUsers[0]?.id || '',
    symbol: markets[0]?.symbol || 'BTC',
    side: 'BUY' as 'BUY' | 'SELL',
    type: 'MARKET' as 'MARKET' | 'LIMIT',
    price: '',
    amount: '1',
    status: 'FILLED' as 'FILLED' | 'OPEN' | 'CANCELLED',
  });

  // Edit Modal
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    status: 'FILLED' as 'FILLED' | 'OPEN' | 'CANCELLED',
    price: '',
    amount: '',
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/spot/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.userName && o.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/spot/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Order spot manual berhasil disuntikkan!');
        setShowCreateModal(false);
        fetchOrders();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Gagal membuat order');
    }
  };

  const handleOpenEdit = (order: any) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status,
      price: String(order.price),
      amount: String(order.amount),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await fetch(`/api/admin/spot/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Order spot berhasil diperbarui!');
        setEditingOrder(null);
        fetchOrders();
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Hapus order spot ini dari database?')) return;
    try {
      const res = await fetch(`/api/admin/spot/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Order spot berhasil dihapus!');
        fetchOrders();
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
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Status ({orders.length})</option>
            <option value="FILLED">FILLED (Tereksekusi)</option>
            <option value="OPEN">OPEN (Menunggu)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Suntikkan Order Manual</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            Log Orderbook & Spot Transaksi ({filteredOrders.length} Order)
          </h3>
          <button
            onClick={fetchOrders}
            className="text-xs font-bold text-amber-800 hover:underline"
          >
            Refresh Table
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Aset</th>
                <th className="px-4 py-3 text-center">Tipe / Sisi</th>
                <th className="px-4 py-3 text-right">Harga Eksekusi</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-right">Total (IDR)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{order.userName || 'User'}</span>
                    <p className="text-[10px] text-gray-400 font-mono">{order.timestamp}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={order.symbol} className="w-5 h-5 rounded-full" />
                      <span className="font-bold text-gray-900">{order.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.side === 'BUY'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {order.side} ({order.type})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900 font-bold">
                    {formatIdr(order.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    {order.amount} {order.symbol}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                    {formatIdr(order.totalIdr || order.price * order.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'FILLED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    Tidak ada order spot yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Suntikkan Order Spot Baru</h3>
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
                  <label className="block font-bold text-gray-700 mb-1">Target Pengguna</label>
                  <select
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pilih Pasangan Aset</label>
                  <select
                    value={createForm.symbol}
                    onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.symbol}>
                        {m.symbol} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sisi Transaksi</label>
                  <select
                    value={createForm.side}
                    onChange={(e: any) => setCreateForm({ ...createForm, side: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="BUY">BUY (Beli)</option>
                    <option value="SELL">SELL (Jual)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Order</label>
                  <select
                    value={createForm.status}
                    onChange={(e: any) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="FILLED">FILLED (Langsung Tereksekusi)</option>
                    <option value="OPEN">OPEN (Menunggu Antrian)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jumlah Aset</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga IDR (Kosong = Market)</label>
                  <input
                    type="number"
                    placeholder="Auto market price"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
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
                  Suntikkan Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Edit Order: #{editingOrder.id}
              </h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Order</label>
                <select
                  value={editForm.status}
                  onChange={(e: any) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="FILLED">FILLED (Tereksekusi)</option>
                  <option value="OPEN">OPEN (Menunggu Antrian)</option>
                  <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Harga Eksekusi (IDR)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jumlah Aset</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
