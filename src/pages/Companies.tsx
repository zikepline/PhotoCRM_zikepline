import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Building2, Search, Edit, Trash2, ExternalLink, Phone, Tag } from 'lucide-react';
import { Company } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [deleteCompanyId, setDeleteCompanyId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    phone: '',
    tags: '',
  });

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCompanies: Company[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        website: c.website,
        phone: c.phone,
        responsibleId: c.user_id,
        tags: c.tags || [],
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));

      setCompanies(formattedCompanies);
      setFilteredCompanies(formattedCompanies);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки компаний');
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name,
        website: company.website || '',
        phone: company.phone || '',
        tags: company.tags.join(', '),
      });
    } else {
      setSelectedCompany(undefined);
      setFormData({
        name: '',
        website: '',
        phone: '',
        tags: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const companyData = {
        name: formData.name,
        website: formData.website || null,
        phone: formData.phone || null,
        tags: tagsArray,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (selectedCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', selectedCompany.id);

        if (error) throw error;
        toast.success('Компания обновлена');
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData);

        if (error) throw error;
        toast.success('Компания создана');
      }

      setDialogOpen(false);
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения компании');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', deleteCompanyId);

      if (error) throw error;

      toast.success('Компания удалена');
      setDeleteDialogOpen(false);
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления компании');
    }
  };

  const openDeleteDialog = (companyId: string) => {
    setDeleteCompanyId(companyId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
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
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-primary"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Новая компания
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск по названию, сайту, телефону или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="grid gap-4">
          {filteredCompanies.length === 0 ? (
            <Card className="p-12 shadow-card">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Компании не найдены' : 'Нет компаний'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте первую компанию для начала работы'
                  }
                </p>
              </div>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <h3 className="text-xl font-semibold text-foreground truncate">
                        {company.name}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="w-4 h-4" />
                          <a 
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                      
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                    </div>

                    {company.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {company.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Создано: {company.createdAt.toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(company.id)}
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

      {/* Company Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Редактировать компанию' : 'Новая компания'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название компании"
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Веб-сайт</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="школа, детский сад, учреждение"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {selectedCompany ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить компанию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Компания будет удалена безвозвратно.
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
