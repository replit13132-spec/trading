export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'stocks' | 'tokenized' | 'komoditas' | 'etf';
  icon: string;
  color: string;
  priceIdr: number;
  priceUsdt: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hIdr: string;
  volume24hUsdt: string;
  sparkline: number[];
  isHot?: boolean;
  isGainer?: boolean;
  isLoser?: boolean;
  isFavorite?: boolean;
}

export interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FuturesPosition {
  id: string;
  userId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  leverage: number;
  marginMode: 'CROSS' | 'ISOLATED';
  entryPrice: number;
  markPrice: number;
  sizeUsdt: number;
  sizeCoin: number;
  margin: number;
  liquidationPrice: number;
  pnlUsdt: number;
  pnlPercentage: number;
  tpPrice?: number;
  slPrice?: number;
  timestamp: string;
}

export interface SpotOrder {
  id: string;
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price: number;
  amount: number;
  totalIdr: number;
  status: 'FILLED' | 'OPEN' | 'CANCELLED';
  timestamp: string;
}

export interface CapitalBatch {
  id: string;
  amount: number;
  createdAt: string;
  unlockDate: string;
  isUnlocked?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'TRADE_SPOT' | 'FUTURES_PNL' | 'WITHDRAW_PROFIT' | 'WITHDRAW_CAPITAL' | 'RECOMPOUND' | 'REWARD';
  amount: number;
  currency: 'IDR' | 'USDT' | string;
  method?: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  timestamp: string;
  txHash?: string;
  proofImage?: string;
  note?: string;
  description?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  nik?: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isDummy?: boolean;
  isVerified?: boolean;
  balances: {
    idr: number;
    usdt: number;
    tokens: Record<string, number>;
  };
  compoundingBalances?: {
    idr: number;
    usdt: number;
    tokens?: Record<string, number>;
  };
  compoundingProfitIdr?: number;
  capitalBatches?: CapitalBatch[];
  proBalances: {
    idr: number;
    usdt: number;
    tokens: Record<string, number>;
  };
  futuresBalances: {
    usdt: number;
  };
  referralCode?: string;
  referredBy?: string;
  referredByCode?: string;
  totalReferralCommissionIdr?: number;
  invitedUsersCount?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  imageUrl: string;
  summary: string;
}

export interface AcademyItem {
  id: string;
  title: string;
  readTime: string;
  level: string;
  imageUrl: string;
  category: string;
  description: string;
}

export interface Announcement {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  content: string;
  active: boolean;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  exchangeStatus: 'NORMAL' | 'DEGRADED' | 'MAINTENANCE';
  makerFeeRate: number;
  takerFeeRate: number;
  maxFuturesLeverage: number;
  minDepositIdr: number;
  minWithdrawIdr: number;
  kycRequiredForWithdraw: boolean;
  globalBannerText: string;
  globalBannerEnabled: boolean;
}
