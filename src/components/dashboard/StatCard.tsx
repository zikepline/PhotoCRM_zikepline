import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'from-primary/10 to-primary/5 text-primary',
    success: 'from-success/10 to-success/5 text-success',
    destructive: 'from-destructive/10 to-destructive/5 text-destructive',
    warning: 'from-warning/10 to-warning/5 text-warning',
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-primary transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
              <span className="text-muted-foreground ml-1">vs прошлый период</span>
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br',
          variantStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
