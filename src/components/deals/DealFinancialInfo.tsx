import { Deal } from '@/types/crm';
import { calculateTax } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/calculations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, TrendingUp, DollarSign, Receipt, Wallet, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface DealFinancialInfoProps {
  deal: Deal;
}

export function DealFinancialInfo({ deal }: DealFinancialInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Проверяем, есть ли все необходимые данные для расчета
  if (!deal.albumPrice || !deal.childrenCount) {
    return null;
  }

  const calculation = calculateTax({
    albumPrice: deal.albumPrice,
    childrenCount: deal.childrenCount,
    printCost: deal.printCost || 0,
    fixedExpenses: deal.fixedExpenses || 0,
    schoolPaymentType: deal.schoolPaymentType || 'percent',
    schoolPercent: deal.schoolPercent,
    schoolFixed: deal.schoolFixed,
    photographerPaymentType: deal.photographerPaymentType || 'percent',
    photographerPercent: deal.photographerPercent,
    photographerFixed: deal.photographerFixed,
    taxBase: deal.taxBase || 'net_profit',
    taxPercent: deal.taxPercent || 6,
  });

  const taxBaseLabel = calculation.taxBase === 'revenue' ? 'С выручки' : 'С чистой прибыли';
  const totalCostsWithTax = calculation.totalCosts + calculation.taxAmount;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="w-full">
        <Card className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Финансовая информация</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <Card className="p-4 space-y-3 bg-muted/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Выручка</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(calculation.totalRevenue)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Валовая прибыль</p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatCurrency(calculation.grossProfit)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Receipt className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Налог</p>
                <p className="text-sm font-semibold text-orange-600">
                  {formatCurrency(calculation.taxAmount)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Wallet className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Чистая прибыль</p>
                <p className="text-sm font-semibold text-purple-600">
                  {formatCurrency(calculation.netProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Все затраты до налогооблажения:</span>
              <span className="text-xs font-medium">{formatCurrency(calculation.totalCosts)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Всего затрат (с налогом):</span>
              <span className="text-xs font-medium">{formatCurrency(totalCostsWithTax)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Режим налогообложения:</span>
              <Badge variant="secondary" className="text-xs">
                {taxBaseLabel}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Процент налога:</span>
              <span className="text-xs font-medium">{calculation.taxPercent}%</span>
            </div>
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
