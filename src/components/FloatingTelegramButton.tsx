import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingTelegramButton: React.FC = () => {
  const [telegramLink, setTelegramLink] = useState('');

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

  if (!telegramLink) return null;

  return (
    <a
      href={telegramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-full shadow-lg shadow-[#0088cc]/50 transition-all hover:scale-110"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};
