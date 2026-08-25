import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoIcon } from './CryptoIcon';
import { SAMPLE_RECEIPT_SVG } from '../data/sampleReceipt';
import {
  X,
  CheckCircle2,
  Building,
  QrCode,
  Smartphone,
  ArrowRightLeft,
  ShieldCheck,
  Coins,
  ChevronRight,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Copy,
  Check,
  FileText,
  Sparkles,
  RefreshCw,
  Clock,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Modals: React.FC = () => {
  const {
    isDepositModalOpen,
    setIsDepositModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isKYCModalOpen,
    setIsKYCModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    depositFunds,
    withdrawFunds,
    withdrawProfit,
    withdrawCapital,
    recompoundProfit,
    transferFunds,
    currentUser,
    walletData,
    formatIdr,
    formatUsdt,
  } = useApp();

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('500000');
  const [depositCurrency, setDepositCurrency] = useState<'IDR' | 'USDT'>('IDR');
  const [depositMethod, setDepositMethod] = useState('Bank Central Asia (BCA)');
  const [bankAccountsList, setBankAccountsList] = useState<any[]>([]);
  const [depositProof, setDepositProof] = useState<string>('');
  const [depositNote, setDepositNote] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/bank-accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBankAccountsList(data.data);
          setDepositMethod(data.data[0].bankName);
        }
      })
      .catch((e) => console.error('Failed to load bank accounts for deposit:', e));
  }, []);

  const activeSelectedAccount = bankAccountsList.find(
    (b) => b.bankName === depositMethod || b.bankCode === depositMethod
  ) || bankAccountsList[0] || {
    bankName: depositMethod,
    accountNumber: '8820 1948 2109 0012',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    notes: 'Transfer 24 jam.',
  };

  // Withdraw state
  const [withdrawCategory, setWithdrawCategory] = useState<'PROFIT' | 'CAPITAL' | 'REGULAR'>('PROFIT');
  const [withdrawAmount, setWithdrawAmount] = useState('100000');
  const [withdrawCurrency, setWithdrawCurrency] = useState<'IDR' | 'USDT'>('IDR');
  const [withdrawDest, setWithdrawDest] = useState('BCA - 1234567890 (A.N USER)');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  // Transfer state
  const [transferFrom, setTransferFrom] = useState<'SPOT' | 'FUTURES'>('SPOT');
  const [transferTo, setTransferTo] = useState<'SPOT' | 'FUTURES'>('FUTURES');
  const [transferAmount, setTransferAmount] = useState('100');
  const [transferCurrency, setTransferCurrency] = useState<'IDR' | 'USDT'>('USDT');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDepositProof(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(activeSelectedAccount?.accountNumber || '8820194821090012');
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  // Handle Deposit
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const proofToSubmit = depositProof || SAMPLE_RECEIPT_SVG;
    const res = await depositFunds(
      Number(depositAmount),
      depositCurrency,
      depositMethod,
      proofToSubmit,
      depositNote || `Transfer deposit ${depositCurrency} via ${depositMethod}`
    );
    if (res.success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setDepositSuccess(true);
    } else {
      alert(res.message || 'Gagal mengajukan deposit');
    }
  };

  // Handle Withdraw
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    const amountNum = Number(withdrawAmount);

    if (withdrawCategory === 'PROFIT') {
      const res = await withdrawProfit(amountNum, withdrawDest);
      if (res.success) {
        confetti({ particleCount: 50, spread: 60 });
        alert(res.message || `Penarikan profit sebesar ${formatIdr(amountNum)} berhasil!`);
        setIsWithdrawModalOpen(false);
      } else {
        setWithdrawMsg(res.message || 'Penarikan profit gagal');
      }
    } else if (withdrawCategory === 'CAPITAL') {
      const res = await withdrawCapital(amountNum, withdrawDest);
      if (res.success) {
        confetti({ particleCount: 50, spread: 60 });
        alert(res.message || `Penarikan modal pokok sebesar ${formatIdr(amountNum)} berhasil!`);
        setIsWithdrawModalOpen(false);
      } else {
        setWithdrawMsg(res.message || 'Penarikan modal gagal');
      }
    } else {
      const res = await withdrawFunds(amountNum, withdrawCurrency, withdrawDest);
      if (res.success) {
        alert(`Penarikan dana sebesar ${withdrawCurrency === 'IDR' ? formatIdr(amountNum) : withdrawAmount + ' USDT'} berhasil diproses!`);
        setIsWithdrawModalOpen(false);
      } else {
        setWithdrawMsg(res.message || 'Penarikan gagal');
      }
    }
  };

  // Handle Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await transferFunds(transferFrom, transferTo, Number(transferAmount), transferCurrency);
    if (res.success) {
      confetti({ particleCount: 30, spread: 50 });
      alert(`Transfer ${transferAmount} ${transferCurrency} berhasil!`);
      setIsTransferModalOpen(false);
    } else {
      setTransferMsg(res.message || 'Transfer gagal');
    }
  };

  return (
    <>
      {/* 1. Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setDepositSuccess(false);
                setIsDepositModalOpen(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {depositSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Bukti Transfer Berhasil Diunggah!</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Permintaan deposit sebesar{' '}
                    <span className="font-bold text-gray-900">
                      {depositCurrency === 'IDR' ? formatIdr(Number(depositAmount)) : depositAmount + ' USDT'}
                    </span>{' '}
                    sedang diverifikasi oleh Admin.
                  </p>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-900 font-bold">
                    <span>Status Verifikasi:</span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                      Menunggu Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 space-y-1">
                    <p>• Estimasi proses verifikasi: 1 - 5 menit</p>
                    <p>• Tim Admin akan mengecek kesesuaian gambar bukti transfer Anda di Dashboard Admin.</p>
                  </div>
                </div>

                {depositProof && (
                  <div className="border border-gray-200 rounded-2xl p-2.5 bg-gray-50 text-left">
                    <p className="text-[11px] font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" /> Pratinjau Bukti Transfer yang Terkirim:
                    </p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white max-h-48 flex items-center justify-center">
                      <img src={depositProof} alt="Bukti Transfer" className="max-h-48 object-contain w-full" />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setDepositSuccess(false);
                    setIsDepositModalOpen(false);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20"
                >
                  Selesai & Kembali ke Portofolio
                </button>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Deposit Saldo & Upload Bukti</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Instan & Aman
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Transfer dana lalu sertakan tangkapan layar / foto resi</p>
                </div>

                {/* Currency Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setDepositCurrency('IDR');
                      setDepositAmount('500000');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      depositCurrency === 'IDR'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rupiah (IDR)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDepositCurrency('USDT');
                      setDepositAmount('100');
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      depositCurrency === 'USDT'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tether (USDT)
                  </button>
                </div>

                {/* Info Card Rule Top Up */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ketentuan Setoran & Compounding:</span>
                  </div>
                  <ul className="space-y-0.5 text-amber-800 font-medium pl-1">
                    <li>• <b>Setoran Awal:</b> Minimal Rp 500.000 (menunggu verifikasi Admin)</li>
                    <li>• <b>Penempatan:</b> Modal masuk ke "ASET" & bertumbuh <b>1% per hari</b></li>
                    <li>• <b>Penarikan Modal Pokok:</b> Terkunci <b>3 bulan</b> sejak tanggal setor</li>
                    <li>• <b>Profit:</b> Ditarik kapan saja (min. Rp 100.000) atau digabung lagi ke modal</li>
                  </ul>
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Nominal Deposit</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                    placeholder="Masukkan nominal deposit (min Rp 500.000)..."
                    min={depositCurrency === 'IDR' ? 500000 : 10}
                    required
                  />
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {(depositCurrency === 'IDR'
                      ? [500000, 1000000, 2000000, 5000000, 10000000]
                      : [50, 100, 500, 1000, 5000]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset.toString())}
                        className="flex-1 min-w-[65px] bg-gray-50 border border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-[10px] font-bold py-1.5 rounded-lg text-gray-700 transition-all text-center"
                      >
                        {depositCurrency === 'IDR' 
                          ? preset >= 1000000 
                            ? `Rp ${(preset / 1000000).toFixed(0)}Jt` 
                            : `Rp ${(preset / 1000).toFixed(0)}Rb`
                          : `$${preset}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Metode Pembayaran Transfer</label>
                  <select
                    value={depositMethod}
                    onChange={(e) => setDepositMethod(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-amber-500"
                  >
                    {bankAccountsList.length > 0 ? (
                      bankAccountsList.map((acc) => (
                        <option key={acc.id} value={acc.bankName}>
                          {acc.bankName} ({acc.category})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BCA Virtual Account">BCA Virtual Account</option>
                        <option value="Mandiri Virtual Account">Mandiri Virtual Account</option>
                        <option value="BRI Virtual Account">BRI Virtual Account</option>
                        <option value="QRIS Instant (GoPay / OVO / DANA)">QRIS Instant (GoPay / OVO / DANA)</option>
                        <option value="Crypto USDT (TRC-20 / BEP-20)">Crypto USDT (TRC-20 / BEP-20)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Bank / VA Info Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-amber-950">
                    <span className="font-medium text-[11px]">Rekening Tujuan ({activeSelectedAccount?.bankName}):</span>
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      a/n {activeSelectedAccount?.accountHolder || 'PT XMONEY PRO INDONESIA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-amber-100 p-2 rounded-xl">
                    <span className="font-mono font-extrabold text-sm text-gray-900">
                      {activeSelectedAccount?.accountNumber || '8820 1948 2109 0012'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="text-[11px] font-bold text-amber-900 hover:bg-amber-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVa ? 'Tersalin' : 'Salin Nomor'}</span>
                    </button>
                  </div>
                  {activeSelectedAccount?.notes && (
                    <p className="text-[10px] text-gray-500 italic">
                      💡 {activeSelectedAccount.notes}
                    </p>
                  )}
                </div>

                {/* Upload Bukti Transfer Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      <span>Upload Bukti Transfer (Foto / Resi)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setDepositProof(SAMPLE_RECEIPT_SVG)}
                      className="text-[10px] font-bold text-amber-900 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Pakai Resi Contoh (Demo)</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {depositProof ? (
                    <div className="relative border-2 border-emerald-300 bg-emerald-50/40 rounded-2xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Bukti Transfer Siap Diunggah</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDepositProof('')}
                          className="text-[10px] font-bold text-rose-600 hover:underline"
                        >
                          Hapus Foto
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-emerald-200 bg-white max-h-40 flex items-center justify-center p-1">
                        <img src={depositProof} alt="Bukti Upload" className="max-h-36 object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50/40 transition-all rounded-2xl p-4 text-center cursor-pointer space-y-1.5 group"
                    >
                      <div className="w-10 h-10 bg-amber-50 group-hover:bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700 transition-all">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">Klik di sini untuk memilih foto bukti transfer</p>
                      <p className="text-[10px] text-gray-400">Format JPG, PNG, atau tangkapan layar m-Banking</p>
                    </div>
                  )}
                </div>

                {/* Catatan Tambahan */}
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    placeholder="Contoh: Transfer via BCA m-Banking a/n Budi Santoso"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/25 text-xs transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Kirim Bukti Transfer & Ajukan Top Up</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setWithdrawMsg(null);
                setIsWithdrawModalOpen(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span>Penarikan Dana (Withdraw)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Pilih jenis dana yang ingin Anda tarik ke rekening bank</p>
              </div>

              {withdrawMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-bold space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-900 font-extrabold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Perhatian:</span>
                  </div>
                  <p className="leading-relaxed">{withdrawMsg}</p>
                </div>
              )}

              {/* Withdraw Source Category Selector */}
              <div className="bg-gray-100 p-1 rounded-2xl flex flex-col sm:flex-row gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawCategory('PROFIT');
                    setWithdrawAmount('100000');
                    setWithdrawMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-center transition-all ${
                    withdrawCategory === 'PROFIT'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ✨ Profit Compounding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawCategory('CAPITAL');
                    setWithdrawAmount('1000000');
                    setWithdrawMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-center transition-all ${
                    withdrawCategory === 'CAPITAL'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📈 Modal Pokok (ASET)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawCategory('REGULAR');
                    setWithdrawAmount('100000');
                    setWithdrawMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-center transition-all ${
                    withdrawCategory === 'REGULAR'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💳 Saldo Kas
                </button>
              </div>

              {/* Rule Card according to selected category */}
              {withdrawCategory === 'PROFIT' && (
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>Opsi: Penarikan Profit Compounding</span>
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-extrabold">
                      Bebas Kapan Saja
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    • Minimum penarikan profit: <b>Rp 100.000</b>
                    <br />
                    • Saldo profit dapat ditarik kapan saja tanpa penguncian.
                  </p>
                </div>
              )}

              {withdrawCategory === 'CAPITAL' && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span>Opsi: Penarikan Modal Pokok (ASET)</span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Lock 3 Bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    • Penarikan Modal Pokok hanya dapat dilakukan <b>3 bulan</b> setelah tanggal penanaman modal/deposit.
                  </p>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Jumlah Nominal Penarikan (Rp)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                  placeholder="Masukkan nominal penarikan..."
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1">
                  <span>
                    {withdrawCategory === 'PROFIT' && 'Saldo Profit Tersedia: '}
                    {withdrawCategory === 'CAPITAL' && 'Total Modal Pokok (ASET): '}
                    {withdrawCategory === 'REGULAR' && 'Saldo Kas Tersedia: '}
                  </span>
                  <b className="text-gray-900">
                    {withdrawCategory === 'PROFIT' && formatIdr(walletData?.compoundingProfitIdr ?? currentUser?.compoundingProfitIdr ?? 0)}
                    {withdrawCategory === 'CAPITAL' && formatIdr(walletData?.compoundingBalances?.idr ?? currentUser?.compoundingBalances?.idr ?? 0)}
                    {withdrawCategory === 'REGULAR' && formatIdr(currentUser?.balances?.idr || 0)}
                  </b>
                </div>
              </div>

              {/* Destination Account */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tujuan Rekening Bank / E-Wallet</label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  placeholder="Contoh: BCA 1234567890 a/n Budi Santoso"
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full font-extrabold py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 ${
                  withdrawCategory === 'PROFIT'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                <span>Konfirmasi Penarikan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Internal Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Transfer Dana Internal</h3>
                <p className="text-xs text-gray-500">Pindahkan saldo antar dompet instan tanpa biaya</p>
              </div>

              {transferMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                  {transferMsg}
                </div>
              )}

              {/* From & To Selectors */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">DARI</span>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-gray-900 text-xs outline-none"
                  >
                    <option value="spot">Spot Wallet</option>
                    <option value="pro">Pro Spot</option>
                    <option value="futures">Futures Margin Wallet</option>
                  </select>
                </div>

                <div className="flex justify-center my-1">
                  <ArrowRightLeft className="w-4 h-4 text-amber-600 rotate-90" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">KE</span>
                  <select
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-gray-900 text-xs outline-none"
                  >
                    <option value="futures">Futures Margin Wallet</option>
                    <option value="pro">Pro Spot</option>
                    <option value="spot">Spot Wallet</option>
                  </select>
                </div>
              </div>

              {/* Currency & Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Mata Uang & Jumlah</label>
                  <select
                    value={transferCurrency}
                    onChange={(e) => setTransferCurrency(e.target.value)}
                    className="bg-gray-100 font-bold text-xs px-2 py-0.5 rounded-lg outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="IDR">IDR</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-xs transition-colors"
              >
                Konfirmasi Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. KYC Verification Modal */}
      {isKYCModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsKYCModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto font-bold">
                <ShieldCheck className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Verifikasi Akun (KYC)</h3>
              <p className="text-xs text-gray-500">
                Akun simulasi Anda telah terverifikasi secara instan dengan status <b>Verified Tier 2</b>.
              </p>

              <div className="bg-gray-50 p-3 rounded-2xl text-left text-xs space-y-1.5 border border-gray-200/80">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Lengkap:</span>
                  <span className="font-bold text-gray-800">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Verifikasi:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Batas Trading:</span>
                  <span className="font-bold text-gray-800">Unlimited (Rp 2 Miliar/hari)</span>
                </div>
              </div>

              <button
                onClick={() => setIsKYCModalOpen(false)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-xs transition-colors"
              >
                Selesai & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Auth / Onboarding Modal (Matching Screenshot 20260823-200119.png and 200127.png) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {authModalMode === 'onboarding' ? (
              <div className="text-center space-y-4 pt-2">
                {/* 4 Token Icons Circle */}
                <div className="flex justify-center items-center gap-2 my-2">
                  <CryptoIcon symbol="BTC" name="Bitcoin" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="ETH" name="Ethereum" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="SOL" name="Solana" className="w-8 h-8 rounded-full shadow" />
                  <CryptoIcon symbol="PTU" name="Pintu Token" className="w-8 h-8 rounded-full shadow" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Crypto App Paling Simpel
                  </h2>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed px-2">
                    Nikmati investasi crypto paling simpel. Harga mulai dari Rp 11.000, kembangkan asetmu dengan Earn & Futures 25x.
                  </p>
                </div>

                <div className="space-y-2 pt-3">
                  <button
                    id="onboarding-register-btn"
                    onClick={() => setAuthModalMode('register')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md text-xs transition-colors"
                  >
                    Daftar
                  </button>

                  <button
                    id="onboarding-login-btn"
                    onClick={() => setAuthModalMode('login')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-2xl text-xs transition-colors"
                  >
                    Masuk
                  </button>
                </div>
              </div>
            ) : authModalMode === 'register' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Buat Akun Personal</h3>
                  <p className="text-xs text-gray-500">Pilih metode pendaftaran yang Anda inginkan</p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      alert('Login simulasi via Google berhasil!');
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full border border-gray-200 hover:bg-gray-50 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="font-bold text-red-500">G</span>
                    <span>Daftar dengan Google</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Login simulasi via Apple ID berhasil!');
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full border border-gray-200 hover:bg-gray-50 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span></span>
                    <span>Daftar dengan Apple ID</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-extrabold shadow transition-colors"
                  >
                    Buat Akun Baru
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-amber-800 font-bold hover:underline"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Masuk ke Akun</h3>
                  <p className="text-xs text-gray-500">Masukkan email dan PIN akun Anda</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Alamat Email"
                    defaultValue=""
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="PIN / Password"
                    defaultValue="123456"
                    className="w-full bg-gray-100 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none"
                  />

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow text-xs transition-colors"
                  >
                    Masuk Sekarang
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-amber-800 font-bold hover:underline"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
