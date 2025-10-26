import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onSuccess: () => void;
}

export function CompanyDialog({ open, onOpenChange, company, onSuccess }: CompanyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    website: '',
    tags: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        phone: company.phone || '',
        website: company.website || '',
        tags: '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        website: '',
        tags: '',
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Введите название компании');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Необходимо войти в систему');
        return;
      }

      const companyData = {
        name: formData.name,
        phone: formData.phone || null,
        website: formData.website || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        user_id: user.id,
      };

      if (company?.id) {
        const { error } = await (supabase as any)
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;
        toast.success('Компания обновлена');
      } else {
        const { error } = await (supabase as any)
          .from('companies')
          .insert(companyData);

        if (error) throw error;
        toast.success('Компания создана');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения компании');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {company ? 'Редактировать компанию' : 'Новая компания'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ООО Образование"
              required
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
            <Label htmlFor="website">Веб-сайт</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label htmlFor="tags">Теги (через запятую)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="школа, государственная"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {company ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
