import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/crm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils/calculations';
import { Calendar, Tag, Phone, Mail, Link as LinkIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealDialog } from '@/components/deals/DealDialog';
import { DealFinancialInfo } from '@/components/deals/DealFinancialInfo';

interface KanbanCardProps {
  deal: Deal;
  onUpdate: () => void;
}

export function KanbanCard({ deal, onUpdate }: KanbanCardProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTotalDays = () => {
    if (!deal.stageHistory || deal.stageHistory.length === 0) return 0;
    const created = new Date(deal.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card
          {...attributes}
          {...listeners}
          onClick={() => setViewDialogOpen(true)}
          className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${
            isDragging ? 'opacity-50 shadow-primary' : ''
          }`}
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-2 truncate">
              {deal.title}
            </h4>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(deal.amount)}
              </span>
            </div>

            {deal.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {deal.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(deal.createdAt)}</span>
            </div>

            {deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {deal.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {deal.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{deal.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{deal.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Сумма</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(deal.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Статус</p>
                <Badge>{deal.status}</Badge>
              </div>
            </div>

            {deal.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Описание</p>
                <p className="text-foreground">{deal.description}</p>
              </div>
            )}

            {deal.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${deal.phone}`} className="text-primary hover:underline">
                  {deal.phone}
                </a>
              </div>
            )}

            {deal.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${deal.email}`} className="text-primary hover:underline">
                  {deal.email}
                </a>
              </div>
            )}

            {deal.links && deal.links.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Ссылки
                </p>
                <div className="space-y-2">
                  {deal.links.map((link, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{link.description}</p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deal.stageHistory && deal.stageHistory.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  История этапов (Всего дней: {getTotalDays()})
                </p>
                <div className="space-y-2">
                  {deal.stageHistory.map((stage, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{stage.status}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(stage.enteredAt)}
                          {stage.exitedAt && ` - ${formatDate(stage.exitedAt)}`}
                        </p>
                      </div>
                      {stage.daysInStage !== undefined && (
                        <Badge variant="secondary">{stage.daysInStage} дн.</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <DealFinancialInfo deal={deal} />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Закрыть
              </Button>
              <Button 
                onClick={() => {
                  setViewDialogOpen(false);
                  setEditDialogOpen(true);
                }}
                className="bg-gradient-primary"
              >
                Редактировать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DealDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        deal={deal}
        onSuccess={onUpdate}
      />
    </>
  );
}
