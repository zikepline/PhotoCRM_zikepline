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
  
  // Расчет расходов без налогов
  const currentExpensesWithoutTax = currentStats.totalRevenue - currentStats.profit - currentStats.totalTax;
  const previousExpensesWithoutTax = previousStats.totalRevenue - previousStats.profit - previousStats.totalTax;
  
  // Расчет расходов с налогами
  const currentExpensesWithTax = currentStats.totalRevenue - currentStats.profit;
  const previousExpensesWithTax = previousStats.totalRevenue - previousStats.profit;

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
    },
    {
      name: 'Рентабельность',
      value: currentStats.totalRevenue > 0 ? (currentStats.profit / currentStats.totalRevenue) * 100 : 0,
      previousValue: previousStats.totalRevenue > 0 ? (previousStats.profit / previousStats.totalRevenue) * 100 : 0,
      changePercent: calculateChangePercent(
        currentStats.totalRevenue > 0 ? (currentStats.profit / currentStats.totalRevenue) * 100 : 0,
        previousStats.totalRevenue > 0 ? (previousStats.profit / previousStats.totalRevenue) * 100 : 0
      ),
      color: '#06b6d4'
    },
    {
      name: 'Расходы (без налогов)',
      value: currentExpensesWithoutTax,
      previousValue: previousExpensesWithoutTax,
      changePercent: calculateChangePercent(currentExpensesWithoutTax, previousExpensesWithoutTax),
      color: '#84cc16'
    },
    {
      name: 'Расходы (с налогами)',
      value: currentExpensesWithTax,
      previousValue: previousExpensesWithTax,
      changePercent: calculateChangePercent(currentExpensesWithTax, previousExpensesWithTax),
      color: '#eab308'
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
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year',
  dateRange?: AnalyticsDateRange
): ChartDataPoint[] {
  const grouped = new Map<string, Deal[]>();

  const getKey = (date: Date): string => {
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0,0,0,0);
        return weekStart.toISOString().split('T')[0];
      }
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      case 'quarter': {
        const q = Math.floor(date.getMonth() / 3);
        return new Date(date.getFullYear(), q * 3, 1).toISOString().split('T')[0];
      }
      case 'year':
        return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
      default:
        return date.toISOString().split('T')[0];
    }
  };

  deals.forEach(deal => {
    const key = getKey(new Date(deal.createdAt));
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(deal);
  });

  // Заполняем пропуски нулями
  if (dateRange) {
    const cursor = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    cursor.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    while (cursor <= end) {
      const key = getKey(cursor);
      if (!grouped.has(key)) grouped.set(key, []);
      // шаг курсора
      switch (groupBy) {
        case 'day':
          cursor.setDate(cursor.getDate() + 1);
          break;
        case 'week':
          cursor.setDate(cursor.getDate() + 7);
          break;
        case 'month':
          cursor.setMonth(cursor.getMonth() + 1);
          break;
        case 'quarter':
          cursor.setMonth(cursor.getMonth() + 3);
          break;
        case 'year':
          cursor.setFullYear(cursor.getFullYear() + 1);
          break;
      }
    }
  }

  return Array.from(grouped.entries())
    .map(([date, deals]) => ({
      date,
      value: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      label: formatDateLabel(date, groupBy as any)
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
  dateRange: AnalyticsDateRange,
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day'
): AnalyticsChartData[] {
  const basePoints = groupDataByPeriod(deals, groupBy, dateRange); // выручка
  const byKey = new Map(basePoints.map(p => [p.date, p]));

  const calcForKey = (key: string) => {
    const [start] = [new Date(key)];
    let end = new Date(start);
    switch (groupBy) {
      case 'day': end = new Date(start); break;
      case 'week': end.setDate(start.getDate() + 6); break;
      case 'month': end = new Date(start.getFullYear(), start.getMonth() + 1, 0); break;
      case 'quarter': end = new Date(start.getFullYear(), start.getMonth() + 3, 0); break;
      case 'year': end = new Date(start.getFullYear(), 11, 31); break;
    }
    const slice = deals.filter(d => {
      const dt = new Date(d.createdAt);
      return dt >= start && dt <= end;
    });
    const stats = calculateStatistics(slice);
    const count = slice.length;
    const avg = stats.totalRevenue / (count || 1);
    return { stats, count, avg };
  };

  const profitData = basePoints.map(p => ({ ...p, value: calcForKey(p.date).stats.profit }));
  const taxData = basePoints.map(p => ({ ...p, value: calcForKey(p.date).stats.totalTax }));
  const dealsCountData = basePoints.map(p => ({ ...p, value: calcForKey(p.date).count }));
  const avgCheckData = basePoints.map(p => ({ ...p, value: calcForKey(p.date).avg }));
  const expensesNoTax = basePoints.map(p => ({ ...p, value: calcForKey(p.date).stats.totalRevenue - calcForKey(p.date).stats.profit - calcForKey(p.date).stats.totalTax }));
  const expensesWithTax = basePoints.map(p => ({ ...p, value: calcForKey(p.date).stats.totalRevenue - calcForKey(p.date).stats.profit }));

  return [
    { metric: 'Выручка', data: basePoints, color: '#f97316', yAxis: 'left' },
    { metric: 'Прибыль', data: profitData, color: '#059669', yAxis: 'left' },
    { metric: 'Налоги', data: taxData, color: '#f59e0b', yAxis: 'left' },
    { metric: 'Количество заказов', data: dealsCountData, color: '#3b82f6', yAxis: 'right' },
    { metric: 'Средний чек', data: avgCheckData, color: '#8b5cf6', yAxis: 'left' },
    { metric: 'Расходы (без налогов)', data: expensesNoTax, color: '#84cc16', yAxis: 'left' },
    { metric: 'Расходы (с налогами)', data: expensesWithTax, color: '#eab308', yAxis: 'left' },
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
  const previousStats = calculateStatistics(previousDeals);
  
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
    },
    previousSummary: {
      totalRevenue: previousStats.totalRevenue,
      totalProfit: previousStats.profit,
      totalDeals: previousDeals.length,
      averageDealSize: previousStats.averageDealSize,
      conversionRate: previousStats.conversionRate,
      profitMargin: previousStats.totalRevenue > 0 ? (previousStats.profit / previousStats.totalRevenue) * 100 : 0
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
