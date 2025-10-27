import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AnalyticsChart } from './AnalyticsChart';
import { AnalyticsChartData } from '@/types/crm';
import { formatCurrency } from '@/lib/utils/analytics';

interface MetricSelectorProps {
  availableMetrics: string[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

function MetricSelector({ availableMetrics, selectedMetrics, onMetricsChange }: MetricSelectorProps) {
  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выберите метрики для отображения</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableMetrics.map(metric => (
            <div key={metric} className="flex items-center space-x-2">
              <Checkbox
                id={metric}
                checked={selectedMetrics.includes(metric)}
                onCheckedChange={() => handleMetricToggle(metric)}
              />
              <Label htmlFor={metric} className="text-sm font-medium">
                {metric}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMetricsChange(availableMetrics)}
          >
            Выбрать все
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMetricsChange([])}
          >
            Очистить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdvancedAnalyticsProps {
  charts: AnalyticsChartData[];
  onMetricsChange: (metrics: string[]) => void;
  selectedMetrics: string[];
}

export function AdvancedAnalytics({ charts, onMetricsChange, selectedMetrics }: AdvancedAnalyticsProps) {
  const availableMetrics = charts.map(chart => chart.metric);
  
  const filteredCharts = charts.filter(chart => 
    selectedMetrics.includes(chart.metric)
  );

  const chartColors = {
    'Выручка': '#10b981',
    'Прибыль': '#059669',
    'Налоги': '#f59e0b',
    'Количество заказов': '#3b82f6',
    'Средний чек': '#8b5cf6',
    'Конверсия': '#ef4444'
  };

  return (
    <div className="space-y-6">
      <MetricSelector
        availableMetrics={availableMetrics}
        selectedMetrics={selectedMetrics}
        onMetricsChange={onMetricsChange}
      />

      {filteredCharts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Динамика выбранных показателей</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={filteredCharts} height={500} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Выберите метрики для отображения</p>
              <p className="text-sm text-muted-foreground">
                Отметьте нужные показатели в списке выше
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Статистика по периодам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCharts.map(chart => {
                const total = chart.data.reduce((sum, point) => sum + point.value, 0);
                const average = total / chart.data.length;
                const max = Math.max(...chart.data.map(point => point.value));
                const min = Math.min(...chart.data.map(point => point.value));
                
                return (
                  <div key={chart.metric} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: chart.color }}
                      />
                      <span className="font-medium">{chart.metric}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Всего: </span>
                        <span className="font-medium">
                          {chart.metric.includes('заказов') 
                            ? total 
                            : formatCurrency(total)
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Среднее: </span>
                        <span className="font-medium">
                          {chart.metric.includes('заказов') 
                            ? average.toFixed(1) 
                            : formatCurrency(average)
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Макс: </span>
                        <span className="font-medium">
                          {chart.metric.includes('заказов') 
                            ? max 
                            : formatCurrency(max)
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Мин: </span>
                        <span className="font-medium">
                          {chart.metric.includes('заказов') 
                            ? min 
                            : formatCurrency(min)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тренды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCharts.map(chart => {
                if (chart.data.length < 2) return null;
                
                const firstValue = chart.data[0].value;
                const lastValue = chart.data[chart.data.length - 1].value;
                const change = lastValue - firstValue;
                const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
                
                return (
                  <div key={chart.metric} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: chart.color }}
                      />
                      <span className="font-medium">{chart.metric}</span>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Изменение:</span>
                        <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? '+' : ''}
                          {chart.metric.includes('заказов') 
                            ? change.toFixed(0) 
                            : formatCurrency(change)
                          }
                        </span>
                        <span className={`text-xs ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
