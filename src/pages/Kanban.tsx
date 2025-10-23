import { useEffect, useState } from 'react';
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
    try {
      const { data, error } = await (supabase as any)
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDeals: Deal[] = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        amount: d.amount,
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
        albumPrice: d.amount / (d.children_count || 1),
        childrenCount: d.children_count,
        printCost: d.print_cost,
        fixedExpenses: d.fixed_expenses,
        schoolPaymentType: d.school_payment_type,
        schoolPercent: d.school_percent,
        schoolFixed: d.school_fixed,
        photographerPaymentType: d.photographer_payment_type,
        photographerPercent: d.photographer_percent,
        photographerFixed: d.photographer_fixed,
        taxBase: d.tax_base,
        taxPercent: d.tax_percent,
      }));

      setDeals(formattedDeals);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки заказов');
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

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
      const { error } = await (supabase as any)
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
    return deals.filter((deal) => deal.status === status);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Доска заказов</h1>
        <p className="text-muted-foreground mt-1">
          Перетаскивайте карточки для изменения статуса
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              color={column.color}
              deals={getDealsByStatus(column.status)}
              onUpdate={loadDeals}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <KanbanCard deal={activeDeal} onUpdate={loadDeals} /> : null}
        </DragOverlay>
      </DndContext>

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
