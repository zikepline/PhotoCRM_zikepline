# Схема базы данных

Этот документ резюмирует таблицы и политики безопасности, исходя из миграций в `supabase/migrations` и типов `src/integrations/supabase/types.ts`.

## public.profiles
- id (uuid, PK, = auth.users.id)
- email (text)
- name (text)
- avatar_url (text)
- phone (text), city (text), country (text)
- tax_rate (numeric, по умолчанию 6)
- tax_base (text: `net_profit|revenue`)
- profession (text)
- created_at, updated_at (timestamptz)

RLS:
- SELECT/UPDATE/INSERT только владелец (`auth.uid() = id`)
- SELECT для всех — если у текущего пользователя роль `admin`

Триггер:
- `on_auth_user_created` — создать профиль при регистрации
- `update_profiles_updated_at` — обновляет `updated_at`

## public.deals
Основные поля: `user_id`, `title`, `amount`, `print_cost`, `children_count`, расходы, налоги, `status`, `stage_history`, `tags`, ссылки на контакт/компанию, `created_at/updated_at`.

RLS: все операции — только владелец (`auth.uid() = user_id`).
Триггер: `update_deals_updated_at`.

## public.contacts
Поля: `user_id`, `name`, `phone`, `email`, `description`, `tags`, `company_id`, даты.

RLS: все операции — только владелец.
Триггер: `update_contacts_updated_at`.

## public.companies
Поля: `user_id`, `name`, `website`, `phone`, `tags`, даты.

RLS: все операции — только владелец.
Триггер: `update_companies_updated_at`.

## public.tasks
Поля: `user_id`, `title`, `description`, `due_date`, `completed`, ссылки на `deals`, `contacts`, `companies`, даты.

RLS: все операции — только владелец.
Триггер: `update_tasks_updated_at`.
Индексы: (см. миграции при необходимости).

## public.user_roles
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- role (enum `app_role`: `admin|user`)
- created_at (timestamptz)
- UNIQUE (user_id, role)

RLS:
- Пользователь видит свои роли
- Админ видит все роли и может управлять ими (ALL), через функцию `public.has_role`.

## public.user_activity
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- activity_type (text)
- created_at (timestamptz)

RLS:
- Вставка — только владелец (`auth.uid() = user_id`)
- Чтение — только админ

Индексы:
- `idx_user_activity_user_id`
- `idx_user_activity_created_at`

## Storage: bucket `avatars`
Политики:
- SELECT: публично, если `bucket_id = 'avatars'`
- INSERT/UPDATE/DELETE: только владелец (папка с именем `auth.uid()`).
