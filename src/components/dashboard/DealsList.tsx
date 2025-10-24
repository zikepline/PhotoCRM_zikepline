import { useState } from 'react';
import { Deal } from '@/types/crm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/calculations';
import { Clock, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealDialog } from '@/components/deals/DealDialog';
import { DealFinancialInfo } from '@/components/deals/DealFinancialInfo';
import { getDeals } from '@/lib/storage';

interface DealsListProps {
  deals: Deal[];
  title: string;
  onUpdate?: () => void;
}

const statusLabels: Record<string, string> = {
  new: 'Новый',
  contact: 'Контакт',
  negotiation: 'Переговоры',
  contract: 'Договор',
  shooting: 'Съемка',
  editing: 'Обработка',
  delivery: 'Доставка',
  completed: 'Завершен',
  lost: 'Проигран',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contact: 'bg-cyan-100 text-cyan-800',
  negotiation: 'bg-yellow-100 text-yellow-800',
  contract: 'bg-orange-100 text-orange-800',
  shooting: 'bg-purple-100 text-purple-800',
  editing: 'bg-indigo-100 text-indigo-800',
  delivery: 'bg-pink-100 text-pink-800',
  completed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export function DealsList({ deals, title, onUpdate }: DealsListProps) {
  const [editDeal, setEditDeal] = useState<Deal | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (deal: Deal) => {
    setEditDeal(deal);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    onUpdate?.();
  };
  return (
    <>
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {deals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Нет заказов</p>
          ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground flex-1">{deal.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[deal.status]}>
                      {statusLabels[deal.status]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(deal)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {formatCurrency(deal.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(deal.createdAt)}
                  </div>
                </div>
                
                {deal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {deal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <DealFinancialInfo deal={deal} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editDeal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
