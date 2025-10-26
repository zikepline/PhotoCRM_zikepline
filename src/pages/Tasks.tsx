import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckSquare, Search, Edit, Trash2, Calendar as CalendarIcon, Clock, CheckCircle, Circle, List, Grid3X3 } from 'lucide-react';
import { Task } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ru } from 'date-fns/locale';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [deleteTaskId, setDeleteTaskId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    completed: false,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        completed: t.completed || false,
        responsibleId: t.user_id,
        dealId: t.deal_id,
        contactId: t.contact_id,
        companyId: t.company_id,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      }));

      // Сортируем задачи: сначала по дате выполнения (ближайшие сверху), затем по дате создания
      const sortedTasks = formattedTasks.sort((a, b) => {
        // Сначала сортируем по дате выполнения (ближайшие сверху)
        if (a.dueDate && b.dueDate) {
          const dueComparison = a.dueDate.getTime() - b.dueDate.getTime();
          if (dueComparison !== 0) return dueComparison;
        }
        
        // Если одна задача имеет дату выполнения, а другая нет - задача с датой идет выше
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        
        // Если обе задачи без даты выполнения или даты одинаковые, сортируем по дате создания (свежие сверху)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки задач');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => 
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    // Если выбрана дата в календаре, показываем только задачи на эту дату
    if (selectedDate && viewMode === 'calendar') {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, tasks, selectedDate, viewMode]);

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        completed: task.completed,
      });
    } else {
      setSelectedTask(undefined);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        completed: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        completed: formData.completed,
      };

      if (selectedTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', selectedTask.id);

        if (error) throw error;
        toast.success('Задача обновлена');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;
        toast.success('Задача создана');
      }

      setDialogOpen(false);
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения задачи');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', deleteTaskId);

      if (error) throw error;

      toast.success('Задача удалена');
      setDeleteDialogOpen(false);
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления задачи');
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      toast.success(completed ? 'Задача выполнена' : 'Задача возвращена в работу');
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка обновления задачи');
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setDeleteTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: Date, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return dueDate < new Date() && !task?.completed;
  };

  // Получить задачи на конкретную дату
  const getTasksForDate = (date: Date) => {
    const tasksOnDate = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
    
    // Отладочная информация
    if (tasksOnDate.length > 0) {
      console.log(`Задачи на ${date.toDateString()}:`, tasksOnDate.map(t => ({
        title: t.title,
        completed: t.completed,
        dueDate: t.dueDate,
        isOverdue: t.dueDate ? isOverdue(t.dueDate, t.id) : false
      })));
    }
    
    return tasksOnDate;
  };

  // Получить количество задач на дату
  const getTaskCountForDate = (date: Date) => {
    return getTasksForDate(date).length;
  };

  // Проверить, есть ли просроченные задачи на дату
  const hasOverdueTasksOnDate = (date: Date) => {
    const tasksOnDate = getTasksForDate(date);
    return tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
  };

  // Проверить, есть ли выполненные задачи на дату
  const hasCompletedTasksOnDate = (date: Date) => {
    const tasksOnDate = getTasksForDate(date);
    return tasksOnDate.some(task => task.completed);
  };

  // Получить тип задач на дату для цветовой индикации
  const getTaskTypeOnDate = (date: Date) => {
    const tasksOnDate = getTasksForDate(date);
    if (tasksOnDate.length === 0) return 'none';
    
    const hasOverdue = tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
    const hasCompleted = tasksOnDate.some(task => task.completed);
    const hasPending = tasksOnDate.some(task => !task.completed);
    
    if (hasOverdue && hasCompleted && hasPending) return 'mixed-all';
    if (hasOverdue && hasCompleted) return 'overdue-completed';
    if (hasOverdue && hasPending) return 'overdue-pending';
    if (hasCompleted && hasPending) return 'completed-pending';
    if (hasOverdue) return 'overdue';
    if (hasCompleted) return 'completed';
    if (hasPending) return 'pending';
    
    return 'none';
  };

  // Обработчик выбора даты в календаре
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Обработчик выбора даты в форме
  const handleFormDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
    } else {
      setFormData({ ...formData, dueDate: '' });
    }
    setCalendarOpen(false);
  };

  // Получить отформатированную дату для отображения
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'Выберите дату';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-primary" />
            Задачи
          </h1>
          <p className="text-muted-foreground mt-1">
            Планирование и контроль задач
          </p>
        </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                Список
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Календарь
              </Button>
            </div>
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-primary"
              onClick={() => handleOpenDialog()}
            >
          <Plus className="w-5 h-5 mr-2" />
          Новая задача
        </Button>
      </div>
        </div>

        {/* Filters - только в режиме списка */}
        {viewMode === 'list' && (
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все задачи</SelectItem>
                <SelectItem value="pending">В работе</SelectItem>
                <SelectItem value="completed">Выполненные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Календарь */}
        {viewMode === 'calendar' && (
          <div className="mb-6">
            {/* Фильтры для календарного режима */}
            <div className="mb-4 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все задачи</SelectItem>
                  <SelectItem value="pending">В работе</SelectItem>
                  <SelectItem value="completed">Выполненные</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ru}
                    className="rounded-md border-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-foreground",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                      day_range_end: "day-range-end",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
                      day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary",
                      day_outside: "text-muted-foreground opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:text-primary-foreground",
                      day_hidden: "invisible",
                    }}
                    modifiers={{
                      hasTasks: (date) => getTaskCountForDate(date) > 0,
                      overdue: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        const hasOverdue = tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
                        if (hasOverdue) console.log(`Overdue tasks on ${date.toDateString()}`);
                        return hasOverdue;
                      },
                      completed: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        return tasksOnDate.some(task => task.completed);
                      },
                      pending: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        return tasksOnDate.some(task => !task.completed);
                      },
                      overdueCompleted: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        const hasOverdue = tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
                        const hasCompleted = tasksOnDate.some(task => task.completed);
                        return hasOverdue && hasCompleted && !tasksOnDate.some(task => !task.completed);
                      },
                      overduePending: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        const hasOverdue = tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
                        const hasPending = tasksOnDate.some(task => !task.completed);
                        return hasOverdue && hasPending && !tasksOnDate.some(task => task.completed);
                      },
                      completedPending: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        const hasCompleted = tasksOnDate.some(task => task.completed);
                        const hasPending = tasksOnDate.some(task => !task.completed);
                        return hasCompleted && hasPending && !tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
                      },
                      mixedAll: (date) => {
                        const tasksOnDate = getTasksForDate(date);
                        const hasOverdue = tasksOnDate.some(task => isOverdue(task.dueDate!, task.id));
                        const hasCompleted = tasksOnDate.some(task => task.completed);
                        const hasPending = tasksOnDate.some(task => !task.completed);
                        return hasOverdue && hasCompleted && hasPending;
                      },
                    }}
                    modifiersClassNames={{
                      hasTasks: "font-medium",
                      overdue: "bg-red-100 text-red-800 font-bold",
                      completed: "bg-green-100 text-green-800 font-medium",
                      pending: "bg-blue-100 text-blue-800 font-medium",
                      overdueCompleted: "bg-gradient-to-br from-red-100 to-green-100 text-gray-800 font-bold",
                      overduePending: "bg-gradient-to-br from-red-100 to-blue-100 text-gray-800 font-bold",
                      completedPending: "bg-gradient-to-br from-green-100 to-blue-100 text-gray-800 font-medium",
                      mixedAll: "bg-gradient-to-br from-red-100 via-green-100 to-blue-100 text-gray-800 font-bold",
                    }}
                  />
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {selectedDate ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Задачи на {selectedDate.toLocaleDateString('ru-RU', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        Показать все
                      </Button>
                    </div>
                    
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">На эту дату нет задач</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTasks.map((task) => (
                          <div key={task.id} className={`p-4 border rounded-lg ${task.completed ? 'opacity-75 bg-muted/50' : 'bg-background'}`}>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={(checked) => handleToggleComplete(task.id, checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Создано: {formatDate(task.createdAt)}</span>
                                  </div>
                                  {isOverdue(task.dueDate!, task.id) && (
                                    <Badge className="text-xs bg-destructive text-destructive-foreground">Просрочено</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(task)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(task.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <CalendarIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите дату</h3>
                      <p className="text-muted-foreground">
                        Кликните на дату в календаре, чтобы увидеть задачи на этот день
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks List - только в режиме списка */}
        {viewMode === 'list' && (
          <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
      <Card className="p-12 shadow-card">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery || statusFilter !== 'all' ? 'Задачи не найдены' : 'Нет задач'}
                  </h3>
          <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Попробуйте изменить фильтры поиска'
                      : 'Создайте первую задачу для начала работы'
                    }
          </p>
        </div>
      </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className={`p-6 shadow-card hover:shadow-lg transition-shadow ${task.completed ? 'opacity-75' : ''}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => handleToggleComplete(task.id, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className={`text-sm mb-3 ${task.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.id) ? 'text-red-500' : ''}`}>
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(task.dueDate)}</span>
                            {isOverdue(task.dueDate, task.id) && (
                              <Badge className="text-xs bg-destructive text-destructive-foreground">Просрочено</Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Создано: {formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Редактировать задачу' : 'Новая задача'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название задачи"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание задачи"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Срок выполнения</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getFormattedDate(formData.dueDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={handleFormDateSelect}
                    locale={ru}
                    initialFocus
                    className="rounded-md border-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-foreground",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 text-foreground hover:bg-accent hover:text-accent-foreground",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                      day_range_end: "day-range-end",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
                      day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary",
                      day_outside: "text-muted-foreground opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:text-primary-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={formData.completed}
                onCheckedChange={(checked) => setFormData({ ...formData, completed: checked as boolean })}
              />
              <Label htmlFor="completed">Задача выполнена</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {selectedTask ? 'Сохранить' : 'Создать'}
              </Button>
    </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Задача будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
