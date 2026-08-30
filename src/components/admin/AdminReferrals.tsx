import React, { useState, useEffect } from 'react';
import {
  Gift,
  Users,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Shield,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Percent,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InvitedMember {
  id: string;
  name: string;
  email: string;
  nik?: string;
  role: string;
  registeredAt: string;
  totalDepositsIdr: number;
  commissionGeneratedIdr: number;
}

interface ReferralUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  referralCode: string;
  referredBy: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
  } | null;
  referredByCode: string | null;
  invitedCount: number;
  invitedMembers: InvitedMember[];
  totalCommissionEarnedIdr: number;
}

interface AdminReferralsProps {
  onRefresh?: () => void;
}

export const AdminReferrals: React.FC<AdminReferralsProps> = ({ onRefresh }) => {
  const { formatIdr } = useApp();

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<{
    stats: {
      totalUsers: number;
      totalReferrers: number;
      totalInvitedUsers: number;
      totalCommissionsDistributedIdr: number;
      commissionRatePercent: number;
    };
    referralUsers: ReferralUser[];
    recentCommissions: any[];
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'HAS_DOWNLINES' | 'HAS_UPLINE'>('ALL');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Edit Referral Code Modal State
  const [editingUser, setEditingUser] = useState<ReferralUser | null>(null);
  const [newReferralCode, setNewReferralCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [editStatusMsg, setEditStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReferralData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/referrals');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyLink = (code: string) => {
    if (!code) return;
    const url = `https://www.xmoney.web.id/?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleOpenEditModal = (user: ReferralUser) => {
    setEditingUser(user);
    setNewReferralCode(user.referralCode || '');
    setEditStatusMsg(null);
  };

  const handleSaveReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !newReferralCode.trim()) return;

    setSavingCode(true);
    setEditStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.userId}/referral-code`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: newReferralCode.trim().toUpperCase() }),
      });

      const json = await res.json();
      if (json.success) {
        setEditStatusMsg({ type: 'success', text: json.message || 'Kode referral berhasil diperbarui!' });
        setTimeout(() => {
          setEditingUser(null);
          fetchReferralData();
          if (onRefresh) onRefresh();
        }, 1000);
      } else {
        setEditStatusMsg({ type: 'error', text: json.message || 'Gagal mengubah kode referral' });
      }
    } catch (err: any) {
      setEditStatusMsg({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setSavingCode(false);
    }
  };

  const filteredUsers = (data?.referralUsers || []).filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.referredBy?.name && user.referredBy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.referredByCode && user.referredByCode.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'HAS_DOWNLINES') {
      return user.invitedCount > 0;
    }
    if (filterType === 'HAS_UPLINE') {
      return Boolean(user.referredBy || user.referredByCode);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-100 text-violet-800 font-extrabold shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Referral & Afiliasi Pengguna
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Pantau kode unik referral setiap pengguna, jaringan relasi anggota (siapa mengajak siapa), serta rincian distribusi komisi <strong>5% dari deposit</strong> yang otomatis masuk ke <strong>Profit Compounding</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => {
              fetchReferralData();
              if (onRefresh) onRefresh();
            }}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border border-violet-200 shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Anggota */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Pengguna</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{data?.stats.totalUsers || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pengguna terdaftar di platform</p>
          </div>
        </div>

        {/* Card 2: Pengajak Aktif */}
        <div className="bg-white border border-violet-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-violet-700 mb-2">
            <span className="text-xs font-bold">Upline / Pengajak Aktif</span>
            <div className="p-1.5 rounded-lg bg-violet-100 text-violet-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-violet-900">{data?.stats.totalReferrers || 0}</p>
            <p className="text-[11px] text-violet-600 font-medium mt-0.5">Memiliki minimal 1 downline</p>
          </div>
        </div>

        {/* Card 3: Anggota Masuk via Referral */}
        <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-bold">Total Downline Terhubung</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-indigo-950">{data?.stats.totalInvitedUsers || 0}</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Mendaftar dengan kode referral</p>
          </div>
        </div>

        {/* Card 4: Total Komisi 5% Dibagikan */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold">Total Komisi 5% Disalurkan</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700">
              {formatIdr(data?.stats.totalCommissionsDistributedIdr || 0)}
            </p>
            <p className="text-[11px] text-emerald-800 font-bold mt-0.5">Masuk ke Profit Compounding</p>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, kode referral..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'ALL'
                ? 'bg-violet-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Pengguna ({data?.referralUsers.length || 0})
          </button>
          <button
            onClick={() => setFilterType('HAS_DOWNLINES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'HAS_DOWNLINES'
                ? 'bg-violet-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Punya Downline ({data?.referralUsers.filter((u) => u.invitedCount > 0).length || 0})
          </button>
          <button
            onClick={() => setFilterType('HAS_UPLINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'HAS_UPLINE'
                ? 'bg-violet-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Punya Upline ({data?.referralUsers.filter((u) => u.referredBy || u.referredByCode).length || 0})
          </button>
        </div>
      </div>

      {/* 4. Referral Table List */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Daftar Kode Referral & Jaringan Relasi Pengguna
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredUsers.length} data
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Klik pada baris pengguna untuk melihat daftar teman yang diajak
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-600" />
            <p className="text-xs">Memuat data referral dan relasi akun...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada data yang cocok dengan pencarian</p>
            <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isExpanded = expandedUser === user.userId;

              return (
                <div key={user.userId} className="transition-colors hover:bg-slate-50/70">
                  {/* Row Summary */}
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Identity */}
                    <div className="flex items-start gap-3 min-w-0 lg:w-1/4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-900 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-inner">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                          <span
                            className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                              user.role === 'admin'
                                ? 'bg-violet-100 text-violet-900 border border-violet-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {user.role === 'admin' ? 'ADMIN' : 'USER'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Referral Code (Unique) */}
                    <div className="flex items-center gap-2 lg:w-1/4">
                      <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">KODE:</span>
                        <span className="font-mono font-black text-xs text-violet-950">
                          {user.referralCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(user.referralCode)}
                          title="Salin Kode Referral"
                          className="p-1 hover:bg-violet-200/60 rounded text-violet-700 transition-colors ml-0.5"
                        >
                          {copiedCode === user.referralCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(user.referralCode)}
                          title="Salin Link Landing Page (https://www.xmoney.web.id/?ref=...)"
                          className="p-1 hover:bg-violet-200/60 rounded text-violet-700 transition-colors"
                        >
                          {copiedLink === user.referralCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        title="Ubah Kode Referral"
                        className="p-2 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors border border-transparent hover:border-violet-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Diundang Oleh (Upline) */}
                    <div className="text-xs lg:w-1/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                        Diundang Oleh (Upline):
                      </span>
                      {user.referredBy ? (
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-bold truncate">{user.referredBy.name}</span>
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 rounded">
                            {user.referredBy.referralCode}
                          </span>
                        </div>
                      ) : user.referredByCode ? (
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {user.referredByCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pendaftar Mandiri (Tanpa Referral)</span>
                      )}
                    </div>

                    {/* Stats & Expand Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 lg:w-1/4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-800">
                          <span className="text-xs font-black text-violet-900 bg-violet-100/80 px-2 py-0.5 rounded-full">
                            {user.invitedCount} Orang Diajak
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          Komisi: {formatIdr(user.totalCommissionEarnedIdr)}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : user.userId)}
                        className={`p-2 rounded-xl transition-all border flex items-center gap-1 text-xs font-bold ${
                          isExpanded
                            ? 'bg-violet-900 text-white border-violet-900 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <span className="hidden sm:inline">{isExpanded ? 'Tutup' : 'Lihat Anggota'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Downline Members Panel */}
                  {isExpanded && (
                    <div className="bg-slate-50/90 border-t border-slate-200/80 p-4 sm:p-6 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-violet-700" />
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Daftar Pengguna yang Diajak oleh {user.name} ({user.invitedMembers.length} Orang)
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Setiap Depo Downline Memberikan 5% ke Profit Compounding Upline
                        </span>
                      </div>

                      {user.invitedMembers.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200 text-slate-400">
                          <Gift className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">Belum ada anggota yang diajak.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Pengguna dapat membagikan kode referral <strong className="font-mono text-violet-900">{user.referralCode}</strong> kepada calon anggota baru.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                                <th className="p-3">Nama Anggota</th>
                                <th className="p-3">Email & NIK</th>
                                <th className="p-3">Status / Role</th>
                                <th className="p-3 text-right">Total Deposit (ACC)</th>
                                <th className="p-3 text-right text-emerald-800">Komisi 5% untuk {user.name}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              {user.invitedMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-violet-50/30 transition-colors">
                                  <td className="p-3 font-bold text-slate-900">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center font-bold text-[10px]">
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span>{member.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-600">
                                    <div>{member.email}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">NIK: {member.nik}</div>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                                      {member.role}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                                    {formatIdr(member.totalDepositsIdr)}
                                  </td>
                                  <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                                    +{formatIdr(member.commissionGeneratedIdr)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Real-Time Referral Reward Log */}
      {data?.recentCommissions && data.recentCommissions.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Riwayat Transaksi Komisi Referral 5% Terkini
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Otomatis masuk ke Profit Compounding</span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.recentCommissions.map((tx) => (
              <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{tx.userName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      REWARD 5%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{tx.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{tx.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-sm text-emerald-600">
                    +{formatIdr(tx.amount)}
                  </span>
                  <span className="block text-[10px] text-slate-400">Status: COMPLETED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Edit Referral Code Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-violet-900">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">Kustomisasi Kode Referral</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sesuaikan kode referral unik untuk pengguna <strong>{editingUser.name}</strong> ({editingUser.email}).
            </p>

            {editStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  editStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {editStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{editStatusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveReferralCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Referral Baru (Unik & Huruf Kapital)
                </label>
                <input
                  type="text"
                  value={newReferralCode}
                  onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: XM-VIP999"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs font-mono font-bold text-slate-900 uppercase outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kode harus unik dan belum digunakan oleh pengguna lain.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCode || !newReferralCode.trim()}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
