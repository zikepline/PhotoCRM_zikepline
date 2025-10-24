# Архитектура

Этот документ описывает логическую архитектуру приложения, ключевые модули и потоки данных.

## Обзор
- Клиентское SPA на React 18 + TypeScript, сборка Vite.
- UI основан на Tailwind CSS и shadcn/ui (Radix) с дизайн‑токенами в `src/index.css` и настройками в `tailwind.config.ts`.
- Данные и аутентификация — Supabase (Postgres, Auth, Storage). Схема и RLS — в `supabase/migrations`.
- Управление данными — TanStack Query. Локальные вычисления — `src/lib/utils` и `src/lib/utils/calculations.ts`.

## Структура каталогов
- `src/pages` — страницы и маршруты (React Router): `App.tsx` описывает маршруты и защиту `ProtectedRoute`.
- `src/components` — переиспользуемые UI‑элементы и фичи: Dashboard, Kanban, формы, навигация.
- `src/contexts` — контексты (например, `SidebarContext`).
- `src/integrations/supabase` — `client.ts` (инициализация клиента), `types.ts` (типизированная схема БД).
- `src/lib` — хелперы, форматирование, локальное хранение (демо‑данные), бизнес‑вычисления.
- `supabase/migrations` — SQL миграции для таблиц, RLS‑политик и Storage.

## Потоки данных
1. Аутентификация:
   - `ProtectedRoute` запрашивает сессию `supabase.auth.getSession()`.
   - Навигация и доступ к страницам зависят от наличия сессии.
2. CRUD с БД:
   - Клиент `supabase` из `integrations/supabase/client.ts` обращается к таблицам с учётом RLS.
   - Типы запросов проверяются по `Database` из `types.ts`.
3. Кэш и синхронизация:
   - `@tanstack/react-query` управляет состоянием запроса, кешированием и рефетчем.
4. Хранилище файлов:
   - Bucket `avatars` для хранения аватаров. Политики разрешают публичное чтение и операции владельцу.

## Навигация и доступ
- Все маршруты, кроме `/auth`, защищены `ProtectedRoute`.
- Роль `admin` открывает доступ к `/admin` (проверка по таблице `user_roles`).

## Стили и дизайн‑система
- Палитра, градиенты и тени определены в `src/index.css` через CSS‑переменные (HSL).
- Tailwind конфиг расширяет токены и анимации и подключает `tailwindcss-animate`.

## Важные зависимости
- React, React Router, TanStack Query, shadcn/ui (Radix), dnd-kit, Recharts, Supabase JS.

## Альясы и сборка
- Алиас `@` указывает на `./src` (см. `vite.config.ts`).
