import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AnalyticsPeriod, AnalyticsFilters } from '@/types/crm';
import { cn } from '@/lib/utils';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export function AnalyticsFiltersComponent({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    filters.selectedMonth || new Date()
  );

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    onFiltersChange({
      ...filters,
      period
    });
  };

  const handleGroupByChange = (groupBy: 'day' | 'week' | 'month') => {
    onFiltersChange({
      ...filters,
      groupBy
    });
  };

  const handleCustomDateRange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      onFiltersChange({
        ...filters,
        period: 'custom',
        customDateRange: {
          startDate: range.from,
          endDate: range.to
        }
      });
    }
  };

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
    onFiltersChange({
      ...filters,
      period: 'specific_month',
      selectedMonth: month,
      customDateRange: {
        startDate: startOfMonth(month),
        endDate: endOfMonth(month)
      }
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? subMonths(selectedMonth, 1)
      : addMonths(selectedMonth, 1);
    
    handleMonthChange(newMonth);
  };

  const periodOptions = [
    { value: 'day', label: 'Сегодня' },
    { value: 'current_month', label: 'Текущий месяц' },
    { value: 'last_month', label: 'Прошлый месяц' },
    { value: 'current_year', label: 'Текущий год' },
    { value: 'specific_month', label: 'Конкретный месяц' },
    { value: 'custom', label: 'Произвольная дата' }
  ];

  const groupByOptions = [
    { value: 'day', label: 'По дням' },
    { value: 'week', label: 'По неделям' },
    { value: 'month', label: 'По месяцам' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры аналитики</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Период</label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Группировка данных</label>
            <Select value={filters.groupBy} onValueChange={handleGroupByChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите группировку" />
              </SelectTrigger>
              <SelectContent>
                {groupByOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Выбор конкретного месяца */}
        {filters.period === 'specific_month' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите месяц</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedMonth, "MMMM yyyy", { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={(date) => date && handleMonthChange(date)}
                    defaultMonth={selectedMonth}
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Произвольная дата */}
        {filters.period === 'custom' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Диапазон дат</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.customDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.customDateRange ? (
                    `${format(filters.customDateRange.startDate, "dd.MM.yyyy", { locale: ru })} - ${format(filters.customDateRange.endDate, "dd.MM.yyyy", { locale: ru })}`
                  ) : (
                    "Выберите даты"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={filters.customDateRange?.startDate}
                  selected={{
                    from: filters.customDateRange?.startDate,
                    to: filters.customDateRange?.endDate
                  }}
                  onSelect={handleCustomDateRange}
                  numberOfMonths={2}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
