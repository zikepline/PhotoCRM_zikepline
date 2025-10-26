# Supabase: локальная разработка и схема БД

## Локальный запуск Supabase

### Автоматический запуск
```powershell
npm run dev:up    # Запуск Supabase + создание .env.local + запуск Vite
npm run dev:down  # Остановка Supabase
```

### Ручной запуск
```powershell
# Запуск локальных контейнеров
npm run db:start   # или supabase start

# Проверка статуса
npm run db:status  # или supabase status

# Сброс БД (удаляет все данные!)
npm run db:reset   # или supabase db reset
```

## Управление данными

### Безопасность данных
- **Остановка фронтенда** не влияет на базу данных
- **`supabase stop`** только останавливает контейнеры Docker; данные сохраняются в локальных Docker volumes
- **Данные удаляются** только при явных действиях:
  - `npm run db:reset` / `supabase db reset` (полный сброс)
  - Ручное удаление Docker volumes

### Резервное копирование
```powershell
# Создание бэкапа
New-Item -ItemType Directory -Force -Path .\backups | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
supabase db dump -f "backups\local-$stamp.sql"

# Восстановление из бэкапа
supabase db reset
supabase db restore -f "backups\local-<timestamp>.sql"
```

## Переменные окружения

Создайте файл `.env.local` в корне проекта:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ВАШ_КЛЮЧ
```

**Получить ключи**: `supabase status`

## Схема базы данных

### Основные таблицы

**`profiles`** — профили пользователей
- Создается автоматически триггером при регистрации
- Поля: `email`, `name`, `phone`, `city`, `country`, `avatar_url`, `tax_rate`, `tax_base`, `profession`

**`deals`** — заказы/сделки
- Ключевые поля: `amount`, `status`, `description`, `phone`, `email`
- Финансовые поля: `album_price`, `children_count`, `print_cost`, `fixed_expenses`
- Платежи: `school_payment_type`, `school_percent`, `school_fixed`, `photographer_payment_type`, `photographer_percent`, `photographer_fixed`, `retoucher_payment_type`, `retoucher_percent`, `retoucher_fixed`, `layout_payment_type`, `layout_percent`, `layout_fixed`
- Налоги: `tax_base`, `tax_percent`
- Связи: `contact_id`, `user_id` (ответственный)

**`contacts`** — контакты клиентов
- Поля: `name`, `phone`, `email`, `description`, `company_id`, `user_id`, `tags`

**`companies`** — компании
- Поля: `name`, `website`, `phone`, `user_id`

**`tasks`** — задачи
- Поля: `title`, `description`, `due_date`, `status`, `user_id`
- Связи: `deal_id`, `contact_id`

**`user_roles`** — роли пользователей
- Поля: `user_id`, `role` (enum: `admin`, `manager`, `observer`)

**`user_activity`** — события активности (для аналитики)
- Поля: `user_id`, `action`, `details`, `created_at`

### Связи между таблицами
- `deals.contact_id` → `contacts.id`
- `deals.user_id` → `profiles.id`
- `contacts.company_id` → `companies.id`
- `tasks.deal_id` → `deals.id`
- `tasks.contact_id` → `contacts.id`

## RLS (Row Level Security)

Включена для всех пользовательских таблиц:

**`profiles`**
- Пользователь видит/изменяет только свою запись
- Админ может читать все записи

**`deals`, `contacts`, `companies`, `tasks`**
- Операции разрешены только если `auth.uid() = user_id`
- Пользователь работает только со своими данными

**`user_roles`**
- Пользователь видит свои роли
- Админ видит все роли и может управлять ими

**`user_activity`**
- Пользователь может вставлять свои события
- Админ может читать все события

## Роли и доступ

### Добавление роли администратора
```sql
insert into public.user_roles (user_id, role)
values ('<ваш_user_id>', 'admin')
on conflict (user_id, role) do nothing;
```

`<ваш_user_id>` — это `auth.users.id` текущего пользователя (можно найти в Supabase Studio).

### Роли в системе
- **`admin`** — полный доступ ко всем данным и админ-панели
- **`manager`** — управление заказами и контактами
- **`observer`** — только просмотр данных

## Хранилище файлов (Storage)

### Bucket `avatars`
- Создается автоматически миграциями
- Политики доступа:
  - **Чтение**: публичное (только bucket `avatars`)
  - **Загрузка/изменение/удаление**: только владельцем (папка = `auth.uid()`)

### Использование в коде
```typescript
// Загрузка аватара
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);

// Получение URL аватара
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```

## Подключение в коде

### Клиент Supabase
```typescript
import { supabase } from '@/integrations/supabase/client';

// Аутентификация
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Работа с данными
const { data: deals } = await supabase
  .from('deals')
  .select('*')
  .eq('user_id', userId);
```

### Типы TypeScript
```typescript
import { Database } from '@/integrations/supabase/types';

// Использование типов
type Deal = Database['public']['Tables']['deals']['Row'];
type DealInsert = Database['public']['Tables']['deals']['Insert'];
```

## Конфигурация

### Файл `supabase/config.toml`
Содержит настройки проекта:
- `project_id` — идентификатор проекта
- Настройки портов и сервисов
- Конфигурация Docker

### Миграции
Все изменения схемы БД хранятся в папке `supabase/migrations/`:
- Файлы создаются автоматически при изменениях через Studio
- Применяются при `supabase start` или `supabase db reset`
- Формат: `YYYYMMDDHHMMSS_description.sql`

## Мониторинг и отладка

### Supabase Studio
- **URL**: http://localhost:54323
- **Функции**: просмотр таблиц, SQL Editor, аутентификация, логи

### Логи
```powershell
# Просмотр логов Supabase
supabase logs

# Логи конкретного сервиса
supabase logs --service api
supabase logs --service db
```

### Отладка подключения
```powershell
# Проверка статуса
supabase status

# Тест подключения к БД
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

## Частые проблемы

### 1. "Supabase CLI не найден"
**Решение**: Установите CLI и добавьте в PATH

### 2. "Docker Desktop не запущен"
**Решение**: Запустите Docker Desktop

### 3. "failed to parse environment file"
**Решение**: Удалите `.env.local` и создайте заново через блокнот

### 4. RLS "permission denied"
**Решение**: 
- Убедитесь, что пользователь авторизован
- Используйте `auth.uid()` в запросах
- Проверьте роли пользователя

### 5. Порт уже занят
**Решение**: 
- Остановите другие экземпляры Supabase
- Измените порты в `supabase/config.toml`
