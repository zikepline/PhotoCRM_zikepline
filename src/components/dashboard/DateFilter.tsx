import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { DateFilter as DateFilterType } from '@/types/crm';
import { formatDate } from '@/lib/utils/calculations';
import { DateRange } from 'react-day-picker';

interface DateFilterProps {
  onFilterChange: (filter: DateFilterType) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<DateFilterType['type']>('current_month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleFilterClick = (type: DateFilterType['type']) => {
    setActiveFilter(type);
    if (type === 'custom' && dateRange?.from && dateRange?.to) {
      onFilterChange({ type, startDate: dateRange.from, endDate: dateRange.to });
    } else {
      onFilterChange({ type });
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;

    // Если уже есть полный диапазон (from и to), начинаем новый выбор
    if (dateRange?.from && dateRange?.to) {
      setDateRange({ from: range.from, to: undefined });
      return;
    }

    // Если есть только from, устанавливаем to
    if (dateRange?.from && !dateRange?.to) {
      const newRange = { from: dateRange.from, to: range.from };
      setDateRange(newRange);
      setActiveFilter('custom');
      const endOfDay = new Date(range.from);
      endOfDay.setHours(23, 59, 59, 999);
      onFilterChange({ type: 'custom', startDate: dateRange.from, endDate: endOfDay });
      return;
    }

    // Первый клик - устанавливаем from
    setDateRange({ from: range.from, to: undefined });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button
        variant={activeFilter === 'current_month' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('current_month')}
        size="sm"
      >
        Текущий месяц
      </Button>
      <Button
        variant={activeFilter === 'last_month' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('last_month')}
        size="sm"
      >
        Прошлый месяц
      </Button>
      <Button
        variant={activeFilter === 'from_year_start' ? 'default' : 'outline'}
        onClick={() => handleFilterClick('from_year_start')}
        size="sm"
      >
        С 1 января
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={activeFilter === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn('justify-start text-left font-normal')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from && dateRange?.to ? (
              `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
            ) : (
              'Произвольная дата'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={1}
            initialFocus
            className="pointer-events-auto"
            classNames={{
              day_range_start: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
              day_range_end: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
              day_range_middle: "bg-primary/10 text-foreground hover:bg-primary/20 rounded-none",
              day_today: "bg-accent text-accent-foreground font-semibold"
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
