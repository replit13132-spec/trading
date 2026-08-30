import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CryptoIcon } from './CryptoIcon';
import { compressImageFile } from '../utils/imageCompressor';

const SAMPLE_RECEIPT_SVG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='550' viewBox='0 0 400 550'%3E%3Crect width='400' height='550' fill='%23ffffff' rx='16'/%3E%3Crect x='0' y='0' width='400' height='90' fill='%23f59e0b'/%3E%3Ctext x='200' y='42' font-family='sans-serif' font-size='20' font-weight='bold' fill='%230f172a' text-anchor='middle'%3EBUKTI TRANSFER BERHASIL%3C/text%3E%3Ctext x='200' y='68' font-family='sans-serif' font-size='12' fill='%23451a03' text-anchor='middle'%3EBank Transfer / Virtual Account%3C/text%3E%3Ccircle cx='200' cy='140' r='30' fill='%23ecfdf5'/%3E%3Cpath d='M188 140l8 8 16-16' stroke='%2310b981' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='200' y='195' font-family='sans-serif' font-size='13' fill='%2364748b' text-anchor='middle'%3ENominal Transfer%3C/text%3E%3Ctext x='200' y='225' font-family='sans-serif' font-size='22' font-weight='bold' fill='%230f172a' text-anchor='middle'%3ERp 1.000.000%3C/text%3E%3Cline x1='40' y1='255' x2='360' y2='255' stroke='%23e2e8f0' stroke-dasharray='4'/%3E%3Ctext x='40' y='290' font-family='sans-serif' font-size='12' fill='%2364748b'%3ERekening Tujuan%3C/text%3E%3Ctext x='360' y='290' font-family='sans-serif' font-size='12' font-weight='bold' fill='%230f172a' text-anchor='end'%3E8820 1948 2109 0012%3C/text%3E%3Ctext x='40' y='325' font-family='sans-serif' font-size='12' fill='%2364748b'%3EPenerima%3C/text%3E%3Ctext x='360' y='325' font-family='sans-serif' font-size='12' font-weight='bold' fill='%230f172a' text-anchor='end'%3EPT PINTU REKSA DIGITAL%3C/text%3E%3Ctext x='40' y='360' font-family='sans-serif' font-size='12' fill='%2364748b'%3EBank Pengirim%3C/text%3E%3Ctext x='360' y='360' font-family='sans-serif' font-size='12' font-weight='bold' fill='%230f172a' text-anchor='end'%3EBCA Mobile / VA%3C/text%3E%3Ctext x='40' y='395' font-family='sans-serif' font-size='12' fill='%2364748b'%3EStatus%3C/text%3E%3Ctext x='360' y='395' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2310b981' text-anchor='end'%3EBERHASIL / SUKSES%3C/text%3E%3Cline x1='40' y1='430' x2='360' y2='430' stroke='%23e2e8f0' stroke-dasharray='4'/%3E%3Ctext x='200' y='475' font-family='sans-serif' font-size='11' fill='%2394a3b8' text-anchor='middle'%3ESimpan struk ini sebagai bukti transaksi yang sah.%3C/text%3E%3Ctext x='200' y='495' font-family='sans-serif' font-size='10' fill='%23cbd5e1' text-anchor='middle'%3ERef: TRX-AUTO-VERIFIED-PINTU%3C/text%3E%3C/svg%3E";
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
  Loader2,
  TrendingUp,
  ArrowDownToLine,
  Lock,
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
  const [depositError, setDepositError] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDepositModalOpen) {
      setDepositError(null);
      fetch('/api/bank-accounts')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setBankAccountsList(data.data);
            // set default deposit method if not already valid
            if (!data.data.some((b: any) => b.bankName === depositMethod)) {
              setDepositMethod(data.data[0].bankName);
            }
          }
        })
        .catch((e) => console.error('Failed to load bank accounts for deposit:', e));
    }
  }, [isDepositModalOpen]);

  const activeSelectedAccount = bankAccountsList.find(
    (b) => b.bankName === depositMethod || b.bankCode === depositMethod
  ) || bankAccountsList[0] || {
    bankName: depositMethod,
    accountNumber: '8820 1948 2109 0012',
    accountHolder: 'PT XMONEY PRO INDONESIA',
    notes: 'Transfer 24 jam.',
  };

  // Withdraw state (Only 2 options: Profit Compounding & Modal Pokok Aset)
  const [withdrawCategory, setWithdrawCategory] = useState<'PROFIT' | 'CAPITAL'>('PROFIT');
  const [withdrawAmount, setWithdrawAmount] = useState('100000');
  const [withdrawBankName, setWithdrawBankName] = useState('BCA');
  const [withdrawAccountNum, setWithdrawAccountNum] = useState('1234567890');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState(currentUser?.name || 'Budi Santoso');
  const [withdrawDest, setWithdrawDest] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawSuccessData, setWithdrawSuccessData] = useState<any | null>(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Transfer state
  const [transferFrom, setTransferFrom] = useState<'SPOT' | 'FUTURES'>('SPOT');
  const [transferTo, setTransferTo] = useState<'SPOT' | 'FUTURES'>('FUTURES');
  const [transferAmount, setTransferAmount] = useState('100');
  const [transferCurrency, setTransferCurrency] = useState<'IDR' | 'USDT'>('USDT');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingImage(true);
      setDepositError(null);
      try {
        const compressedBase64 = await compressImageFile(file, 1024, 1024, 0.75);
        setDepositProof(compressedBase64);
      } catch (err: any) {
        console.error('Failed to compress image:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setDepositProof(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingImage(false);
      }
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
    setDepositError(null);
    setIsSubmittingDeposit(true);
    try {
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
        setDepositError(res.message || 'Gagal mengajukan deposit');
      }
    } catch (err: any) {
      setDepositError(err?.message || 'Terjadi gangguan saat memproses deposit');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Handle Withdraw (Profit Compounding & Modal Pokok Aset)
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    setIsSubmittingWithdraw(true);

    const amountNum = Number(withdrawAmount);
    const destStr = `${withdrawBankName} - ${withdrawAccountNum} (a/n ${withdrawAccountHolder})`;
    const bankDetails = {
      bankName: withdrawBankName,
      accountNumber: withdrawAccountNum,
      accountHolder: withdrawAccountHolder,
    };

    try {
      if (withdrawCategory === 'PROFIT') {
        const res = await withdrawProfit(amountNum, destStr, bankDetails);
        if (res.success) {
          confetti({ particleCount: 60, spread: 70 });
          setWithdrawSuccessData({
            category: 'PROFIT',
            categoryName: 'Profit Compounding',
            amount: amountNum,
            destination: destStr,
            message: res.message || 'Pengajuan penarikan profit berhasil diajukan!',
          });
        } else {
          setWithdrawMsg(res.message || 'Pengajuan penarikan profit gagal diajukan');
        }
      } else if (withdrawCategory === 'CAPITAL') {
        const res = await withdrawCapital(amountNum, destStr, bankDetails);
        if (res.success) {
          confetti({ particleCount: 60, spread: 70 });
          setWithdrawSuccessData({
            category: 'CAPITAL',
            categoryName: 'Modal Pokok (ASET)',
            amount: amountNum,
            destination: destStr,
            message: res.message || 'Pengajuan penarikan modal pokok berhasil diajukan!',
          });
        } else {
          setWithdrawMsg(res.message || 'Pengajuan penarikan modal pokok gagal diajukan');
        }
      }
    } catch (err: any) {
      setWithdrawMsg(err.message || 'Terjadi kesalahan sistem saat memproses penarikan');
    } finally {
      setIsSubmittingWithdraw(false);
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
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto text-violet-600 animate-pulse">
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

                <div className="bg-violet-50/80 border border-violet-200/80 rounded-2xl p-3.5 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between text-violet-900 font-bold">
                    <span>Status Verifikasi:</span>
                    <span className="bg-violet-200 text-violet-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                      Menunggu Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-violet-700 space-y-1">
                    <p>• Estimasi proses verifikasi: 1 - 5 menit</p>
                    <p>• Tim Admin akan mengecek kesesuaian gambar bukti transfer Anda di Dashboard Admin.</p>
                  </div>
                </div>

                {depositProof && (
                  <div className="border border-gray-200 rounded-2xl p-2.5 bg-gray-50 text-left">
                    <p className="text-[11px] font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-violet-600" /> Pratinjau Bukti Transfer yang Terkirim:
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
                  className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-colors shadow-md shadow-violet-500/20"
                >
                  Selesai & Kembali ke Portofolio
                </button>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Deposit Saldo & Upload Bukti</span>
                    <span className="text-[10px] bg-violet-100 text-violet-900 font-bold px-2 py-0.5 rounded-full">
                      Instan & Aman
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Transfer dana lalu sertakan tangkapan layar / foto resi</p>
                </div>

                {/* Info Card Rule Top Up */}
                <div className="bg-violet-50 border border-violet-200/80 rounded-2xl p-3 text-[11px] text-violet-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-violet-950">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span>Ketentuan Setoran & Compounding:</span>
                  </div>
                  <ul className="space-y-0.5 text-violet-800 font-medium pl-1">
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
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-500 focus:bg-white transition-all"
                    placeholder="Masukkan nominal deposit (min Rp 500.000)..."
                    min={500000}
                    required
                  />
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {[500000, 1000000, 2000000, 5000000, 10000000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset.toString())}
                        className="flex-1 min-w-[65px] bg-gray-50 border border-gray-200 hover:bg-violet-50 hover:border-violet-300 text-[10px] font-bold py-1.5 rounded-lg text-gray-700 transition-all text-center"
                      >
                        {preset >= 1000000 
                          ? `Rp ${(preset / 1000000).toFixed(0)}Jt` 
                          : `Rp ${(preset / 1000).toFixed(0)}Rb`}
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
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-500"
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
                <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-violet-950">
                    <span className="font-medium text-[11px]">Rekening Tujuan ({activeSelectedAccount?.bankName}):</span>
                    <span className="text-[10px] font-extrabold text-violet-900 bg-violet-100 px-2 py-0.5 rounded-full">
                      a/n {activeSelectedAccount?.accountHolder || 'PT XMONEY PRO INDONESIA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-violet-100 p-2 rounded-xl">
                    <span className="font-mono font-extrabold text-sm text-gray-900">
                      {activeSelectedAccount?.accountNumber || '8820 1948 2109 0012'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="text-[11px] font-bold text-violet-900 hover:bg-violet-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
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
                  {activeSelectedAccount?.imageUrl && (
                    <div className="mt-3 border border-violet-100 bg-white rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
                      <p className="text-[10px] font-bold text-violet-900 uppercase tracking-wider flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pindai Kode QR / Lampiran Rekening</span>
                      </p>
                      <div className="w-48 h-48 border border-gray-100 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1.5 shadow-inner">
                        <img
                          src={activeSelectedAccount.imageUrl}
                          alt="QR Code Rekening"
                          className="h-full w-full object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 text-center">
                        Silakan simpan atau scan gambar di atas untuk mempermudah transfer.
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Bukti Transfer Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-violet-600" />
                      <span>Upload Bukti Transfer (Foto / Resi)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setDepositProof(SAMPLE_RECEIPT_SVG);
                        setDepositError(null);
                      }}
                      className="text-[10px] font-bold text-violet-900 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-violet-500" />
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

                  {isCompressingImage ? (
                    <div className="border-2 border-dashed border-violet-300 bg-violet-50/50 rounded-2xl p-4 text-center space-y-2">
                      <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-violet-900">Mengoptimalkan & Mengompresi Foto Bukti...</p>
                      <p className="text-[10px] text-violet-600">Menyesuaikan resolusi agar upload instan dan stabil</p>
                    </div>
                  ) : depositProof ? (
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
                      className="border-2 border-dashed border-gray-300 hover:border-violet-500 hover:bg-violet-50/40 transition-all rounded-2xl p-4 text-center cursor-pointer space-y-1.5 group"
                    >
                      <div className="w-10 h-10 bg-violet-50 group-hover:bg-violet-100 rounded-full flex items-center justify-center mx-auto text-violet-700 transition-all">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">Klik di sini untuk memilih foto bukti transfer</p>
                      <p className="text-[10px] text-gray-400">Format JPG, PNG, atau tangkapan layar m-Banking (Otomatis dikompres)</p>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {depositError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <p className="font-bold">Gagal Mengajukan Deposit</p>
                      <p className="text-[11px] text-rose-700 leading-relaxed">{depositError}</p>
                    </div>
                  </div>
                )}

                {/* Catatan Tambahan */}
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    placeholder="Contoh: Transfer via BCA m-Banking a/n Budi Santoso"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDeposit || isCompressingImage}
                  className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-violet-500/25 text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingDeposit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Mengirim Pengajuan Top Up...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Kirim Bukti Transfer & Ajukan Top Up</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Withdraw Modal (Only Profit Compounding & Modal Pokok Aset) */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setWithdrawMsg(null);
                setWithdrawSuccessData(null);
                setIsWithdrawModalOpen(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {withdrawSuccessData ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-900">Pengajuan Penarikan Terkirim!</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Permintaan penarikan dana Anda telah tercatat dan sedang dalam antrean verifikasi Admin.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Jenis Penarikan</span>
                    <span className="font-extrabold text-violet-950 bg-violet-100 px-2.5 py-0.5 rounded-full">
                      {withdrawSuccessData.categoryName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Nominal Penarikan</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {formatIdr(withdrawSuccessData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Rekening Tujuan</span>
                    <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">
                      {withdrawSuccessData.destination}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Status Verifikasi</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                      <Clock className="w-3 h-3" /> Menunggu ACC Admin
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-violet-50 rounded-2xl border border-violet-200 text-violet-950 text-xs text-left flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Admin akan memverifikasi rekening Anda dan mentransfer dana. Anda akan menerima notifikasi begitu dana berhasil dikirim.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWithdrawSuccessData(null);
                    setWithdrawMsg(null);
                    setIsWithdrawModalOpen(false);
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-violet-500/25 text-xs transition-all"
                >
                  Selesai & Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Penarikan Dana (Withdraw)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pilih jenis saldo yang ingin ditarik ke rekening bank / e-wallet Anda
                  </p>
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

                {/* Withdraw Source Category Selector - ONLY 2 OPTIONS */}
                <div className="bg-gray-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawCategory('PROFIT');
                      setWithdrawAmount('100000');
                      setWithdrawMsg(null);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                      withdrawCategory === 'PROFIT'
                        ? 'bg-emerald-600 text-white shadow-md font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Profit Compounding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawCategory('CAPITAL');
                      setWithdrawAmount('1000000');
                      setWithdrawMsg(null);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                      withdrawCategory === 'CAPITAL'
                        ? 'bg-violet-700 text-white shadow-md font-black'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Modal Pokok (ASET)</span>
                  </button>
                </div>

                {/* Rule Info according to selected category */}
                {withdrawCategory === 'PROFIT' ? (
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Penarikan Profit Compounding</span>
                      </span>
                      <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                        Bebas Kapan Saja
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed pt-0.5">
                      • Minimum penarikan: <b>Rp 100.000</b> (Berisi hasil bagi hasil harian 1% & bonus referral 5%).
                      <br />
                      • Dana akan diverifikasi & ditransfer langsung oleh Admin ke rekening Anda.
                    </p>
                  </div>
                ) : (
                  <div className="bg-violet-50/90 border border-violet-200/90 rounded-2xl p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-violet-950">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-violet-600" />
                        <span>Penarikan Modal Pokok (ASET)</span>
                      </span>
                      <span className="bg-violet-200 text-violet-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Lock 3 Bulan
                      </span>
                    </div>
                    <p className="text-[11px] text-violet-900 leading-relaxed pt-0.5">
                      • Modal Pokok (ASET) hanya dapat ditarik setelah masa penguncian <b>3 bulan (90 hari)</b> terlewati sejak tanggal deposit/re-compound.
                      <br />
                      • Pengajuan akan diverifikasi dan diproses oleh Admin.
                    </p>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">Jumlah Nominal Penarikan (Rp)</label>
                    <span className="text-[11px] text-gray-500">
                      {withdrawCategory === 'PROFIT' ? 'Saldo Profit: ' : 'Modal Aset: '}
                      <b className="text-gray-900">
                        {withdrawCategory === 'PROFIT'
                          ? formatIdr(walletData?.compoundingProfitIdr ?? currentUser?.compoundingProfitIdr ?? 0)
                          : formatIdr(walletData?.compoundingBalances?.idr ?? currentUser?.compoundingBalances?.idr ?? 0)}
                      </b>
                    </span>
                  </div>

                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-violet-500 focus:bg-white transition-all"
                    placeholder="Masukkan nominal penarikan..."
                    required
                  />

                  {/* Preset Percentages */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                      const maxVal =
                        withdrawCategory === 'PROFIT'
                          ? (walletData?.compoundingProfitIdr ?? currentUser?.compoundingProfitIdr ?? 0)
                          : (walletData?.compoundingBalances?.idr ?? currentUser?.compoundingBalances?.idr ?? 0);
                      const calculated = Math.floor(maxVal * pct);
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setWithdrawAmount(String(Math.max(100000, calculated)))}
                          className="py-1 px-1 bg-gray-100 hover:bg-violet-100 hover:text-violet-900 rounded-lg text-[11px] font-bold text-gray-600 transition-colors"
                        >
                          {pct === 1.0 ? 'Maksimal' : `${pct * 100}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Destination Bank / E-Wallet Selection */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-800 block">Informasi Rekening Penerima</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Nama Bank / E-Wallet</span>
                      <select
                        value={withdrawBankName}
                        onChange={(e) => setWithdrawBankName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-500"
                      >
                        <option value="BCA">Bank BCA</option>
                        <option value="Mandiri">Bank Mandiri</option>
                        <option value="BRI">Bank BRI</option>
                        <option value="BNI">Bank BNI</option>
                        <option value="CIMB Niaga">CIMB Niaga</option>
                        <option value="Permata">Bank Permata</option>
                        <option value="Bank Jago">Bank Jago</option>
                        <option value="Seabank">SeaBank</option>
                        <option value="DANA">DANA (E-Wallet)</option>
                        <option value="OVO">OVO (E-Wallet)</option>
                        <option value="GoPay">GoPay (E-Wallet)</option>
                        <option value="ShopeePay">ShopeePay</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Nomor Rekening / HP</span>
                      <input
                        type="text"
                        value={withdrawAccountNum}
                        onChange={(e) => setWithdrawAccountNum(e.target.value)}
                        placeholder="Contoh: 1234567890"
                        className="w-full bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Nama Pemilik Rekening (A.N)</span>
                    <input
                      type="text"
                      value={withdrawAccountHolder}
                      onChange={(e) => setWithdrawAccountHolder(e.target.value)}
                      placeholder="Nama sesuai buku tabungan / e-wallet"
                      className="w-full bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                </div>

                {/* Workflow Explanation Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>
                    <b>Alur:</b> Pengajuan $\rightarrow$ Admin Verifikasi $\rightarrow$ Dana Masuk ke Rekening.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className={`w-full font-extrabold py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    withdrawCategory === 'PROFIT'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                      : 'bg-violet-700 hover:bg-violet-800 text-white shadow-violet-700/25'
                  }`}
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengajukan Penarikan...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Ajukan Penarikan Dana</span>
                    </>
                  )}
                </button>
              </form>
            )}
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
                  <ArrowRightLeft className="w-4 h-4 text-violet-600 rotate-90" />
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
                className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-xs transition-colors"
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
              <div className="w-14 h-14 bg-violet-100 text-violet-900 rounded-full flex items-center justify-center mx-auto font-bold">
                <ShieldCheck className="w-8 h-8 text-violet-600" />
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
                className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md text-xs transition-colors"
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
                  <CryptoIcon symbol="PTU" name="Platform Token" className="w-8 h-8 rounded-full shadow" />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Crypto App Paling Simpel
                  </h2>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed px-2">
                    Nikmati investasi crypto paling simpel. Harga mulai dari Rp 500.000, kembangkan asetmu dengan Earn & Futures 25x.
                  </p>
                </div>

                <div className="space-y-2 pt-3">
                  <button
                    id="onboarding-register-btn"
                    onClick={() => setAuthModalMode('register')}
                    className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md text-xs transition-colors"
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
                    className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-extrabold shadow transition-colors"
                  >
                    Buat Akun Baru
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-violet-800 font-bold hover:underline"
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
                    className="w-full bg-violet-500 hover:bg-violet-400 text-slate-950 font-extrabold py-3 rounded-xl shadow text-xs transition-colors"
                  >
                    Masuk Sekarang
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setAuthModalMode('onboarding')}
                    className="text-xs text-violet-800 font-bold hover:underline"
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
