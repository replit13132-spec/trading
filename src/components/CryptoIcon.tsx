import React, { useState } from 'react';

interface CryptoIconProps {
  src?: string;
  symbol?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackColor?: string;
}

// Built-in SVG icons for reliable, instant rendering without network lag or 404s
const KNOWN_ICONS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  PTU: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15112.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  STX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4847.png',
  DGB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/109.png',
  ZRO: 'https://s2.coinmarketcap.com/static/img/coins/64x64/26997.png',
  MODE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/31174.png',
  MAGMA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29424.png',
  POL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28324.png',
  NVDA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16274.png',
  AAPL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16260.png',
  TSLA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16262.png',
};

const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  BTC: { bg: 'bg-amber-500', text: 'text-white' },
  ETH: { bg: 'bg-indigo-600', text: 'text-white' },
  SOL: { bg: 'bg-teal-500', text: 'text-white' },
  PTU: { bg: 'bg-blue-600', text: 'text-white' },
  MODE: { bg: 'bg-lime-400', text: 'text-gray-900' },
  MAGMA: { bg: 'bg-orange-600', text: 'text-white' },
  ZRO: { bg: 'bg-gray-900', text: 'text-white' },
  STX: { bg: 'bg-violet-600', text: 'text-white' },
  DGB: { bg: 'bg-sky-600', text: 'text-white' },
  USDT: { bg: 'bg-emerald-600', text: 'text-white' },
  XRP: { bg: 'bg-slate-800', text: 'text-white' },
  BNB: { bg: 'bg-yellow-500', text: 'text-gray-900' },
  NVDA: { bg: 'bg-green-600', text: 'text-white' },
  AAPL: { bg: 'bg-gray-800', text: 'text-white' },
  TSLA: { bg: 'bg-red-600', text: 'text-white' },
};

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  src,
  symbol = '',
  name = '',
  className = 'w-7 h-7 rounded-full',
  fallbackColor,
}) => {
  const cleanSymbol = (symbol || '').toUpperCase().trim();
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || KNOWN_ICONS[cleanSymbol]);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setImgSrc(src || KNOWN_ICONS[cleanSymbol]);
    setHasError(false);
  }, [src, cleanSymbol]);

  if (!imgSrc || hasError) {
    const brand = BRAND_COLORS[cleanSymbol] || {
      bg: fallbackColor || 'bg-blue-600',
      text: 'text-white',
    };
    const displayLabel = cleanSymbol.slice(0, 4) || name.slice(0, 3) || '?';

    return (
      <div
        className={`${className} ${brand.bg} ${brand.text} flex items-center justify-center font-extrabold text-[9px] uppercase shadow-sm flex-shrink-0 select-none overflow-hidden`}
        title={name || cleanSymbol}
      >
        <span>{displayLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name || cleanSymbol}
      className={`${className} object-cover flex-shrink-0`}
      onError={() => {
        if (KNOWN_ICONS[cleanSymbol] && imgSrc !== KNOWN_ICONS[cleanSymbol]) {
          setImgSrc(KNOWN_ICONS[cleanSymbol]);
        } else {
          setHasError(true);
        }
      }}
      loading="lazy"
    />
  );
};
