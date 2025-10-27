import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, BarChart3 } from 'lucide-react';
import { AnalyticsData } from '@/types/crm';
import { formatCurrency } from '@/lib/utils/analytics';

interface ExportDataProps {
  analyticsData: AnalyticsData;
}

export function ExportData({ analyticsData }: ExportDataProps) {
  const exportToCSV = () => {
    const csvData = analyticsData.charts.map(chart => 
      chart.data.map(point => ({
        Дата: point.date,
        Метрика: chart.metric,
        Значение: point.value,
        Метка: point.label || ''
      }))
    ).flat();
    
    const csvContent = [
      'Дата,Метрика,Значение,Метка',
      ...csvData.map(row => `${row.Дата},${row.Метрика},${row.Значение},${row.Метка}`)
    ].join('\n');
    
    downloadFile(csvContent, 'analytics.csv', 'text/csv');
  };

  const exportToJSON = () => {
    const jsonData = {
      period: analyticsData.period,
      dateRange: {
        startDate: analyticsData.dateRange.startDate.toISOString(),
        endDate: analyticsData.dateRange.endDate.toISOString()
      },
      summary: analyticsData.summary,
      metrics: analyticsData.metrics,
      charts: analyticsData.charts
    };
    
    downloadFile(JSON.stringify(jsonData, null, 2), 'analytics.json', 'application/json');
  };

  const exportToExcel = () => {
    // Простая реализация экспорта в Excel через CSV с расширением .xlsx
    const csvData = analyticsData.charts.map(chart => 
      chart.data.map(point => ({
        Дата: point.date,
        Метрика: chart.metric,
        Значение: point.value,
        Метка: point.label || ''
      }))
    ).flat();
    
    const csvContent = [
      'Дата,Метрика,Значение,Метка',
      ...csvData.map(row => `${row.Дата},${row.Метрика},${row.Значение},${row.Метка}`)
    ].join('\n');
    
    downloadFile(csvContent, 'analytics.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    const report = `
АНАЛИТИЧЕСКИЙ ОТЧЕТ
Период: ${analyticsData.dateRange.startDate.toLocaleDateString('ru-RU')} - ${analyticsData.dateRange.endDate.toLocaleDateString('ru-RU')}

СВОДНЫЕ ПОКАЗАТЕЛИ:
- Общая выручка: ${formatCurrency(analyticsData.summary.totalRevenue)}
- Чистая прибыль: ${formatCurrency(analyticsData.summary.totalProfit)}
- Количество заказов: ${analyticsData.summary.totalDeals}
- Средний чек: ${formatCurrency(analyticsData.summary.averageDealSize)}
- Конверсия: ${analyticsData.summary.conversionRate.toFixed(1)}%
- Рентабельность: ${analyticsData.summary.profitMargin.toFixed(1)}%

ИЗМЕНЕНИЯ К ПРЕДЫДУЩЕМУ ПЕРИОДУ:
${analyticsData.metrics.map(metric => 
  `- ${metric.name}: ${metric.changePercent ? (metric.changePercent >= 0 ? '+' : '') + metric.changePercent.toFixed(1) + '%' : 'Нет данных'}`
).join('\n')}

ДЕТАЛЬНАЯ ДИНАМИКА:
${analyticsData.charts.map(chart => 
  `${chart.metric}:\n${chart.data.map(point => 
    `  ${point.date}: ${chart.metric.includes('заказов') ? point.value : formatCurrency(point.value)}`
  ).join('\n')}`
).join('\n\n')}

Отчет сгенерирован: ${new Date().toLocaleString('ru-RU')}
    `.trim();
    
    downloadFile(report, 'analytics_report.txt', 'text/plain');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Экспорт данных
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="w-4 h-4 mr-2" />
          CSV файл
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="w-4 h-4 mr-2" />
          JSON файл
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Excel файл
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Текстовый отчет
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
