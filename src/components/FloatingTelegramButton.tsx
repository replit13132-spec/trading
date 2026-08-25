import React, { useState, useEffect } from 'react';
import { Send, X, MessageSquareCode, ShieldAlert } from 'lucide-react';

export const FloatingTelegramButton: React.FC = () => {
  const [telegramLink, setTelegramLink] = useState('https://t.me/xmoney_support');
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.telegramLink) {
          setTelegramLink(data.data.telegramLink);
        }
      })
      .catch((e) => console.error('Error fetching config:', e));
  }, []);

  if (!isVisible) return null;

  const handleRedirect = () => {
    const url = telegramLink || 'https://t.me/xmoney_support';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50 animate-bounce"
        id="telegram-minimized-trigger"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white rounded-full shadow-xl shadow-sky-500/30 transition-all transform hover:scale-110 border border-white/20"
          title="Buka Chat Telegram"
        >
          <Send className="w-6 h-6 rotate-[-25deg] translate-x-[-1px] translate-y-[1px]" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 max-w-sm w-[280px] bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-sky-500/10 hover:shadow-sky-500/20 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
      id="telegram-floating-card"
    >
      {/* Header card with close/minimize */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-1.5 text-sky-400">
          <Send className="w-4 h-4 rotate-[-25deg]" />
          <span className="text-[10px] uppercase font-black tracking-wider">Layanan CS 24/7</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px] font-bold px-1.5"
            title="Sembunyikan"
          >
            Sembunyikan
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Tutup Permanen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="space-y-3">
        <div>
          <h4 className="font-extrabold text-xs text-white">Hubungi Kami di Telegram</h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            Butuh bantuan deposit, withdraw, atau ada kendala sistem? Customer Service kami siap melayani Anda.
          </p>
        </div>

        {/* Live Indicator Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400">CS Online • Balasan Instan</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRedirect}
          className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 hover:text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 rotate-[-25deg]" />
          <span>Mulai Chat Sekarang</span>
        </button>
      </div>
    </div>
  );
};
