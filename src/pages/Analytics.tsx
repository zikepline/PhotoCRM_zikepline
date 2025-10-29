import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsFiltersComponent } from '@/components/analytics/AnalyticsFilters';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { MetricsGrid } from '@/components/analytics/MetricsGrid';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { ExportData } from '@/components/analytics/ExportData';
import { AnalyticsFilters, AnalyticsPeriod } from '@/types/crm';
import { toast } from 'sonner';
import { createChartData } from '@/lib/utils/analytics';

export default function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'current_month',
    selectedMetrics: ['revenue', 'profit', 'deals'],
    groupBy: 'day'
  });

  const { analyticsData, isLoading, error, refetch, deals } = useAnalytics(
    filters.period, 
    filters.customDateRange,
    filters.selectedMonth
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Данные обновлены');
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось обновить данные');
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки данных</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Произошла неизвестная ошибка'}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground mt-1">
            Детальный анализ вашего бизнеса
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          {analyticsData && <ExportData analyticsData={analyticsData} />}
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFiltersComponent 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      ) : analyticsData ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="detailed">Детально</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Основные показатели */}
            <AnalyticsSummary 
              summary={analyticsData.summary} 
              previousSummary={analyticsData.previousSummary}
            />
            
            {/* Налоги и расходы */}
            <Card>
              <CardHeader>
                <CardTitle>Налоги и расходы за период</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsGrid 
                  metrics={analyticsData.metrics.filter(m => 
                    m.name === 'Налоги' || m.name.startsWith('Расходы')
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Выбор метрик и график с учетом группировки */}
            {deals && (
              <AdvancedAnalytics 
                charts={createChartData(deals, analyticsData.dateRange, filters.groupBy)}
                selectedMetrics={filters.selectedMetrics}
                onMetricsChange={(metrics) => setFilters({ ...filters, selectedMetrics: metrics })}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      )}
    </div>
  );
}
