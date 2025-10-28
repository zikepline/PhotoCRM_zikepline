import { Deal, AnalyticsPeriod, AnalyticsDateRange, AnalyticsData, AnalyticsMetric, ChartDataPoint, AnalyticsChartData } from '@/types/crm';
import { calculateStatistics } from './calculations';

// Получение диапазона дат для периода
export function getDateRangeForPeriod(period: AnalyticsPeriod, customRange?: AnalyticsDateRange, selectedMonth?: Date): AnalyticsDateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'day':
      return {
        startDate: new Date(today),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'current_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        startDate: lastMonth,
        endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      };
    
    case 'current_year':
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      };
    
    case 'specific_month':
      if (selectedMonth) {
        return {
          startDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1),
          endDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59)
        };
      }
      return getDateRangeForPeriod('current_month');
    
    case 'custom':
      return customRange || getDateRangeForPeriod('current_month');
    
    default:
      return getDateRangeForPeriod('current_month');
  }
}

// Фильтрация сделок по дате
export function filterDealsByDateRange(deals: Deal[], dateRange: AnalyticsDateRange): Deal[] {
  return deals.filter(deal => {
    const dealDate = new Date(deal.createdAt);
    return dealDate >= dateRange.startDate && dealDate <= dateRange.endDate;
  });
}

// Расчет метрик для сравнения периодов
export function calculatePeriodComparison(
  currentDeals: Deal[], 
  previousDeals: Deal[]
): AnalyticsMetric[] {
  const currentStats = calculateStatistics(currentDeals);
  const previousStats = calculateStatistics(previousDeals);
  
  const metrics: AnalyticsMetric[] = [
    {
      name: 'Выручка',
      value: currentStats.totalRevenue,
      previousValue: previousStats.totalRevenue,
      changePercent: calculateChangePercent(currentStats.totalRevenue, previousStats.totalRevenue),
      color: '#f97316'
    },
    {
      name: 'Прибыль',
      value: currentStats.profit,
      previousValue: previousStats.profit,
      changePercent: calculateChangePercent(currentStats.profit, previousStats.profit),
      color: '#059669'
    },
    {
      name: 'Налоги',
      value: currentStats.totalTax,
      previousValue: previousStats.totalTax,
      changePercent: calculateChangePercent(currentStats.totalTax, previousStats.totalTax),
      color: '#f59e0b'
    },
    {
      name: 'Количество заказов',
      value: currentDeals.length,
      previousValue: previousDeals.length,
      changePercent: calculateChangePercent(currentDeals.length, previousDeals.length),
      color: '#3b82f6'
    },
    {
      name: 'Средний чек',
      value: currentStats.averageDealSize,
      previousValue: previousStats.averageDealSize,
      changePercent: calculateChangePercent(currentStats.averageDealSize, previousStats.averageDealSize),
      color: '#8b5cf6'
    },
    {
      name: 'Конверсия',
      value: currentStats.conversionRate,
      previousValue: previousStats.conversionRate,
      changePercent: calculateChangePercent(currentStats.conversionRate, previousStats.conversionRate),
      color: '#ef4444'
    }
  ];
  
  return metrics;
}

// Расчет процента изменения
export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Группировка данных по дням/неделям/месяцам
export function groupDataByPeriod(
  deals: Deal[], 
  groupBy: 'day' | 'week' | 'month'
): ChartDataPoint[] {
  const grouped = new Map<string, Deal[]>();
  
  deals.forEach(deal => {
    const date = new Date(deal.createdAt);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(deal);
  });
  
  return Array.from(grouped.entries())
    .map(([date, deals]) => ({
      date,
      value: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      label: formatDateLabel(date, groupBy)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Форматирование меток дат
export function formatDateLabel(dateStr: string, groupBy: 'day' | 'week' | 'month'): string {
  const date = new Date(dateStr);
  
  switch (groupBy) {
    case 'day':
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    case 'week':
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`;
    case 'month':
      return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    default:
      return date.toLocaleDateString('ru-RU');
  }
}

// Создание данных для графиков
export function createChartData(
  deals: Deal[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): AnalyticsChartData[] {
  const revenueData = groupDataByPeriod(deals, groupBy);
  const profitData = groupDataByPeriod(
    deals.filter(d => d.status === 'completed'), 
    groupBy
  ).map(point => ({
    ...point,
    value: calculateStatistics(
      deals.filter(d => 
        d.status === 'completed' && 
        new Date(d.createdAt).toISOString().split('T')[0] === point.date
      )
    ).profit
  }));
  
  const dealsCountData = groupDataByPeriod(deals, groupBy).map(point => ({
    ...point,
    value: deals.filter(d => 
      new Date(d.createdAt).toISOString().split('T')[0] === point.date
    ).length
  }));
  
  return [
    {
      metric: 'Выручка',
      data: revenueData,
      color: '#f97316',
      yAxis: 'left'
    },
    {
      metric: 'Прибыль',
      data: profitData,
      color: '#059669',
      yAxis: 'left'
    },
    {
      metric: 'Количество заказов',
      data: dealsCountData,
      color: '#3b82f6',
      yAxis: 'right'
    }
  ];
}

// Основная функция для получения аналитических данных
export function generateAnalyticsData(
  deals: Deal[],
  period: AnalyticsPeriod,
  customRange?: AnalyticsDateRange,
  selectedMonth?: Date
): AnalyticsData {
  const dateRange = getDateRangeForPeriod(period, customRange, selectedMonth);
  const currentDeals = filterDealsByDateRange(deals, dateRange);
  
  // Получаем данные для предыдущего периода для сравнения
  const previousDateRange = getPreviousPeriodRange(dateRange, period);
  const previousDeals = filterDealsByDateRange(deals, previousDateRange);
  
  const metrics = calculatePeriodComparison(currentDeals, previousDeals);
  const charts = createChartData(currentDeals);
  const currentStats = calculateStatistics(currentDeals);
  
  return {
    period,
    dateRange,
    metrics,
    charts,
    summary: {
      totalRevenue: currentStats.totalRevenue,
      totalProfit: currentStats.profit,
      totalDeals: currentDeals.length,
      averageDealSize: currentStats.averageDealSize,
      conversionRate: currentStats.conversionRate,
      profitMargin: currentStats.totalRevenue > 0 ? (currentStats.profit / currentStats.totalRevenue) * 100 : 0
    }
  };
}

// Получение диапазона для предыдущего периода
export function getPreviousPeriodRange(
  currentRange: AnalyticsDateRange, 
  period: AnalyticsPeriod
): AnalyticsDateRange {
  const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime();
  const startDate = new Date(currentRange.startDate.getTime() - duration);
  const endDate = new Date(currentRange.startDate.getTime() - 1);
  
  return { startDate, endDate };
}

// Форматирование валюты
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Форматирование процентов
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
