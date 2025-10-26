import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
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

interface TasksCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

export function TasksCalendar({ tasks, onTaskClick, onToggleComplete }: TasksCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ru });
  const calendarEnd = endOfWeek(monthEnd, { locale: ru });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), day)
    );
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4 shadow-card">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const hasOverdueTasks = dayTasks.some(
              task => !task.completed && task.due_date && isOverdue(new Date(task.due_date))
            );

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 border rounded-lg transition-colors",
                  isCurrentMonth ? "bg-card" : "bg-muted/30",
                  isTodayDate && "border-primary border-2",
                  hasOverdueTasks && "border-destructive/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !isCurrentMonth && "text-muted-foreground",
                      isTodayDate && "text-primary font-bold"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const taskOverdue = !task.completed && task.due_date && isOverdue(new Date(task.due_date));
                    
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "group text-xs p-1.5 rounded cursor-pointer transition-colors",
                          task.completed ? "bg-muted/50" : "bg-primary/10 hover:bg-primary/20",
                          taskOverdue && "bg-destructive/10 hover:bg-destructive/20"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                      >
                        <div className="flex items-start gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(task.id, task.completed);
                            }}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-primary" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </button>
                          <span
                            className={cn(
                              "flex-1 line-clamp-2",
                              task.completed && "line-through text-muted-foreground",
                              taskOverdue && !task.completed && "text-destructive font-medium"
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayTasks.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary rounded"></div>
          <span>Сегодня</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/10 rounded"></div>
          <span>Активная задача</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive/10 border border-destructive/50 rounded"></div>
          <span>Просроченная задача</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted/50 rounded"></div>
          <span>Выполненная задача</span>
        </div>
      </div>
    </div>
  );
}
