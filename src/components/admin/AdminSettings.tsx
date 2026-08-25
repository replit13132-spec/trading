import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Percent,
  Lock,
  Radio,
  X,
  Save,
} from 'lucide-react';

interface AdminSettingsProps {
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onRefresh }) => {
  const [config, setConfig] = useState<any>({
    maintenanceMode: false,
    maintenanceMessage: 'Sistem sedang dalam peningkatan performa rutin.',
    tradingFeePercent: 0.1,
    takerFeePercent: 0.1,
    makerFeePercent: 0.05,
    maxFuturesLeverage: 25,
    liquidationMarginRate: 0.5,
    withdrawalFeeIdr: 4500,
    withdrawalTaxPercent: 0,
    telegramLink: '',
    depositFeePercent: 0,
    minDepositIdr: 50000,
    announcementBanner: 'Selamat datang di Pintu Crypto & US Stocks Trading Exchange!',
    bannerActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Konfigurasi sistem berhasil disimpan & diterapkan live!');
        onRefresh();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode Box */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            config.maintenanceMode
              ? 'bg-rose-50 border-rose-200'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  config.maintenanceMode ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Mode Pemeliharaan (Maintenance Mode)</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Jika diaktifkan, platform menampilkan layar pemeliharaan untuk semua pengguna biasa.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {config.maintenanceMode && (
            <div className="mt-4 pt-4 border-t border-rose-200">
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Pesan Notifikasi Pemeliharaan
              </label>
              <input
                type="text"
                value={config.maintenanceMessage}
                onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-rose-900 focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          )}
        </div>

        {/* Trading Fees & Risk Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fees */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <DollarSign className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-sm text-gray-900">Biaya Transaksi & Maker/Taker</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Maker Fee (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.makerFeePercent}
                  onChange={(e) => setConfig({ ...config, makerFeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Taker Fee (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.takerFeePercent}
                  onChange={(e) => setConfig({ ...config, takerFeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Fee Penarikan (IDR)</label>
                <input
                  type="number"
                  value={config.withdrawalFeeIdr}
                  onChange={(e) => setConfig({ ...config, withdrawalFeeIdr: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pajak Penarikan (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.withdrawalTaxPercent}
                  onChange={(e) => setConfig({ ...config, withdrawalTaxPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Minimal Deposit (IDR)</label>
                <input
                  type="number"
                  value={config.minDepositIdr}
                  onChange={(e) => setConfig({ ...config, minDepositIdr: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Link Telegram CS</label>
                <input
                  type="text"
                  value={config.telegramLink}
                  onChange={(e) => setConfig({ ...config, telegramLink: e.target.value })}
                  placeholder="https://t.me/username"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-gray-900">Manajemen Risiko Derivatif</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Maksimal Leverage (x)</label>
                <input
                  type="number"
                  value={config.maxFuturesLeverage}
                  onChange={(e) => setConfig({ ...config, maxFuturesLeverage: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ambang Likuidasi (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.liquidationMarginRate}
                  onChange={(e) => setConfig({ ...config, liquidationMarginRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-gray-700 mb-1">Banner Pengumuman Atas (Marquee/Bar)</label>
              <input
                type="text"
                value={config.announcementBanner}
                onChange={(e) => setConfig({ ...config, announcementBanner: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan Sistem</span>
          </button>
        </div>
      </form>
    </div>
  );
};
