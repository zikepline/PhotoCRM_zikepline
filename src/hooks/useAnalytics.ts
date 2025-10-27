import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, AnalyticsPeriod, AnalyticsDateRange, AnalyticsData } from '@/types/crm';
import { generateAnalyticsData } from '@/lib/utils/analytics';

export function useAnalytics(period: AnalyticsPeriod, customRange?: AnalyticsDateRange, selectedMonth?: Date) {
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // Загрузка сделок
  const { data: dealsData, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((d: any) => ({
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
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  useEffect(() => {
    if (dealsData) {
      setDeals(dealsData);
    }
  }, [dealsData]);

  // Генерация аналитических данных
  const analyticsData = useMemo(() => {
    if (!deals.length) return null;
    return generateAnalyticsData(deals, period, customRange, selectedMonth);
  }, [deals, period, customRange, selectedMonth]);

  return {
    analyticsData,
    isLoading,
    error,
    deals
  };
}

// Хук для получения метрик в реальном времени
export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState({
    totalDeals: 0,
    activeDeals: 0,
    completedDeals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*');

        if (dealsData) {
          const deals = dealsData.map((d: any) => ({
            id: d.id,
            title: d.title,
            amount: d.amount || 0,
            status: d.status,
            createdAt: new Date(d.created_at),
            // ... другие поля
          }));

          const now = new Date();
          const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const totalDeals = deals.length;
          const activeDeals = deals.filter(d => 
            d.status !== 'completed' && d.status !== 'lost' && d.status !== 'new'
          ).length;
          const completedDeals = deals.filter(d => d.status === 'completed').length;
          const totalRevenue = deals.reduce((sum, d) => sum + d.amount, 0);
          const monthlyRevenue = deals
            .filter(d => d.createdAt >= currentMonth)
            .reduce((sum, d) => sum + d.amount, 0);

          setMetrics({
            totalDeals,
            activeDeals,
            completedDeals,
            totalRevenue,
            monthlyRevenue
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки метрик:', error);
      }
    };

    fetchMetrics();
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return metrics;
}
