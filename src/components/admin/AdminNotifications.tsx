import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Megaphone,
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

interface AdminNotificationsProps {
  onRefresh: () => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onRefresh }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state for broadcasting notification
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'promo' | 'emergency'>('info');
  const [target, setTarget] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Judul dan pesan notifikasi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, target }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || 'Notifikasi berhasil disiarkan ke seluruh pengguna!');
        setTitle('');
        setMessage('');
        setType('info');
        fetchNotifications();
        onRefresh();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Gagal menyiarkan notifikasi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.filter((n) => n.id !== id));
        onRefresh();
      } else {
        alert(data.message || 'Gagal menghapus notifikasi.');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menghapus notifikasi.');
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" /> Broadcast Center
              </span>
              <span className="text-xs text-slate-400 font-medium">{notifications.length} Total Siaran</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Notifikasi & Siaran Global
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Kirimkan pengumuman penting, pemberitahuan promo, update sistem, atau pesan siaran langsung ke lonceng notifikasi seluruh pengguna aplikasi.
            </p>
          </div>
          <button
            onClick={fetchNotifications}
            disabled={isLoading}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* Broadcast Form Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Buat Siaran Notifikasi Baru</h3>
              <p className="text-xs text-slate-500">Pesan akan langsung tampil di menu lonceng notifikasi seluruh pengguna.</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-lg">
            Target: Seluruh Pengguna (ALL)
          </span>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Judul Notifikasi *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 🎉 Bonus Cashback 100 USDT Telah Tiba!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Kategori / Tipe Notifikasi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="info">ℹ️ Informasi Umum (Info)</option>
                <option value="success">🎉 Berhasil / Hadiah (Success)</option>
                <option value="warning">⚠️ Peringatan / Maintenance (Warning)</option>
                <option value="promo">🎁 Promo Spesial (Promo)</option>
                <option value="emergency">🚨 Darurat / Pengumuman Penting (Emergency)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700">Isi Pesan Notifikasi *</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan isi pesan detail yang akan dibaca oleh pengguna..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Menyiarkan...' : 'Kirim Siaran ke Seluruh Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History / List Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Riwayat Siaran Notifikasi</h3>
            <p className="text-xs text-slate-500">Daftar pesan siaran yang telah dikirimkan ke pengguna.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siaran..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            <p className="text-xs">Memuat daftar siaran...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Belum ada riwayat siaran notifikasi.</p>
            <p className="text-xs">Gunakan formulir di atas untuk mengirimkan siaran pertama Anda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isEmergency = notif.type === 'emergency';
              const isWarning = notif.type === 'warning';
              const isSuccess = notif.type === 'success';
              const isPromo = notif.type === 'promo';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    isEmergency
                      ? 'bg-rose-50/60 border-rose-200'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200'
                      : isSuccess
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                        isEmergency
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : isSuccess
                          ? 'bg-emerald-100 text-emerald-700'
                          : isPromo
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isEmergency ? <AlertTriangle className="w-5 h-5" /> :
                       isWarning ? <AlertTriangle className="w-5 h-5" /> :
                       isSuccess ? <Sparkles className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isEmergency
                              ? 'bg-rose-200 text-rose-900'
                              : isWarning
                              ? 'bg-amber-200 text-amber-900'
                              : isSuccess
                              ? 'bg-emerald-200 text-emerald-900'
                              : isPromo
                              ? 'bg-purple-200 text-purple-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}
                        >
                          {notif.type || 'info'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Target: {notif.target || 'ALL'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3" /> {notif.createdAt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
                    title="Hapus siaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
