import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, BarChart2, ArrowLeftRight, FileText, Wallet, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const baseNavItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'market',
      label: 'Market',
      icon: BarChart2,
    },
    {
      id: 'trade',
      label: 'Simulasi',
      icon: ArrowLeftRight,
    },
    {
      id: 'transaksi',
      label: 'Transaksi',
      icon: FileText,
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
    },
  ];

  const navItems = currentUser?.role === 'admin'
    ? [
        ...baseNavItems,
        {
          id: 'admin',
          label: 'Admin',
          icon: Shield,
        },
      ]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/80 px-2 py-1.5 shadow-lg select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-transform active:scale-95 ${
                isActive ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-amber-50' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-amber-500' : 'stroke-2'}`} />
              </div>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold text-amber-600' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

