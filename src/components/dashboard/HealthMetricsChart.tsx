'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface HealthMetricsChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  type?: 'bar' | 'line' | 'donut';
  height?: number;
}

export function HealthMetricsChart({
  title,
  description,
  data,
  type = 'bar',
  height = 200,
}: HealthMetricsChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const defaultColors = [
    '#0ea5e9', // sky-500
    '#22c55e', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ];

  const getColor = (index: number, providedColor?: string) => {
    return providedColor || defaultColors[index % defaultColors.length];
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {type === 'bar' && (
          <div className="space-y-3" style={{ minHeight: height }}>
            {data.map((item, index) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                      backgroundColor: getColor(index, item.color),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {type === 'donut' && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="relative">
              <svg width={height} height={height} viewBox="0 0 100 100">
                {data.reduce<{ offset: number; elements: JSX.Element[] }>(
                  (acc, item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const element = (
                      <circle
                        key={item.label}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={getColor(index, item.color)}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-acc.offset}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-500"
                      />
                    );
                    return {
                      offset: acc.offset + percentage,
                      elements: [...acc.elements, element],
                    };
                  },
                  { offset: 0, elements: [] }
                ).elements}
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold fill-current"
                >
                  {total}
                </text>
              </svg>
            </div>
            <div className="ml-4 space-y-2">
              {data.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColor(index, item.color) }}
                  />
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'line' && (
          <div style={{ height }}>
            <svg width="100%" height={height} className="overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1="0"
                  y1={`${percent}%`}
                  x2="100%"
                  y2={`${percent}%`}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
              ))}

              {/* Area under the line */}
              <path
                d={`
                  M 0 ${height}
                  ${data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = maxValue > 0 ? height - (item.value / maxValue) * height : height;
                    return `L ${x}% ${y}`;
                  }).join(' ')}
                  L 100% ${height}
                  Z
                `}
                fill="url(#lineGradient)"
              />

              {/* Line */}
              <polyline
                points={data
                  .map((item, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = maxValue > 0 ? height - (item.value / maxValue) * height : height;
                    return `${x}%,${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                className="transition-all duration-500"
              />

              {/* Data points */}
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = maxValue > 0 ? height - (item.value / maxValue) * height : height;
                return (
                  <g key={item.label}>
                    <circle
                      cx={`${x}%`}
                      cy={y}
                      r="4"
                      fill="#0ea5e9"
                      className="transition-all duration-500"
                    />
                    <text
                      x={`${x}%`}
                      y={height + 16}
                      textAnchor="middle"
                      className="text-xs fill-current text-muted-foreground"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthMetricsChart;
