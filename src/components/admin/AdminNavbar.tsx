import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Search,
  Sliders,
  Shield,
  UserCheck,
  ChevronDown,
  ArrowUpRight,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminTab } from './AdminSidebar';

interface AdminNavbarProps {
  activeTab: AdminTab;
  isCollapsed: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  systemConfig?: any;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeTab,
  isCollapsed,
  setIsMobileOpen,
  onRefresh,
  isRefreshing,
  systemConfig,
}) => {
  const { currentUser, allUsers, switchUser, setActiveTab } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Ringkasan & Metrik Ekosistem',
      subtitle: 'Pantau likuiditas, volume trading 24 jam, dan aktivitas pengguna.',
    },
    markets: {
      title: 'Manajemen Pasar & Koin',
      subtitle: 'Tambah aset baru, sesuaikan harga, upload ikon/gambar, atau hapus koin.',
    },
    users: {
      title: 'Manajemen Pengguna & Saldo',
      subtitle: 'Kelola akun trader, status KYC, ubah saldo IDR/USDT, dan hak akses admin.',
    },
    referrals: {
      title: 'Sistem Referral & Afiliasi Pengguna',
      subtitle: 'Pantau kode referral unik setiap akun, hubungan pengajak/downline, dan komisi deposit 5%.',
    },
    accounts: {
      title: 'Manajemen Rekening Deposit & Pembayaran',
      subtitle: 'Kelola daftar rekening bank tujuan transfer deposit, virtual account, dan QRIS.',
    },
    finance: {
      title: 'Audit Keuangan & Transaksi',
      subtitle: 'Verifikasi deposit masuk, persetujuan penarikan rupiah/kripto, dan mutasi saldo.',
    },
    compounding: {
      title: 'Compounding & Bunga Harian',
      subtitle: 'Atur persentase bunga harian (Yield) dan eksekusi pembagian imbal hasil majemuk.',
    },
    cms: {
      title: 'CMS Berita, Edukasi & Pengumuman',
      subtitle: 'Publikasi wawasan pasar, silabus Akademi Crypto, dan siaran pengumuman darurat.',
    },
    notifications: {
      title: 'Pusat Notifikasi & Siaran Global',
      subtitle: 'Kirimkan siaran pengumuman, promo, dan pesan notifikasi ke seluruh pengguna aplikasi.',
    },
    settings: {
      title: 'Konfigurasi & Pengaturan Sistem',
      subtitle: 'Sesuaikan biaya transaksi, link Telegram customer service, pesan pemeliharaan, dan limit deposit.',
    },
  };

  const currentInfo = tabTitles[activeTab] || {
    title: 'Admin Control Center',
    subtitle: 'Panel kendali utama',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-violet-800 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
                Admin Panel
              </span>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {currentInfo.title}
              </h1>
            </div>
            <p className="text-xs text-gray-500 truncate hidden md:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Live Clock, Refresh, User Switcher, Exit Admin */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600">
            <Clock className="w-3.5 h-3.5 text-violet-800" />
            <span>{timeStr}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-violet-800 hover:bg-violet-50 border border-gray-200 rounded-xl transition-all"
            title="Muat ulang data terkini"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-800' : ''}`} />
          </button>

          {/* User / Admin Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] text-white uppercase font-bold">
                {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
              </div>
              <span className="max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline-block">
                {currentUser?.name || 'Administrator'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-violet-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Sesi Aktif Saat Ini</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-violet-100 text-violet-900">
                    Role: {currentUser?.role?.toUpperCase()}
                  </span>
                </div>

                <div className="px-3 py-1.5">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Ganti Akun Cepat</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          u.id === currentUser?.id
                            ? 'bg-violet-50 text-violet-900 font-bold'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[9px] uppercase text-gray-400">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Exit to User App */}
          <button
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white font-extrabold hover:bg-violet-700 rounded-xl text-xs transition-all shadow-md shadow-violet-500/10"
          >
            <span className="hidden sm:inline">Aplikasi User</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
