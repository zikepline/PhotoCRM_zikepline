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
    setDateRange(range);
    if (range?.from && range?.to) {
      setActiveFilter('custom');
      // Устанавливаем конец дня для endDate, чтобы включить заказы за этот день
      const endOfDay = new Date(range.to);
      endOfDay.setHours(23, 59, 59, 999);
      onFilterChange({ type: 'custom', startDate: range.from, endDate: endOfDay });
    }
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
              day_selected: "bg-primary/20 text-primary-foreground hover:bg-primary/30",
              day_range_start: "bg-primary text-primary-foreground hover:bg-primary",
              day_range_end: "bg-primary text-primary-foreground hover:bg-primary",
              day_range_middle: "bg-primary/10 text-foreground",
              day_today: "bg-accent text-accent-foreground"
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
