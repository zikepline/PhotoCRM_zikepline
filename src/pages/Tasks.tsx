import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare } from 'lucide-react';

export default function Tasks() {
  return (
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
        <Button size="lg" className="bg-gradient-primary hover:shadow-primary">
          <Plus className="w-5 h-5 mr-2" />
          Новая задача
        </Button>
      </div>

      <Card className="p-12 shadow-card">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Раздел в разработке</h3>
          <p className="text-muted-foreground">
            Функционал управления задачами будет доступен в следующей версии
          </p>
        </div>
      </Card>
    </div>
  );
}
