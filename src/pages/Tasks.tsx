import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckSquare, CheckCircle2, Circle, Clock, Search, Pencil, Trash2, Calendar as CalendarIcon, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils/calculations';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TasksCalendar } from '@/components/tasks/TasksCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: Date;
  completed: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [deleteTaskId, setDeleteTaskId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const loadTasks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        due_date: t.due_date ? new Date(t.due_date) : undefined,
        completed: t.completed || false,
        user_id: t.user_id,
        created_at: new Date(t.created_at),
        updated_at: new Date(t.updated_at),
      }));

      setTasks(formattedTasks);
      setFilteredTasks(formattedTasks);
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

    if (filterStatus === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    setFilteredTasks(filtered);
  }, [searchQuery, tasks, filterStatus]);

  const handleOpenDialog = (task?: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      toast.success(completed ? 'Задача отмечена как невыполненная' : 'Задача выполнена');
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка обновления задачи');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .delete()
        .eq('id', deleteTaskId);

      if (error) throw error;
      toast.success('Задача удалена');
      loadTasks();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления задачи');
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteTaskId(id);
    setDeleteDialogOpen(true);
  };

  const isOverdue = (dueDate?: Date, completed?: boolean) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-primary" />
              Задачи
            </h1>
            <p className="text-muted-foreground mt-1">
              Планирование и контроль задач
            </p>
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

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Список
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Календарь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  Все
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                >
                  Активные
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                >
                  Выполненные
                </Button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="p-12 shadow-card">
              <div className="text-center">
                <CheckSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Задачи не найдены' : 'Нет задач'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Попробуйте изменить запрос' : 'Создайте первую задачу'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить задачу
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className={cn(
                  "p-6 shadow-card hover:shadow-primary transition-all",
                  task.completed && "opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={cn(
                          "text-lg font-semibold text-foreground mb-1",
                          task.completed && "line-through"
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {task.due_date && (
                            <div className={cn(
                              "flex items-center gap-1",
                              isOverdue(task.due_date, task.completed) && "text-destructive font-medium"
                            )}>
                              <Clock className="w-4 h-4" />
                              {format(task.due_date, "PPP", { locale: ru })}
                            </div>
                          )}
                          <div>
                            Создана: {formatDate(task.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(task)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteDialog(task.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <TasksCalendar
              tasks={tasks}
              onTaskClick={handleOpenDialog}
              onToggleComplete={handleToggleComplete}
            />
          </TabsContent>
        </Tabs>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSuccess={loadTasks}
      />

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
