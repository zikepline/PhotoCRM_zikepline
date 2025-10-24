## PhotoCRM — CRM для фотографов (Vite + React + Supabase)

Современное веб‑приложение для управления заказами, контактами и аналитикой. Использует Vite + React + TypeScript, shadcn/ui (Radix), Tailwind CSS, TanStack Query и Supabase (Auth, Postgres, Storage) с RLS‑политиками.

### Возможности
- **Аутентификация**: email/пароль и Google OAuth (Supabase Auth)
- **Профиль**: заполнение профиля, аватар через Storage bucket `avatars`
- **Панель**: метрики, фильтр по датам, список заказов и быстрые действия
- **Kanban**: перетаскивание заказов между стадиями
- **Контакты**: поиск, создание/редактирование/удаление
- **Админ‑панель**: статистика посещений и список пользователей (для роли admin)
- **Разделы в разработке**: `Компании`, `Задачи`

---

### Требования
- Node.js 18+ и npm
- (Опционально для локальной БД) Supabase CLI. Установка: см. "Supabase CLI" в оф. доках — [Install the Supabase CLI](https://supabase.com/docs/guides/cli#install-the-cli)

### Быстрый старт
1) Установите зависимости
```bash
npm i
```
2) Локально с Supabase (рекомендуется)
```bash
npm run dev:up
```
- Скрипт поднимет локальный Supabase (`supabase start`), распарсит `supabase status` и автоматически создаст/обновит `.env.local` с `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`, затем запустит Vite.

3) Используете хостинг Supabase? Создайте `.env.local` вручную и запустите dev‑сервер
```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# старт
npm run dev
```

### Полезные команды
- **Разработка**: `npm run dev` — Vite Dev Server
- **Быстрый старт с локальным Supabase**: `npm run dev:up`
- **Остановить локальный Supabase**: `npm run dev:down`
- **Старт БД**: `npm run db:start`
- **Статус БД**: `npm run db:status`
- **Сброс БД + миграции**: `npm run db:reset`
- **Сборка**: `npm run build` (или `npm run build:dev`)
- **Предпросмотр**: `npm run preview`
- **Линт**: `npm run lint`

---

### Переменные окружения
- `VITE_SUPABASE_URL` — URL проекта Supabase (REST API)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — публичный anon key (безопасен для клиента)

Файл `.env.local` располагается в корне проекта. Скрипт `npm run dev:up` заполняет его автоматически из локального Supabase.

### Supabase и миграции
- Конфигурация: `supabase/config.toml`
- Миграции: `supabase/migrations/*.sql`
- Локальный запуск контейнеров:
```bash
npm run db:start   # эквивалент supabase start
npm run db:status
npm run db:reset   # пересоздать БД и применить все миграции
```
- При первом запуске через `dev:up` миграции будут применены автоматически локальным Supabase.

#### Роли и доступ
Используется таблица `public.user_roles` и enum `public.app_role ('admin'|'user')`. RLS‑политики позволяют admin видеть агрегированные данные. Чтобы назначить себе роль `admin`, узнайте свой `auth.users.id` и выполните SQL:
```sql
insert into public.user_roles (user_id, role)
values ('<ваш_user_id>', 'admin')
on conflict (user_id, role) do nothing;
```

#### Хранилище аватаров
Bucket `avatars` создаётся миграциями. Доступ на чтение публичный, запись/обновление/удаление доступны владельцу.

---

### Архитектура и стек
- React 18 + TypeScript, Vite
- Tailwind CSS + shadcn/ui (Radix)
- TanStack Query — кеш/запросы данных
- dnd-kit — drag & drop для Kanban
- Recharts — графики в админке
- Supabase JS SDK — клиент к Postgres/Auth/Storage

Клиент Supabase:
```ts
// импортируйте клиент так
import { supabase } from '@/integrations/supabase/client';
```

---

### Структура проекта (основное)
- `src/pages` — страницы (`/auth`, `/`, `/kanban`, `/contacts`, `/companies`, `/tasks`, `/profile`, `/admin`)
- `src/components` — UI и фичи (Kanban, Dashboard, формы и т.д.)
- `src/integrations/supabase` — клиент `client.ts` и типы БД `types.ts`
- `src/lib/utils` — бизнес‑логика расчетов и форматирование
- `src/types` — доменные типы (CRM)
- `supabase/migrations` — SQL‑миграции схемы, RLS и storage
- `scripts/dev-up.mjs` — автозапуск Supabase и генерация `.env.local`

---

### Маршруты и доступ
- `/auth` — вход/регистрация (email/пароль, Google OAuth)
- `/complete-profile` — завершение профиля после регистрации
- `/` — панель с метриками, фильтры, список заказов
- `/kanban` — доска статусов заказов, перетаскивание
- `/contacts` — управление контактами
- `/companies`, `/tasks` — в разработке
- `/profile` — профиль пользователя, аватар
- `/admin` — админ‑панель (требует роль `admin`)

Все рабочие маршруты, кроме `/auth`, защищены компонентом `ProtectedRoute`.

---

### Сборка и деплой
1) Соберите проект:
```bash
npm run build
```
2) Задеплойте содержимое `dist/` на любой статический хостинг (Vercel, Netlify, S3+CloudFront и т.п.). Настройте SPA‑fallback на `index.html`.
3) Создайте проект в Supabase, возьмите `Project URL` и `anon` ключ. Пропишите их как переменные окружения в вашем хостинге (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
4) При необходимости примените миграции в удалённую БД (см. доки Supabase CLI о `db push`/`migrate`).

---

### Безопасность
- На клиенте используйте только `anon` ключ. Никогда не используйте `service_role` в браузере.
- Убедитесь, что RLS‑политики покрывают все таблицы с пользовательскими данными.

### Частые проблемы
- «Supabase CLI не найден»: установите CLI (см. раздел Требования).
- «Не удалось распарсить supabase status» при `dev:up`: проверьте, что Supabase запущен; задайте переменные вручную в `.env.local`.
- Ошибки RLS «permission denied»: убедитесь, что вы вставляете `user_id = auth.uid()` и аутентифицированы, или что пользователь имеет нужную роль.

---

### Лицензия
Укажите здесь условия лицензии проекта, если нужно.
