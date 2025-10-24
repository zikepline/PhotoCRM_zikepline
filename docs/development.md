# Руководство по разработке

## Быстрый старт
```bash
npm i
npm run dev:up  # поднимет локальный Supabase, создаст .env.local и запустит Vite
```
Альтернатива с облачным Supabase:
```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

npm run dev
```

## Скрипты
- `dev` — Vite Dev Server
- `dev:up` — старт локального Supabase, генерация `.env.local`, запуск `dev`
- `dev:down` — остановка локального Supabase
- `db:start` — `supabase start`
- `db:status` — `supabase status`
- `db:reset` — пересоздать БД и применить все миграции
- `build`, `build:dev`, `preview`, `lint`

## Окружение
- `VITE_SUPABASE_URL` — URL API Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` — публичный anon key

`.env.local` создается/обновляется автоматически `scripts/dev-up.mjs` при локальной разработке.

## Код‑стайл и архитектура
- Компоненты UI в `src/components/ui` построены на shadcn/ui с утилитой `cn` (`src/lib/utils.ts`).
- Глобальные стили и дизайн‑токены — `src/index.css` и `tailwind.config.ts`.
- Маршрутизация — `react-router-dom` в `src/App.tsx`.
- Доступ — через `ProtectedRoute`.
- Работа с данными — `@tanstack/react-query`.

## Работа с Supabase
- Клиент: `import { supabase } from '@/integrations/supabase/client'`.
- Типы БД: `src/integrations/supabase/types.ts`.
- Для локальной БД используйте скрипты `db:*` или `dev:up`.

## Тестовые/демо данные
- Вспомогательное локальное хранилище (LocalStorage) реализовано в `src/lib/storage.ts` для демо‑режима некоторых сущностей.

## Советы
- Всегда проверяйте, что запросы проходят RLS — вставляйте `user_id = auth.uid()`.
- Для роли admin добавьте запись в `public.user_roles` (см. docs/supabase.md).
