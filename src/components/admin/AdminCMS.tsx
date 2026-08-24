import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  GraduationCap,
  Bell,
  CheckCircle,
  XCircle,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface AdminCMSProps {
  onRefresh: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({ onRefresh }) => {
  const [subTab, setSubTab] = useState<'news' | 'academy' | 'announcements'>('news');
  const [newsList, setNewsList] = useState<any[]>([]);
  const [academyList, setAcademyList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // News Form
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Update',
    summary: '',
    content: '',
    author: 'Tim Riset Pintu',
    readTime: '3 mnt',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=60',
    source: 'Pintu News',
  });

  // Academy Form
  const [academyForm, setAcademyForm] = useState({
    title: '',
    level: 'PEMULA' as 'PEMULA' | 'MENENGAH' | 'LANJUTAN',
    readTime: '5 mnt',
    description: '',
    content: '',
    tag: 'Dasar Kripto',
  });

  // Announcement Form
  const [annForm, setAnnForm] = useState({
    title: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'MAINTENANCE',
    message: '',
    link: '',
    active: true,
  });

  const parseJson = async (res: Response) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return { success: false, data: [] };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resNews, resAcad, resAnn] = await Promise.all([
        fetch('/api/cms/news'),
        fetch('/api/cms/academy'),
        fetch('/api/cms/announcements'),
      ]);
      const dataNews = await parseJson(resNews);
      const dataAcad = await parseJson(resAcad);
      const dataAnn = await parseJson(resAnn);

      if (dataNews.success) setNewsList(dataNews.data);
      if (dataAcad.success) setAcademyList(dataAcad.data);
      if (dataAnn.success) setAnnouncements(dataAnn.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // NEWS Handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editItem ? `/api/cms/news/${editItem.id}` : '/api/cms/news/create';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(editItem ? 'Berita berhasil diperbarui!' : 'Berita baru berhasil diterbitkan!');
        setShowModal(false);
        setEditItem(null);
        fetchData();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Hapus artikel berita ini?')) return;
    try {
      await fetch(`/api/cms/news/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // ACADEMY Handlers
  const handleSaveAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editItem ? `/api/cms/academy/${editItem.id}` : '/api/cms/academy/create';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(academyForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(editItem ? 'Modul akademi diperbarui!' : 'Modul akademi berhasil ditambahkan!');
        setShowModal(false);
        setEditItem(null);
        fetchData();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAcademy = async (id: string) => {
    if (!confirm('Hapus modul edukasi ini?')) return;
    try {
      await fetch(`/api/cms/academy/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // ANNOUNCEMENT Handlers
  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editItem ? `/api/cms/announcements/${editItem.id}` : '/api/cms/announcements/create';
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(editItem ? 'Pengumuman diperbarui!' : 'Pengumuman baru aktif disiarkan!');
        setShowModal(false);
        setEditItem(null);
        fetchData();
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await fetch(`/api/cms/announcements/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('news')}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'news'
                ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-md shadow-amber-500/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Berita & Riset ({newsList.length})</span>
          </button>

          <button
            onClick={() => setSubTab('academy')}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'academy'
                ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-md shadow-amber-500/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Akademi Pintu ({academyList.length})</span>
          </button>

          <button
            onClick={() => setSubTab('announcements')}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'announcements'
                ? 'bg-amber-500 text-slate-950 font-extrabold text-white shadow-md shadow-amber-500/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Siaran Banner ({announcements.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>
            {subTab === 'news'
              ? 'Tulis Artikel Berita'
              : subTab === 'academy'
              ? 'Tambah Modul Belajar'
              : 'Buat Siaran Pengumuman'}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: NEWS */}
      {subTab === 'news' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="relative h-36 rounded-2xl overflow-hidden mb-3 bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 line-clamp-2 mb-1.5">{item.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-3 mb-3">{item.summary}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>{item.author} • {item.readTime}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditItem(item);
                      setNewsForm({
                        title: item.title,
                        category: item.category,
                        summary: item.summary,
                        content: item.content,
                        author: item.author,
                        readTime: item.readTime,
                        imageUrl: item.imageUrl,
                        source: item.source,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: ACADEMY */}
      {subTab === 'academy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academyList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      item.level === 'PEMULA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.level === 'MENENGAH'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {item.level}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">{item.readTime}</span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 mb-1.5">{item.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-3 mb-3">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-semibold text-amber-800">#{item.tag}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditItem(item);
                      setAcademyForm({
                        title: item.title,
                        level: item.level,
                        readTime: item.readTime,
                        description: item.description,
                        content: item.content,
                        tag: item.tag,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAcademy(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: ANNOUNCEMENTS */}
      {subTab === 'announcements' && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {announcements.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : item.type === 'MAINTENANCE'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-gray-900">{item.title}</h4>
                      <span
                        className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                          item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.active ? 'Aktif Tayang' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditItem(item);
                      setAnnForm({
                        title: item.title,
                        type: item.type,
                        message: item.message,
                        link: item.link || '',
                        active: item.active,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnn(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Universal CMS Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">
                {subTab === 'news'
                  ? editItem ? 'Edit Artikel Berita' : 'Tulis Berita Baru'
                  : subTab === 'academy'
                  ? editItem ? 'Edit Modul Akademi' : 'Tambah Modul Edukasi'
                  : editItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM NEWS */}
            {subTab === 'news' && (
              <form onSubmit={handleSaveNews} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Judul Berita</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Waktu Baca</label>
                    <input
                      type="text"
                      value={newsForm.readTime}
                      onChange={(e) => setNewsForm({ ...newsForm, readTime: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ringkasan Singkat</label>
                  <textarea
                    rows={2}
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Konten Lengkap</label>
                  <textarea
                    rows={4}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">URL Gambar Header</label>
                  <input
                    type="url"
                    value={newsForm.imageUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-white font-bold rounded-xl"
                  >
                    Simpan Artikel
                  </button>
                </div>
              </form>
            )}

            {/* FORM ACADEMY */}
            {subTab === 'academy' && (
              <form onSubmit={handleSaveAcademy} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Judul Topik Edukasi</label>
                  <input
                    type="text"
                    required
                    value={academyForm.title}
                    onChange={(e) => setAcademyForm({ ...academyForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tingkat Kesulitan</label>
                    <select
                      value={academyForm.level}
                      onChange={(e: any) => setAcademyForm({ ...academyForm, level: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    >
                      <option value="PEMULA">PEMULA (Beginner)</option>
                      <option value="MENENGAH">MENENGAH (Intermediate)</option>
                      <option value="LANJUTAN">LANJUTAN (Advanced)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Kategori / Tag</label>
                    <input
                      type="text"
                      value={academyForm.tag}
                      onChange={(e) => setAcademyForm({ ...academyForm, tag: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deskripsi Ringkas</label>
                  <textarea
                    rows={2}
                    value={academyForm.description}
                    onChange={(e) => setAcademyForm({ ...academyForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Silabus & Materi Belajar</label>
                  <textarea
                    rows={4}
                    value={academyForm.content}
                    onChange={(e) => setAcademyForm({ ...academyForm, content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-white font-bold rounded-xl"
                  >
                    Simpan Modul
                  </button>
                </div>
              </form>
            )}

            {/* FORM ANNOUNCEMENTS */}
            {subTab === 'announcements' && (
              <form onSubmit={handleSaveAnn} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Judul Siaran</label>
                  <input
                    type="text"
                    required
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tipe Siaran</label>
                    <select
                      value={annForm.type}
                      onChange={(e: any) => setAnnForm({ ...annForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    >
                      <option value="INFO">Informasi Biasa</option>
                      <option value="WARNING">Peringatan Penting</option>
                      <option value="MAINTENANCE">Jadwal Pemeliharaan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status Penyiaran</label>
                    <select
                      value={annForm.active ? 'true' : 'false'}
                      onChange={(e) => setAnnForm({ ...annForm, active: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                    >
                      <option value="true">Aktif (Tampil di User)</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pesan Pengumuman</label>
                  <textarea
                    rows={3}
                    required
                    value={annForm.message}
                    onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-white font-bold rounded-xl"
                  >
                    Simpan Pengumuman
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
