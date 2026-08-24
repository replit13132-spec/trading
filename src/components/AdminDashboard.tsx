import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminNavbar } from './admin/AdminNavbar';
import { AdminOverview } from './admin/AdminOverview';
import { AdminMarkets } from './admin/AdminMarkets';
import { AdminUsers } from './admin/AdminUsers';
import { AdminSpotOrders } from './admin/AdminSpotOrders';
import { AdminFutures } from './admin/AdminFutures';
import { AdminFinance } from './admin/AdminFinance';
import { AdminCMS } from './admin/AdminCMS';
import { AdminSettings } from './admin/AdminSettings';

export const AdminDashboard: React.FC = () => {
  const { currentUser, setActiveTab: setMainTab } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch admin stats:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased">
      {/* Collapsible / Expandable Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        stats={stats}
      />

      {/* Main Content Area (Dynamically offsets with sidebar width) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[260px]'
        }`}
      >
        {/* Sticky Admin Navbar */}
        <AdminNavbar
          activeTab={activeTab}
          isCollapsed={isSidebarCollapsed}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onRefresh={fetchStats}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Admin Body View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              setActiveTab={setActiveTab}
              onRefresh={fetchStats}
            />
          )}

          {activeTab === 'markets' && <AdminMarkets onRefresh={fetchStats} />}

          {activeTab === 'users' && <AdminUsers onRefresh={fetchStats} />}

          {activeTab === 'spot' && <AdminSpotOrders onRefresh={fetchStats} />}

          {activeTab === 'futures' && <AdminFutures onRefresh={fetchStats} />}

          {activeTab === 'finance' && <AdminFinance onRefresh={fetchStats} />}

          {activeTab === 'cms' && <AdminCMS onRefresh={fetchStats} />}

          {activeTab === 'settings' && <AdminSettings onRefresh={fetchStats} />}
        </main>
      </div>
    </div>
  );
};
