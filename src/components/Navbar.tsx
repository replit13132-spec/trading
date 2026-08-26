import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, User as UserIcon, Shield, RefreshCw, ChevronDown, Check, LogIn, UserPlus, LogOut, Bell, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    allUsers,
    walletData,
    switchUser,
    resetBalance,
    formatIdr,
    activeTab,
    setActiveTab,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsOnboarded,
    setAuthScreen,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setNotificationsList(data.data);
        }
      })
      .catch(() => {});
  }, [showNotifications]);

  const spotTotalIdr = walletData?.totalIdr || 0;
  const compoundingTotalIdr = walletData?.totalCompoundingIdr || 0;
  const proTotalIdr = walletData?.proTotalIdr || 0;
  const futuresUsdt = walletData?.futuresTotalUsdt || 0;
  const totalWalletVal = spotTotalIdr + compoundingTotalIdr + proTotalIdr + futuresUsdt * 17584;

  return (
    <>
      {/* Admin Mode Floating Banner when Admin is previewing user app */}
      {currentUser?.role === 'admin' && activeTab !== 'admin' && (
        <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] flex items-center justify-between z-50 border-b border-slate-800">
          <div className="flex items-center gap-1.5 max-w-xl truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-bold text-violet-400">Mode Admin Aktif:</span>
            <span className="text-slate-300 truncate hidden xs:inline">
              Anda sedang mempratinjau antarmuka pengguna konsumen.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-2.5 py-0.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-slate-950 text-[10px] font-extrabold transition-all flex items-center gap-1 shrink-0 shadow-sm"
          >
            <Shield className="w-3 h-3" />
            <span>Buka Dashboard Admin</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-2.5 sm:px-4 py-2.5 sm:py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand Logo & Admin Dashboard */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-85 transition-opacity"
          >
            <img src="/logo.png" alt="Logo" className="w-32 h-16 sm:w-40 sm:h-20 object-contain flex-shrink-0" />
          </button>

          {/* Admin Dashboard Quick Link (Only for Admin role) */}
          {currentUser?.role === 'admin' && (
            <button
              id="admin-dashboard-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-colors border flex-shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-violet-500 text-slate-950 border-violet-500 font-extrabold'
                  : 'bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100'
              }`}
            >
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </div>

        {/* Right: Mail Notifications, User Profile with Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Mail Notifications */}
          <div className="relative">
            <button
              id="mail-notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors relative flex-shrink-0"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-20px)] max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900">Pemberitahuan & Siaran</h4>
                  <span className="text-[11px] text-violet-600 font-semibold">{notificationsList.length} Pesan</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  {notificationsList.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-xs">Belum ada pemberitahuan.</p>
                  ) : (
                    notificationsList.map((notif) => (
                      <div key={notif.id} className="p-2.5 bg-violet-50/60 rounded-xl border border-violet-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900">{notif.title}</p>
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-violet-200 text-violet-900 rounded">
                            {notif.type || 'info'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] text-gray-400 font-mono">{notif.createdAt}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Icon Dropdown */}
          <div className="relative">
            <button
              id="profile-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              title="Profil & Akun"
              className={`p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ${
                showUserMenu ? 'bg-violet-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-900 flex items-center justify-center font-extrabold text-sm shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {currentUser?.name || 'Pengguna'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {currentUser?.email || 'user@email.com'}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 ${
                        currentUser?.role === 'admin'
                          ? 'bg-violet-100 text-violet-900'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {currentUser?.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>

                {/* Account Balances Summary (Synchronized with Wallet Screen) */}
                {currentUser && (
                  <div className="my-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                      <span className="text-[11px] text-gray-600 font-bold">📈 Saldo Aset:</span>
                      <span className="font-extrabold text-violet-950 text-xs">
                        {formatIdr(
                          (currentUser.compoundingBalances?.idr || 0) +
                            (currentUser.compoundingBalances?.usdt || 0) * 17584
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-800 text-[11px] pt-0.5 font-bold">
                      <span>⚡ Profit:</span>
                      <span className="font-extrabold text-emerald-600">
                        {formatIdr(currentUser.compoundingProfitIdr || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-1 space-y-1">
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-violet-900 hover:bg-violet-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-violet-600" />
                      Dashboard Admin
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setAuthScreen('login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Logout / Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};
