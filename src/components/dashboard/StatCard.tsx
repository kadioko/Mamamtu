'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-800',
  primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
};

const iconStyles = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  primary: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
  success: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
  warning: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-600 dark:text-green-400'
      : trend.value < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-500'
    : '';

  return (
    <Card className={cn('transition-all hover:shadow-md', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(description || trend) && (
              <div className="flex items-center gap-2 text-sm">
                {trend && TrendIcon && (
                  <span className={cn('flex items-center gap-1', trendColor)}>
                    <TrendIcon className="h-4 w-4" />
                    {Math.abs(trend.value)}%
                  </span>
                )}
                {description && (
                  <span className="text-muted-foreground">{description}</span>
                )}
                {trend?.label && (
                  <span className="text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'p-3 rounded-full',
                iconStyles[variant]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
