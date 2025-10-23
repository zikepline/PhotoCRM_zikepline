import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Upload } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [taxRate, setTaxRate] = useState('6');
  const [taxBase, setTaxBase] = useState<'net_profit' | 'revenue'>('net_profit');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);
      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setName(profile.name || '');
        setTaxRate(profile.tax_rate?.toString() || '6');
        setTaxBase((profile.tax_base as 'net_profit' | 'revenue') || 'net_profit');
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Аватарка обновлена');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Ошибка загрузки аватарки');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update user metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { name }
      });

      if (metaError) throw metaError;

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          tax_rate: parseFloat(taxRate),
          tax_base: taxBase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Профиль успешно обновлен');
      
      // Reload to update sidebar
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Аватарка</CardTitle>
            <CardDescription>
              Загрузите фотографию профиля
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                {name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Загрузка...' : 'Загрузить аватарку'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
            <CardDescription>
              Обновите свою личную информацию
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Налоговые настройки</CardTitle>
            <CardDescription>
              Настройте параметры налогообложения для автоматического расчета в заказах
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Ставка налога (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxBase">База налогообложения</Label>
              <Select value={taxBase} onValueChange={(value: 'net_profit' | 'revenue') => setTaxBase(value)}>
                <SelectTrigger id="taxBase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_profit">Чистая прибыль</SelectItem>
                  <SelectItem value="revenue">Выручка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </div>
    </div>
  );
}