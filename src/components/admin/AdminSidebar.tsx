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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type AdminTab =
  | 'overview'
  | 'markets'
  | 'users'
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
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
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
      id: 'accounts' as AdminTab,
      label: 'Rekening Deposit',
      shortLabel: 'Rekening',
      icon: Building2,
      badge: 'CRUD',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'finance' as AdminTab,
      label: 'Keuangan & Bukti Transfer',
      shortLabel: 'Keuangan',
      icon: CreditCard,
      badge: stats?.pendingDeposits ? `${stats.pendingDeposits} Verifikasi` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse',
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
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 text-slate-100 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out shadow-2xl overflow-x-hidden ${
          isCollapsed ? 'w-[68px]' : 'w-[260px]'
        } ${
          isMobileOpen ? 'translate-x-0 !w-[280px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-105 transition-transform overflow-hidden p-1"
              title={isCollapsed ? 'Perluas Sidebar' : 'Admin Panel'}
            >
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </button>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">XMoney</span>
                  <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-md">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Sistem Kontrol Penuh</p>
              </div>
            )}
          </div>

          {/* Close on mobile / Collapse on desktop */}
          <div className="flex items-center flex-shrink-0">
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
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
                      ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-lg shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-slate-950" />
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
                    ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-slate-950 font-extrabold' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />

                <div className="flex-1 flex items-center justify-between min-w-0 text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
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
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/70 flex-shrink-0">
          {isCollapsed && !isMobileOpen ? (
            <button
              onClick={() => setMainTab('beranda')}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all border border-slate-700/60 shadow-sm"
              title="Kembali ke Tampilan User"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
            </button>
          ) : (
            <button
              onClick={() => setMainTab('beranda')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700/60 shadow-sm"
              title="Kembali ke Tampilan Pengguna (App View)"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="truncate">Ke Tampilan User</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
