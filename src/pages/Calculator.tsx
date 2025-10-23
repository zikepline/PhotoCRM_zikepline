import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { calculateTax, formatCurrency } from '@/lib/utils/calculations';
import { TaxCalculation } from '@/types/crm';
import { Calculator as CalcIcon, TrendingUp, TrendingDown } from 'lucide-react';

export default function Calculator() {
  const [params, setParams] = useState({
    albumPrice: 500,
    childrenCount: 100,
    printCost: 150,
    fixedExpenses: 0,
    schoolPaymentType: 'percent' as 'percent' | 'fixed',
    schoolPercent: 15,
    schoolFixed: 0,
    photographerPaymentType: 'percent' as 'percent' | 'fixed',
    photographerPercent: 25,
    photographerFixed: 0,
    taxBase: 'net_profit' as 'revenue' | 'net_profit',
    taxPercent: 6,
  });

  const [result, setResult] = useState<TaxCalculation | null>(null);

  const handleCalculate = () => {
    const calculation = calculateTax(params);
    setResult(calculation);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CalcIcon className="w-8 h-8 text-primary" />
          Калькулятор заказа
        </h1>
        <p className="text-muted-foreground mt-1">
          Рассчитайте чистую прибыль с учетом всех расходов и налогов
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-6">Параметры расчета</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="albumPrice">Стоимость альбома (₽)</Label>
                <Input
                  id="albumPrice"
                  type="number"
                  value={params.albumPrice || ''}
                  onChange={(e) => handleInputChange('albumPrice', e.target.value)}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div>
                <Label htmlFor="childrenCount">Количество детей</Label>
                <Input
                  id="childrenCount"
                  type="number"
                  value={params.childrenCount || ''}
                  onChange={(e) => handleInputChange('childrenCount', e.target.value)}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printCost">Стоимость печати за 1 шт. (₽)</Label>
                <Input
                  id="printCost"
                  type="number"
                  value={params.printCost || ''}
                  onChange={(e) => handleInputChange('printCost', e.target.value)}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div>
                <Label htmlFor="fixedExpenses">Фиксированные расходы (₽)</Label>
                <Input
                  id="fixedExpenses"
                  type="number"
                  value={params.fixedExpenses || ''}
                  onChange={(e) => handleInputChange('fixedExpenses', e.target.value)}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="mb-3 block">Откат школе</Label>
                <RadioGroup
                  value={params.schoolPaymentType}
                  onValueChange={(value) => handleInputChange('schoolPaymentType', value)}
                  className="flex gap-4 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percent" id="school-percent" />
                    <Label htmlFor="school-percent" className="cursor-pointer">Процент</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="school-fixed" />
                    <Label htmlFor="school-fixed" className="cursor-pointer">Фикс. сумма</Label>
                  </div>
                </RadioGroup>
                <Input
                  type="number"
                  value={(params.schoolPaymentType === 'percent' ? params.schoolPercent : params.schoolFixed) || ''}
                  onChange={(e) => handleInputChange(
                    params.schoolPaymentType === 'percent' ? 'schoolPercent' : 'schoolFixed',
                    e.target.value
                  )}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder={params.schoolPaymentType === 'percent' ? 'Процент' : 'Сумма в рублях'}
                />
              </div>

              <div>
                <Label className="mb-3 block">Оплата фотографу</Label>
                <RadioGroup
                  value={params.photographerPaymentType}
                  onValueChange={(value) => handleInputChange('photographerPaymentType', value)}
                  className="flex gap-4 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percent" id="photographer-percent" />
                    <Label htmlFor="photographer-percent" className="cursor-pointer">Процент</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="photographer-fixed" />
                    <Label htmlFor="photographer-fixed" className="cursor-pointer">Фикс. сумма</Label>
                  </div>
                </RadioGroup>
                <Input
                  type="number"
                  value={(params.photographerPaymentType === 'percent' ? params.photographerPercent : params.photographerFixed) || ''}
                  onChange={(e) => handleInputChange(
                    params.photographerPaymentType === 'percent' ? 'photographerPercent' : 'photographerFixed',
                    e.target.value
                  )}
                  onFocus={handleInputFocus}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder={params.photographerPaymentType === 'percent' ? 'Процент' : 'Сумма в рублях'}
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Налогооблагаемая база</Label>
              <RadioGroup
                value={params.taxBase}
                onValueChange={(value) => handleInputChange('taxBase', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="revenue" id="revenue" />
                  <Label htmlFor="revenue" className="cursor-pointer">Выручка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net_profit" id="net_profit" />
                  <Label htmlFor="net_profit" className="cursor-pointer">Чистая прибыль</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="taxPercent">Ставка налога (%)</Label>
              <Input
                id="taxPercent"
                type="number"
                value={params.taxPercent || ''}
                onChange={(e) => handleInputChange('taxPercent', e.target.value)}
                onFocus={handleInputFocus}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <Button
              onClick={handleCalculate}
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-primary"
            >
              <CalcIcon className="w-5 h-5 mr-2" />
              Рассчитать
            </Button>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-6">Результаты расчета</h2>
          
          {result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-primary text-white">
                <p className="text-sm opacity-90 mb-1">Общая выручка</p>
                <p className="text-3xl font-bold">{formatCurrency(result.totalRevenue)}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Себестоимость</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(result.totalCosts)}
                </p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>• Печать: {formatCurrency(result.totalPrintCost)}</p>
                  <p>• Расходы: {formatCurrency(result.fixedExpenses)}</p>
                  <p>• Школе: {formatCurrency(result.schoolPayment)}
                    {result.schoolPaymentType === 'percent' && ` (${result.schoolPercent}%)`}
                  </p>
                  <p>• Фотографу: {formatCurrency(result.photographerPayment)}
                    {result.photographerPaymentType === 'percent' && ` (${result.photographerPercent}%)`}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                result.grossProfit >= 0 
                  ? 'border-success bg-success/5' 
                  : 'border-destructive bg-destructive/5'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {result.grossProfit >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                  <p className={`text-sm font-medium ${
                    result.grossProfit >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    Валовая прибыль
                  </p>
                </div>
                <p className={`text-2xl font-semibold ${
                  result.grossProfit >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(result.grossProfit)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-warning/10">
                <p className="text-sm text-muted-foreground mb-1">Налог</p>
                <p className="text-xl font-semibold text-warning">
                  {formatCurrency(result.taxAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.taxBase === 'revenue' ? 'От выручки' : 'От чистой прибыли'} ({result.taxPercent}%)
                </p>
              </div>

              <div className={`p-6 rounded-lg ${
                result.netProfit >= 0 
                  ? 'bg-gradient-success' 
                  : 'bg-gradient-to-br from-destructive to-destructive/80'
              } text-white`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.netProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6" />
                  ) : (
                    <TrendingDown className="w-6 h-6" />
                  )}
                  <p className="text-lg font-medium">Чистая прибыль</p>
                </div>
                <p className="text-4xl font-bold">{formatCurrency(result.netProfit)}</p>
                <p className="text-sm opacity-90 mt-2">
                  Маржа: {((result.netProfit / result.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <CalcIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Введите параметры и нажмите "Рассчитать"
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}