import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database Seed Data: Exactly 2 Demo Accounts (User and Admin)
let users: any[] = [
  {
    id: 'user_dummy_1',
    name: 'Budi Santoso',
    nik: '3171012304950001',
    email: 'budi.santoso@gmail.com',
    role: 'user',
    isDummy: false,
    isVerified: true,
    balances: {
      idr: 50000000,
      usdt: 2500,
      tokens: {
        BTC: 0.035,
        ETH: 0.45,
        SOL: 4.2,
        PTU: 1500,
        MODE: 2000,
      },
    },
    compoundingBalances: {
      idr: 25000000,
      usdt: 1500,
      tokens: {
        BTC: 0.035,
        ETH: 0.45,
      },
    },
    compoundingProfitIdr: 1250000,
    capitalBatches: [],
    proBalances: {
      idr: 15000000,
      usdt: 1200,
      tokens: {
        BTC: 0.015,
        ETH: 0.2,
      },
    },
    futuresBalances: {
      usdt: 1300,
    },
  },
  {
    id: 'user_admin',
    name: 'Administrator',
    nik: '3171099999990000',
    email: process.env.ADMIN_EMAIL || 'admin@xmoney.com',
    password: process.env.ADMIN_PASSWORD || 'password123',
    role: 'admin',
    isDummy: false,
    isVerified: true,
    balances: {
      idr: 1000000000,
      usdt: 100000,
      tokens: {
        BTC: 5.0,
        ETH: 50.0,
        SOL: 500.0,
      },
    },
    compoundingBalances: {
      idr: 500000000,
      usdt: 50000,
      tokens: {},
    },
    proBalances: {
      idr: 500000000,
      usdt: 50000,
      tokens: {},
    },
    futuresBalances: {
      usdt: 50000,
    },
  },
];

let currentUserId = 'user_dummy_1';

let markets: any[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    color: '#F7931A',
    priceIdr: 1359133000,
    priceUsdt: 77250.7,
    change24h: 0.04,
    high24h: 1362552000,
    low24h: 1329004000,
    volume24hIdr: '5,41B',
    volume24hUsdt: '2,08M',
    sparkline: [76500, 76200, 76800, 75900, 76400, 77100, 77250],
    isHot: true,
    isGainer: true,
    isFavorite: true,
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    color: '#627EEA',
    priceIdr: 42608000,
    priceUsdt: 2420.5,
    change24h: 0.12,
    high24h: 43100000,
    low24h: 41950000,
    volume24hIdr: '2,97B',
    volume24hUsdt: '1,45M',
    sparkline: [2380, 2395, 2410, 2400, 2415, 2420],
    isHot: true,
    isGainer: true,
    isFavorite: true,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    color: '#14F195',
    priceIdr: 1662500,
    priceUsdt: 94.5,
    change24h: 0.98,
    high24h: 1690000,
    low24h: 1610000,
    volume24hIdr: '3,40B',
    volume24hUsdt: '980K',
    sparkline: [91, 92.5, 93, 92, 94, 94.5],
    isHot: true,
    isGainer: true,
    isFavorite: true,
  },
  {
    id: 'ptu',
    symbol: 'PTU',
    name: 'Pintu Token',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15112.png',
    color: '#0052FF',
    priceIdr: 1590,
    priceUsdt: 0.0904,
    change24h: 3.05,
    high24h: 1650,
    low24h: 1520,
    volume24hIdr: '51,12M',
    volume24hUsdt: '320K',
    sparkline: [1510, 1530, 1525, 1560, 1580, 1590],
    isHot: true,
    isGainer: true,
    isFavorite: true,
  },
  {
    id: 'mode',
    symbol: 'MODE',
    name: 'Mode Network',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/31174.png',
    color: '#DFFE00',
    priceIdr: 1218.2,
    priceUsdt: 0.0692,
    change24h: 27.66,
    high24h: 1250,
    low24h: 940,
    volume24hIdr: '12,4M',
    volume24hUsdt: '720K',
    sparkline: [950, 980, 1050, 1120, 1180, 1218],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'magma',
    symbol: 'MAGMA',
    name: 'Magma Finance',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29424.png',
    color: '#FF6B00',
    priceIdr: 4116,
    priceUsdt: 0.234,
    change24h: -25.07,
    high24h: 5600,
    low24h: 3950,
    volume24hIdr: '8,9M',
    volume24hUsdt: '510K',
    sparkline: [5500, 5200, 4800, 4400, 4200, 4116],
    isHot: true,
    isLoser: true,
  },
  {
    id: 'zro',
    symbol: 'ZRO',
    name: 'LayerZero',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/26997.png',
    color: '#000000',
    priceIdr: 21538,
    priceUsdt: 1.22,
    change24h: 22.45,
    high24h: 22100,
    low24h: 17200,
    volume24hIdr: '45,2M',
    volume24hUsdt: '2,6M',
    sparkline: [17500, 18200, 19400, 20100, 21538],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'stx',
    symbol: 'STX',
    name: 'Stacks',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4847.png',
    color: '#5546FF',
    priceIdr: 4165,
    priceUsdt: 0.236,
    change24h: 19.27,
    high24h: 4250,
    low24h: 3450,
    volume24hIdr: '34,1M',
    volume24hUsdt: '1,9M',
    sparkline: [3500, 3650, 3800, 4000, 4165],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'dgb',
    symbol: 'DGB',
    name: 'DigiByte',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/109.png',
    color: '#0066CC',
    priceIdr: 86.05,
    priceUsdt: 0.00489,
    change24h: 16.68,
    high24h: 89.2,
    low24h: 73.5,
    volume24hIdr: '18,5M',
    volume24hUsdt: '1,05M',
    sparkline: [74, 76, 79, 82, 86.05],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    color: '#26A17B',
    priceIdr: 17584,
    priceUsdt: 1.0,
    change24h: 0.05,
    high24h: 17610,
    low24h: 17550,
    volume24hIdr: '5,88B',
    volume24hUsdt: '3,34M',
    sparkline: [17570, 17580, 17584],
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP (Ripple)',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    color: '#23292F',
    priceIdr: 26342,
    priceUsdt: 1.49,
    change24h: -0.47,
    high24h: 27100,
    low24h: 25900,
    volume24hIdr: '2,42B',
    volume24hUsdt: '1,37M',
    sparkline: [26800, 26600, 26400, 26342],
    isLoser: true,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB (Binance)',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    color: '#F3BA2F',
    priceIdr: 12222000,
    priceUsdt: 695.1,
    change24h: 0.40,
    high24h: 12350000,
    low24h: 12050000,
    volume24hIdr: '979,34M',
    volume24hUsdt: '556K',
    sparkline: [688, 691, 693, 695.1],
  },
  // Tokenized Stocks
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corp (Tokenized)',
    category: 'stocks',
    icon: 'https://assets.coingecko.com/coins/images/30356/small/nvidia.png',
    color: '#76B900',
    priceIdr: 2450000,
    priceUsdt: 139.3,
    change24h: 4.82,
    high24h: 2490000,
    low24h: 2320000,
    volume24hIdr: '18,2B',
    volume24hUsdt: '1,03M',
    sparkline: [132, 134, 137, 139.3],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc (Tokenized)',
    category: 'stocks',
    icon: 'https://assets.coingecko.com/coins/images/30357/small/apple.png',
    color: '#A2AAAD',
    priceIdr: 4050000,
    priceUsdt: 230.2,
    change24h: 1.15,
    high24h: 4090000,
    low24h: 3980000,
    volume24hIdr: '12,5B',
    volume24hUsdt: '710K',
    sparkline: [227, 228, 229, 230.2],
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc (Tokenized)',
    category: 'stocks',
    icon: 'https://assets.coingecko.com/coins/images/30358/small/tesla.png',
    color: '#E82127',
    priceIdr: 3920000,
    priceUsdt: 222.9,
    change24h: -2.31,
    high24h: 4100000,
    low24h: 3880000,
    volume24hIdr: '22,1B',
    volume24hUsdt: '1,25M',
    sparkline: [229, 226, 224, 222.9],
    isLoser: true,
  },
];

let futuresPositions: any[] = [];
let bankAccounts: any[] = [
  {
    id: 'bank_1',
    bankName: 'Bank Central Asia (BCA)',
    bankCode: 'BCA',
    accountNumber: '8820 1948 2109 0012',
    accountHolder: 'PT PINTU PRO INDONESIA',
    category: 'Virtual Account',
    isActive: true,
    notes: 'Transfer via BCA Mobile / ATM / Internet Banking 24 jam.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_2',
    bankName: 'Bank Mandiri',
    bankCode: 'MANDIRI',
    accountNumber: '1370 0098 7654 3',
    accountHolder: 'PT PINTU PRO INDONESIA',
    category: 'Transfer Bank',
    isActive: true,
    notes: 'Transfer via Livin by Mandiri atau ATM Mandiri.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_3',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    bankCode: 'BRI',
    accountNumber: '0123 0100 9876 501',
    accountHolder: 'PT PINTU PRO INDONESIA',
    category: 'Transfer Bank',
    isActive: true,
    notes: 'Transfer via BRImo / ATM BRI.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_4',
    bankName: 'Bank Negara Indonesia (BNI)',
    bankCode: 'BNI',
    accountNumber: '0987 6543 210',
    accountHolder: 'PT PINTU PRO INDONESIA',
    category: 'Virtual Account',
    isActive: true,
    notes: 'Transfer via BNI Mobile Banking / ATM BNI.',
    createdAt: '2026-08-01 00:00:00',
  },
  {
    id: 'bank_5',
    bankName: 'QRIS Standar Nasional',
    bankCode: 'QRIS',
    accountNumber: 'ID1029384756102',
    accountHolder: 'PT PINTU PRO INDONESIA',
    category: 'QRIS',
    isActive: true,
    notes: 'Pindai kode QR menggunakan GoPay, OVO, ShopeePay, Dana, LinkAja, atau m-Banking.',
    createdAt: '2026-08-01 00:00:00',
  },
];
const DEFAULT_RECEIPT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="580" viewBox="0 0 400 580" fill="none"><rect width="400" height="580" fill="%23f8fafc" rx="20"/><rect x="16" y="16" width="368" height="548" fill="%23ffffff" rx="16" stroke="%23cbd5e1" stroke-width="2"/><rect x="16" y="16" width="368" height="75" fill="%230052FF" rx="16"/><text x="36" y="58" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">BCA Mobile - M-Transfer</text><circle cx="345" cy="53" r="14" fill="%23ffffff" opacity="0.25"/><text x="36" y="125" fill="%231e293b" font-family="sans-serif" font-size="14" font-weight="bold">TRANSFER BANK BERHASIL</text><text x="36" y="145" fill="%2364748b" font-family="sans-serif" font-size="11">24 AGU 2026 14:22:18 WIB</text><line x1="36" y1="165" x2="364" y2="165" stroke="%23e2e8f0" stroke-width="1"/><text x="36" y="195" fill="%2364748b" font-family="sans-serif" font-size="11">Bank Tujuan</text><text x="36" y="215" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">BCA VIRTUAL ACCOUNT</text><text x="36" y="245" fill="%2364748b" font-family="sans-serif" font-size="11">No. VA / Rekening Tujuan</text><text x="36" y="265" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">8820 1948 2109 0012</text><text x="36" y="295" fill="%2364748b" font-family="sans-serif" font-size="11">Nama Penerima</text><text x="36" y="315" fill="%230052FF" font-family="sans-serif" font-size="13" font-weight="bold">PT PINTU PRO INDONESIA</text><text x="36" y="345" fill="%2364748b" font-family="sans-serif" font-size="11">Pengirim / Remitter</text><text x="36" y="365" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">BUDI SANTOSO</text><line x1="36" y1="385" x2="364" y2="385" stroke="%23e2e8f0" stroke-width="1"/><text x="36" y="415" fill="%2364748b" font-family="sans-serif" font-size="11">Jumlah Transfer Deposit</text><text x="36" y="440" fill="%2316a34a" font-family="sans-serif" font-size="22" font-weight="bold">Rp 10.000.000</text><text x="36" y="470" fill="%2364748b" font-family="sans-serif" font-size="11">No. Referensi Transaksi</text><text x="36" y="490" fill="%23334155" font-family="sans-serif" font-size="12" font-weight="bold">REF-20260824-99812</text><rect x="36" y="510" width="328" height="36" fill="%23ecfdf5" rx="8" stroke="%23a7f3d0"/><text x="200" y="533" text-anchor="middle" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold">✓ RESI SAH & TERKIRIM KE SISTEM PINTU</text></svg>`;

let spotOrders: any[] = [];
let transactions: any[] = [];

let notifications = [
  {
    id: 'notif_1',
    title: '🎉 Selamat Datang di Pintu',
    message: 'Nikmati trading spot & compounding modal dengan hasil 1% per hari. Verifikasi KYC Anda sekarang untuk fitur lengkap.',
    type: 'success',
    createdAt: '24 Agu 2026 00:00',
    target: 'ALL',
  },
  {
    id: 'notif_2',
    title: '⚠️ Pemeliharaan Sistem Berkala',
    message: 'Sistem compounding otomatis berjalan setiap pukul 00:00 WIB. Pastikan saldo aktif Anda siap.',
    type: 'warning',
    createdAt: '23 Agu 2026 12:00',
    target: 'ALL',
  }
];

let announcements = [
  {
    id: 'ann_1',
    type: 'warning',
    title: 'Maintenance Kirim/Terima via BSC (BEP-20)',
    content: 'Fitur deposit & withdrawal jaringan BSC (BEP-20) sedang dalam pemeliharaan berkala untuk peningkatan stabilitas node.',
    active: true,
  }
];

// Compounding / Yield Configuration State
let compoundingSettings = {
  enabled: true,
  dailyRate: 1.0, // Default 1.0% per day
  payoutFrequency: 'DAILY', // 'DAILY', 'HOURLY', 'WEEKLY'
  targetBalanceType: 'ALL', // 'ALL', 'IDR', 'USDT'
  minBalanceRequirement: 100000, // Minimal Rp 100.000 untuk dapat compounding
  applyToRole: 'ALL_USERS', // 'ALL_USERS', 'USER_ONLY'
  autoDistributionCron: true,
  lastDistributedAt: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString('id-ID'),
  totalProfitDistributedIdr: 12500000,
  totalProfitDistributedUsdt: 850,
};

let compoundingLogs: any[] = [
  {
    id: 'cmp_log_1',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString('id-ID'),
    rateApplied: 1.0,
    recipientsCount: 2,
    totalIdrDistributed: 500000,
    totalUsdtDistributed: 25,
    status: 'SUCCESS',
    triggeredBy: 'SYSTEM_CRON',
    note: 'Pembagian compounding otomatis 1.0% harian ke seluruh akun pengguna',
  },
];

let newsArticles = [
  {
    id: 'news_1',
    title: 'Harga Polygon (POL) Diam-diam Rebound 26,38% dalam Sehari, Akankah Tembus Level Tertinggi?',
    source: 'Pintu News • Altcoin',
    timeAgo: '1 hari',
    category: 'Altcoin',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    summary: 'Aset kripto Polygon mencatatkan lonjakan tajam didorong peningkatan adopsi rollup Layer-2 dan integrasi ekosistem baru.',
  },
  {
    id: 'news_2',
    title: '3 Altcoin Ini Berdarah di Weekend, Anjlok Belasan Persen Menjelang Keputusan Suku Bunga Fed',
    source: 'Pintu News • Altcoin',
    timeAgo: '1 hari',
    category: 'Market',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    summary: 'Pasar derivatif mengalami volatilitas tinggi saat para trader menyesuaikan posisi risiko sebelum data inflasi makro dirilis.',
  },
  {
    id: 'news_3',
    title: 'Hack DeFi Lainnya: Term Labs Kehilangan US$8,5 Juta dalam Serangan Manipulasi Flash Loan',
    source: 'BeinCrypto Indonesia',
    timeAgo: '28 menit',
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    summary: 'Protokol pinjaman terdesentralisasi mengonfirmasi eksploitasi pada kontrak pintar mereka dan sedang bekerja sama dengan auditor on-chain.',
  },
  {
    id: 'news_4',
    title: 'Crypto Skeptic Rashida Tlaib Memegang Exchange-Traded Fund (ETF) Bitcoin',
    source: 'BeinCrypto Indonesia',
    timeAgo: 'sekitar 1 jam',
    category: 'Regulation',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    summary: 'Laporan kepemilikan aset menunjukkan anggota kongres yang sebelumnya kritis terhadap kripto kini memiliki eksposur ETF.',
  },
];

let academyItems = [
  {
    id: 'acad_1',
    title: '5 Strategi Wajib Investor di Bear Market Crypto',
    readTime: '4 min baca',
    level: 'Pemula',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
    category: 'Investasi',
    description: 'Pelajari cara melindungi modal, Dollar Cost Averaging (DCA), dan mencari peluang di fase akumulasi pasar.',
  },
  {
    id: 'acad_2',
    title: 'Tokenisasi Aset: Pengertian, Cara Kerja, dan Risiko RWA',
    readTime: '6 min baca',
    level: 'Menengah',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
    category: 'Teknologi',
    description: 'Mengenal Real World Assets (RWA) seperti saham, properti, dan obligasi yang diperdagangkan di blockchain.',
  },
  {
    id: 'acad_3',
    title: 'Langkah Awal Trading Crypto untuk Pemula',
    readTime: '3 min baca',
    level: 'Pemula',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    category: 'Trading',
    description: 'Panduan lengkap membaca orderbook, menentukan entry & exit, serta manajemen risiko dasar.',
  },
  {
    id: 'acad_4',
    title: 'Apa itu Crypto Futures & Cara Memakai Leverage 25x?',
    readTime: '5 min baca',
    level: 'Lanjutan',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    category: 'Derivatif',
    description: 'Memahami kontrak perpetual, margin mode cross vs isolated, funding rate, dan level likuidasi.',
  },
];

// Helper: generate realistic candles
function generateCandles(basePrice: number, count: number = 40, timeframe: string = '15m') {
  const candles: any[] = [];
  let current = basePrice * 0.985;
  const now = Date.now();
  const stepMs = timeframe === '1m' ? 60000 : timeframe === '15m' ? 900000 : timeframe === '1J' ? 3600000 : 86400000;

  for (let i = count; i >= 0; i--) {
    const timeMs = now - i * stepMs;
    const variation = (Math.random() - 0.48) * (basePrice * 0.008);
    const open = current;
    const close = Math.max(open + variation, basePrice * 0.5);
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.004);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.004);
    const volume = Math.floor(Math.random() * 50 + 5) / 10;
    current = close;

    const d = new Date(timeMs);
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    candles.push({
      time: timeStr,
      timestamp: timeMs,
      open: Number(open.toFixed(1)),
      high: Number(high.toFixed(1)),
      low: Number(low.toFixed(1)),
      close: Number(close.toFixed(1)),
      volume: Number(volume.toFixed(2)),
    });
  }
  return candles;
}

// Background price simulation interval for realistic live ticks
setInterval(() => {
  markets.forEach((m) => {
    const delta = (Math.random() - 0.495) * (m.priceUsdt * 0.0015);
    m.priceUsdt = Math.max(Number((m.priceUsdt + delta).toFixed(4)), 0.0001);
    m.priceIdr = Math.round(m.priceUsdt * 17584);
    
    // Update active futures positions PnL
    futuresPositions.forEach((pos) => {
      if (pos.symbol === m.symbol) {
        pos.markPrice = m.priceUsdt;
        const diff = pos.side === 'LONG' ? (pos.markPrice - pos.entryPrice) : (pos.entryPrice - pos.markPrice);
        pos.pnlUsdt = Number(((diff / pos.entryPrice) * pos.sizeUsdt).toFixed(2));
        pos.pnlPercentage = Number(((diff / pos.entryPrice) * pos.leverage * 100).toFixed(2));
      }
    });
  });
}, 3000);

// API Endpoints
// Markets
app.get('/api/markets', (req, res) => {
  res.json({ success: true, data: markets });
});

app.get('/api/markets/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const market = markets.find((m) => m.symbol === symbol || m.id === symbol.toLowerCase());
  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found' });
  }
  res.json({ success: true, data: market });
});

app.get('/api/markets/:symbol/candles', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const timeframe = (req.query.timeframe as string) || '15m';
  const market = markets.find((m) => m.symbol === symbol || m.id === symbol.toLowerCase()) || markets[0];
  const candles = generateCandles(market.priceUsdt, 45, timeframe);
  res.json({ success: true, data: candles });
});

app.get('/api/markets/:symbol/orderbook', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const market = markets.find((m) => m.symbol === symbol || m.id === symbol.toLowerCase()) || markets[0];
  const base = market.priceUsdt;
  
  const asks: any[] = [];
  const bids: any[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const askPrice = base + i * (base * 0.0006);
    const askAmount = (Math.random() * 25 + 5).toFixed(2);
    asks.unshift({
      price: Number(askPrice.toFixed(1)),
      amount: Number(askAmount),
      total: Number((Number(askPrice) * Number(askAmount)).toFixed(1)),
    });

    const bidPrice = base - i * (base * 0.0006);
    const bidAmount = (Math.random() * 25 + 5).toFixed(2);
    bids.push({
      price: Number(bidPrice.toFixed(1)),
      amount: Number(bidAmount),
      total: Number((Number(bidPrice) * Number(bidAmount)).toFixed(1)),
    });
  }

  res.json({
    success: true,
    data: {
      symbol: market.symbol,
      currentPrice: market.priceUsdt,
      asks,
      bids,
    },
  });
});

// User & Account Management
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    currentUser: users.find((u) => u.id === currentUserId) || users[0],
    allUsers: users,
  });
});

app.post('/api/users/switch', (req, res) => {
  const { userId } = req.body;
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  currentUserId = target.id;
  res.json({ success: true, currentUser: target });
});

app.post('/api/users/create', (req, res) => {
  const { name, email, role, initialIdr, initialUsdt } = req.body;
  const newUser = {
    id: 'user_' + Date.now(),
    name: name || 'Pengguna Baru',
    email: email || `user_${Date.now()}@email.com`,
    role: role || 'user',
    isDummy: true,
    isVerified: true,
    balances: {
      idr: Number(initialIdr) || 10000000,
      usdt: Number(initialUsdt) || 500,
      tokens: {
        BTC: 0.005,
        ETH: 0.05,
        SOL: 1.0,
      },
    },
    proBalances: {
      idr: 5000000,
      usdt: 250,
      tokens: {},
    },
    futuresBalances: {
      usdt: 250,
    },
  };
  users.push(newUser);
  currentUserId = newUser.id;
  res.json({ success: true, currentUser: newUser });
});

// Dedicated Auth Endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, nik, email, password, referralCode } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama Lengkap wajib diisi.' });
  }

  if (!nik || !String(nik).trim()) {
    return res.status(400).json({ success: false, message: 'NIK (Nomor Induk Kependudukan) wajib diisi.' });
  }

  const cleanNik = String(nik).trim();
  if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
    return res.status(400).json({ success: false, message: 'NIK harus terdiri dari 16 digit angka.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Alamat Email wajib diisi.' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Password wajib diisi.' });
  }

  const existingEmail = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Silakan masuk.' });
  }

  const existingNik = users.find((u) => u.nik === cleanNik);
  if (existingNik) {
    return res.status(400).json({ success: false, message: 'NIK ini sudah terdaftar dalam sistem.' });
  }

  const bonusIdr = referralCode ? 10000000 : 5000000;
  const bonusUsdt = referralCode ? 100 : 50;

  const newUser = {
    id: 'user_' + Date.now(),
    name: name.trim(),
    nik: cleanNik,
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: 'user',
    isDummy: false,
    isVerified: true,
    balances: {
      idr: bonusIdr,
      usdt: bonusUsdt,
      tokens: {
        BTC: 0.002,
        ETH: 0.02,
        SOL: 0.5,
        PTU: 100,
      },
    },
    proBalances: {
      idr: 2000000,
      usdt: 100,
      tokens: {},
    },
    futuresBalances: {
      usdt: 100,
    },
  };

  users.push(newUser);
  currentUserId = newUser.id;
  res.json({ success: true, currentUser: newUser, message: 'Pendaftaran akun baru berhasil!' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, identifier, password } = req.body;
  const loginEmail = (email || identifier || '').trim().toLowerCase();

  if (!loginEmail) {
    return res.status(400).json({ success: false, message: 'Alamat Email wajib diisi.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password wajib diisi.' });
  }

  const target = users.find(
    (u) =>
      u.email?.toLowerCase() === loginEmail ||
      u.id === identifier
  );

  if (target) {
    currentUserId = target.id;
    return res.json({ success: true, currentUser: target, message: `Selamat datang kembali, ${target.name}!` });
  }

  return res.status(400).json({ success: false, message: 'Akun dengan email tersebut tidak ditemukan. Silakan mendaftar terlebih dahulu.' });
});

app.post('/api/auth/social', (req, res) => {
  const { provider, name, email } = req.body;
  const targetEmail = email || `user.${provider}@pintu.co.id`;
  let user = users.find((u) => u.email === targetEmail);

  if (!user) {
    user = {
      id: `user_${provider}_` + Date.now(),
      name: name || (provider === 'google' ? 'Pengguna Google' : 'Pengguna Apple ID'),
      email: targetEmail,
      role: 'user',
      isDummy: false,
      isVerified: true,
      balances: {
        idr: 10000000,
        usdt: 200,
        tokens: { BTC: 0.005, ETH: 0.05, PTU: 50 },
      },
      proBalances: { idr: 5000000, usdt: 100, tokens: {} },
      futuresBalances: { usdt: 100 },
    };
    users.push(user);
  }

  currentUserId = user.id;
  res.json({ success: true, currentUser: user });
});

app.post('/api/users/reset-balance', (req, res) => {
  const user = users.find((u) => u.id === currentUserId);
  if (user) {
    if (user.id === 'user_dummy_1') {
      user.balances.idr = 50000000;
      user.balances.usdt = 2500;
      user.proBalances.idr = 15000000;
      user.proBalances.usdt = 1200;
      user.futuresBalances.usdt = 1300;
    } else if (user.id === 'user_dummy_2') {
      user.balances.idr = 250000000;
      user.balances.usdt = 15000;
      user.proBalances.idr = 75000000;
      user.proBalances.usdt = 8000;
      user.futuresBalances.usdt = 7000;
    } else {
      user.balances.idr = 50000000;
      user.balances.usdt = 2500;
    }
  }
  res.json({ success: true, currentUser: user });
});

// Wallet Operations
app.get('/api/user/wallet', (req, res) => {
  const user = users.find((u) => u.id === currentUserId) || users[0];
  
  if (!user.compoundingBalances) {
    user.compoundingBalances = { idr: 25000000, usdt: 1500, tokens: {} };
  }
  if (user.compoundingProfitIdr === undefined) {
    user.compoundingProfitIdr = 1250000;
  }
  if (!user.capitalBatches) {
    user.capitalBatches = [
      {
        id: 'batch_demo_1',
        amount: 25000000,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        unlockDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        isUnlocked: false,
      },
    ];
  }

  // Calculate total portfolio value in IDR
  let totalIdr = user.balances.idr + user.balances.usdt * 17584;
  for (const [symbol, amount] of Object.entries(user.balances.tokens)) {
    const market = markets.find((m) => m.symbol === symbol);
    if (market) {
      totalIdr += (amount as number) * market.priceIdr;
    }
  }

  // Calculate total compounding balance value in IDR
  let totalCompoundingIdr = (user.compoundingBalances?.idr || 0) + (user.compoundingBalances?.usdt || 0) * 17584;

  let proTotalIdr = user.proBalances.idr + user.proBalances.usdt * 17584;
  for (const [symbol, amount] of Object.entries(user.proBalances.tokens)) {
    const market = markets.find((m) => m.symbol === symbol);
    if (market) {
      proTotalIdr += (amount as number) * market.priceIdr;
    }
  }

  const futuresTotalUsdt = user.futuresBalances.usdt;

  const now = new Date();
  const batches = user.capitalBatches || [];
  const unlockedCapital = batches
    .filter((b: any) => b.isUnlocked || new Date(b.unlockDate) <= now)
    .reduce((sum: number, b: any) => sum + b.amount, 0);
  const lockedCapital = Math.max(0, (user.compoundingBalances?.idr || 0) - unlockedCapital);

  res.json({
    success: true,
    data: {
      balances: user.balances,
      compoundingBalances: user.compoundingBalances,
      compoundingProfitIdr: user.compoundingProfitIdr || 0,
      capitalBatches: user.capitalBatches || [],
      unlockedCapital,
      lockedCapital,
      proBalances: user.proBalances,
      futuresBalances: user.futuresBalances,
      totalIdr: Math.round(totalIdr),
      totalCompoundingIdr: Math.round(totalCompoundingIdr),
      proTotalIdr: Math.round(proTotalIdr),
      futuresTotalUsdt,
    },
  });
});

app.post('/api/user/deposit', (req, res) => {
  const { amount, currency, method, proofImage, note } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const depositAmount = Number(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah deposit tidak valid' });
  }

  if ((currency === 'IDR' || !currency) && depositAmount < 500000) {
    return res.status(400).json({
      success: false,
      message: 'Minimal setoran awal (Top Up) Rupiah adalah Rp 500.000',
    });
  }

  const imageToUse = proofImage || DEFAULT_RECEIPT_SVG;

  const newTx = {
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'DEPOSIT',
    amount: depositAmount,
    currency: currency || 'IDR',
    method: method || 'BCA Virtual Account',
    status: 'PENDING',
    proofImage: imageToUse,
    note: note || 'Transfer deposit diajukan pengguna',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Setoran Top Up ${currency || 'IDR'} Rp ${depositAmount.toLocaleString('id-ID')} via ${method || 'VA Bank'} (Menunggu Verifikasi Admin). Setelah disetujui, modal langsung masuk ke ASET (Compounding 1%/hari, terkunci 3 bulan).`,
  };
  transactions.unshift(newTx);

  res.json({
    success: true,
    data: newTx,
    user,
    message: 'Bukti transfer berhasil diunggah! Top up Anda sedang diverifikasi oleh Admin.',
  });
});

// Penarikan Profit Compounding (Min Rp 100.000, kapan saja)
app.post('/api/user/withdraw-profit', (req, res) => {
  const { amount, destination } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 100000) {
    return res.status(400).json({
      success: false,
      message: 'Minimal penarikan profit compounding adalah Rp 100.000',
    });
  }

  const currentProfit = user.compoundingProfitIdr || 0;
  if (currentProfit < numAmount) {
    return res.status(400).json({
      success: false,
      message: `Saldo Profit Compounding tidak mencukupi (Tersedia: Rp ${currentProfit.toLocaleString('id-ID')})`,
    });
  }

  user.compoundingProfitIdr -= numAmount;

  const newTx = {
    id: 'tx_pft_' + Date.now(),
    userId: user.id,
    type: 'WITHDRAW_PROFIT',
    amount: numAmount,
    currency: 'IDR',
    method: destination || 'Rekening Bank',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Penarikan Profit Compounding Rp ${numAmount.toLocaleString('id-ID')} ke ${destination || 'Rekening Bank'}`,
  };
  transactions.unshift(newTx);

  res.json({
    success: true,
    data: newTx,
    user,
    message: `Penarikan profit sebesar Rp ${numAmount.toLocaleString('id-ID')} berhasil diproses!`,
  });
});

// Gabungkan Profit ke Modal Awal (Re-Compound)
app.post('/api/user/recompound-profit', (req, res) => {
  const { amount } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const currentProfit = user.compoundingProfitIdr || 0;
  const recompoundAmount = amount ? Number(amount) : currentProfit;

  if (recompoundAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada profit yang dapat digabungkan' });
  }

  if (currentProfit < recompoundAmount) {
    return res.status(400).json({
      success: false,
      message: `Saldo profit tidak mencukupi (Tersedia: Rp ${currentProfit.toLocaleString('id-ID')})`,
    });
  }

  user.compoundingProfitIdr -= recompoundAmount;
  if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
  user.compoundingBalances.idr = (user.compoundingBalances.idr || 0) + recompoundAmount;

  if (!user.capitalBatches) user.capitalBatches = [];
  const now = new Date();
  const unlockDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  user.capitalBatches.push({
    id: 'batch_rec_' + Date.now(),
    amount: recompoundAmount,
    createdAt: now.toISOString(),
    unlockDate: unlockDate.toISOString(),
    isUnlocked: false,
  });

  const newTx = {
    id: 'tx_rec_' + Date.now(),
    userId: user.id,
    type: 'RECOMPOUND',
    amount: recompoundAmount,
    currency: 'IDR',
    method: 'Re-Compound Profit',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Profit Rp ${recompoundAmount.toLocaleString('id-ID')} digabungkan kembali ke Modal Awal (ASET). Sekarang ikut compounding 1%/hari.`,
  };
  transactions.unshift(newTx);

  res.json({
    success: true,
    data: newTx,
    user,
    message: `Profit Rp ${recompoundAmount.toLocaleString('id-ID')} berhasil digabungkan ke Modal Awal (ASET)! Total Aset kini ikut bertumbuh 1%/hari.`,
  });
});

// Penarikan Modal Pokok (ASET) - Terkunci 3 Bulan sejak tanggal setor
app.post('/api/user/withdraw-capital', (req, res) => {
  const { amount, destination } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah penarikan modal tidak valid' });
  }

  const totalCapital = user.compoundingBalances?.idr || 0;
  if (totalCapital < numAmount) {
    return res.status(400).json({
      success: false,
      message: `Total Modal Awal (ASET) tidak mencukupi (Tersedia: Rp ${totalCapital.toLocaleString('id-ID')})`,
    });
  }

  const now = new Date();
  const batches = user.capitalBatches || [];
  
  let unlockedCapital = 0;
  let lockedBatches: any[] = [];

  for (const batch of batches) {
    const isUnlocked = batch.isUnlocked || new Date(batch.unlockDate) <= now;
    if (isUnlocked) {
      unlockedCapital += batch.amount;
    } else {
      lockedBatches.push(batch);
    }
  }

  if (unlockedCapital < numAmount) {
    lockedBatches.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
    const earliestUnlock = lockedBatches.length > 0 ? new Date(lockedBatches[0].unlockDate) : new Date(now.getTime() + 90*24*60*60*1000);
    const dateFormatted = earliestUnlock.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return res.status(400).json({
      success: false,
      message: `Penarikan modal pokok belum dapat dilakukan. Modal Pokok Anda terkunci selama 3 bulan sejak tanggal deposit. Paling cepat baru dapat ditarik pada ${dateFormatted}.`,
    });
  }

  user.compoundingBalances.idr -= numAmount;

  const newTx = {
    id: 'tx_cap_' + Date.now(),
    userId: user.id,
    type: 'WITHDRAW_CAPITAL',
    amount: numAmount,
    currency: 'IDR',
    method: destination || 'Rekening Bank',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Penarikan Modal Pokok (ASET) Rp ${numAmount.toLocaleString('id-ID')} ke ${destination || 'Rekening Bank'}`,
  };
  transactions.unshift(newTx);

  res.json({
    success: true,
    data: newTx,
    user,
    message: `Penarikan modal pokok Rp ${numAmount.toLocaleString('id-ID')} berhasil diproses!`,
  });
});

app.post('/api/user/withdraw', (req, res) => {
  const { amount, currency, destination } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const withdrawAmount = Number(amount);
  if (currency === 'IDR') {
    if (user.balances.idr < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Saldo Rupiah tidak mencukupi' });
    }
    user.balances.idr -= withdrawAmount;
  } else if (currency === 'USDT') {
    if (user.balances.usdt < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Saldo USDT tidak mencukupi' });
    }
    user.balances.usdt -= withdrawAmount;
  }

  const newTx = {
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'WITHDRAW',
    amount: withdrawAmount,
    currency,
    method: destination || 'Rekening Bank',
    status: 'COMPLETED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Penarikan ${currency} ke ${destination}`,
  };
  transactions.unshift(newTx);

  res.json({ success: true, data: newTx, user });
});

app.post('/api/user/transfer', (req, res) => {
  const { from, to, amount, currency } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const numAmount = Number(amount);
  if (currency === 'USDT') {
    if (from === 'spot' && to === 'futures') {
      if (user.balances.usdt < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Spot USDT tidak cukup' });
      }
      user.balances.usdt -= numAmount;
      user.futuresBalances.usdt += numAmount;
    } else if (from === 'futures' && to === 'spot') {
      if (user.futuresBalances.usdt < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Futures USDT tidak cukup' });
      }
      user.futuresBalances.usdt -= numAmount;
      user.balances.usdt += numAmount;
    } else if (from === 'spot' && to === 'pro') {
      if (user.balances.usdt < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Spot USDT tidak cukup' });
      }
      user.balances.usdt -= numAmount;
      user.proBalances.usdt += numAmount;
    } else if (from === 'pro' && to === 'spot') {
      if (user.proBalances.usdt < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Pro Spot USDT tidak cukup' });
      }
      user.proBalances.usdt -= numAmount;
      user.balances.usdt += numAmount;
    }
  } else if (currency === 'IDR') {
    if (from === 'spot' && to === 'pro') {
      if (user.balances.idr < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Spot Rupiah tidak cukup' });
      }
      user.balances.idr -= numAmount;
      user.proBalances.idr += numAmount;
    } else if (from === 'pro' && to === 'spot') {
      if (user.proBalances.idr < numAmount) {
        return res.status(400).json({ success: false, message: 'Saldo Pro Spot Rupiah tidak cukup' });
      }
      user.proBalances.idr -= numAmount;
      user.balances.idr += numAmount;
    }
  }

  res.json({ success: true, user });
});

// Trading: Spot
app.post('/api/trade/spot', (req, res) => {
  const { symbol, side, type, amount, price } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const market = markets.find((m) => m.symbol === symbol.toUpperCase());
  if (!market) return res.status(404).json({ success: false, message: 'Market not found' });

  const tradePrice = type === 'MARKET' ? market.priceIdr : Number(price);
  const tradeAmount = Number(amount);
  const totalCost = tradePrice * tradeAmount;

  if (!user.compoundingBalances) {
    user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
  }

  if (side === 'BUY') {
    if (user.balances.idr < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Saldo Rupiah Biasa (Top-Up) tidak mencukupi (Dibutuhkan: Rp ${totalCost.toLocaleString('id-ID')})`,
      });
    }
    user.balances.idr -= totalCost;
    user.balances.tokens[market.symbol] = (user.balances.tokens[market.symbol] || 0) + tradeAmount;
    // Pindahkan nilai pembelian ke Saldo Compounding (Aset Dibelikan)
    user.compoundingBalances.idr = (user.compoundingBalances.idr || 0) + totalCost;
  } else {
    // SELL
    const currentTokenBalance = user.balances.tokens[market.symbol] || 0;
    if (currentTokenBalance < tradeAmount) {
      return res.status(400).json({
        success: false,
        message: `Saldo ${market.symbol} tidak mencukupi`,
      });
    }
    user.balances.tokens[market.symbol] -= tradeAmount;
    user.balances.idr += totalCost;
    if ((user.compoundingBalances.idr || 0) >= totalCost) {
      user.compoundingBalances.idr -= totalCost;
    } else {
      user.compoundingBalances.idr = 0;
    }
  }

  const order = {
    id: 'spot_' + Date.now(),
    userId: user.id,
    symbol: market.symbol,
    side,
    type,
    price: tradePrice,
    amount: tradeAmount,
    totalIdr: totalCost,
    status: 'FILLED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  spotOrders.unshift(order);

  res.json({ success: true, order, user });
});

// Trading: Futures
app.post('/api/trade/futures', (req, res) => {
  const { symbol, side, leverage, marginMode, amountUsdt, tpPrice, slPrice } = req.body;
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const market = markets.find((m) => m.symbol === symbol.toUpperCase()) || markets[0];
  const sizeMargin = Number(amountUsdt);
  const lev = Number(leverage) || 25;

  if (user.futuresBalances.usdt < sizeMargin) {
    return res.status(400).json({
      success: false,
      message: `Margin USDT Futures tidak mencukupi (Saldo: ${user.futuresBalances.usdt} USDT)`,
    });
  }

  user.futuresBalances.usdt -= sizeMargin;

  const totalPositionSize = sizeMargin * lev;
  const entryPrice = market.priceUsdt;
  const sizeCoin = Number((totalPositionSize / entryPrice).toFixed(4));
  
  // Calculate liquidation price
  const liqBuffer = entryPrice / lev;
  const liquidationPrice = side === 'LONG' ? Math.max(entryPrice - liqBuffer * 0.9, 0) : entryPrice + liqBuffer * 0.9;

  const newPosition = {
    id: 'pos_' + Date.now(),
    userId: user.id,
    symbol: market.symbol,
    side,
    leverage: lev,
    marginMode: marginMode || 'CROSS',
    entryPrice,
    markPrice: entryPrice,
    sizeUsdt: totalPositionSize,
    sizeCoin,
    margin: sizeMargin,
    liquidationPrice: Number(liquidationPrice.toFixed(1)),
    pnlUsdt: 0,
    pnlPercentage: 0,
    tpPrice: tpPrice ? Number(tpPrice) : undefined,
    slPrice: slPrice ? Number(slPrice) : undefined,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  futuresPositions.unshift(newPosition);
  res.json({ success: true, position: newPosition, user });
});

app.post('/api/trade/futures/close/:id', (req, res) => {
  const posIndex = futuresPositions.findIndex((p) => p.id === req.params.id);
  if (posIndex === -1) {
    return res.status(404).json({ success: false, message: 'Posisi tidak ditemukan' });
  }

  const pos = futuresPositions[posIndex];
  const user = users.find((u) => u.id === pos.userId);
  if (user) {
    const returnAmount = Math.max(pos.margin + pos.pnlUsdt, 0);
    user.futuresBalances.usdt = Number((user.futuresBalances.usdt + returnAmount).toFixed(2));
  }

  futuresPositions.splice(posIndex, 1);
  res.json({ success: true, message: 'Posisi berhasil ditutup', user });
});

app.get('/api/user/positions', (req, res) => {
  const userPositions = futuresPositions.filter((p) => p.userId === currentUserId);
  res.json({ success: true, data: userPositions });
});

app.get('/api/user/orders', (req, res) => {
  const userOrders = spotOrders.filter((o) => o.userId === currentUserId);
  const userTxs = transactions.filter((t) => t.userId === currentUserId);
  res.json({ success: true, spotOrders: userOrders, transactions: userTxs });
});

// Content
app.get('/api/content/news', (req, res) => {
  res.json({ success: true, data: newsArticles });
});

app.get('/api/content/academy', (req, res) => {
  res.json({ success: true, data: academyItems });
});

app.get('/api/announcements', (req, res) => {
  res.json({ success: true, data: announcements });
});

// System Configuration
let systemConfig = {
  maintenanceMode: false,
  exchangeStatus: 'NORMAL', // 'NORMAL' | 'DEGRADED' | 'MAINTENANCE'
  makerFeeRate: 0.001, // 0.1%
  takerFeeRate: 0.0015, // 0.15%
  maxFuturesLeverage: 25,
  minDepositIdr: 10000,
  minWithdrawIdr: 50000,
  kycRequiredForWithdraw: true,
  globalBannerText: 'Sistem Trading berjalan normal. Likuiditas terjamin 100% didukung Audit On-Chain.',
  globalBannerEnabled: true,
  withdrawalTaxPercent: 0,
  telegramLink: '',
};

// Admin Dashboard & Comprehensive CRUD Endpoints
// 1. Stats & Overview
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = users.length;
  const totalPositions = futuresPositions.length;
  const totalSpotOrders = spotOrders.length;
  const totalVolumeIdr = spotOrders.reduce((acc, o) => acc + (o.totalIdr || 0), 0) + 1450000000;
  const totalDepositsIdr = transactions
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'COMPLETED' && t.currency === 'IDR')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawalsIdr = transactions
    .filter((t) => t.type === 'WITHDRAW' && t.status === 'COMPLETED' && t.currency === 'IDR')
    .reduce((acc, t) => acc + t.amount, 0);
  
  res.json({
    success: true,
    data: {
      totalUsers,
      totalPositions,
      totalSpotOrders,
      totalVolumeIdr,
      totalDepositsIdr,
      totalWithdrawalsIdr,
      activeMarkets: markets.length,
      pendingDeposits: transactions.filter((t) => t.status === 'PENDING').length,
      systemConfig,
    },
  });
});

// 2. System Settings & Bank Accounts CRUD
app.get('/api/bank-accounts', (req, res) => {
  res.json({ success: true, data: bankAccounts.filter((b) => b.isActive) });
});

app.get('/api/admin/bank-accounts', (req, res) => {
  res.json({ success: true, data: bankAccounts });
});

app.post('/api/admin/bank-accounts/create', (req, res) => {
  const { bankName, bankCode, accountNumber, accountHolder, category, isActive, notes } = req.body;
  if (!bankName || !accountNumber || !accountHolder) {
    return res.status(400).json({ success: false, message: 'Nama bank, nomor rekening, dan nama pemilik wajib diisi' });
  }

  const newAccount = {
    id: `bank_${Date.now()}`,
    bankName,
    bankCode: bankCode || bankName.substring(0, 6).toUpperCase(),
    accountNumber,
    accountHolder,
    category: category || 'Transfer Bank',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    notes: notes || '',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  bankAccounts.unshift(newAccount);
  res.json({ success: true, data: newAccount, message: 'Rekening bank berhasil ditambahkan!' });
});

app.put('/api/admin/bank-accounts/:id', (req, res) => {
  const { id } = req.params;
  const idx = bankAccounts.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Rekening bank tidak ditemukan' });
  }

  bankAccounts[idx] = { ...bankAccounts[idx], ...req.body };
  res.json({ success: true, data: bankAccounts[idx], message: 'Rekening bank berhasil diperbarui!' });
});

app.post('/api/admin/bank-accounts/:id/toggle', (req, res) => {
  const { id } = req.params;
  const acc = bankAccounts.find((b) => b.id === id);
  if (!acc) {
    return res.status(404).json({ success: false, message: 'Rekening bank tidak ditemukan' });
  }

  acc.isActive = !acc.isActive;
  res.json({ success: true, data: acc, message: `Status rekening diubah menjadi ${acc.isActive ? 'Aktif' : 'Non-Aktif'}` });
});

app.delete('/api/admin/bank-accounts/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = bankAccounts.length;
  bankAccounts = bankAccounts.filter((b) => b.id !== id);
  if (bankAccounts.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Rekening bank tidak ditemukan' });
  }

  res.json({ success: true, message: 'Rekening bank berhasil dihapus!' });
});

app.get('/api/admin/config', (req, res) => {
  res.json({ success: true, data: systemConfig });
});

app.post('/api/admin/config', (req, res) => {
  systemConfig = { ...systemConfig, ...req.body };
  res.json({ success: true, data: systemConfig, message: 'Konfigurasi sistem berhasil diperbarui!' });
});

app.get('/api/config', (req, res) => {
  res.json({ success: true, data: { telegramLink: systemConfig.telegramLink } });
});

// 3. Markets CRUD
app.get('/api/admin/markets', (req, res) => {
  res.json({ success: true, data: markets });
});

app.post('/api/admin/markets/create', (req, res) => {
  const { symbol, name, category, priceUsdt, icon, color, change24h, high24h, low24h, volume24hIdr, isHot, isGainer, isLoser } = req.body;
  if (!symbol || !name) {
    return res.status(400).json({ success: false, message: 'Simbol dan nama aset wajib diisi' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();
  const existing = markets.find((m) => m.symbol === cleanSymbol);
  if (existing) {
    return res.status(400).json({ success: false, message: `Aset dengan simbol ${cleanSymbol} sudah ada` });
  }

  const pUsdt = Number(priceUsdt) || 1.0;
  const pIdr = Math.round(pUsdt * 17584);
  const newAsset = {
    id: cleanSymbol.toLowerCase(),
    symbol: cleanSymbol,
    name: name.trim(),
    category: category || 'crypto',
    icon: icon || 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    color: color || '#0052FF',
    priceUsdt: pUsdt,
    priceIdr: pIdr,
    change24h: change24h !== undefined ? Number(change24h) : 1.5,
    high24h: high24h ? Number(high24h) : Math.round(pIdr * 1.05),
    low24h: low24h ? Number(low24h) : Math.round(pIdr * 0.95),
    volume24hIdr: volume24hIdr || '1,2B',
    volume24hUsdt: '500K',
    sparkline: [pUsdt * 0.95, pUsdt * 0.98, pUsdt * 1.01, pUsdt],
    isHot: Boolean(isHot),
    isGainer: Boolean(isGainer),
    isLoser: Boolean(isLoser),
  };
  markets.push(newAsset);
  res.json({ success: true, data: newAsset, message: `Aset ${cleanSymbol} berhasil ditambahkan!` });
});

app.put('/api/admin/markets/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const market = markets.find((m) => m.symbol === symbol);
  if (!market) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });

  const { name, category, priceUsdt, change24h, high24h, low24h, volume24hIdr, color, icon, isHot, isGainer, isLoser } = req.body;
  if (name) market.name = name;
  if (category) market.category = category;
  if (icon) market.icon = icon;
  if (color) market.color = color;
  if (priceUsdt !== undefined) {
    market.priceUsdt = Number(priceUsdt);
    market.priceIdr = Math.round(market.priceUsdt * 17584);
  }
  if (change24h !== undefined) market.change24h = Number(change24h);
  if (high24h !== undefined) market.high24h = Number(high24h);
  if (low24h !== undefined) market.low24h = Number(low24h);
  if (volume24hIdr) market.volume24hIdr = volume24hIdr;
  if (isHot !== undefined) market.isHot = Boolean(isHot);
  if (isGainer !== undefined) market.isGainer = Boolean(isGainer);
  if (isLoser !== undefined) market.isLoser = Boolean(isLoser);

  res.json({ success: true, data: market, message: `Aset ${symbol} berhasil diperbarui!` });
});

app.delete('/api/admin/markets/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const idx = markets.findIndex((m) => m.symbol === symbol);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });

  const deleted = markets.splice(idx, 1);
  res.json({ success: true, data: deleted[0], message: `Aset ${symbol} berhasil dihapus dari sistem!` });
});

app.post('/api/admin/markets/pump-dump', (req, res) => {
  const { symbol, percentage } = req.body; // e.g. +25 or -20
  const market = markets.find((m) => m.symbol === symbol.toUpperCase());
  if (!market) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });

  const multiplier = 1 + Number(percentage) / 100;
  market.priceUsdt = Number((market.priceUsdt * multiplier).toFixed(4));
  market.priceIdr = Math.round(market.priceUsdt * 17584);
  market.change24h = Number((market.change24h + Number(percentage)).toFixed(2));
  
  if (Number(percentage) > 0) {
    market.high24h = Math.max(market.high24h, market.priceIdr);
    market.isGainer = true;
    market.isLoser = false;
  } else {
    market.low24h = Math.min(market.low24h, market.priceIdr);
    market.isLoser = true;
    market.isGainer = false;
  }

  res.json({ success: true, data: market, message: `Simulasi ${percentage}% berhasil diaplikasikan ke ${market.symbol}!` });
});

app.post('/api/admin/markets/update-price', (req, res) => {
  const { symbol, newPriceUsdt, change24h } = req.body;
  const market = markets.find((m) => m.symbol === symbol.toUpperCase());
  if (!market) return res.status(404).json({ success: false, message: 'Asset not found' });

  if (newPriceUsdt) {
    market.priceUsdt = Number(newPriceUsdt);
    market.priceIdr = Math.round(market.priceUsdt * 17584);
  }
  if (change24h !== undefined) {
    market.change24h = Number(change24h);
  }

  res.json({ success: true, data: market });
});

// 4. Users CRUD
app.get('/api/admin/users', (req, res) => {
  res.json({ success: true, data: users });
});

app.put('/api/admin/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  const { name, email, phone, role, isVerified, isDummy, balances, proBalances, futuresBalances } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role && (role === 'user' || role === 'admin')) user.role = role;
  if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
  if (isDummy !== undefined) user.isDummy = Boolean(isDummy);
  if (balances) user.balances = { ...user.balances, ...balances };
  if (proBalances) user.proBalances = { ...user.proBalances, ...proBalances };
  if (futuresBalances) user.futuresBalances = { ...user.futuresBalances, ...futuresBalances };

  res.json({ success: true, user, message: `Akun ${user.name} berhasil diperbarui!` });
});

app.delete('/api/admin/users/:id', (req, res) => {
  if (users.length <= 1) {
    return res.status(400).json({ success: false, message: 'Minimal harus ada 1 akun di sistem' });
  }
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  const deleted = users.splice(idx, 1)[0];
  if (currentUserId === deleted.id) {
    currentUserId = users[0].id;
  }
  res.json({ success: true, message: `Akun ${deleted.name} berhasil dihapus!` });
});

app.post('/api/admin/users/:id/toggle-kyc', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  user.isVerified = !user.isVerified;
  res.json({ success: true, user, message: `Status KYC ${user.name} diubah ke ${user.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}` });
});

app.post('/api/admin/users/update-balance', (req, res) => {
  const { userId, idr, usdt, futuresUsdt, compoundingIdr, compoundingUsdt } = req.body;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (idr !== undefined) user.balances.idr = Number(idr);
  if (usdt !== undefined) user.balances.usdt = Number(usdt);
  if (futuresUsdt !== undefined) user.futuresBalances.usdt = Number(futuresUsdt);

  if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
  if (compoundingIdr !== undefined) user.compoundingBalances.idr = Number(compoundingIdr);
  if (compoundingUsdt !== undefined) user.compoundingBalances.usdt = Number(compoundingUsdt);

  res.json({ success: true, user });
});

app.post('/api/admin/users/update-role', (req, res) => {
  const { userId, role } = req.body;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'Role harus user atau admin' });
  }

  user.role = role;
  res.json({ success: true, user, message: `Role ${user.name} berhasil diubah menjadi ${role.toUpperCase()}` });
});

// 5. Spot Orders CRUD
app.get('/api/admin/spot/orders', (req, res) => {
  const ordersWithUser = spotOrders.map((o) => {
    const u = users.find((user) => user.id === o.userId);
    return { ...o, userName: u ? u.name : 'Unknown User', userEmail: u ? u.email : '-' };
  });
  res.json({ success: true, data: ordersWithUser });
});

app.post('/api/admin/spot/orders/create', (req, res) => {
  const { userId, symbol, side, type, price, amount, status } = req.body;
  const targetUser = users.find((u) => u.id === userId) || users[0];
  const market = markets.find((m) => m.symbol === symbol.toUpperCase()) || markets[0];
  const p = Number(price) || market.priceIdr;
  const a = Number(amount) || 1;

  const newOrder = {
    id: 'spot_' + Date.now(),
    userId: targetUser.id,
    symbol: market.symbol,
    side: side || 'BUY',
    type: type || 'MARKET',
    price: p,
    amount: a,
    totalIdr: Math.round(p * a),
    status: status || 'FILLED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  spotOrders.unshift(newOrder);
  res.json({ success: true, data: newOrder, message: 'Order spot berhasil dibuat oleh Admin' });
});

app.put('/api/admin/spot/orders/:id', (req, res) => {
  const order = spotOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

  const { status, price, amount } = req.body;
  if (status) order.status = status;
  if (price !== undefined) order.price = Number(price);
  if (amount !== undefined) order.amount = Number(amount);
  if (price !== undefined || amount !== undefined) {
    order.totalIdr = Math.round(order.price * order.amount);
  }

  res.json({ success: true, data: order, message: 'Order spot berhasil diperbarui!' });
});

app.delete('/api/admin/spot/orders/:id', (req, res) => {
  const idx = spotOrders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

  const deleted = spotOrders.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Order spot berhasil dihapus' });
});

// 6. Futures Positions CRUD
app.get('/api/admin/futures/positions', (req, res) => {
  const positionsWithUser = futuresPositions.map((pos) => {
    const u = users.find((user) => user.id === pos.userId);
    return { ...pos, userName: u ? u.name : 'Unknown User', userEmail: u ? u.email : '-' };
  });
  res.json({ success: true, data: positionsWithUser });
});

app.post('/api/admin/futures/positions/create', (req, res) => {
  const { userId, symbol, side, leverage, margin, entryPrice } = req.body;
  const targetUser = users.find((u) => u.id === userId) || users[0];
  const market = markets.find((m) => m.symbol === (symbol || 'BTC').toUpperCase()) || markets[0];
  const lev = Number(leverage) || 10;
  const mgn = Number(margin) || 100;
  const ep = Number(entryPrice) || market.priceUsdt;
  const sizeUsdt = mgn * lev;
  const sizeCoin = Number((sizeUsdt / ep).toFixed(4));
  const isLong = (side || 'LONG') === 'LONG';
  const liqDiff = (ep / lev) * 0.9;
  const liquidationPrice = isLong ? Math.max(ep - liqDiff, 0.01) : ep + liqDiff;

  const newPos = {
    id: 'pos_' + Date.now(),
    userId: targetUser.id,
    symbol: market.symbol,
    side: isLong ? 'LONG' : 'SHORT',
    leverage: lev,
    marginMode: 'CROSS',
    entryPrice: ep,
    markPrice: market.priceUsdt,
    sizeUsdt,
    sizeCoin,
    margin: mgn,
    liquidationPrice: Number(liquidationPrice.toFixed(1)),
    pnlUsdt: 0,
    pnlPercentage: 0,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  futuresPositions.unshift(newPos);
  res.json({ success: true, data: newPos, message: 'Posisi Futures berhasil dibuat oleh Admin' });
});

app.put('/api/admin/futures/positions/:id', (req, res) => {
  const pos = futuresPositions.find((p) => p.id === req.params.id);
  if (!pos) return res.status(404).json({ success: false, message: 'Posisi futures tidak ditemukan' });

  const { leverage, margin, liquidationPrice, pnlUsdt, pnlPercentage } = req.body;
  if (leverage !== undefined) pos.leverage = Number(leverage);
  if (margin !== undefined) pos.margin = Number(margin);
  if (liquidationPrice !== undefined) pos.liquidationPrice = Number(liquidationPrice);
  if (pnlUsdt !== undefined) pos.pnlUsdt = Number(pnlUsdt);
  if (pnlPercentage !== undefined) pos.pnlPercentage = Number(pnlPercentage);

  res.json({ success: true, data: pos, message: 'Posisi futures berhasil disesuaikan!' });
});

app.delete('/api/admin/futures/positions/:id', (req, res) => {
  const idx = futuresPositions.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Posisi futures tidak ditemukan' });

  const deleted = futuresPositions.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Posisi futures berhasil dilikuidasi / ditutup' });
});

// 7. Transactions & Finance CRUD
app.get('/api/admin/transactions', (req, res) => {
  const txWithUser = transactions.map((t) => {
    const u = users.find((user) => user.id === t.userId);
    return { ...t, userName: u ? u.name : 'Unknown User', userEmail: u ? u.email : '-' };
  });
  res.json({ success: true, data: txWithUser });
});

app.post('/api/admin/transactions/create', (req, res) => {
  const { userId, type, amount, currency, method, status, description } = req.body;
  const targetUser = users.find((u) => u.id === userId) || users[0];
  const newTx = {
    id: 'tx_' + Date.now(),
    userId: targetUser.id,
    type: type || 'DEPOSIT',
    amount: Number(amount) || 1000000,
    currency: currency || 'IDR',
    method: method || 'Admin Manual Credit',
    status: status || 'COMPLETED',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: description || 'Transaksi disuntikkan secara manual oleh Admin',
  };
  transactions.unshift(newTx);
  res.json({ success: true, data: newTx, message: 'Transaksi manual berhasil dicatat!' });
});

app.put('/api/admin/transactions/:id/status', (req, res) => {
  const tx = transactions.find((t) => t.id === req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

  const { status } = req.body;
  const previousStatus = tx.status;
  if (status) tx.status = status;

  // Credit user asset when approving pending deposit
  if (tx.type === 'DEPOSIT' && previousStatus === 'PENDING' && status === 'COMPLETED') {
    const user = users.find((u) => u.id === tx.userId);
    if (user) {
      if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
      if (!user.capitalBatches) user.capitalBatches = [];

      const now = new Date();
      const unlockDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 bulan (90 hari)

      if (tx.currency === 'IDR' || !tx.currency) {
        user.compoundingBalances.idr = (user.compoundingBalances.idr || 0) + Number(tx.amount);
        user.capitalBatches.push({
          id: 'batch_' + Date.now(),
          amount: Number(tx.amount),
          createdAt: now.toISOString(),
          unlockDate: unlockDate.toISOString(),
          isUnlocked: false,
        });
        const dateStr = unlockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        tx.description = `Modal Rp ${Number(tx.amount).toLocaleString('id-ID')} disetujui Admin. Langsung masuk ke ASET (Compounding 1%/hari, terkunci s/d ${dateStr})`;
      } else if (tx.currency === 'USDT') {
        user.compoundingBalances.usdt = (user.compoundingBalances.usdt || 0) + Number(tx.amount);
        tx.description = `Deposit ${tx.currency} disetujui Admin pada ${new Date().toLocaleTimeString('id-ID')}`;
      }
    }
  }

  res.json({ success: true, data: tx, message: `Status transaksi berhasil diubah ke ${status}` });
});

app.delete('/api/admin/transactions/:id', (req, res) => {
  const idx = transactions.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

  const deleted = transactions.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Log transaksi berhasil dihapus' });
});

// 8. CMS: News Articles CRUD
app.post('/api/admin/news/create', (req, res) => {
  const { title, source, category, imageUrl, summary } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul berita wajib diisi' });

  const newArticle = {
    id: 'news_' + Date.now(),
    title: title.trim(),
    source: source || 'Crypto Editorial',
    timeAgo: 'Baru saja',
    category: category || 'Altcoin',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    summary: summary || title,
  };
  newsArticles.unshift(newArticle);
  res.json({ success: true, data: newArticle, message: 'Berita baru berhasil dipublikasikan!' });
});

app.put('/api/admin/news/:id', (req, res) => {
  const article = newsArticles.find((n) => n.id === req.params.id);
  if (!article) return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });

  const { title, source, category, imageUrl, summary } = req.body;
  if (title) article.title = title;
  if (source) article.source = source;
  if (category) article.category = category;
  if (imageUrl) article.imageUrl = imageUrl;
  if (summary) article.summary = summary;

  res.json({ success: true, data: article, message: 'Berita berhasil diperbarui!' });
});

app.delete('/api/admin/news/:id', (req, res) => {
  const idx = newsArticles.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });

  const deleted = newsArticles.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Berita berhasil dihapus' });
});

// 9. CMS: Academy Items CRUD
app.post('/api/admin/academy/create', (req, res) => {
  const { title, readTime, level, imageUrl, category, description } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul edukasi wajib diisi' });

  const newItem = {
    id: 'acad_' + Date.now(),
    title: title.trim(),
    readTime: readTime || '4 min baca',
    level: level || 'Pemula',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
    category: category || 'Investasi',
    description: description || title,
  };
  academyItems.unshift(newItem);
  res.json({ success: true, data: newItem, message: 'Materi Akademi baru berhasil ditambahkan!' });
});

app.put('/api/admin/academy/:id', (req, res) => {
  const item = academyItems.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Materi Akademi tidak ditemukan' });

  const { title, readTime, level, imageUrl, category, description } = req.body;
  if (title) item.title = title;
  if (readTime) item.readTime = readTime;
  if (level) item.level = level;
  if (imageUrl) item.imageUrl = imageUrl;
  if (category) item.category = category;
  if (description) item.description = description;

  res.json({ success: true, data: item, message: 'Materi Akademi berhasil diperbarui!' });
});

app.delete('/api/admin/academy/:id', (req, res) => {
  const idx = academyItems.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Materi tidak ditemukan' });

  const deleted = academyItems.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Materi Akademi berhasil dihapus' });
});

// 10. CMS: Announcements & Banners CRUD
app.post('/api/admin/announcements/create', (req, res) => {
  const { title, content, type, active } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul pengumuman wajib diisi' });

  const newAnn = {
    id: 'ann_' + Date.now(),
    title: title.trim(),
    content: content || title,
    type: type || 'warning',
    active: active !== undefined ? Boolean(active) : true,
  };
  announcements.unshift(newAnn);
  res.json({ success: true, data: newAnn, message: 'Pengumuman baru berhasil disiarkan!' });
});

app.put('/api/admin/announcements/:id', (req, res) => {
  const ann = announcements.find((a) => a.id === req.params.id);
  if (!ann) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

  const { title, content, type, active } = req.body;
  if (title) ann.title = title;
  if (content) ann.content = content;
  if (type) ann.type = type;
  if (active !== undefined) ann.active = Boolean(active);

  res.json({ success: true, data: ann, message: 'Pengumuman berhasil diperbarui!' });
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  const idx = announcements.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

  const deleted = announcements.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Pengumuman berhasil dihapus' });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

app.get('/api/admin/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

app.post('/api/admin/notifications/broadcast', (req, res) => {
  const { title, message, type, target } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Judul dan pesan notifikasi wajib diisi' });
  }

  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const newNotif = {
    id: 'notif_' + Date.now(),
    title: title.trim(),
    message: message.trim(),
    type: type || 'info',
    target: target || 'ALL',
    createdAt: dateStr,
  };

  notifications.unshift(newNotif);
  res.json({ success: true, data: newNotif, message: 'Notifikasi berhasil disiarkan ke seluruh pengguna!' });
});

app.delete('/api/admin/notifications/:id', (req, res) => {
  const idx = notifications.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });

  const deleted = notifications.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Notifikasi berhasil dihapus' });
});

// Alias Endpoints for CMS
app.get('/api/cms/news', (req, res) => {
  res.json({ success: true, data: newsArticles });
});

app.get('/api/cms/academy', (req, res) => {
  res.json({ success: true, data: academyItems });
});

app.get('/api/cms/announcements', (req, res) => {
  res.json({ success: true, data: announcements });
});

app.post('/api/cms/news/create', (req, res) => {
  const { title, source, category, imageUrl, summary } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul berita wajib diisi' });

  const newArticle = {
    id: 'news_' + Date.now(),
    title: title.trim(),
    source: source || 'Crypto Editorial',
    timeAgo: 'Baru saja',
    category: category || 'Altcoin',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    summary: summary || title,
  };
  newsArticles.unshift(newArticle);
  res.json({ success: true, data: newArticle, message: 'Berita baru berhasil dipublikasikan!' });
});

app.put('/api/cms/news/:id', (req, res) => {
  const article = newsArticles.find((n) => n.id === req.params.id);
  if (!article) return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });

  const { title, source, category, imageUrl, summary } = req.body;
  if (title) article.title = title;
  if (source) article.source = source;
  if (category) article.category = category;
  if (imageUrl) article.imageUrl = imageUrl;
  if (summary) article.summary = summary;

  res.json({ success: true, data: article, message: 'Berita berhasil diperbarui!' });
});

app.delete('/api/cms/news/:id', (req, res) => {
  const idx = newsArticles.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });

  const deleted = newsArticles.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Berita berhasil dihapus' });
});

app.post('/api/cms/academy/create', (req, res) => {
  const { title, readTime, level, imageUrl, category, description } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul edukasi wajib diisi' });

  const newItem = {
    id: 'acad_' + Date.now(),
    title: title.trim(),
    readTime: readTime || '4 min baca',
    level: level || 'Pemula',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80',
    category: category || 'Investasi',
    description: description || title,
  };
  academyItems.unshift(newItem);
  res.json({ success: true, data: newItem, message: 'Materi Akademi baru berhasil ditambahkan!' });
});

app.put('/api/cms/academy/:id', (req, res) => {
  const item = academyItems.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Materi Akademi tidak ditemukan' });

  const { title, readTime, level, imageUrl, category, description } = req.body;
  if (title) item.title = title;
  if (readTime) item.readTime = readTime;
  if (level) item.level = level;
  if (imageUrl) item.imageUrl = imageUrl;
  if (category) item.category = category;
  if (description) item.description = description;

  res.json({ success: true, data: item, message: 'Materi Akademi berhasil diperbarui!' });
});

app.delete('/api/cms/academy/:id', (req, res) => {
  const idx = academyItems.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Materi tidak ditemukan' });

  const deleted = academyItems.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Materi Akademi berhasil dihapus' });
});

app.post('/api/cms/announcements/create', (req, res) => {
  const { title, content, type, active } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Judul pengumuman wajib diisi' });

  const newAnn = {
    id: 'ann_' + Date.now(),
    title: title.trim(),
    content: content || title,
    type: type || 'warning',
    active: active !== undefined ? Boolean(active) : true,
  };
  announcements.unshift(newAnn);
  res.json({ success: true, data: newAnn, message: 'Pengumuman baru berhasil disiarkan!' });
});

app.put('/api/cms/announcements/:id', (req, res) => {
  const ann = announcements.find((a) => a.id === req.params.id);
  if (!ann) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

  const { title, content, type, active } = req.body;
  if (title) ann.title = title;
  if (content) ann.content = content;
  if (type) ann.type = type;
  if (active !== undefined) ann.active = Boolean(active);

  res.json({ success: true, data: ann, message: 'Pengumuman berhasil diperbarui!' });
});

app.delete('/api/cms/announcements/:id', (req, res) => {
  const idx = announcements.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });

  const deleted = announcements.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Pengumuman berhasil dihapus' });
});

// 11. Compounding Management & Trigger Endpoints
app.get('/api/admin/compounding', (req, res) => {
  res.json({
    success: true,
    settings: compoundingSettings,
    logs: compoundingLogs,
  });
});

app.put('/api/admin/compounding/settings', (req, res) => {
  const {
    enabled,
    payoutFrequency,
    targetBalanceType,
    minBalanceRequirement,
    applyToRole,
    autoDistributionCron,
  } = req.body;

  if (enabled !== undefined) compoundingSettings.enabled = Boolean(enabled);
  compoundingSettings.dailyRate = 1.0; // System Fixed 1.0%
  if (payoutFrequency) compoundingSettings.payoutFrequency = payoutFrequency;
  if (targetBalanceType) compoundingSettings.targetBalanceType = targetBalanceType;
  if (minBalanceRequirement !== undefined && !isNaN(Number(minBalanceRequirement))) {
    compoundingSettings.minBalanceRequirement = Number(minBalanceRequirement);
  }
  if (applyToRole) compoundingSettings.applyToRole = applyToRole;
  if (autoDistributionCron !== undefined) compoundingSettings.autoDistributionCron = Boolean(autoDistributionCron);

  res.json({
    success: true,
    data: compoundingSettings,
    message: `Pengaturan Compounding (Fixed 1.0% / hari) berhasil diperbarui!`,
  });
});

app.post('/api/admin/compounding/trigger', (req, res) => {
  const rate = 1.0; // System Fixed 1.0% per hari
  compoundingSettings.dailyRate = 1.0;
  let totalIdrDistributed = 0;
  let totalUsdtDistributed = 0;
  let recipientsCount = 0;

  users.forEach((user) => {
    // Check role filter
    if (compoundingSettings.applyToRole === 'USER_ONLY' && user.role === 'admin') {
      return;
    }

    if (!user.compoundingBalances) {
      user.compoundingBalances = { idr: 25000000, usdt: 1500, tokens: {} };
    }

    let idrYield = 0;
    let usdtYield = 0;

    const cmpIdr = user.compoundingBalances.idr || 0;
    const cmpUsdt = user.compoundingBalances.usdt || 0;

    // Check IDR Compounding Balance (Saldo Dibelikan)
    if (
      (compoundingSettings.targetBalanceType === 'ALL' || compoundingSettings.targetBalanceType === 'IDR') &&
      cmpIdr >= compoundingSettings.minBalanceRequirement
    ) {
      idrYield = Math.round(cmpIdr * (rate / 100));
      user.compoundingProfitIdr = (user.compoundingProfitIdr || 0) + idrYield;
      totalIdrDistributed += idrYield;
    }

    // Check USDT Compounding Balance
    const minUsdt = compoundingSettings.minBalanceRequirement > 0 ? compoundingSettings.minBalanceRequirement / 15000 : 1;
    if (
      (compoundingSettings.targetBalanceType === 'ALL' || compoundingSettings.targetBalanceType === 'USDT') &&
      cmpUsdt >= minUsdt
    ) {
      usdtYield = Number((cmpUsdt * (rate / 100)).toFixed(2));
      user.compoundingBalances.usdt += usdtYield;
      totalUsdtDistributed += usdtYield;
    }

    if (idrYield > 0 || usdtYield > 0) {
      recipientsCount++;

      // Create transaction record for audit log
      if (idrYield > 0) {
        transactions.unshift({
          id: 'tx_cmp_idr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'REWARD',
          amount: idrYield,
          currency: 'IDR',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleString('id-ID'),
          method: 'Compounding Yield Auto',
          description: `Bunga Compounding Harian ${rate}% (+Rp ${idrYield.toLocaleString('id-ID')})`,
        });
      }

      if (usdtYield > 0) {
        transactions.unshift({
          id: 'tx_cmp_usdt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type: 'REWARD',
          amount: usdtYield,
          currency: 'USDT',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleString('id-ID'),
          method: 'Compounding Yield Auto',
          description: `Bunga Compounding Harian ${rate}% (+${usdtYield} USDT)`,
        });
      }
    }
  });

  const nowStr = new Date().toLocaleString('id-ID');
  compoundingSettings.lastDistributedAt = nowStr;
  compoundingSettings.totalProfitDistributedIdr += totalIdrDistributed;
  compoundingSettings.totalProfitDistributedUsdt += totalUsdtDistributed;

  const logEntry = {
    id: 'cmp_log_' + Date.now(),
    timestamp: nowStr,
    rateApplied: rate,
    recipientsCount,
    totalIdrDistributed,
    totalUsdtDistributed,
    status: 'SUCCESS',
    triggeredBy: req.body?.triggeredBy || 'ADMIN_MANUAL',
    note: `Pembagian compounding ${rate}%/hari berhasil dikreditkan ke ${recipientsCount} akun pengguna.`,
  };

  compoundingLogs.unshift(logEntry);

  res.json({
    success: true,
    data: logEntry,
    settings: compoundingSettings,
    message: `Eksekusi compounding ${rate}%/hari berhasil! Saldo telah dikreditkan ke ${recipientsCount} akun pengguna.`,
  });
});

app.delete('/api/admin/compounding/logs/:id', (req, res) => {
  const idx = compoundingLogs.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Log compounding tidak ditemukan' });

  const deleted = compoundingLogs.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Log compounding berhasil dihapus' });
});

// Fallback 404 for unhandled API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API Route Not Found: ${req.method} ${req.originalUrl}` });
});


async function startServer() {
  if (process.env.NODE_ENV === 'development') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trading Backend & Frontend running on http://localhost:${PORT}`);
  });
}

startServer();
