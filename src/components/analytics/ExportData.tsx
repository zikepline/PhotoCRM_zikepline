import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { AnalyticsData } from '@/types/crm';
import { formatCurrency } from '@/lib/utils/analytics';

interface ExportDataProps {
  analyticsData: AnalyticsData;
}

export function ExportData({ analyticsData }: ExportDataProps) {
  const exportToExcel = () => {
    // Экспорт как SpreadsheetML (Excel 2003 XML), корректно открывается с кириллицей
    const rows = analyticsData.charts.map(chart =>
      chart.data.map(point => [point.date, chart.metric, String(point.value), point.label || ''])
    ).flat();

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
    const workbookOpen = `\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`;
    const styles = `\n<Styles><Style ss:ID="s62"><NumberFormat ss:Format="Standard"/></Style></Styles>`;
    const worksheetOpen = `\n<Worksheet ss:Name="Analytics">\n<Table>`;
    const headerRow = `\n<Row>\n<Cell><Data ss:Type="String">Дата</Data></Cell>\n<Cell><Data ss:Type="String">Метрика</Data></Cell>\n<Cell><Data ss:Type="Number">Значение</Data></Cell>\n<Cell><Data ss:Type="String">Метка</Data></Cell>\n</Row>`;
    const dataRows = rows.map(r => `\n<Row>\n<Cell><Data ss:Type="String">${escapeXml(r[0])}</Data></Cell>\n<Cell><Data ss:Type="String">${escapeXml(r[1])}</Data></Cell>\n<Cell ss:StyleID="s62"><Data ss:Type="Number">${Number(r[2]) || 0}</Data></Cell>\n<Cell><Data ss:Type="String">${escapeXml(r[3])}</Data></Cell>\n</Row>`).join('');
    const worksheetClose = `\n</Table>\n</Worksheet>`;
    const workbookClose = `\n</Workbook>`;

    const content = xmlHeader + workbookOpen + styles + worksheetOpen + headerRow + dataRows + worksheetClose + workbookClose;

    // Добавляем BOM для совместимости
    const utf8Bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([utf8Bom, content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    triggerDownloadBlob(blob, 'analytics.xls');
  };

  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const triggerDownloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
