import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent Database Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

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
    change24h: 3.45,
    high24h: 1368552000,
    low24h: 1329004000,
    volume24hIdr: '124,5B',
    volume24hUsdt: '7,08M',
    sparkline: [74500, 75200, 75800, 76400, 76800, 77250],
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
    change24h: 1.85,
    high24h: 43500000,
    low24h: 41800000,
    volume24hIdr: '68,2B',
    volume24hUsdt: '3,88M',
    sparkline: [2380, 2395, 2410, 2400, 2415, 2420.5],
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
    priceIdr: 2750000,
    priceUsdt: 156.4,
    change24h: 6.24,
    high24h: 2820000,
    low24h: 2580000,
    volume24hIdr: '45,8B',
    volume24hUsdt: '2,60M',
    sparkline: [142, 146, 149, 151, 154, 156.4],
    isHot: true,
    isGainer: true,
    isFavorite: true,
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
    change24h: 0.02,
    high24h: 17610,
    low24h: 17550,
    volume24hIdr: '185,0B',
    volume24hUsdt: '10,5M',
    sparkline: [17580, 17582, 17584],
    isFavorite: true,
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
    change24h: 2.40,
    high24h: 12450000,
    low24h: 11950000,
    volume24hIdr: '22,4M',
    volume24hUsdt: '1,27M',
    sparkline: [678, 684, 689, 695.1],
    isHot: true,
    isFavorite: true,
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP (Ripple)',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    color: '#23292F',
    priceIdr: 26342,
    priceUsdt: 1.498,
    change24h: 4.82,
    high24h: 27500,
    low24h: 25100,
    volume24hIdr: '34,2B',
    volume24hUsdt: '1,94M',
    sparkline: [1.38, 1.42, 1.46, 1.498],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    color: '#0033AD',
    priceIdr: 14250,
    priceUsdt: 0.81,
    change24h: 5.12,
    high24h: 14600,
    low24h: 13500,
    volume24hIdr: '18,5B',
    volume24hUsdt: '1,05M',
    sparkline: [0.76, 0.78, 0.79, 0.81],
    isGainer: true,
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    color: '#C2A633',
    priceIdr: 4620,
    priceUsdt: 0.263,
    change24h: 8.75,
    high24h: 4850,
    low24h: 4150,
    volume24hIdr: '52,8B',
    volume24hUsdt: '3,00M',
    sparkline: [0.23, 0.24, 0.25, 0.263],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    color: '#E84142',
    priceIdr: 495000,
    priceUsdt: 28.15,
    change24h: 3.80,
    high24h: 512000,
    low24h: 472000,
    volume24hIdr: '14,2B',
    volume24hUsdt: '807K',
    sparkline: [26.8, 27.2, 27.9, 28.15],
  },
  {
    id: 'dot',
    symbol: 'DOT',
    name: 'Polkadot',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    color: '#E6007A',
    priceIdr: 128500,
    priceUsdt: 7.31,
    change24h: 2.15,
    high24h: 132000,
    low24h: 124000,
    volume24hIdr: '9,4B',
    volume24hUsdt: '534K',
    sparkline: [7.05, 7.15, 7.22, 7.31],
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    color: '#375BD2',
    priceIdr: 285000,
    priceUsdt: 16.21,
    change24h: 4.30,
    high24h: 294000,
    low24h: 271000,
    volume24hIdr: '16,8B',
    volume24hUsdt: '955K',
    sparkline: [15.2, 15.6, 15.9, 16.21],
  },
  {
    id: 'matic',
    symbol: 'MATIC',
    name: 'Polygon',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
    color: '#8247E5',
    priceIdr: 8950,
    priceUsdt: 0.509,
    change24h: 3.10,
    high24h: 9200,
    low24h: 8600,
    volume24hIdr: '12,3B',
    volume24hUsdt: '699K',
    sparkline: [0.48, 0.49, 0.50, 0.509],
  },
  {
    id: 'trx',
    symbol: 'TRX',
    name: 'TRON',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
    color: '#EF0027',
    priceIdr: 4120,
    priceUsdt: 0.234,
    change24h: 1.45,
    high24h: 4200,
    low24h: 4050,
    volume24hIdr: '8,7B',
    volume24hUsdt: '494K',
    sparkline: [0.228, 0.231, 0.234],
  },
  {
    id: 'shib',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    color: '#FFA409',
    priceIdr: 0.385,
    priceUsdt: 0.0000219,
    change24h: 7.60,
    high24h: 0.41,
    low24h: 0.35,
    volume24hIdr: '28,5B',
    volume24hUsdt: '1,62M',
    sparkline: [0.0000195, 0.0000205, 0.0000219],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'ton',
    symbol: 'TON',
    name: 'Toncoin',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
    color: '#0098EA',
    priceIdr: 96500,
    priceUsdt: 5.48,
    change24h: 2.85,
    high24h: 99000,
    low24h: 93500,
    volume24hIdr: '11,2B',
    volume24hUsdt: '636K',
    sparkline: [5.25, 5.35, 5.48],
  },
  {
    id: 'near',
    symbol: 'NEAR',
    name: 'Near Protocol',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/10365/small/near.png',
    color: '#000000',
    priceIdr: 108500,
    priceUsdt: 6.17,
    change24h: 5.40,
    high24h: 112000,
    low24h: 102000,
    volume24hIdr: '15,6B',
    volume24hUsdt: '887K',
    sparkline: [5.75, 5.95, 6.17],
    isGainer: true,
  },
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui Network',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png',
    color: '#4DA2FF',
    priceIdr: 58500,
    priceUsdt: 3.32,
    change24h: 9.15,
    high24h: 61000,
    low24h: 52000,
    volume24hIdr: '42,1B',
    volume24hUsdt: '2,39M',
    sparkline: [2.95, 3.12, 3.32],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'apt',
    symbol: 'APT',
    name: 'Aptos',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    color: '#10B981',
    priceIdr: 185000,
    priceUsdt: 10.52,
    change24h: 4.25,
    high24h: 192000,
    low24h: 176000,
    volume24hIdr: '13,8B',
    volume24hUsdt: '784K',
    sparkline: [9.95, 10.20, 10.52],
  },
  {
    id: 'pepe',
    symbol: 'PEPE',
    name: 'Pepe',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.png',
    color: '#4FA345',
    priceIdr: 0.178,
    priceUsdt: 0.0000101,
    change24h: 14.80,
    high24h: 0.195,
    low24h: 0.152,
    volume24hIdr: '64,2B',
    volume24hUsdt: '3,65M',
    sparkline: [0.0000085, 0.0000092, 0.0000101],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'render',
    symbol: 'RENDER',
    name: 'Render Network',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
    color: '#E53E3E',
    priceIdr: 115000,
    priceUsdt: 6.54,
    change24h: 6.70,
    high24h: 119000,
    low24h: 106000,
    volume24hIdr: '19,5B',
    volume24hUsdt: '1,10M',
    sparkline: [5.95, 6.25, 6.54],
    isGainer: true,
  },
  {
    id: 'uni',
    symbol: 'UNI',
    name: 'Uniswap',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    color: '#FF007A',
    priceIdr: 178000,
    priceUsdt: 10.12,
    change24h: 3.40,
    high24h: 184000,
    low24h: 171000,
    volume24hIdr: '12,8B',
    volume24hUsdt: '727K',
    sparkline: [9.65, 9.85, 10.12],
  },
  {
    id: 'ltc',
    symbol: 'LTC',
    name: 'Litecoin',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
    color: '#345D9D',
    priceIdr: 1545000,
    priceUsdt: 87.86,
    change24h: 2.10,
    high24h: 1580000,
    low24h: 1505000,
    volume24hIdr: '14,6B',
    volume24hUsdt: '830K',
    sparkline: [85.2, 86.5, 87.86],
  },
  {
    id: 'tao',
    symbol: 'TAO',
    name: 'Bittensor',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/28362/small/bittensor.png',
    color: '#1E293B',
    priceIdr: 8450000,
    priceUsdt: 480.5,
    change24h: 8.90,
    high24h: 8750000,
    low24h: 7650000,
    volume24hIdr: '31,2B',
    volume24hUsdt: '1,77M',
    sparkline: [435, 455, 480.5],
    isHot: true,
    isGainer: true,
  },
  {
    id: 'kas',
    symbol: 'KAS',
    name: 'Kaspa',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/25751/small/kaspa-icon.png',
    color: '#70C7BA',
    priceIdr: 2650,
    priceUsdt: 0.1507,
    change24h: 4.80,
    high24h: 2780,
    low24h: 2480,
    volume24hIdr: '10,5B',
    volume24hUsdt: '597K',
    sparkline: [0.142, 0.146, 0.1507],
  },
  {
    id: 'atom',
    symbol: 'ATOM',
    name: 'Cosmos Hub',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    color: '#2E3148',
    priceIdr: 98500,
    priceUsdt: 5.60,
    change24h: 1.95,
    high24h: 101000,
    low24h: 96000,
    volume24hIdr: '8,2B',
    volume24hUsdt: '466K',
    sparkline: [5.42, 5.51, 5.60],
  },
  {
    id: 'inj',
    symbol: 'INJ',
    name: 'Injective',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png',
    color: '#00F3FF',
    priceIdr: 345000,
    priceUsdt: 19.62,
    change24h: 5.75,
    high24h: 360000,
    low24h: 322000,
    volume24hIdr: '17,4B',
    volume24hUsdt: '989K',
    sparkline: [18.2, 18.9, 19.62],
  },
  {
    id: 'arb',
    symbol: 'ARB',
    name: 'Arbitrum',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    color: '#28A0F0',
    priceIdr: 14200,
    priceUsdt: 0.807,
    change24h: 3.20,
    high24h: 14600,
    low24h: 13600,
    volume24hIdr: '11,5B',
    volume24hUsdt: '653K',
    sparkline: [0.77, 0.79, 0.807],
  },
  {
    id: 'op',
    symbol: 'OP',
    name: 'Optimism',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    color: '#FF0420',
    priceIdr: 31200,
    priceUsdt: 1.774,
    change24h: 4.10,
    high24h: 32500,
    low24h: 29800,
    volume24hIdr: '13,2B',
    volume24hUsdt: '750K',
    sparkline: [1.68, 1.72, 1.774],
  },
  {
    id: 'xlm',
    symbol: 'XLM',
    name: 'Stellar Lumens',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
    color: '#08B5E5',
    priceIdr: 6850,
    priceUsdt: 0.389,
    change24h: 6.45,
    high24h: 7150,
    low24h: 6350,
    volume24hIdr: '21,4B',
    volume24hUsdt: '1,21M',
    sparkline: [0.355, 0.372, 0.389],
    isGainer: true,
  },
  {
    id: 'xmr',
    symbol: 'XMR',
    name: 'Monero',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
    color: '#FF6600',
    priceIdr: 2980000,
    priceUsdt: 169.47,
    change24h: 1.80,
    high24h: 3040000,
    low24h: 2910000,
    volume24hIdr: '10,8B',
    volume24hUsdt: '614K',
    sparkline: [165, 167, 169.47],
  },
  {
    id: 'ptu',
    symbol: 'PTU',
    name: 'Pintu Token',
    category: 'crypto',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15112.png',
    color: '#0052FF',
    priceIdr: 1620,
    priceUsdt: 0.0921,
    change24h: 5.15,
    high24h: 1680,
    low24h: 1530,
    volume24hIdr: '58,4M',
    volume24hUsdt: '365K',
    sparkline: [1510, 1540, 1580, 1620],
    isHot: true,
    isGainer: true,
    isFavorite: true,
  },
  // Tokenized Global Stocks & Gold
  {
    id: 'xau',
    symbol: 'XAU',
    name: 'Emas Digital (Tether Gold)',
    category: 'komoditas',
    icon: 'https://assets.coingecko.com/coins/images/10481/small/Tether_Gold.png',
    color: '#D4AF37',
    priceIdr: 47250000,
    priceUsdt: 2687.1,
    change24h: 0.85,
    high24h: 47500000,
    low24h: 46800000,
    volume24hIdr: '48,5B',
    volume24hUsdt: '2,75M',
    sparkline: [2650, 2670, 2687.1],
    isHot: true,
    isFavorite: true,
  },
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
    change24h: 3.45,
    high24h: 4100000,
    low24h: 3880000,
    volume24hIdr: '22,1B',
    volume24hUsdt: '1,25M',
    sparkline: [215, 219, 222.9],
    isGainer: true,
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corp (Tokenized)',
    category: 'stocks',
    icon: 'https://assets.coingecko.com/coins/images/30359/small/microsoft.png',
    color: '#00A4EF',
    priceIdr: 7420000,
    priceUsdt: 421.9,
    change24h: 1.65,
    high24h: 7500000,
    low24h: 7350000,
    volume24hIdr: '14,8B',
    volume24hUsdt: '841K',
    sparkline: [415, 418, 421.9],
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet Google (Tokenized)',
    category: 'stocks',
    icon: 'https://assets.coingecko.com/coins/images/30360/small/google.png',
    color: '#EA4335',
    priceIdr: 3180000,
    priceUsdt: 180.8,
    change24h: 2.15,
    high24h: 3220000,
    low24h: 3120000,
    volume24hIdr: '16,2B',
    volume24hUsdt: '921K',
    sparkline: [176, 178, 180.8],
  },
  {
    id: 'ftm',
    symbol: 'FTM',
    name: 'Fantom',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/4001/small/Fantom.png',
    color: '#1969FF',
    priceIdr: 10540,
    priceUsdt: 0.60,
    change24h: 4.15,
    high24h: 11200,
    low24h: 9800,
    volume24hIdr: '18,4B',
    volume24hUsdt: '1,05M',
    sparkline: [0.55, 0.58, 0.60],
  },
  {
    id: 'jup',
    symbol: 'JUP',
    name: 'Jupiter',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/34188/small/jup.png',
    color: '#31C5C5',
    priceIdr: 17400,
    priceUsdt: 0.99,
    change24h: 5.30,
    high24h: 18400,
    low24h: 16500,
    volume24hIdr: '12,4B',
    volume24hUsdt: '705K',
    sparkline: [0.91, 0.95, 0.99],
  },
  {
    id: 'wif',
    symbol: 'WIF',
    name: 'dogwifhat',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.png',
    color: '#E4A853',
    priceIdr: 43080,
    priceUsdt: 2.45,
    change24h: 7.20,
    high24h: 46200,
    low24h: 39500,
    volume24hIdr: '35,1B',
    volume24hUsdt: '2,00M',
    sparkline: [2.15, 2.30, 2.45],
    isHot: true,
  },
  {
    id: 'bonk',
    symbol: 'BONK',
    name: 'Bonk',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/28600/small/bonk.png',
    color: '#F29C38',
    priceIdr: 0.38,
    priceUsdt: 0.0000216,
    change24h: 9.45,
    high24h: 0.42,
    low24h: 0.34,
    volume24hIdr: '18,9B',
    volume24hUsdt: '1,07M',
    sparkline: [0.000018, 0.000020, 0.0000216],
    isHot: true,
  },
  {
    id: 'fet',
    symbol: 'FET',
    name: 'Artificial Superintelligence Alliance',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.png',
    color: '#002E5F',
    priceIdr: 25320,
    priceUsdt: 1.44,
    change24h: 3.82,
    high24h: 26500,
    low24h: 24200,
    volume24hIdr: '22,6B',
    volume24hUsdt: '1,28M',
    sparkline: [1.35, 1.40, 1.44],
  },
  {
    id: 'tia',
    symbol: 'TIA',
    name: 'Celestia',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/31967/small/celestia.png',
    color: '#7B2CBF',
    priceIdr: 96360,
    priceUsdt: 5.48,
    change24h: 4.85,
    high24h: 101000,
    low24h: 92000,
    volume24hIdr: '14,8B',
    volume24hUsdt: '841K',
    sparkline: [5.12, 5.30, 5.48],
  },
  {
    id: 'sei',
    symbol: 'SEI',
    name: 'Sei Network',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/30748/small/sei-logo.png',
    color: '#B32424',
    priceIdr: 8790,
    priceUsdt: 0.50,
    change24h: 6.12,
    high24h: 9200,
    low24h: 8100,
    volume24hIdr: '16,2B',
    volume24hUsdt: '921K',
    sparkline: [0.45, 0.48, 0.50],
  },
  {
    id: 'aave',
    symbol: 'AAVE',
    name: 'Aave',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    color: '#B6509E',
    priceIdr: 2539000,
    priceUsdt: 144.4,
    change24h: 2.85,
    high24h: 2620000,
    low24h: 2480000,
    volume24hIdr: '11,4B',
    volume24hUsdt: '648K',
    sparkline: [138, 141, 144.4],
  },
  {
    id: 'ldo',
    symbol: 'LDO',
    name: 'Lido DAO',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png',
    color: '#00A3FF',
    priceIdr: 21980,
    priceUsdt: 1.25,
    change24h: -1.45,
    high24h: 23100,
    low24h: 21200,
    volume24hIdr: '9,5B',
    volume24hUsdt: '540K',
    sparkline: [1.32, 1.29, 1.25],
  },
  {
    id: 'floki',
    symbol: 'FLOKI',
    name: 'Floki',
    category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/18399/small/floki.png',
    color: '#FFB800',
    priceIdr: 2.25,
    priceUsdt: 0.000128,
    change24h: 8.12,
    high24h: 2.45,
    low24h: 2.05,
    volume24hIdr: '25,4B',
    volume24hUsdt: '1,45M',
    sparkline: [0.000115, 0.000121, 0.000128],
    isHot: true,
  },
];

let futuresPositions: any[] = [];
let bankAccounts: any[] = [
  {
    id: 'bank_1',
    bankName: 'Bank Central Asia (BCA)',
    bankCode: 'BCA',
    accountNumber: '8820 1948 2109 0012',
    accountHolder: 'PT CRYPTO INDONESIA',
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
    accountHolder: 'PT CRYPTO INDONESIA',
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
    accountHolder: 'PT CRYPTO INDONESIA',
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
    accountHolder: 'PT CRYPTO INDONESIA',
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
    accountHolder: 'PT CRYPTO INDONESIA',
    category: 'QRIS',
    isActive: true,
    notes: 'Pindai kode QR menggunakan GoPay, OVO, ShopeePay, Dana, LinkAja, atau m-Banking.',
    createdAt: '2026-08-01 00:00:00',
  },
];
const DEFAULT_RECEIPT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="580" viewBox="0 0 400 580" fill="none"><rect width="400" height="580" fill="%23f8fafc" rx="20"/><rect x="16" y="16" width="368" height="548" fill="%23ffffff" rx="16" stroke="%23cbd5e1" stroke-width="2"/><rect x="16" y="16" width="368" height="75" fill="%230052FF" rx="16"/><text x="36" y="58" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">BCA Mobile - M-Transfer</text><circle cx="345" cy="53" r="14" fill="%23ffffff" opacity="0.25"/><text x="36" y="125" fill="%231e293b" font-family="sans-serif" font-size="14" font-weight="bold">TRANSFER BANK BERHASIL</text><text x="36" y="145" fill="%2364748b" font-family="sans-serif" font-size="11">24 AGU 2026 14:22:18 WIB</text><line x1="36" y1="165" x2="364" y2="165" stroke="%23e2e8f0" stroke-width="1"/><text x="36" y="195" fill="%2364748b" font-family="sans-serif" font-size="11">Bank Tujuan</text><text x="36" y="215" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">BCA VIRTUAL ACCOUNT</text><text x="36" y="245" fill="%2364748b" font-family="sans-serif" font-size="11">No. VA / Rekening Tujuan</text><text x="36" y="265" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">8820 1948 2109 0012</text><text x="36" y="295" fill="%2364748b" font-family="sans-serif" font-size="11">Nama Penerima</text><text x="36" y="315" fill="%230052FF" font-family="sans-serif" font-size="13" font-weight="bold">PT CRYPTO INDONESIA</text><text x="36" y="345" fill="%2364748b" font-family="sans-serif" font-size="11">Pengirim / Remitter</text><text x="36" y="365" fill="%230f172a" font-family="sans-serif" font-size="13" font-weight="bold">BUDI SANTOSO</text><line x1="36" y1="385" x2="364" y2="385" stroke="%23e2e8f0" stroke-width="1"/><text x="36" y="415" fill="%2364748b" font-family="sans-serif" font-size="11">Jumlah Transfer Deposit</text><text x="36" y="440" fill="%2316a34a" font-family="sans-serif" font-size="22" font-weight="bold">Rp 10.000.000</text><text x="36" y="470" fill="%2364748b" font-family="sans-serif" font-size="11">No. Referensi Transaksi</text><text x="36" y="490" fill="%23334155" font-family="sans-serif" font-size="12" font-weight="bold">REF-20260824-99812</text><rect x="36" y="510" width="328" height="36" fill="%23ecfdf5" rx="8" stroke="%23a7f3d0"/><text x="200" y="533" text-anchor="middle" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold">✓ RESI SAH & TERKIRIM KE SISTEM EXCHANGE</text></svg>`;

let spotOrders: any[] = [];
let transactions: any[] = [];

let notifications = [
  {
    id: 'notif_1',
    title: '🎉 Selamat Datang di Exchange',
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
    source: 'Market News • Altcoin',
    timeAgo: '1 hari',
    category: 'Altcoin',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    summary: 'Aset kripto Polygon mencatatkan lonjakan tajam didorong peningkatan adopsi rollup Layer-2 dan integrasi ekosistem baru.',
  },
  {
    id: 'news_2',
    title: '3 Altcoin Ini Berdarah di Weekend, Anjlok Belasan Persen Menjelang Keputusan Suku Bunga Fed',
    source: 'Market News • Altcoin',
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

// PostgreSQL & Local Database Persistence Functions
let pgPool: Pool | null = null;
let isPgConnected = false;

function initPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[Database] DATABASE_URL not set in environment. Using local data/db.json storage.');
    return null;
  }

  try {
    const isSsl = connectionString.includes('sslmode=require') || connectionString.includes('ssl=true');
    const pool = new Pool({
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Idle client pool error:', err.message);
    });

    return pool;
  } catch (err: any) {
    console.error('[PostgreSQL] Failed to initialize connection pool:', err?.message || err);
    return null;
  }
}

function sanitizeUser(user: any) {
  if (!user) return user;
  if (!user.balances) {
    user.balances = { idr: 0, usdt: 0, btc: 0, eth: 0, sol: 0, ptu: 0, tokens: {} };
  } else {
    if (typeof user.balances.idr !== 'number') user.balances.idr = 0;
    if (typeof user.balances.usdt !== 'number') user.balances.usdt = 0;
    if (!user.balances.tokens) user.balances.tokens = {};
  }
  if (!user.compoundingBalances) {
    user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
  } else {
    if (typeof user.compoundingBalances.idr !== 'number') user.compoundingBalances.idr = 0;
    if (typeof user.compoundingBalances.usdt !== 'number') user.compoundingBalances.usdt = 0;
    if (!user.compoundingBalances.tokens) user.compoundingBalances.tokens = {};
  }
  if (typeof user.compoundingProfitIdr !== 'number') {
    user.compoundingProfitIdr = 0;
  }
  if (!Array.isArray(user.capitalBatches)) {
    user.capitalBatches = [];
  }
  if (!user.proBalances) {
    user.proBalances = { idr: 0, usdt: 0, tokens: {} };
  }
  if (!user.futuresBalances) {
    user.futuresBalances = { usdt: 0 };
  }
  return user;
}

function applyDatabaseState(data: any) {
  if (Array.isArray(data.users) && data.users.length > 0) {
    users = data.users.map(sanitizeUser);
  }
  if (data.currentUserId) currentUserId = data.currentUserId;
  if (Array.isArray(data.markets) && data.markets.length > 0) {
    const hardcodedMarkets = [...markets];
    const loadedMarkets = data.markets;
    const loadedMap = new Map<string, any>(loadedMarkets.map((m: any) => [m.id, m]));
    
    // For each hardcoded market, if it exists in loaded, keep loaded price and stats
    markets = hardcodedMarkets.map((hm) => {
      const lm = loadedMap.get(hm.id);
      if (lm) {
        let priceIdr = lm.priceIdr ?? hm.priceIdr;
        let priceUsdt = lm.priceUsdt ?? hm.priceUsdt;

        // Prevent corrupted prices (like 2) for major coins
        if (hm.symbol === 'BTC' && (priceIdr < 100000000 || priceUsdt < 5000)) {
          priceIdr = hm.priceIdr;
          priceUsdt = hm.priceUsdt;
        } else if (hm.symbol === 'ETH' && (priceIdr < 5000000 || priceUsdt < 300)) {
          priceIdr = hm.priceIdr;
          priceUsdt = hm.priceUsdt;
        } else if (hm.symbol === 'SOL' && (priceIdr < 100000 || priceUsdt < 5)) {
          priceIdr = hm.priceIdr;
          priceUsdt = hm.priceUsdt;
        } else if (hm.symbol === 'USDT' && (priceIdr < 10000 || priceUsdt < 0.5)) {
          priceIdr = hm.priceIdr;
          priceUsdt = hm.priceUsdt;
        } else if (hm.symbol === 'BNB' && (priceIdr < 1000000 || priceUsdt < 50)) {
          priceIdr = hm.priceIdr;
          priceUsdt = hm.priceUsdt;
        }

        return {
          ...hm,
          priceIdr,
          priceUsdt,
          change24h: lm.change24h ?? hm.change24h,
          high24h: lm.high24h ?? hm.high24h,
          low24h: lm.low24h ?? hm.low24h,
          volume24hIdr: lm.volume24hIdr ?? hm.volume24hIdr,
          volume24hUsdt: lm.volume24hUsdt ?? hm.volume24hUsdt,
          sparkline: lm.sparkline ?? hm.sparkline,
          isFavorite: lm.isFavorite ?? hm.isFavorite,
        };
      }
      return hm;
    });

    // Append any loaded markets that are not in the hardcoded list
    const hardcodedIds = new Set(hardcodedMarkets.map((hm) => hm.id));
    loadedMarkets.forEach((lm: any) => {
      if (!hardcodedIds.has(lm.id)) {
        markets.push(lm);
      }
    });
  }
  if (Array.isArray(data.bankAccounts) && data.bankAccounts.length > 0) bankAccounts = data.bankAccounts;
  if (Array.isArray(data.spotOrders)) spotOrders = data.spotOrders;
  if (Array.isArray(data.transactions)) transactions = data.transactions;
  if (Array.isArray(data.notifications)) notifications = data.notifications;
  if (Array.isArray(data.announcements)) announcements = data.announcements;
  if (data.compoundingSettings) compoundingSettings = { ...compoundingSettings, ...data.compoundingSettings };
  if (Array.isArray(data.compoundingLogs)) compoundingLogs = data.compoundingLogs;
  if (Array.isArray(data.newsArticles) && data.newsArticles.length > 0) newsArticles = data.newsArticles;
  if (Array.isArray(data.academyItems) && data.academyItems.length > 0) academyItems = data.academyItems;
  if (Array.isArray(data.futuresPositions)) futuresPositions = data.futuresPositions;
}

function getDatabasePayload() {
  return {
    users,
    currentUserId,
    markets,
    bankAccounts,
    spotOrders,
    transactions,
    notifications,
    announcements,
    compoundingSettings,
    compoundingLogs,
    newsArticles,
    academyItems,
    futuresPositions,
    updatedAt: new Date().toISOString(),
  };
}

function saveDatabaseToFile() {
  try {
    ensureDataDir();
    const payload = getDatabasePayload();
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write db.json:', err);
  }
}

async function persistToPostgres() {
  if (!pgPool || !isPgConnected) return;
  try {
    const payload = getDatabasePayload();
    const entries = Object.entries(payload);
    for (const [key, value] of entries) {
      await pgPool.query(
        `INSERT INTO app_state (key, data, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE 
         SET data = EXCLUDED.data, updated_at = NOW();`,
        [key, JSON.stringify(value)]
      );
    }
  } catch (err: any) {
    console.error('[PostgreSQL] Failed to persist state to PostgreSQL:', err?.message || err);
  }
}

let saveTimeout: any = null;
function saveDatabase() {
  saveDatabaseToFile();
  if (isPgConnected && pgPool) {
    persistToPostgres().catch((e) => {
      console.error('[PostgreSQL] Error in persistToPostgres:', e?.message || e);
    });
  }
}

function queueSaveDatabase() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDatabase();
  }, 150);
}

async function initDatabase() {
  ensureDataDir();

  // 1. First attempt to load from local file cache
  let loadedFromLocal = false;
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      applyDatabaseState(data);
      loadedFromLocal = true;
      console.log(`[Database] Loaded ${users.length} users, ${transactions.length} transactions from local db.json cache.`);
    } catch (e) {
      console.error('[Database] Failed to read local db.json:', e);
    }
  }

  // 2. Next, connect to PostgreSQL if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      pgPool = initPgPool();
      if (pgPool) {
        const client = await pgPool.connect();
        try {
          // Create persistent table if it doesn't exist yet
          await client.query(`
            CREATE TABLE IF NOT EXISTS app_state (
              key VARCHAR(100) PRIMARY KEY,
              data JSONB NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Fetch all state records from PostgreSQL
          const result = await client.query('SELECT key, data FROM app_state;');
          if (result.rows.length > 0) {
            const pgState: Record<string, any> = {};
            for (const row of result.rows) {
              pgState[row.key] = row.data;
            }
            applyDatabaseState(pgState);
            isPgConnected = true;
            console.log(`[PostgreSQL] Connected successfully to PostgreSQL! Loaded ${users.length} users and ${transactions.length} transactions.`);
          } else {
            isPgConnected = true;
            console.log('[PostgreSQL] Connected to PostgreSQL. Initializing tables with seed data...');
            await persistToPostgres();
          }
        } finally {
          client.release();
        }
      }
    } catch (err: any) {
      console.log('[PostgreSQL] Local connection not active, falling back to local file storage.');
      isPgConnected = false;
    }
  }

  // 3. Save database state (this ensures any sanitized or initialized data is stored back)
  saveDatabase();
}

// Initialize database on startup
initDatabase();

// Auto-save on every state-mutating request
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        queueSaveDatabase();
      }
    });
  }
  next();
});

// Periodic safety save every 30 seconds
setInterval(() => {
  saveDatabase();
}, 30000);

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

// Health & Database Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isPgConnected ? 'PostgreSQL' : 'Local Persistence (data/db.json)',
    isPostgres: isPgConnected,
    usersCount: users.length,
    transactionsCount: transactions.length,
    marketsCount: markets.length,
  });
});

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

// Helper to resolve current authenticated user (via header, query, body, or fallback)
function resolveUser(req: express.Request) {
  const headerUserId = (req.headers['x-user-id'] as string) || '';
  const queryUserId = (req.query.userId as string) || '';
  const bodyUserId = (req.body && req.body.currentUserId) || '';
  const targetId = headerUserId || queryUserId || bodyUserId || currentUserId;
  const found = users.find((u) => u.id === targetId || u.email?.toLowerCase() === targetId?.toLowerCase());
  const user = found || users.find((u) => u.id === currentUserId) || users[0];
  return sanitizeUser(user);
}

// User & Account Management
app.get('/api/users', (req, res) => {
  const user = resolveUser(req);
  if (user) {
    currentUserId = user.id;
  }
  res.json({
    success: true,
    currentUser: user,
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
  const { name, email, role, initialIdr, initialUsdt, initialCompoundingAsset, initialCompoundingProfit } = req.body;
  const newUser = {
    id: 'user_' + Date.now(),
    name: name || 'Pengguna Baru',
    email: email || `user_${Date.now()}@email.com`,
    role: role || 'user',
    isDummy: false,
    isVerified: true,
    balances: {
      idr: Number(initialIdr) || 0,
      usdt: Number(initialUsdt) || 0,
      tokens: {},
    },
    compoundingBalances: {
      idr: Number(initialCompoundingAsset) || 0,
      usdt: 0,
      tokens: {},
    },
    compoundingProfitIdr: Number(initialCompoundingProfit) || 0,
    capitalBatches: [],
    proBalances: {
      idr: 0,
      usdt: 0,
      tokens: {},
    },
    futuresBalances: {
      usdt: 0,
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
      idr: 0,
      usdt: 0,
      tokens: {},
    },
    compoundingBalances: {
      idr: 0,
      usdt: 0,
      tokens: {},
    },
    compoundingProfitIdr: 0,
    capitalBatches: [],
    proBalances: {
      idr: 0,
      usdt: 0,
      tokens: {},
    },
    futuresBalances: {
      usdt: 0,
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
  const targetEmail = email || `user.${provider}@trade.co.id`;
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
        idr: 0,
        usdt: 0,
        tokens: {},
      },
      compoundingBalances: {
        idr: 0,
        usdt: 0,
        tokens: {},
      },
      compoundingProfitIdr: 0,
      capitalBatches: [],
      proBalances: { idr: 0, usdt: 0, tokens: {} },
      futuresBalances: { usdt: 0 },
    };
    users.push(user);
  }

  currentUserId = user.id;
  res.json({ success: true, currentUser: user });
});

app.post('/api/users/reset-balance', (req, res) => {
  const user = resolveUser(req);
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
      user.balances.idr = 0;
      user.balances.usdt = 0;
      user.balances.tokens = {};
      user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
      user.compoundingProfitIdr = 0;
      user.capitalBatches = [];
      user.proBalances = { idr: 0, usdt: 0, tokens: {} };
      user.futuresBalances = { usdt: 0 };
    }
  }
  res.json({ success: true, currentUser: user });
});

// Wallet Operations
app.get('/api/user/wallet', (req, res) => {
  const user = resolveUser(req);
  
  if (!user.compoundingBalances) {
    user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
  }
  if (user.compoundingProfitIdr === undefined) {
    user.compoundingProfitIdr = 0;
  }
  if (!user.capitalBatches) {
    user.capitalBatches = [];
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const withdrawAmount = Number(amount);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah penarikan tidak valid' });
  }

  if (currency === 'IDR') {
    if (user.balances.idr < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Saldo Rupiah tidak mencukupi' });
    }
    user.balances.idr -= withdrawAmount;
    if (user.walletCash !== undefined) {
      user.walletCash = Math.max(0, user.walletCash - withdrawAmount);
    }
  } else if (currency === 'USDT') {
    if (user.balances.usdt < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Saldo USDT tidak mencukupi' });
    }
    user.balances.usdt -= withdrawAmount;
    if (user.walletUsdt !== undefined) {
      user.walletUsdt = Math.max(0, user.walletUsdt - withdrawAmount);
    }
  }

  const newTx = {
    id: 'tx_wd_' + Date.now(),
    userId: user.id,
    type: 'WITHDRAW',
    amount: withdrawAmount,
    currency: currency || 'IDR',
    method: destination || 'Rekening Bank',
    status: 'PENDING',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description: `Penarikan ${currency || 'IDR'} ${currency === 'USDT' ? withdrawAmount + ' USDT' : 'Rp ' + withdrawAmount.toLocaleString('id-ID')} ke ${destination || 'Rekening Bank'} (Menunggu Verifikasi & ACC Admin)`,
  };
  transactions.unshift(newTx);

  res.json({
    success: true,
    data: newTx,
    user,
    message: `Pengajuan penarikan sebesar ${currency === 'USDT' ? withdrawAmount + ' USDT' : 'Rp ' + withdrawAmount.toLocaleString('id-ID')} berhasil diajukan! Menunggu persetujuan Admin.`,
  });
});

app.post('/api/user/transfer', (req, res) => {
  const { from, to, amount, currency } = req.body;
  const user = resolveUser(req);
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
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
  const user = resolveUser(req);
  const userPositions = futuresPositions.filter((p) => p.userId === user.id);
  res.json({ success: true, data: userPositions });
});

app.get('/api/user/orders', (req, res) => {
  const user = resolveUser(req);
  const userOrders = spotOrders.filter((o) => o.userId === user.id);
  const userTxs = transactions.filter((t) => t.userId === user.id);
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

  const { name, email, phone, role, isVerified, isDummy, balances, proBalances, futuresBalances, compoundingBalances, compoundingProfitIdr } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role && (role === 'user' || role === 'admin')) user.role = role;
  if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
  if (isDummy !== undefined) user.isDummy = Boolean(isDummy);
  if (balances) user.balances = { ...user.balances, ...balances };
  if (proBalances) user.proBalances = { ...user.proBalances, ...proBalances };
  if (futuresBalances) user.futuresBalances = { ...user.futuresBalances, ...futuresBalances };
  if (compoundingBalances) {
    if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
    user.compoundingBalances = { ...user.compoundingBalances, ...compoundingBalances };
  }
  if (compoundingProfitIdr !== undefined) {
    user.compoundingProfitIdr = Number(compoundingProfitIdr);
  }

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

  const user = users.find((u) => u.id === tx.userId);

  // 1. APPROVING A PENDING DEPOSIT -> Otomatis saldo bertambah!
  if (tx.type === 'DEPOSIT' && previousStatus === 'PENDING' && status === 'COMPLETED') {
    if (user) {
      if (!user.balances) user.balances = { idr: 0, usdt: 0, btc: 0, eth: 0, sol: 0, ptu: 0, tokens: {} };
      if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
      if (!user.capitalBatches) user.capitalBatches = [];

      const now = new Date();
      const unlockDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 bulan (90 hari)
      const txAmount = Number(tx.amount);

      if (tx.currency === 'IDR' || !tx.currency) {
        user.balances.idr = (user.balances.idr || 0) + txAmount;
        user.walletCash = (user.walletCash || 0) + txAmount;
        user.compoundingBalances.idr = (user.compoundingBalances.idr || 0) + txAmount;
        user.compoundCapital = (user.compoundCapital || 0) + txAmount;

        user.capitalBatches.push({
          id: 'batch_' + Date.now(),
          amount: txAmount,
          createdAt: now.toISOString(),
          unlockDate: unlockDate.toISOString(),
          isUnlocked: false,
        });

        const dateStr = unlockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        tx.description = `Deposit Rp ${txAmount.toLocaleString('id-ID')} diverifikasi & disetujui Admin. Saldo langsung aktif (Aset Compounding 1%/hari, terkunci s/d ${dateStr})`;
      } else if (tx.currency === 'USDT') {
        user.balances.usdt = (user.balances.usdt || 0) + txAmount;
        user.walletUsdt = (user.walletUsdt || 0) + txAmount;
        user.compoundingBalances.usdt = (user.compoundingBalances.usdt || 0) + txAmount;
        tx.description = `Deposit ${txAmount} USDT diverifikasi & disetujui Admin pada ${new Date().toLocaleTimeString('id-ID')}`;
      }

      // Kirim Notifikasi ke User
      notifications.unshift({
        id: 'notif_' + Date.now(),
        title: '✅ Deposit Disetujui (ACC)',
        message: `Setoran dana sebesar ${tx.currency === 'USDT' ? txAmount + ' USDT' : 'Rp ' + txAmount.toLocaleString('id-ID')} telah diverifikasi oleh tim Admin dan berhasil ditambahkan ke saldo akun Anda!`,
        type: 'success',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        target: user.id,
      });
    }
  }

  // 2. REJECTING A DEPOSIT -> Kirim notifikasi
  if (tx.type === 'DEPOSIT' && previousStatus === 'PENDING' && status === 'REJECTED') {
    if (user) {
      notifications.unshift({
        id: 'notif_' + Date.now(),
        title: '❌ Deposit Ditolak',
        message: `Setoran dana sebesar ${tx.currency === 'USDT' ? tx.amount + ' USDT' : 'Rp ' + Number(tx.amount).toLocaleString('id-ID')} ditolak Admin. Pastikan bukti transfer valid dan nomor rekening sesuai.`,
        type: 'error',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        target: user.id,
      });
    }
  }

  // 3. APPROVING A PENDING WITHDRAWAL -> Status selesai & notifikasi
  if ((tx.type === 'WITHDRAW' || tx.type === 'WITHDRAW_PROFIT' || tx.type === 'WITHDRAW_CAPITAL') && previousStatus === 'PENDING' && status === 'COMPLETED') {
    if (user) {
      const txAmount = Number(tx.amount);
      notifications.unshift({
        id: 'notif_' + Date.now(),
        title: '💸 Penarikan Dana Berhasil',
        message: `Penarikan dana sebesar ${tx.currency === 'USDT' ? txAmount + ' USDT' : 'Rp ' + txAmount.toLocaleString('id-ID')} telah disetujui Admin dan telah ditransfer ke rekening bank / wallet tujuan Anda.`,
        type: 'success',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        target: user.id,
      });
    }
  }

  // 4. REJECTING A PENDING WITHDRAWAL -> Otomatis REFUND saldo kembali ke akun user!
  if ((tx.type === 'WITHDRAW' || tx.type === 'WITHDRAW_PROFIT' || tx.type === 'WITHDRAW_CAPITAL') && previousStatus === 'PENDING' && status === 'REJECTED') {
    if (user) {
      const txAmount = Number(tx.amount);

      if (tx.type === 'WITHDRAW') {
        if (tx.currency === 'IDR' || !tx.currency) {
          user.balances.idr = (user.balances.idr || 0) + txAmount;
          user.walletCash = (user.walletCash || 0) + txAmount;
        } else if (tx.currency === 'USDT') {
          user.balances.usdt = (user.balances.usdt || 0) + txAmount;
          user.walletUsdt = (user.walletUsdt || 0) + txAmount;
        }
      } else if (tx.type === 'WITHDRAW_PROFIT') {
        user.compoundingProfitIdr = (user.compoundingProfitIdr || 0) + txAmount;
      } else if (tx.type === 'WITHDRAW_CAPITAL') {
        if (!user.compoundingBalances) user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
        user.compoundingBalances.idr = (user.compoundingBalances.idr || 0) + txAmount;
      }

      notifications.unshift({
        id: 'notif_' + Date.now(),
        title: '⚠️ Penarikan Ditolak (Saldo Dikembalikan)',
        message: `Pengajuan penarikan sebesar ${tx.currency === 'USDT' ? txAmount + ' USDT' : 'Rp ' + txAmount.toLocaleString('id-ID')} ditolak Admin. Saldo telah dikembalikan secara utuh ke akun Anda.`,
        type: 'warning',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        target: user.id,
      });
    }
  }

  res.json({
    success: true,
    data: tx,
    user: user ? {
      id: user.id,
      balances: user.balances,
      compoundingBalances: user.compoundingBalances,
      compoundingProfitIdr: user.compoundingProfitIdr,
    } : null,
    message: `Status transaksi berhasil diubah ke ${status}. Saldo pengguna telah otomatis disinkronkan.`,
  });
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
      user.compoundingBalances = { idr: 0, usdt: 0, tokens: {} };
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
  if (process.env.NODE_ENV !== 'production') {
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
