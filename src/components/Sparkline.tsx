import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  isPositive?: boolean;
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  isPositive = true,
  width = 80,
  height = 28,
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-0" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = color || (isPositive ? '#16a34a' : '#dc2626');

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
