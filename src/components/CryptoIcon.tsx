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
  ADA: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
  TRX: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
  SHIB: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
  TON: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
  NEAR: 'https://assets.coingecko.com/coins/images/10365/small/near.png',
  SUI: 'https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png',
  APT: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.png',
  RENDER: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
  TAO: 'https://assets.coingecko.com/coins/images/28362/small/bittensor.png',
  KAS: 'https://assets.coingecko.com/coins/images/25751/small/kaspa-icon.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
  INJ: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
  OP: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
  XLM: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
  XMR: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
  XAU: 'https://assets.coingecko.com/coins/images/10481/small/Tether_Gold.png',
  STX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4847.png',
  DGB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/109.png',
  ZRO: 'https://s2.coinmarketcap.com/static/img/coins/64x64/26997.png',
  MODE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/31174.png',
  MAGMA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29424.png',
  POL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28324.png',
  NVDA: 'https://assets.coingecko.com/coins/images/30356/small/nvidia.png',
  AAPL: 'https://assets.coingecko.com/coins/images/30357/small/apple.png',
  TSLA: 'https://assets.coingecko.com/coins/images/30358/small/tesla.png',
  MSFT: 'https://assets.coingecko.com/coins/images/30359/small/microsoft.png',
  GOOGL: 'https://assets.coingecko.com/coins/images/30360/small/google.png',
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
  ADA: { bg: 'bg-blue-700', text: 'text-white' },
  DOGE: { bg: 'bg-yellow-600', text: 'text-white' },
  AVAX: { bg: 'bg-red-600', text: 'text-white' },
  DOT: { bg: 'bg-pink-600', text: 'text-white' },
  LINK: { bg: 'bg-blue-600', text: 'text-white' },
  MATIC: { bg: 'bg-purple-600', text: 'text-white' },
  TRX: { bg: 'bg-red-500', text: 'text-white' },
  SHIB: { bg: 'bg-orange-500', text: 'text-white' },
  TON: { bg: 'bg-sky-500', text: 'text-white' },
  NEAR: { bg: 'bg-black', text: 'text-white' },
  SUI: { bg: 'bg-blue-500', text: 'text-white' },
  APT: { bg: 'bg-emerald-600', text: 'text-white' },
  PEPE: { bg: 'bg-green-600', text: 'text-white' },
  RENDER: { bg: 'bg-red-700', text: 'text-white' },
  UNI: { bg: 'bg-pink-500', text: 'text-white' },
  LTC: { bg: 'bg-slate-600', text: 'text-white' },
  TAO: { bg: 'bg-neutral-800', text: 'text-white' },
  KAS: { bg: 'bg-teal-600', text: 'text-white' },
  ATOM: { bg: 'bg-indigo-900', text: 'text-white' },
  INJ: { bg: 'bg-cyan-600', text: 'text-white' },
  ARB: { bg: 'bg-sky-600', text: 'text-white' },
  OP: { bg: 'bg-red-600', text: 'text-white' },
  XLM: { bg: 'bg-cyan-500', text: 'text-white' },
  XMR: { bg: 'bg-orange-600', text: 'text-white' },
  XAU: { bg: 'bg-amber-600', text: 'text-white' },
  NVDA: { bg: 'bg-green-600', text: 'text-white' },
  AAPL: { bg: 'bg-gray-800', text: 'text-white' },
  TSLA: { bg: 'bg-red-600', text: 'text-white' },
  MSFT: { bg: 'bg-blue-600', text: 'text-white' },
  GOOGL: { bg: 'bg-red-500', text: 'text-white' },
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
