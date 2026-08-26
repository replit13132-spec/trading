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
import { LogIn } from 'lucide-react';

const LoginPromptScreen: React.FC<{ tabName: string }> = ({ tabName }) => {
  const { setAuthScreen } = useApp();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto py-12">
      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mb-4 animate-bounce">
        <LogIn className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">Masuk ke Akun Anda</h3>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Untuk mengakses halaman <span className="font-bold text-violet-600">{tabName}</span>, silakan masuk ke akun Anda atau daftar jika belum memiliki akun.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={() => setAuthScreen('login')}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-xs"
        >
          Masuk / Login
        </button>
        <button
          onClick={() => setAuthScreen('register')}
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-95 text-xs"
        >
          Daftar Akun Baru
        </button>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-900 antialiased selection:bg-violet-500 selection:text-violet-950">
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
          currentUser ? <TradeScreen /> : <LoginPromptScreen tabName="Trade" />
        ) : activeTab === 'transaksi' ? (
          currentUser ? <TransactionScreen /> : <LoginPromptScreen tabName="Transaksi" />
        ) : activeTab === 'wallet' ? (
          currentUser ? <WalletScreen /> : <LoginPromptScreen tabName="Wallet" />
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
