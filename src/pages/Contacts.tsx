import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Mail, Phone, Search, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/calculations';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [deleteContactId, setDeleteContactId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    tags: '',
  });

  const loadContacts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContacts: Contact[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        description: c.description,
        companyId: c.company_id,
        responsibleId: c.user_id,
        tags: c.tags || [],
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка загрузки контактов');
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone || '',
        email: contact.email || '',
        description: contact.description || '',
        tags: contact.tags.join(', '),
      });
    } else {
      setSelectedContact(undefined);
      setFormData({ name: '', phone: '', email: '', description: '', tags: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Введите имя контакта');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Необходимо войти в систему');
        return;
      }

      const contactData = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        description: formData.description || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        user_id: user.id,
      };

      if (selectedContact?.id) {
        const { error } = await (supabase as any)
          .from('contacts')
          .update(contactData)
          .eq('id', selectedContact.id);

        if (error) throw error;
        toast.success('Контакт обновлен');
      } else {
        const { error } = await (supabase as any)
          .from('contacts')
          .insert(contactData);

        if (error) throw error;
        toast.success('Контакт создан');
      }

      loadContacts();
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка сохранения контакта');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await (supabase as any)
        .from('contacts')
        .delete()
        .eq('id', deleteContactId);

      if (error) throw error;
      toast.success('Контакт удален');
      loadContacts();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления контакта');
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteContactId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Контакты
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление клиентами и контактами
          </p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-primary hover:shadow-primary"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="w-5 h-5 mr-2" />
          Новый контакт
        </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Поиск по имени, телефону или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length === 0 ? (
            <Card className="col-span-full p-12 shadow-card">
              <div className="text-center">
                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Контакты не найдены' : 'Нет контактов'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Попробуйте изменить запрос' : 'Создайте первый контакт'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить контакт
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredContacts.map((contact) => (
              <Card key={contact.id} className="p-6 shadow-card hover:shadow-primary transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Создан: {formatDate(contact.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(contact)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteDialog(contact.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${contact.phone}`} className="hover:text-primary">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${contact.email}`} className="hover:text-primary">
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>

                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? 'Редактировать контакт' : 'Новый контакт'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван Иванов"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация"
              />
            </div>
            <div>
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="школа, директор"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {selectedContact ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить контакт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Контакт будет удален безвозвратно.
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