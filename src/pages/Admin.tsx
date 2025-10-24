import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '@/lib/utils/calculations';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { DateFilter as DateFilterType } from '@/types/crm';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

interface ActivityStats {
  total_visits: number;
  unique_users: number;
  visits_by_date: { date: string; visits: number; unique: number }[];
}

type GroupBy = 'day' | 'week' | 'month' | 'year';

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
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [dateFilter, groupBy, isAdmin]);

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
        .select('id, email, name, phone, city, country, created_at')
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
          .maybeSingle();

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

      // Group by selected period
      const visitsByPeriod = activities?.reduce((acc: any, activity) => {
        const date = new Date(activity.created_at);
        let key = '';

        switch (groupBy) {
          case 'day':
            key = formatDate(date);
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = formatDate(weekStart);
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            key = date.getFullYear().toString();
            break;
        }

        if (!acc[key]) {
          acc[key] = { visits: 0, users: new Set() };
        }
        acc[key].visits++;
        acc[key].users.add(activity.user_id);
        return acc;
      }, {});

      const visitsByDateArray = Object.entries(visitsByPeriod || {})
        .map(([date, data]: [string, any]) => ({
          date,
          visits: data.visits,
          unique: data.users.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

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

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <DateFilter onFilterChange={setDateFilter} />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Группировка:</span>
          <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">По дням</SelectItem>
              <SelectItem value="week">По неделям</SelectItem>
              <SelectItem value="month">По месяцам</SelectItem>
              <SelectItem value="year">По годам</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Всего посещений</CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.total_visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Уникальных пользователей</CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" style={{ color: 'hsl(262 83% 58%)' }}>
              {stats.unique_users}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>График активности</CardTitle>
          <CardDescription>
            Всего посещений и уникальных пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.visits_by_date.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.visits_by_date}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover p-3 border rounded-md shadow-lg">
                          <p className="text-sm font-medium mb-1">{payload[0].payload.date}</p>
                          <p className="text-sm" style={{ color: 'hsl(var(--primary))' }}>
                            Всего посещений: {payload[0].value}
                          </p>
                          <p className="text-sm" style={{ color: 'hsl(262 83% 58%)' }}>
                            Уникальных пользователей: {payload[1]?.value || 0}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="visits" 
                  fill="hsl(var(--primary))" 
                  name="Всего посещений"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="unique" 
                  fill="hsl(262 83% 58%)" 
                  name="Уникальных пользователей"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Нет данных за выбранный период
            </div>
          )}
        </CardContent>
      </Card>

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
                <TableHead>Телефон</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Страна</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead>Последний вход</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>{user.city || '—'}</TableCell>
                  <TableCell>{user.country || '—'}</TableCell>
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
