import React from 'react';
import {
  LayoutDashboard,
  Coins,
  Users,
  ArrowLeftRight,
  TrendingUp,
  CreditCard,
  Building2,
  FileCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  X,
  Percent,
  Bell,
  Gift,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type AdminTab =
  | 'overview'
  | 'markets'
  | 'users'
  | 'referrals'
  | 'accounts'
  | 'finance'
  | 'compounding'
  | 'cms'
  | 'notifications'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  stats?: any;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  stats,
}) => {
  const { setActiveTab: setMainTab, markets, allUsers } = useApp();

  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Ringkasan & Metrik',
      shortLabel: 'Metrik',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'markets' as AdminTab,
      label: 'Pasar & Koin',
      shortLabel: 'Pasar',
      icon: Coins,
      badge: markets.length,
      badgeColor: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    },
    {
      id: 'users' as AdminTab,
      label: 'Pengguna & Saldo',
      shortLabel: 'User',
      icon: Users,
      badge: allUsers.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'referrals' as AdminTab,
      label: 'Sistem Referral & Afiliasi',
      shortLabel: 'Referral',
      icon: Gift,
      badge: '5% Komisi',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'accounts' as AdminTab,
      label: 'Rekening Deposit',
      shortLabel: 'Rekening',
      icon: Building2,
      badge: 'CRUD',
      badgeColor: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    },
    {
      id: 'finance' as AdminTab,
      label: 'Keuangan & Bukti Transfer',
      shortLabel: 'Keuangan',
      icon: CreditCard,
      badge: stats?.pendingDeposits ? `${stats.pendingDeposits} Verifikasi` : null,
      badgeColor: 'bg-violet-500/20 text-violet-400 border border-violet-500/30 animate-pulse',
    },
    {
      id: 'compounding' as AdminTab,
      label: 'Compounding & Bunga Harian',
      shortLabel: 'Compounding',
      icon: Percent,
      badge: 'Auto Yield',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'cms' as AdminTab,
      label: 'CMS Berita & Edukasi',
      shortLabel: 'CMS',
      icon: FileText,
      badge: null,
    },
    {
      id: 'notifications' as AdminTab,
      label: 'Pusat Notifikasi & Siaran',
      shortLabel: 'Notifikasi',
      icon: Bell,
      badge: 'Broadcast',
      badgeColor: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    },
    {
      id: 'settings' as AdminTab,
      label: 'Konfigurasi & Pengaturan',
      shortLabel: 'Pengaturan',
      icon: Settings,
      badge: 'Sistem',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white text-slate-800 border-r border-violet-100 flex flex-col transition-all duration-300 ease-in-out shadow-lg overflow-x-hidden ${
          isCollapsed ? 'w-[68px]' : 'w-[260px]'
        } ${
          isMobileOpen ? 'translate-x-0 !w-[280px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-violet-100 bg-violet-50/30 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 shadow-sm hover:scale-105 transition-transform overflow-hidden p-1 border border-violet-100"
              title={isCollapsed ? 'Perluas Sidebar' : 'Admin Panel'}
            >
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </button>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-violet-900">XMoney</span>
                  <span className="text-[10px] uppercase font-bold bg-violet-100 text-violet-700 border border-violet-200 px-1.5 py-0.2 rounded-md">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-violet-500 font-medium truncate">Sistem Kontrol Penuh</p>
              </div>
            )}
          </div>

          {/* Close on mobile / Collapse on desktop */}
          <div className="flex items-center flex-shrink-0">
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-violet-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const collapsedMode = isCollapsed && !isMobileOpen;

            if (collapsedMode) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-violet-600 text-white font-extrabold shadow-md shadow-violet-500/20'
                      : 'text-slate-500 hover:text-violet-700 hover:bg-violet-50/80'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-600 rounded-full ring-2 ring-white" />
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? 'bg-violet-600 text-white font-extrabold shadow-md shadow-violet-500/20'
                    : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/80'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-600'
                  }`}
                />

                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Return to App */}
        <div className="p-2.5 border-t border-violet-100 bg-violet-50/30 flex-shrink-0">
          {isCollapsed && !isMobileOpen ? (
            <button
              onClick={() => setMainTab('beranda')}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 transition-all border border-violet-100 shadow-sm"
              title="Kembali ke Tampilan User"
            >
              <Sparkles className="w-5 h-5 text-violet-600" />
            </button>
          ) : (
            <button
              onClick={() => setMainTab('beranda')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 hover:text-violet-900 text-xs font-bold transition-all border border-violet-100 shadow-sm"
              title="Kembali ke Tampilan Pengguna (App View)"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <span className="truncate">Ke Tampilan User</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
