import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, User as UserIcon, Shield, RefreshCw, ChevronDown, Check, LogIn, UserPlus, LogOut } from 'lucide-react';

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
            <span className="font-bold text-blue-400">Mode Admin Aktif:</span>
            <span className="text-slate-300 truncate hidden xs:inline">
              Anda sedang mempratinjau antarmuka pengguna konsumen.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-2.5 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold transition-all flex items-center gap-1 shrink-0 shadow-sm"
          >
            <Shield className="w-3 h-3" />
            <span>Buka Dashboard Admin</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-2.5 sm:px-4 py-2.5 sm:py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Pintu Brand & Admin Dashboard */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-85 transition-opacity"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm flex-shrink-0">
              <span className="font-extrabold text-base sm:text-lg lowercase tracking-tighter">∩</span>
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">pintu</span>
          </button>

          {/* Admin Dashboard Quick Link (Only for Admin role) */}
          {currentUser?.role === 'admin' && (
            <button
              id="admin-dashboard-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-colors border flex-shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
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
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900">Pemberitahuan</h4>
                  <span className="text-[11px] text-blue-600 font-semibold">Tandai dibaca</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="p-2 bg-blue-50/60 rounded-xl">
                    <p className="font-semibold text-gray-900">🎉 Selamat Datang di Pintu</p>
                    <p className="text-gray-600 text-[11px] mt-0.5">Nikmati trading spot & futures dengan likuiditas tinggi dan leverage hingga 25x.</p>
                  </div>
                  <div className="p-2 bg-amber-50/60 rounded-xl">
                    <p className="font-semibold text-amber-900">⚠️ Jaringan BSC Selesai Maintenance</p>
                    <p className="text-amber-800 text-[11px] mt-0.5">Deposit dan penarikan BEP-20 kini telah berjalan normal kembali.</p>
                  </div>
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
                showUserMenu ? 'bg-gray-200 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {currentUser?.name || 'Pengguna'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {currentUser?.email || 'user@pintu.co.id'}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 ${
                        currentUser?.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
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
                      <span className="text-[11px] text-gray-500 font-medium">💳 Saldo:</span>
                      <span className="font-extrabold text-blue-700 text-xs">
                        {formatIdr(currentUser.balances?.idr || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-900 text-[11px] pt-0.5">
                      <span className="font-medium">📈 Aset (1%/hari):</span>
                      <span className="font-extrabold text-amber-700">
                        {formatIdr(
                          (currentUser.compoundingBalances?.idr || 0) +
                            (currentUser.compoundingBalances?.usdt || 0) * 17584
                        )}
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
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-blue-600" />
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
