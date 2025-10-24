# Supabase: схема, RLS и запуск

## Локальный запуск (Windows, PowerShell)
```powershell
npm run db:start   # запустить локальные контейнеры Supabase
npm run db:status  # проверить статус
npm run db:reset   # пересоздать БД и применить миграции
```
Или используйте удобный `npm run dev:up` — он:
- проверит наличие Supabase CLI;
- запустит контейнеры;
- распарсит `supabase status` и заполнит `.env.local`;
- запустит Vite.

## Переменные окружения
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Схема БД (основное)
- `profiles` — профиль пользователя (триггер создаёт запись при появлении пользователя в `auth.users`). Поля: `email`, `name`, доп. поля `phone`, `city`, `country`, `avatar_url`, `tax_rate`, `tax_base`, `profession`.
- `deals` — сделки/заказы. Ключевые поля: суммы, налоги, типы выплат, статус, история стадий.
- `contacts` — контакты.
- `companies` — компании.
- `tasks` — задачи (ссылки на `deals`, `contacts`, `companies`).
- `user_roles` — роли пользователя (enum `app_role`: `admin` | `user`).
- `user_activity` — события активности (для админ‑панели/аналитики).

См. типы в `src/integrations/supabase/types.ts`.

## RLS (Row Level Security)
Включена для всех пользовательских таблиц.
- `profiles`: пользователь видит/меняет только свою запись; админ может читать все.
- `deals`, `contacts`, `companies`, `tasks`: операции разрешены, если `auth.uid() = user_id`.
- `user_roles`: пользователь видит свои роли; админ — все; админ управляет ролями.
- `user_activity`: пользователь вставляет свои события; админ читает все.

## Роли
Добавить себе роль `admin`:
```sql
insert into public.user_roles (user_id, role)
values ('<ваш_user_id>', 'admin')
on conflict (user_id, role) do nothing;
```

`<ваш_user_id>` — это `auth.users.id` текущего пользователя.

## Хранилище (Storage)
- Bucket `avatars` создаётся миграциями.
- Политики:
  - чтение: публичное (только bucket `avatars`),
  - вставка/изменение/удаление — только владельцем (имя папки = `auth.uid()`).

## Конфигурация CLI
- `supabase/config.toml` содержит `project_id`.

## Подключение в коде
```ts
import { supabase } from '@/integrations/supabase/client';
```
Клиент инициализируется `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`, сессия хранится в `localStorage` с автообновлением токена.
