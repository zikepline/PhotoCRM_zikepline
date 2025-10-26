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
import { Plus, CheckSquare, Search, Edit, Trash2, Calendar, Clock, CheckCircle, Circle } from 'lucide-react';
import { Task } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [deleteTaskId, setDeleteTaskId] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    completed: false,
  });

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => 
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, tasks]);

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
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-primary"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Новая задача
          </Button>
        </div>

        {/* Filters */}
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

        {/* Tasks List */}
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
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(task.dueDate)}</span>
                          {isOverdue(task.dueDate, task.id) && (
                            <Badge variant="destructive" className="text-xs">Просрочено</Badge>
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
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
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
