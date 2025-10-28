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

export default function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: 'current_month',
    selectedMetrics: ['revenue', 'profit', 'deals'],
    groupBy: 'day'
  });

  const { analyticsData, isLoading, error } = useAnalytics(
    filters.period, 
    filters.customDateRange,
    filters.selectedMonth
  );

  const handleRefresh = () => {
    // Данные обновятся автоматически благодаря React Query
    toast.success('Данные обновлены');
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
            
            {/* Все метрики с трендами */}
            <Card>
              <CardHeader>
                <CardTitle>Показатели за период</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsGrid metrics={analyticsData.metrics} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Графики динамики */}
            <Card>
              <CardHeader>
                <CardTitle>Динамика показателей</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={analyticsData.charts} height={500} />
              </CardContent>
            </Card>
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
