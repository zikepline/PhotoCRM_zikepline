import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsMetric } from '@/types/crm';
import { formatCurrency, formatPercent } from '@/lib/utils/analytics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: AnalyticsMetric;
  compareLabel: string;
}

export function MetricCard({ metric, compareLabel }: MetricCardProps) {
  const isPositive = metric.changePercent && metric.changePercent > 0;
  const isNegative = metric.changePercent && metric.changePercent < 0;
  const isNeutral = metric.changePercent === 0 || !metric.changePercent;

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNegative) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatValue = (value: number) => {
    if (metric.name.includes('заказов') || metric.name.includes('Конверсия')) {
      return metric.name.includes('Конверсия') ? `${value.toFixed(1)}%` : value.toString();
    }
    return formatCurrency(value);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.name}
        </CardTitle>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: metric.color }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(metric.value)}</div>
        {metric.changePercent !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>{formatPercent(metric.changePercent)}</span>
            <span className="text-muted-foreground">{compareLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricsGridProps {
  metrics: AnalyticsMetric[];
  compareLabel?: string;
}

export function MetricsGrid({ metrics, compareLabel = 'к предыдущему периоду' }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} compareLabel={compareLabel} />
      ))}
    </div>
  );
}
