import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { MarketScreen } from './components/MarketScreen';
import { TradeScreen } from './components/TradeScreen';
import { TransactionScreen } from './components/TransactionScreen';
import { WalletScreen } from './components/WalletScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Modals } from './components/Modals';

const MainContent: React.FC = () => {
  const { activeTab, isOnboarded, authScreen, currentUser } = useApp();

  // Dedicated Auth Views
  if (authScreen === 'login') {
    return <LoginScreen />;
  }

  if (authScreen === 'register') {
    return <RegisterScreen />;
  }

  // If user opens app for the first time, show the requested onboarding page
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-white">
        <OnboardingScreen />
        <Modals />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-900 antialiased selection:bg-amber-500 selection:text-amber-950">
      {/* Top Navbar (hidden on Admin screen to provide dedicated enterprise dashboard) */}
      {activeTab !== 'admin' && <Navbar />}

      {/* Main Screen View */}
      <main className="flex-1 w-full">
        {activeTab === 'admin' ? (
          currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <HomeScreen />
          )
        ) : activeTab === 'beranda' ? (
          <HomeScreen />
        ) : activeTab === 'market' ? (
          <MarketScreen />
        ) : activeTab === 'trade' ? (
          <TradeScreen />
        ) : activeTab === 'transaksi' ? (
          <TransactionScreen />
        ) : activeTab === 'wallet' ? (
          <WalletScreen />
        ) : (
          <HomeScreen />
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden on Admin screen) */}
      {activeTab !== 'admin' && <BottomNav />}

      {/* Global Action Modals */}
      <Modals />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
