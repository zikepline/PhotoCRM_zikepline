import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';

export default function Companies() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Компании
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление организациями и учреждениями
          </p>
        </div>
        <Button size="lg" className="bg-gradient-primary hover:shadow-primary">
          <Plus className="w-5 h-5 mr-2" />
          Новая компания
        </Button>
      </div>

      <Card className="p-12 shadow-card">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Раздел в разработке</h3>
          <p className="text-muted-foreground">
            Функционал управления компаниями будет доступен в следующей версии
          </p>
        </div>
      </Card>
    </div>
  );
}
