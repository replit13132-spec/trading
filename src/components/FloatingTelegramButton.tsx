import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export const FloatingTelegramButton: React.FC = () => {
  const [telegramLink, setTelegramLink] = useState('https://t.me/xmoney_support');

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

  const handleRedirect = () => {
    const url = telegramLink || 'https://t.me/xmoney_support';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      id="telegram-floating-trigger"
    >
      <button
        onClick={handleRedirect}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white rounded-full shadow-xl shadow-sky-500/30 transition-all transform hover:scale-110 active:scale-95 border border-white/20 relative animate-bounce"
        style={{ animationDuration: '3s' }}
        title="Hubungi CS di Telegram"
      >
        <Send className="w-6 h-6 rotate-[-25deg] translate-x-[-1px] translate-y-[1.5px]" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
};

