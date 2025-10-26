import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Phone, Globe, Search, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/crm';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/calculations';
import { CompanyDialog } from '@/components/companies/CompanyDialog';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [deleteCompanyId, setDeleteCompanyId] = useState<string>('');

  const loadCompanies = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCompanies: Company[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        website: c.website,
        responsibleId: c.user_id,
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
      company.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const handleOpenDialog = (company?: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await (supabase as any)
        .from('companies')
        .delete()
        .eq('id', deleteCompanyId);

      if (error) throw error;
      toast.success('Компания удалена');
      loadCompanies();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления компании');
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteCompanyId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Поиск по названию, телефону или сайту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length === 0 ? (
            <Card className="col-span-full p-12 shadow-card">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Компании не найдены' : 'Нет компаний'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Попробуйте изменить запрос' : 'Создайте первую компанию'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить компанию
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="p-6 shadow-card hover:shadow-primary transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {company.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Создана: {formatDate(company.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteDialog(company.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${company.phone}`} className="hover:text-primary">
                        {company.phone}
                      </a>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={selectedCompany}
        onSuccess={loadCompanies}
      />

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
