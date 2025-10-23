import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils/calculations';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DateFilter as DateFilterType } from '@/types/crm';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface ActivityStats {
  total_visits: number;
  unique_users: number;
  visits_by_date: { date: string; count: number }[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total_visits: 0,
    unique_users: 0,
    visits_by_date: [],
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>({
    type: 'current_month',
  });

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [dateFilter, isAdmin]);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        toast.error('У вас нет прав доступа к этой странице');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadUsers();
    } catch (error: any) {
      console.error('Error checking admin:', error);
      toast.error('Ошибка проверки прав доступа');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false });

      if (!profiles) return;

      // Get last sign in data from auth metadata
      const usersInfo: UserInfo[] = profiles.map(profile => ({
        ...profile,
        last_sign_in_at: null, // We'll get this from activity
      }));

      // Get last activity for each user
      for (const user of usersInfo) {
        const { data: activity } = await supabase
          .from('user_activity')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('activity_type', 'login')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (activity) {
          user.last_sign_in_at = activity.created_at;
        }
      }

      setUsers(usersInfo);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    }
  };

  const loadStats = async () => {
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      const now = new Date();
      
      switch (dateFilter.type) {
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'from_year_start':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        case 'custom':
          startDate = dateFilter.startDate;
          endDate = dateFilter.endDate;
          break;
      }

      let query = supabase
        .from('user_activity')
        .select('*', { count: 'exact' });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: activities, count } = await query;

      const uniqueUsers = new Set(activities?.map(a => a.user_id) || []).size;

      // Group by date
      const visitsByDate = activities?.reduce((acc: any, activity) => {
        const date = formatDate(new Date(activity.created_at));
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const visitsByDateArray = Object.entries(visitsByDate || {}).map(([date, count]) => ({
        date,
        count: count as number,
      }));

      setStats({
        total_visits: count || 0,
        unique_users: uniqueUsers,
        visits_by_date: visitsByDateArray,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error('Ошибка загрузки статистики');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

      <div className="mb-6">
        <DateFilter onFilterChange={setDateFilter} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Всего посещений</CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.total_visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Уникальных пользователей</CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.unique_users}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Все зарегистрированные пользователи системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead>Последний вход</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(new Date(user.created_at))}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? formatDateTime(new Date(user.last_sign_in_at))
                      : 'Никогда'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}