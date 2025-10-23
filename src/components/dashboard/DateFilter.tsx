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
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const handleFilterClick = (type: DateFilterType['type']) => {
    setActiveFilter(type);
    if (type === 'custom' && customStartDate && customEndDate) {
      onFilterChange({ type, startDate: customStartDate, endDate: customEndDate });
    } else {
      onFilterChange({ type });
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      setActiveFilter('custom');
      onFilterChange({ type: 'custom', startDate: customStartDate, endDate: customEndDate });
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
            {customStartDate && customEndDate ? (
              `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
            ) : (
              'Произвольная дата'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Дата начала</p>
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={setCustomStartDate}
                initialFocus
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Дата окончания</p>
              <Calendar
                mode="single"
                selected={customEndDate}
                onSelect={setCustomEndDate}
              />
            </div>
            <Button 
              onClick={handleCustomDateChange} 
              className="w-full"
              disabled={!customStartDate || !customEndDate}
            >
              Применить
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
