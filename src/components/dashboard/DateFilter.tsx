import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { DateFilter as DateFilterType } from '@/types/crm';
import { formatDate } from '@/lib/utils/calculations';

interface DateFilterProps {
  onFilterChange: (filter: DateFilterType) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<DateFilterType['type']>('current_month');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleFilterClick = (type: DateFilterType['type']) => {
    setActiveFilter(type);
    if (type === 'custom' && startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      onFilterChange({ type, startDate, endDate: endOfDay });
    } else {
      onFilterChange({ type });
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate) {
      setActiveFilter('custom');
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      onFilterChange({ type: 'custom', startDate: date, endDate: endOfDay });
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (startDate && date) {
      setActiveFilter('custom');
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      onFilterChange({ type: 'custom', startDate, endDate: endOfDay });
    }
  };

  const getCustomButtonText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `${formatDate(startDate)} - Дата окончания`;
    } else if (endDate) {
      return `Дата начала - ${formatDate(endDate)}`;
    }
    return 'Произвольная дата';
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
            {getCustomButtonText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Дата начала</h4>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Дата окончания</h4>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
