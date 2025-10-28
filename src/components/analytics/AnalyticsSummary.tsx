import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/analytics';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Target, 
  Percent,
  BarChart3
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function SummaryCard({ title, value, icon: Icon, description, trend }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              к предыдущему периоду
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsSummaryProps {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalDeals: number;
    averageDealSize: number;
    conversionRate: number;
    profitMargin: number;
  };
  previousSummary?: never;
}

export function AnalyticsSummary({ summary, previousSummary }: AnalyticsSummaryProps) {
  const calculateTrend = undefined as unknown as never;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SummaryCard
        title="Общая выручка"
        value={formatCurrency(summary.totalRevenue)}
        icon={DollarSign}
        description="За выбранный период"
        
      />
      
      <SummaryCard
        title="Чистая прибыль"
        value={formatCurrency(summary.totalProfit)}
        icon={TrendingUp}
        description="После всех расходов"
        
      />
      
      <SummaryCard
        title="Количество заказов"
        value={summary.totalDeals}
        icon={ShoppingBag}
        description="Всего сделок"
        
      />
      
      <SummaryCard
        title="Средний чек"
        value={formatCurrency(summary.averageDealSize)}
        icon={Target}
        description="На один заказ"
        
      />
      
      <SummaryCard
        title="Конверсия"
        value={`${summary.conversionRate.toFixed(1)}%`}
        icon={Percent}
        description="Успешных сделок"
        
      />
      
      <SummaryCard
        title="Рентабельность"
        value={`${summary.profitMargin.toFixed(1)}%`}
        icon={BarChart3}
        description="Прибыль к выручке"
        
      />
    </div>
  );
}
