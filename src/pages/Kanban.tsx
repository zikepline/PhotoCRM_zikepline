import { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealStatus } from '@/types/crm';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const columns: { status: string; title: string; color: string }[] = [
  { status: 'new', title: 'Новые', color: 'bg-blue-500' },
  { status: 'contact', title: 'Контакт', color: 'bg-cyan-500' },
  { status: 'negotiation', title: 'Переговоры', color: 'bg-yellow-500' },
  { status: 'contract', title: 'Договор', color: 'bg-orange-500' },
  { status: 'shooting', title: 'Съемка', color: 'bg-purple-500' },
  { status: 'editing', title: 'Обработка', color: 'bg-indigo-500' },
  { status: 'delivery', title: 'Доставка', color: 'bg-pink-500' },
  { status: 'completed', title: 'Завершено', color: 'bg-green-500' },
  { status: 'lost', title: 'Проигран', color: 'bg-red-500' },
];

export default function Kanban() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletedLost, setShowCompletedLost] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    deal: Deal | null;
    newStatus: string;
  }>({ open: false, deal: null, newStatus: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const pageSize = 200;
      let allRows: any[] = [];

      // Загружаем ВСЕ заказы без фильтров
      let from = 0;
      while (true) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        const batch = data || [];
        allRows = allRows.concat(batch);
        if (batch.length < pageSize) break;
        from += pageSize;
      }

      const formattedDeals: Deal[] = allRows.map((d: any) => ({
        id: d.id,
        title: d.title,
        amount: Number(d.amount) || 0,
        status: d.status,
        contactId: d.contact_id,
        responsibleId: d.user_id,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at),
        description: d.description,
        phone: d.phone,
        email: d.email,
        links: d.links || [],
        stageHistory: d.stage_history || [],
        tags: d.tags || [],
        albumPrice: (Number(d.amount) || 0) / (d.children_count || 1),
        childrenCount: d.children_count,
        printCost: Number(d.print_cost) || 0,
        fixedExpenses: Number(d.fixed_expenses) || 0,
        schoolPaymentType: d.school_payment_type,
        schoolPercent: Number(d.school_percent) || 0,
        schoolFixed: Number(d.school_fixed) || 0,
        photographerPaymentType: d.photographer_payment_type,
        photographerPercent: Number(d.photographer_percent) || 0,
        photographerFixed: Number(d.photographer_fixed) || 0,
        retoucherPaymentType: d.retoucher_payment_type,
        retoucherPercent: Number(d.retoucher_percent) || 0,
        retoucherFixed: Number(d.retoucher_fixed) || 0,
        layoutPaymentType: d.layout_payment_type,
        layoutPercent: Number(d.layout_percent) || 0,
        layoutFixed: Number(d.layout_fixed) || 0,
        taxBase: d.tax_base,
        taxPercent: Number(d.tax_percent) || 0,
      }));

      setDeals(formattedDeals);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки заказов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  // Мемоизируем группировку заказов для производительности
  const dealsByStatus = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    columns.forEach(col => {
      grouped[col.status] = deals.filter(deal => deal.status === col.status);
    });
    return grouped;
  }, [deals]);

  
  // Подсчет скрытых заказов
  const hiddenDealsCount = useMemo(() => {
    if (showCompletedLost) return { completed: 0, lost: 0 };
    const completedCount = dealsByStatus['completed']?.length || 0;
    const lostCount = dealsByStatus['lost']?.length || 0;
    return { completed: completedCount, lost: lostCount };
  }, [dealsByStatus, showCompletedLost]);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    let newStatus: string;

    // Проверяем, бросили на колонку или на карточку
    const targetColumn = columns.find(col => col.status === over.id);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
      // Бросили на карточку - найдем статус этой карточки
      const targetDeal = deals.find(d => d.id === over.id);
      if (!targetDeal) return;
      newStatus = targetDeal.status as string;
    }

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === newStatus) return;

    // Проверка для финальных статусов
    if (deal.status === 'completed' || deal.status === 'lost') {
      setConfirmDialog({
        open: true,
        deal,
        newStatus,
      });
      return;
    }

    await updateDealStatus(dealId, newStatus, deal);
  };

  const updateDealStatus = async (dealId: string, newStatus: string, originalDeal: Deal) => {
    // Оптимистичное обновление
    setDeals((prevDeals) =>
      prevDeals.map((d) => (d.id === dealId ? { ...d, status: newStatus as DealStatus } : d))
    );

    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus })
        .eq('id', dealId);

      if (error) throw error;

      toast.success('Статус заказа обновлен');
    } catch (error: any) {
      // Откат изменений при ошибке
      setDeals((prevDeals) =>
        prevDeals.map((d) => (d.id === dealId ? { ...d, status: originalDeal.status as DealStatus } : d))
      );
      toast.error(error.message || 'Ошибка обновления статуса');
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.deal) return;
    
    await updateDealStatus(
      confirmDialog.deal.id,
      confirmDialog.newStatus,
      confirmDialog.deal
    );
    
    setConfirmDialog({ open: false, deal: null, newStatus: '' });
  };

  const getDealsByStatus = (status: string) => {
    return dealsByStatus[status] || [];
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Доска заказов</h1>
            <p className="text-muted-foreground mt-1">
              Перетаскивайте карточки для изменения статуса
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Label htmlFor="show-completed" className="text-sm cursor-pointer">
                Показать завершенные/проигранные
              </Label>
              <Switch
                id="show-completed"
                checked={showCompletedLost}
                onCheckedChange={setShowCompletedLost}
              />
              {!showCompletedLost && (hiddenDealsCount.completed > 0 || hiddenDealsCount.lost > 0) && (
                <span className="text-sm text-muted-foreground">
                  (Скрыто: {hiddenDealsCount.completed + hiddenDealsCount.lost})
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={loadDeals} 
              disabled={isLoading}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>
        
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Загрузка заказов...</p>
          </div>
        )}
      </div>

      {!isLoading && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
              const isFinal = column.status === 'completed' || column.status === 'lost';
              const fullDeals = getDealsByStatus(column.status);
              const headerCount = fullDeals.length;
              const headerAmount = fullDeals.reduce((s, d) => s + d.amount, 0);
              const dealsForRender = !showCompletedLost && isFinal ? [] : fullDeals;
              return (
                <KanbanColumn
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  color={column.color}
                  deals={dealsForRender}
                  headerCount={headerCount}
                  headerAmount={headerAmount}
                  onUpdate={loadDeals}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeDeal ? <KanbanCard deal={activeDeal} onUpdate={loadDeals} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, deal: null, newStatus: '' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите изменение статуса</AlertDialogTitle>
            <AlertDialogDescription>
              Заказ "{confirmDialog.deal?.title}" уже имеет статус "
              {confirmDialog.deal?.status === 'completed' ? 'Завершено' : 'Проигран'}".
              <br />
              <br />
              Вы уверены, что хотите изменить статус?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Изменить статус
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
