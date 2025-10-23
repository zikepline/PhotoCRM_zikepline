import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types/crm';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: string;
  title: string;
  deals: Deal[];
  color: string;
  onUpdate: () => void;
}

export function KanbanColumn({ status, title, deals, color, onUpdate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const dealIds = useMemo(() => deals.map(deal => deal.id), [deals]);

  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div className="flex flex-col min-w-[320px] bg-muted/30 rounded-lg">
      <div className={cn('p-4 rounded-t-lg', color)}>
        <div className="flex items-center justify-between text-white">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            {deals.length}
          </span>
        </div>
        <p className="text-sm text-white/90 mt-1">
          {new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
          }).format(totalAmount)}
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-4 space-y-3 min-h-[500px] transition-colors',
          isOver && 'bg-primary/5'
        )}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <KanbanCard key={deal.id} deal={deal} onUpdate={onUpdate} />
          ))}
        </SortableContext>
        
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Перетащите сюда заказы
          </div>
        )}
      </div>
    </div>
  );
}
