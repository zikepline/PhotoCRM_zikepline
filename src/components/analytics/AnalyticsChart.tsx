import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsChartData } from '@/types/crm';
import { formatCurrency } from '@/lib/utils/analytics';

interface AnalyticsChartProps {
  data: AnalyticsChartData[];
  height?: number;
}

export function AnalyticsChart({ data, height = 400 }: AnalyticsChartProps) {
  // Объединяем все данные по датам
  const chartData = React.useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();
    
    data.forEach(chart => {
      chart.data.forEach(point => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        dateMap.get(point.date)![chart.metric] = point.value;
      });
    });
    
    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {new Date(label).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="text-sm font-medium">
                {entry.dataKey.includes('заказов') 
                  ? entry.value 
                  : formatCurrency(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {data.map((chart, index) => (
            <Line
              key={chart.metric}
              yAxisId={chart.yAxis || 'left'}
              type="monotone"
              dataKey={chart.metric}
              stroke={chart.color}
              strokeWidth={2}
              dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chart.color, strokeWidth: 2 }}
              name={chart.metric}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
