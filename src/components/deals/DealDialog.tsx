import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Deal, DealStatus, DealLink } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, Calculator, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DealFinancialInfo } from '@/components/deals/DealFinancialInfo';
import { Card } from '@/components/ui/card';

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  onSuccess: () => void;
}

const statusOptions: { value: DealStatus; label: string }[] = [
  { value: 'new', label: 'Новый' },
  { value: 'contact', label: 'Контакт' },
  { value: 'negotiation', label: 'Переговоры' },
  { value: 'contract', label: 'Договор' },
  { value: 'shooting', label: 'Съемка' },
  { value: 'editing', label: 'Обработка' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'completed', label: 'Завершен' },
  { value: 'lost', label: 'Проигран' },
];

export function DealDialog({ open, onOpenChange, deal, onSuccess }: DealDialogProps) {
  const [isFinancialOpen, setIsFinancialOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Deal & { links: DealLink[] }>>({
    title: '',
    status: 'new',
    description: '',
    phone: '',
    email: '',
    links: [],
    tags: [],
    albumPrice: 0,
    childrenCount: 0,
    printCost: 0,
    fixedExpenses: 0,
    schoolPaymentType: 'percent',
    schoolPercent: 0,
    schoolFixed: 0,
    photographerPaymentType: 'percent',
    photographerPercent: 0,
    photographerFixed: 0,
  });

  useEffect(() => {
    const loadProfileSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tax_rate, tax_base')
        .eq('id', user.id)
        .single();

      if (deal) {
        setFormData({
          ...deal,
          links: deal.links || []
        });
      } else {
        setFormData({
          title: '',
          status: 'new',
          description: '',
          phone: '',
          email: '',
          links: [],
          tags: [],
          albumPrice: 0,
          childrenCount: 0,
          printCost: 0,
          fixedExpenses: 0,
          schoolPaymentType: 'percent',
          schoolPercent: 0,
          schoolFixed: 0,
          photographerPaymentType: 'percent',
          photographerPercent: 0,
          photographerFixed: 0,
        });
      }
    };

    if (open) {
      loadProfileSettings();
    }
  }, [deal, open]);

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...(formData.links || []), { url: '', description: '' }]
    });
  };

  const removeLink = (index: number) => {
    const newLinks = [...(formData.links || [])];
    newLinks.splice(index, 1);
    setFormData({ ...formData, links: newLinks });
  };

  const updateLink = (index: number, field: 'url' | 'description', value: string) => {
    const newLinks = [...(formData.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, links: newLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.albumPrice || !formData.childrenCount) {
      toast.error('Заполните обязательные поля');
      return;
    }

    const calculatedAmount = (formData.albumPrice || 0) * (formData.childrenCount || 0);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error('Необходимо войти в систему');
        return;
      }

      // Get tax settings from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tax_rate, tax_base')
        .eq('id', user.id)
        .single();

      const dealData = {
        title: formData.title,
        amount: calculatedAmount,
        status: formData.status as DealStatus,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        links: JSON.parse(JSON.stringify(formData.links || [])),
        print_cost: formData.printCost,
        children_count: formData.childrenCount,
        fixed_expenses: formData.fixedExpenses,
        school_payment_type: formData.schoolPaymentType,
        school_percent: formData.schoolPercent,
        school_fixed: formData.schoolFixed,
        photographer_payment_type: formData.photographerPaymentType,
        photographer_percent: formData.photographerPercent,
        photographer_fixed: formData.photographerFixed,
        tax_base: profile?.tax_base || 'net_profit',
        tax_percent: profile?.tax_rate || 6,
        user_id: user.id,
      };

      if (deal?.id) {
        const { error } = await (supabase as any)
          .from('deals')
          .update(dealData)
          .eq('id', deal.id);

        if (error) throw error;
        toast.success('Заказ обновлен');
      } else {
        const { error } = await (supabase as any)
          .from('deals')
          .insert(dealData);

        if (error) throw error;
        toast.success('Заказ создан');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения заказа');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? 'Редактировать заказ' : 'Новый заказ'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Название заказа *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Школьная фотосессия - Лицей №1"
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as DealStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация о заказе"
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Ссылки</Label>
                <Button type="button" size="sm" variant="outline" onClick={addLink}>
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить ссылку
                </Button>
              </div>
              
              {formData.links && formData.links.length > 0 && (
                <div className="space-y-3">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://..."
                        />
                        <Input
                          value={link.description}
                          onChange={(e) => updateLink(index, 'description', e.target.value)}
                          placeholder="Описание (например: Исходники)"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeLink(index)}
                        className="self-start"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <Collapsible open={isFinancialOpen} onOpenChange={setIsFinancialOpen}>
              <CollapsibleTrigger className="w-full">
                <Card className="p-3 hover:bg-muted/80 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Финансовые параметры</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isFinancialOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </Card>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2">
                <Card className="p-4 space-y-3 bg-muted/80 transition-colors cursor-pointer">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="albumPrice">Стоимость альбома *</Label>
                      <Input
                        id="albumPrice"
                        type="number"
                        value={formData.albumPrice || ''}
                        onChange={(e) => setFormData({ ...formData, albumPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                        onWheel={(e) => e.currentTarget.blur()}
                        required
                      />
                    </div>
              
                    <div>
                      <Label htmlFor="childrenCount">Количество детей *</Label>
                      <Input
                        id="childrenCount"
                        type="number"
                        value={formData.childrenCount || ''}
                        onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value ? parseInt(e.target.value) : 0 })}
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                        onWheel={(e) => e.currentTarget.blur()}
                        required
                      />
                    </div>
              
                    <div>
                      <Label htmlFor="printCost">Печать за 1 шт. (₽)</Label>
                      <Input
                        id="printCost"
                        type="number"
                        value={formData.printCost || ''}
                        onChange={(e) => setFormData({ ...formData, printCost: e.target.value ? parseFloat(e.target.value) : 0 })}
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
              
                    <div>
                      <Label htmlFor="fixedExpenses">Фикс. расходы (₽)</Label>
                      <Input
                        id="fixedExpenses"
                        type="number"
                        value={formData.fixedExpenses || ''}
                        onChange={(e) => setFormData({ ...formData, fixedExpenses: e.target.value ? parseFloat(e.target.value) : 0 })}
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </div>
              
                    <div className="col-span-2 space-y-3">
                      <div>
                        <Label className="mb-2 block">Откат школе</Label>
                        <RadioGroup
                          value={formData.schoolPaymentType}
                          onValueChange={(value) => setFormData({ ...formData, schoolPaymentType: value as 'percent' | 'fixed' })}
                          className="flex gap-4 mb-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percent" id="deal-school-percent" />
                            <Label htmlFor="deal-school-percent" className="cursor-pointer">Процент</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="deal-school-fixed" />
                            <Label htmlFor="deal-school-fixed" className="cursor-pointer">Фикс. сумма</Label>
                          </div>
                        </RadioGroup>
                        <Input
                          type="number"
                          value={(formData.schoolPaymentType === 'percent' ? formData.schoolPercent : formData.schoolFixed) || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            [formData.schoolPaymentType === 'percent' ? 'schoolPercent' : 'schoolFixed']: e.target.value ? parseFloat(e.target.value) : 0
                          })}
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder={formData.schoolPaymentType === 'percent' ? 'Процент' : 'Сумма в рублях'}
                        />
                      </div>
              
                      <div>
                        <Label className="mb-2 block">Оплата фотографу</Label>
                        <RadioGroup
                          value={formData.photographerPaymentType}
                          onValueChange={(value) => setFormData({ ...formData, photographerPaymentType: value as 'percent' | 'fixed' })}
                          className="flex gap-4 mb-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percent" id="deal-photographer-percent" />
                            <Label htmlFor="deal-photographer-percent" className="cursor-pointer">Процент</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="deal-photographer-fixed" />
                            <Label htmlFor="deal-photographer-fixed" className="cursor-pointer">Фикс. сумма</Label>
                          </div>
                        </RadioGroup>
                        <Input
                          type="number"
                          value={(formData.photographerPaymentType === 'percent' ? formData.photographerPercent : formData.photographerFixed) || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            [formData.photographerPaymentType === 'percent' ? 'photographerPercent' : 'photographerFixed']: e.target.value ? parseFloat(e.target.value) : 0
                          })}
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder={formData.photographerPaymentType === 'percent' ? 'Процент' : 'Сумма в рублях'}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {deal && (
            <div className="border-t pt-4">
              <DealFinancialInfo deal={deal} />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {deal ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
