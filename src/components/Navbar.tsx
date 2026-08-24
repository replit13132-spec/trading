import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, User as UserIcon, Shield, RefreshCw, ChevronDown, Check, LogIn, UserPlus, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    allUsers,
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

        {/* Right: Dummy User Switcher, Mail Notifications, User Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Quick Dummy Account Switcher Pill */}
          <div className="relative">
            <button
              id="dummy-account-switcher-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-colors max-w-[130px] xs:max-w-[160px] sm:max-w-none ${
                currentUser?.role === 'admin'
                  ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span
                className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ${
                  currentUser?.role === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentUser?.role === 'admin' ? 'ADMIN' : 'USER'}
              </span>
              <span className="font-semibold max-w-[45px] xs:max-w-[70px] sm:max-w-[110px] truncate">
                {currentUser?.name || 'Akun'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Pilih Akun (Role: Admin / User)</p>
                  <p className="text-xs text-gray-600">Beralih akun untuk menguji fitur role & saldo</p>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        currentUser?.id === u.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.role === 'admin' ? 'ADMIN' : 'USER'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-[11px] text-gray-500">{formatIdr(u.balances.idr)} • {u.balances.usdt} USDT</p>
                        </div>
                      </div>
                      {currentUser?.id === u.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-gray-100 space-y-1">
                  <button
                    onClick={() => {
                      setAuthScreen('login');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Masuk ke Akun Lain
                  </button>

                  <button
                    onClick={() => {
                      setAuthScreen('register');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-emerald-700 hover:bg-emerald-50 font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Daftar Akun Baru
                  </button>

                  <button
                    onClick={() => {
                      resetBalance();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-amber-700 hover:bg-amber-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Saldo Akun Ini
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mail Notifications */}
          <div className="relative">
            <button
              id="mail-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
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

          {/* User Profile */}
          <button
            id="profile-btn"
            onClick={() => setAuthScreen('login')}
            title="Masuk / Kelola Akun"
            className="p-1.5 sm:p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
    </>
  );
};
