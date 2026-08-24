import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Asset, UserAccount, FuturesPosition, SpotOrder, Transaction, NewsArticle, AcademyItem } from '../types';

interface AppContextType {
  mode: 'pintu' | 'pro';
  setMode: (mode: 'pintu' | 'pro') => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  authScreen: 'none' | 'login' | 'register';
  setAuthScreen: (screen: 'none' | 'login' | 'register') => void;
  activeTab: 'beranda' | 'market' | 'trade' | 'transaksi' | 'wallet' | 'admin';
  setActiveTab: (tab: 'beranda' | 'market' | 'trade' | 'transaksi' | 'wallet' | 'admin') => void;
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  markets: Asset[];
  selectedMarket: Asset | null;
  setSelectedMarket: (asset: Asset) => void;
  futuresPositions: FuturesPosition[];
  walletData: any;
  announcements: any[];
  newsList: NewsArticle[];
  academyList: AcademyItem[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'onboarding';
  setAuthModalMode: (mode: 'login' | 'register' | 'onboarding') => void;
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isKYCModalOpen: boolean;
  setIsKYCModalOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  registerUser: (name: string, nik: string, email: string, password?: string, referralCode?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithSocial: (provider: 'google' | 'apple') => Promise<{ success: boolean; message?: string }>;
  resetBalance: () => Promise<void>;
  createDummyUser: (name: string, email: string, role: 'user' | 'admin', idr: number, usdt: number) => Promise<void>;
  executeSpotTrade: (symbol: string, side: 'BUY' | 'SELL', type: 'MARKET' | 'LIMIT', amount: number, price?: number) => Promise<{ success: boolean; message?: string }>;
  openFuturesPosition: (params: { symbol: string; side: 'LONG' | 'SHORT'; leverage: number; marginMode: 'CROSS' | 'ISOLATED'; amountUsdt: number; tpPrice?: number; slPrice?: number }) => Promise<{ success: boolean; message?: string }>;
  closeFuturesPosition: (id: string) => Promise<{ success: boolean; message?: string }>;
  depositFunds: (amount: number, currency: 'IDR' | 'USDT', method: string, proofImage?: string, note?: string) => Promise<{ success: boolean; message?: string; transaction?: any }>;
  withdrawFunds: (amount: number, currency: 'IDR' | 'USDT', destination: string) => Promise<{ success: boolean; message?: string }>;
  withdrawProfit: (amount: number, destination: string) => Promise<{ success: boolean; message?: string }>;
  recompoundProfit: (amount?: number) => Promise<{ success: boolean; message?: string }>;
  withdrawCapital: (amount: number, destination: string) => Promise<{ success: boolean; message?: string }>;
  transferFunds: (from: string, to: string, amount: number, currency: string) => Promise<{ success: boolean; message?: string }>;
  updateMarketPrice: (symbol: string, newPriceUsdt: number, change24h?: number) => Promise<boolean>;
  createMarketAsset: (asset: any) => Promise<boolean>;
  updateUserBalance: (userId: string, idr?: number, usdt?: number, futuresUsdt?: number) => Promise<boolean>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<boolean>;
  formatIdr: (amount: number) => string;
  formatUsdt: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'pintu' | 'pro'>('pintu');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [authScreen, setAuthScreen] = useState<'none' | 'login' | 'register'>('none');
  const [activeTab, setActiveTab] = useState<'beranda' | 'market' | 'trade' | 'transaksi' | 'wallet' | 'admin'>('beranda');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [markets, setMarkets] = useState<Asset[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Asset | null>(null);
  const [futuresPositions, setFuturesPositions] = useState<FuturesPosition[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [academyList, setAcademyList] = useState<AcademyItem[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'onboarding'>('onboarding');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

  const formatIdr = (amount: number = 0) => {
    if (isNaN(amount)) return 'Rp 0';
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  };

  const formatUsdt = (amount: number = 0) => {
    if (isNaN(amount)) return '0,00';
    return amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const refreshData = useCallback(async () => {
    try {
      const [mkRes, userRes, walletRes, posRes, newsRes, acadRes, annRes] = await Promise.all([
        fetch('/api/markets'),
        fetch('/api/users'),
        fetch('/api/user/wallet'),
        fetch('/api/user/positions'),
        fetch('/api/content/news'),
        fetch('/api/content/academy'),
        fetch('/api/announcements'),
      ]);

      const parseRes = async (res: Response) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return { success: false, raw: text };
        }
      };

      const [mkJson, userJson, walletJson, posJson, newsJson, acadJson, annJson] = await Promise.all([
        parseRes(mkRes),
        parseRes(userRes),
        parseRes(walletRes),
        parseRes(posRes),
        parseRes(newsRes),
        parseRes(acadRes),
        parseRes(annRes),
      ]);

      if (mkJson.success) {
        setMarkets(mkJson.data);
        if (!selectedMarket && mkJson.data.length > 0) {
          setSelectedMarket(mkJson.data[0]);
        }
      }
      if (userJson.success) {
        setCurrentUser(userJson.currentUser);
        setAllUsers(userJson.allUsers);
      }
      if (walletJson.success) {
        setWalletData(walletJson.data);
      }
      if (posJson.success) {
        setFuturesPositions(posJson.data);
      }
      if (newsJson.success) setNewsList(newsJson.data);
      if (acadJson.success) setAcademyList(acadJson.data);
      if (annJson.success) setAnnouncements(annJson.data);
    } catch (err) {
      console.error('Failed to fetch app data:', err);
    }
  }, [selectedMarket]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/users/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        // If switched to admin account, automatically open the Admin Dashboard
        if (data.currentUser?.role === 'admin') {
          setActiveTab('admin');
        } else if (activeTab === 'admin') {
          setActiveTab('beranda');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loginUser = async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, identifier: email, password }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        // If logged in as admin, automatically set activeTab to admin
        if (data.currentUser?.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('beranda');
        }
        return { success: true, message: data.message, user: data.currentUser };
      }
      return { success: false, message: data.message || 'Login gagal' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Terjadi kesalahan saat masuk' };
    }
  };

  const registerUser = async (name: string, nik: string, email: string, password?: string, referralCode?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nik, email, password, referralCode }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Pendaftaran gagal' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Terjadi kesalahan saat mendaftar' };
    }
  };

  const loginWithSocial = async (provider: 'google' | 'apple') => {
    try {
      const name = provider === 'google' ? 'Google User (Verified)' : 'Apple User (Verified)';
      const email = provider === 'google' ? 'user.google@gmail.com' : 'user.apple@icloud.com';
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, name, email }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: 'Gagal autentikasi sosial' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal autentikasi sosial' };
    }
  };

  const resetBalance = async () => {
    try {
      const res = await fetch('/api/users/reset-balance', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createDummyUser = async (name: string, email: string, role: 'user' | 'admin', idr: number, usdt: number) => {
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, initialIdr: idr, initialUsdt: usdt }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeSpotTrade = async (symbol: string, side: 'BUY' | 'SELL', type: 'MARKET' | 'LIMIT', amount: number, price?: number) => {
    try {
      const res = await fetch('/api/trade/spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, side, type, amount, price }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Transaksi gagal' };
    }
  };

  const openFuturesPosition = async (params: { symbol: string; side: 'LONG' | 'SHORT'; leverage: number; marginMode: 'CROSS' | 'ISOLATED'; amountUsdt: number; tpPrice?: number; slPrice?: number }) => {
    try {
      const res = await fetch('/api/trade/futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal membuka posisi futures' };
    }
  };

  const closeFuturesPosition = async (id: string) => {
    try {
      const res = await fetch(`/api/trade/futures/close/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal menutup posisi' };
    }
  };

  const depositFunds = async (
    amount: number,
    currency: 'IDR' | 'USDT',
    method: string,
    proofImage?: string,
    note?: string
  ) => {
    try {
      const res = await fetch('/api/user/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, method, proofImage, note }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: data.message, transaction: data.data };
      }
      return { success: false, message: data.message || 'Gagal mengajukan deposit' };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.message || 'Gangguan koneksi' };
    }
  };

  const withdrawFunds = async (amount: number, currency: 'IDR' | 'USDT', destination: string) => {
    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, destination }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal penarikan dana' };
    }
  };

  const withdrawProfit = async (amount: number, destination: string) => {
    try {
      const res = await fetch('/api/user/withdraw-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, destination }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal penarikan profit' };
    }
  };

  const recompoundProfit = async (amount?: number) => {
    try {
      const res = await fetch('/api/user/recompound-profit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal menggabungkan profit ke modal' };
    }
  };

  const withdrawCapital = async (amount: number, destination: string) => {
    try {
      const res = await fetch('/api/user/withdraw-capital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, destination }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal penarikan modal pokok' };
    }
  };

  const transferFunds = async (from: string, to: string, amount: number, currency: string) => {
    try {
      const res = await fetch('/api/user/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, amount, currency }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal transfer dana' };
    }
  };

  const updateMarketPrice = async (symbol: string, newPriceUsdt: number, change24h?: number) => {
    try {
      const res = await fetch('/api/admin/markets/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, newPriceUsdt, change24h }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const createMarketAsset = async (asset: any) => {
    try {
      const res = await fetch('/api/admin/markets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateUserBalance = async (userId: string, idr?: number, usdt?: number, futuresUsdt?: number) => {
    try {
      const res = await fetch('/api/admin/users/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, idr, usdt, futuresUsdt }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const res = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        isOnboarded,
        setIsOnboarded,
        authScreen,
        setAuthScreen,
        activeTab,
        setActiveTab,
        currentUser,
        allUsers,
        markets,
        selectedMarket,
        setSelectedMarket,
        futuresPositions,
        walletData,
        announcements,
        newsList,
        academyList,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isKYCModalOpen,
        setIsKYCModalOpen,
        refreshData,
        switchUser,
        loginUser,
        registerUser,
        loginWithSocial,
        resetBalance,
        createDummyUser,
        executeSpotTrade,
        openFuturesPosition,
        closeFuturesPosition,
        depositFunds,
        withdrawFunds,
        withdrawProfit,
        recompoundProfit,
        withdrawCapital,
        transferFunds,
        updateMarketPrice,
        createMarketAsset,
        updateUserBalance,
        updateUserRole,
        formatIdr,
        formatUsdt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
