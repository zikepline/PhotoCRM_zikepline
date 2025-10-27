import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { AnalyticsMetric } from '@/types/crm';
import { formatCurrency, formatPercent } from '@/lib/utils/analytics';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  target?: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
}

function KPICard({ title, value, target, change, icon: Icon, color = '#3b82f6', description }: KPICardProps) {
  const progress = target ? (typeof value === 'number' ? (value / target) * 100 : 0) : undefined;
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = change === 0 || !change;

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Прогресс к цели</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-2",
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>{formatPercent(change)}</span>
            <span className="text-muted-foreground">
              к предыдущему периоду
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KPIDashboardProps {
  metrics: AnalyticsMetric[];
  targets?: {
    revenue?: number;
    profit?: number;
    deals?: number;
    conversion?: number;
  };
}

export function KPIDashboard({ metrics, targets }: KPIDashboardProps) {
  const revenueMetric = metrics.find(m => m.name === 'Выручка');
  const profitMetric = metrics.find(m => m.name === 'Прибыль');
  const dealsMetric = metrics.find(m => m.name === 'Количество заказов');
  const conversionMetric = metrics.find(m => m.name === 'Конверсия');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Выручка"
        value={revenueMetric ? formatCurrency(revenueMetric.value) : '0 ₽'}
        target={targets?.revenue}
        change={revenueMetric?.changePercent}
        icon={DollarSign}
        color="#10b981"
        description="Общий доход за период"
      />
      
      <KPICard
        title="Прибыль"
        value={profitMetric ? formatCurrency(profitMetric.value) : '0 ₽'}
        target={targets?.profit}
        change={profitMetric?.changePercent}
        icon={TrendingUp}
        color="#059669"
        description="Чистая прибыль"
      />
      
      <KPICard
        title="Заказы"
        value={dealsMetric ? dealsMetric.value : 0}
        target={targets?.deals}
        change={dealsMetric?.changePercent}
        icon={Users}
        color="#3b82f6"
        description="Количество сделок"
      />
      
      <KPICard
        title="Конверсия"
        value={conversionMetric ? `${conversionMetric.value.toFixed(1)}%` : '0%'}
        target={targets?.conversion}
        change={conversionMetric?.changePercent}
        icon={Target}
        color="#8b5cf6"
        description="Успешных сделок"
      />
    </div>
  );
}

interface PerformanceIndicatorProps {
  title: string;
  current: number;
  previous: number;
  target?: number;
  format?: 'currency' | 'number' | 'percent';
}

export function PerformanceIndicator({ 
  title, 
  current, 
  previous, 
  target, 
  format = 'number' 
}: PerformanceIndicatorProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const progress = target ? (current / target) * 100 : undefined;
  
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatValue(current)}</span>
          <Badge variant={change >= 0 ? "default" : "destructive"}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </Badge>
        </div>
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прогресс к цели</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Предыдущий период: {formatValue(previous)}
        </div>
      </CardContent>
    </Card>
  );
}
