import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DealsList } from '@/components/dashboard/DealsList';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DealDialog } from '@/components/deals/DealDialog';
import { supabase } from '@/integrations/supabase/client';
import { calculateStatistics, formatCurrency, filterDealsByDate } from '@/lib/utils/calculations';
import { Deal, DateFilter as DateFilterType } from '@/types/crm';
import { TrendingUp, ShoppingBag, Receipt, ListChecks, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Простая и красивая иконка рубля в круге (используем текст с кругом)
const CircleRubleIcon = ({ className }: { className?: string }) => (
  <div className={cn("rounded-full border-2 border-current flex items-center justify-center w-8 h-8", className)}>
    <span className="font-bold text-base">₽</span>
  </div>
);

export default function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterType>({ type: 'current_month' });
  const [dealDialogOpen, setDealDialogOpen] = useState(false);

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
      const filtered = filterDealsByDate(formattedDeals, dateFilter);
      setFilteredDeals(filtered);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки заказов');
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    const filtered = filterDealsByDate(deals, dateFilter);
    setFilteredDeals(filtered);
  }, [dateFilter, deals]);

  // Фильтруемая статистика (только денежные показатели)
  const filteredStats = calculateStatistics(filteredDeals);
  
  // Нефильтруемая статистика (количество заказов)
  const totalDeals = deals.length;
  const completedDeals = deals.filter(d => d.status === 'completed').length;
  const lostDeals = deals.filter(d => d.status === 'lost').length;
  const activeDealsCount = deals.filter(d => d.status !== 'completed' && d.status !== 'new' && d.status !== 'lost').length;
  
  const recentDeals = filteredDeals
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Панель управления</h1>
          <p className="text-muted-foreground mt-1">
            Добро пожаловать в PhotoCRM
          </p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-primary hover:shadow-primary"
          onClick={() => setDealDialogOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Новый заказ
        </Button>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Период:</span>
        <DateFilter onFilterChange={setDateFilter} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего заказов"
          value={totalDeals.toString()}
          icon={ListChecks}
          variant="default"
        />
        <StatCard
          title="В работе"
          value={activeDealsCount.toString()}
          icon={ShoppingBag}
          variant="warning"
        />
        <StatCard
          title="Завершено"
          value={completedDeals.toString()}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Проиграно"
          value={lostDeals.toString()}
          icon={XCircle}
          variant="destructive"
        />
      </div>

      {/* Filtered Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Общая выручка (за период)"
          value={formatCurrency(filteredStats.totalRevenue)}
          icon={CircleRubleIcon}
          variant="success"
        />
        <StatCard
          title="Чистая прибыль (за период)"
          value={formatCurrency(filteredStats.profit)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Налоги (за период)"
          value={formatCurrency(filteredStats.totalTax)}
          icon={CircleRubleIcon}
          variant="warning"
        />
      </div>

      {/* Recent Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealsList deals={recentDeals} title="Последние заказы" onUpdate={loadDeals} />
        <DealsList 
          deals={filteredDeals.filter(d => d.status !== 'completed' && d.status !== 'new' && d.status !== 'lost')} 
          title="В работе"
          onUpdate={loadDeals}
        />
      </div>

      <DealDialog
        open={dealDialogOpen}
        onOpenChange={setDealDialogOpen}
        onSuccess={loadDeals}
      />
    </div>
  );
}
