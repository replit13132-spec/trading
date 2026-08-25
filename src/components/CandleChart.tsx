import React, { useState, useEffect, useRef } from 'react';
import { Candle } from '../types';
import { Maximize2, RotateCcw, RotateCw, Settings, SlidersHorizontal } from 'lucide-react';

interface CandleChartProps {
  symbol: string;
  currentPrice: number;
  currencyPrefix?: string;
  isIdr?: boolean;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  symbol,
  currentPrice,
  currencyPrefix = '',
  isIdr = false,
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '15m' | '1J' | '4J' | '1H' | '1W'>('15m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        const res = await fetch(`/api/markets/${symbol}/candles?timeframe=${timeframe}`);
        const json = await res.json();
        if (json.success && json.data) {
          setCandles(json.data);
        }
      } catch (err) {
        console.error('Failed to load candles', err);
      }
    };
    fetchCandles();
    const int = setInterval(fetchCandles, 5000);
    return () => clearInterval(int);
  }, [symbol, timeframe]);

  // Render chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const chartHeight = height - 60; // Leave 50px for volume + 20px for time
    const volumeHeight = 45;
    const paddingRight = 65; // For price labels

    // Calculate min & max price
    let minPrice = Math.min(...candles.map((c) => c.low));
    let maxPrice = Math.max(...candles.map((c) => c.high));
    if (minPrice === maxPrice) {
      minPrice *= 0.99;
      maxPrice *= 1.01;
    }
    const priceRange = maxPrice - minPrice;

    // Max volume
    const maxVol = Math.max(...candles.map((c) => c.volume), 1);

    // Draw horizontal grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = 15 + (chartHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Price text on axis
      const priceAtY = maxPrice - (i / gridSteps) * priceRange;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        isIdr ? Math.round(priceAtY).toLocaleString('id-ID') : priceAtY.toFixed(1),
        width - paddingRight + 6,
        y + 3
      );
    }

    const candleWidth = Math.max((width - paddingRight) / candles.length - 4, 3);
    const stepX = (width - paddingRight) / candles.length;

    candles.forEach((c, idx) => {
      const x = idx * stepX + stepX / 2;
      const isGreen = c.close >= c.open;
      const candleColor = isGreen ? '#10b981' : '#ef4444';

      // Candlestick coordinates
      const yHigh = 15 + ((maxPrice - c.high) / priceRange) * chartHeight;
      const yLow = 15 + ((maxPrice - c.low) / priceRange) * chartHeight;
      const yOpen = 15 + ((maxPrice - c.open) / priceRange) * chartHeight;
      const yClose = 15 + ((maxPrice - c.close) / priceRange) * chartHeight;

      // Draw wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = candleColor;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1.5);
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Draw Volume Bar at bottom
      const volBarHeight = (c.volume / maxVol) * volumeHeight;
      const volY = height - 20 - volBarHeight;
      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volBarHeight);

      // Time axis labels every few candles
      if (idx % Math.ceil(candles.length / 5) === 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.time, x, height - 5);
      }
    });

    // Draw current price indicator line
    const currentY = 15 + ((maxPrice - currentPrice) / priceRange) * chartHeight;
    if (currentY >= 0 && currentY <= chartHeight + 20) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width - paddingRight, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on right axis
      ctx.fillStyle = '#059669';
      ctx.fillRect(width - paddingRight, currentY - 9, paddingRight, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isIdr ? Math.round(currentPrice).toLocaleString('id-ID') : currentPrice.toFixed(1),
        width - paddingRight / 2,
        currentY + 3.5
      );
    }

    // Crosshair line on mouse move
    if (mousePos) {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 0.8;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height - 20);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width - paddingRight, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, currentPrice, mousePos, isIdr]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const paddingRight = 65;
    const stepX = (canvas.width - paddingRight) / candles.length;
    const candleIdx = Math.floor(x / stepX);
    if (candles[candleIdx]) {
      setHoveredCandle(candles[candleIdx]);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  return (
    <div className="bg-white border-b border-gray-200 select-none">
      {/* Timeframe Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-1">
          {(['1m', '15m', '1J', '4J', '1H', '1W'] as const).map((tf) => (
            <button
              key={tf}
              id={`tf-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                timeframe === tf
                  ? 'text-violet-800 font-bold bg-violet-50'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
          <span className="text-gray-400 text-[10px] ml-1">Lainnya ▾</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <button title="Indikator" className="hover:text-black">
            <span className="font-serif italic font-bold">fx</span> Indikator
          </button>
          <button title="Settings" className="hover:text-black">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button title="Fullscreen" className="hover:text-black">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OHLC Bar */}
      <div className="px-3 py-1 text-[11px] font-mono text-gray-500 flex items-center gap-3 overflow-x-auto bg-gray-50/50">
        {hoveredCandle ? (
          <>
            <span>O: <b className="text-gray-800">{isIdr ? Math.round(hoveredCandle.open).toLocaleString('id-ID') : hoveredCandle.open}</b></span>
            <span>H: <b className="text-gray-800">{isIdr ? Math.round(hoveredCandle.high).toLocaleString('id-ID') : hoveredCandle.high}</b></span>
            <span>L: <b className="text-gray-800">{isIdr ? Math.round(hoveredCandle.low).toLocaleString('id-ID') : hoveredCandle.low}</b></span>
            <span>C: <b className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-600' : 'text-red-600'}>{isIdr ? Math.round(hoveredCandle.close).toLocaleString('id-ID') : hoveredCandle.close}</b></span>
            <span>Vol: <b className="text-gray-800">{hoveredCandle.volume}</b></span>
          </>
        ) : (
          <>
            <span className="text-emerald-600 font-bold">
              {isIdr ? `Rp ${Math.round(currentPrice).toLocaleString('id-ID')}` : `${currentPrice.toFixed(1)} USDT`}
            </span>
            <span className="text-gray-400">Volume SMA 9</span>
          </>
        )}
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-56 relative bg-white">
        <canvas
          ref={canvasRef}
          width={420}
          height={224}
          className="w-full h-full cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
};
