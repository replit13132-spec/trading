import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

async function main() {
  console.log('\n==================================================');
  console.log('       🚀 POSTGRESQL DATABASE PUSH TOOL           ');
  console.log('==================================================\n');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL is not set in environment or .env file.');
    console.error('Please make sure .env contains DATABASE_URL="postgresql://user:pass@host:5432/dbname"\n');
    process.exit(1);
  }

  console.log(`📡 Connecting to PostgreSQL: ${connectionString.replace(/:[^:@]+@/, ':****@')}...`);

  const isSsl = connectionString.includes('sslmode=require') || connectionString.includes('ssl=true');
  const pool = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 8000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to PostgreSQL server!\n');

    console.log('📦 Step 1: Creating database schema & tables...');
    
    // Create master app_state table for atomic & persistent synchronization
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for fast JSONB querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_state_updated ON app_state(updated_at);
    `);

    console.log('   ✓ Table "app_state" verified/created successfully.');

    console.log('\n📥 Step 2: Preparing seed & local data to push...');
    const DATA_DIR = path.join(process.cwd(), 'data');
    const DB_FILE = path.join(DATA_DIR, 'db.json');

    let payload: Record<string, any> = {};

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        payload = JSON.parse(raw);
        console.log(`   ✓ Loaded existing data snapshot from "${DB_FILE}"`);
      } catch (err: any) {
        console.warn(`   ⚠️ Warning reading db.json (${err.message}). Using standard initial seed.`);
      }
    }

    // Default seeds if empty
    if (!payload.users || !Array.isArray(payload.users) || payload.users.length === 0) {
      payload.users = [
        {
          id: 'usr_001',
          name: 'Demo Trader',
          email: 'user@pintu.co.id',
          password: 'password123',
          role: 'user',
          nik: '3201123456780001',
          phone: '081234567890',
          walletCash: 125000000,
          walletUsdt: 8500,
          compoundCapital: 50000000,
          compoundProfit: 3420000,
          isCompoundingActive: true,
          compoundDay: 14,
          proBalance: 25000000,
          isKycVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          bankAccounts: [
            { id: 'ba_1', bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DEMO TRADER' }
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr_admin',
          name: 'Super Admin',
          email: process.env.ADMIN_EMAIL || 'admin@pintu.co.id',
          password: process.env.ADMIN_PASSWORD || 'password123',
          role: 'admin',
          nik: '3201999988880001',
          phone: '081199887766',
          walletCash: 500000000,
          walletUsdt: 35000,
          compoundCapital: 0,
          compoundProfit: 0,
          isCompoundingActive: false,
          compoundDay: 0,
          proBalance: 100000000,
          isKycVerified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          bankAccounts: [],
          createdAt: new Date().toISOString(),
        }
      ];
    }

    if (!payload.markets || !Array.isArray(payload.markets) || payload.markets.length === 0) {
      payload.markets = [
        { id: 'btc', symbol: 'BTC/IDR', base: 'BTC', quote: 'IDR', price: 1545000000, change24h: 3.42, high24h: 1560000000, low24h: 1490000000, volume24h: 428.5, tags: ['hot', 'gainers'], logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035' },
        { id: 'eth', symbol: 'ETH/IDR', base: 'ETH', quote: 'IDR', price: 43500000, change24h: -1.15, high24h: 44800000, low24h: 42900000, volume24h: 1250.2, tags: ['hot'], logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=035' },
        { id: 'sol', symbol: 'SOL/IDR', base: 'SOL', quote: 'IDR', price: 2850000, change24h: 8.75, high24h: 2950000, low24h: 2600000, volume24h: 8900.0, tags: ['gainers'], logo: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=035' },
        { id: 'usdt', symbol: 'USDT/IDR', base: 'USDT', quote: 'IDR', price: 16250, change24h: 0.12, high24h: 16280, low24h: 16220, volume24h: 450000.0, tags: [], logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=035' },
      ];
    }

    if (!payload.bankAccounts || !Array.isArray(payload.bankAccounts) || payload.bankAccounts.length === 0) {
      payload.bankAccounts = [
        { id: 'adm_ba_1', bankName: 'BCA (Bank Central Asia)', accountNumber: '8820394812', accountHolder: 'PT PINTU REKSA DIGITAL', qrImageUrl: '', isQris: false, isActive: true },
        { id: 'adm_ba_2', bankName: 'Bank Mandiri', accountNumber: '1370019284712', accountHolder: 'PT PINTU REKSA DIGITAL', qrImageUrl: '', isQris: false, isActive: true },
        { id: 'adm_ba_3', bankName: 'QRIS All Payment & E-Wallet', accountNumber: 'NMID: ID1020039481', accountHolder: 'PINTU OFFICIAL DEPOSIT', qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580014ID.GO.QRIS.WWW01189360050300000882015204581253033605802ID5920PINTU%20REKSA%20DIGITAL6007JAKARTA61051234062070703A0163041D3B', isQris: true, isActive: true }
      ];
    }

    if (!payload.compoundingSettings) {
      payload.compoundingSettings = {
        yieldPercent: 1.5,
        minDeposit: 1000000,
        compoundDurationDays: 30,
        penaltyEarlyWithdraw: 5.0,
      };
    }

    console.log('\n📤 Step 3: Pushing records to PostgreSQL table "app_state"...');

    const keysToPush = [
      'users',
      'currentUserId',
      'markets',
      'bankAccounts',
      'spotOrders',
      'transactions',
      'notifications',
      'announcements',
      'compoundingSettings',
      'compoundingLogs',
      'newsArticles',
      'academyItems',
      'futuresPositions',
    ];

    for (const key of keysToPush) {
      const dataVal = payload[key] !== undefined ? payload[key] : [];
      await client.query(
        `INSERT INTO app_state (key, data, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE 
         SET data = EXCLUDED.data, updated_at = NOW();`,
        [key, JSON.stringify(dataVal)]
      );
      const count = Array.isArray(dataVal) ? `${dataVal.length} items` : typeof dataVal === 'object' ? 'Config object' : String(dataVal);
      console.log(`   ✓ Pushed [${key}] -> (${count})`);
    }

    client.release();

    console.log('\n==================================================');
    console.log('  🎉 DATABASE PUSH COMPLETED SUCCESSFULLY!        ');
    console.log('==================================================');
    console.log('All tables, data structures, and initial state are');
    console.log('now securely persisted in your PostgreSQL database.\n');

    await pool.end();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Push failed with error:', err.message || err);
    await pool.end();
    process.exit(1);
  }
}

main();
