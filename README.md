## PhotoCRM — CRM для фотографов (Vite + React + Supabase)

Современное веб‑приложение для управления заказами, контактами и аналитикой. Основано на Vite + React + TypeScript, shadcn/ui (Radix), Tailwind CSS, TanStack Query и Supabase (Auth, Postgres, Storage) с RLS‑политиками.
 
### Возможности
- Аутентификация (email/пароль, а также OAuth при настройке в Supabase)
- Профиль и аватар (Storage bucket `avatars`)
- Панель метрик, фильтр по датам, список заказов
- Kanban с перетаскиванием стадий (dnd-kit)
- Контакты, компании, задачи
- Админ‑панель со сводной статистикой (для роли admin)

### Стек
- React 18 + TypeScript (Vite)
- Tailwind CSS + shadcn/ui (Radix)
- TanStack Query — кеш и запросы
- React Router 6 — маршрутизация
- Supabase JS SDK — Postgres/Auth/Storage

---

## Требования
- Node.js 18+ и npm
- Docker (для локальной БД Supabase)
- Supabase CLI (опционально, но рекомендуется)

См. подробную настройку в документации: [docs/development.md](docs/development.md) и [docs/supabase.md](docs/supabase.md).

---

## Быстрый старт
1) Установите зависимости:
```bash
npm i
```
2) Локально с Supabase (рекомендуется):
```bash
npm run dev:up
```
Скрипт поднимет локальный Supabase (`supabase start`), распарсит `supabase status` и автоматически создаст/обновит `.env.local` с `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`, затем запустит Vite.

3) Используете облачный Supabase? Создайте `.env.local` вручную и запустите dev‑сервер:
```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# старт
npm run dev
```

Полная инструкция по локальной разработке: [docs/development.md](docs/development.md).

---

## Полезные команды
- Разработка: `npm run dev`
- Быстрый старт с локальным Supabase: `npm run dev:up`
- Остановить локальный Supabase: `npm run dev:down`
- Старт БД: `npm run db:start`
- Статус БД: `npm run db:status`
- Сброс БД + миграции: `npm run db:reset`
- Сборка: `npm run build` (или `npm run build:dev`)
- Предпросмотр: `npm run preview`
- Линт: `npm run lint`

---

## Переменные окружения
- `VITE_SUPABASE_URL` — URL проекта Supabase (REST API)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — публичный anon key (безопасен для клиента)

Файл `.env.local` располагается в корне. Скрипт `npm run dev:up` заполняет его автоматически из локального Supabase.

---

## Архитектура и структура
- `src/pages` — страницы (`/auth`, `/`, `/kanban`, `/contacts`, `/companies`, `/tasks`, `/profile`, `/admin`)
- `src/components` — UI и фичи (Kanban, Dashboard, формы и т. д.)
- `src/integrations/supabase` — клиент `client.ts` и типы БД `types.ts`
- `src/lib` — бизнес‑логика, форматирование, хелперы
- `src/contexts` — контексты (например, сайдбар)
- `src/types` — доменные типы (CRM)
- `supabase/migrations` — SQL‑миграции схемы, RLS и storage
- `scripts/dev-up.mjs` — автозапуск Supabase и генерация `.env.local`

Подробнее об архитектуре: [docs/architecture.md](docs/architecture.md).

---

## Маршруты и доступ
- `/auth` — аутентификация
- `/complete-profile` — завершение профиля
- `/` — панель с метриками
- `/kanban` — доска заказов
- `/contacts` — контакты
- `/companies`, `/tasks` — в разработке
- `/profile` — профиль пользователя
- `/admin` — админ‑панель (требуется роль `admin`)

Все защищено компонентом `ProtectedRoute`, кроме `/auth`.

---

## Supabase и миграции
- Конфигурация: `supabase/config.toml`
- Миграции: `supabase/migrations/*.sql`
- Локальный запуск контейнеров:
```bash
npm run db:start   # supabase start
npm run db:status
npm run db:reset   # пересоздать БД и применить миграции
```

Про роли и RLS, а также bucket `avatars` — см. [docs/supabase.md](docs/supabase.md) и [docs/database.md](docs/database.md).

---

## Сборка и деплой
1) Соберите проект:
```bash
npm run build
```
2) Задеплойте содержимое `dist/` на статический хостинг (Vercel, Netlify, S3+CloudFront и т. п.). Включите SPA‑fallback на `index.html`.
3) В хостинге задайте `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`.
4) Примените миграции в удалённой БД при необходимости.

Подробный гайд по деплою: [docs/deployment.md](docs/deployment.md).

---

## Безопасность
- В браузере используйте только `anon` ключ, не `service_role`.
- Убедитесь, что RLS‑политики покрывают все пользовательские таблицы.

## Частые проблемы
- «Supabase CLI не найден»: установите CLI.
- Ошибка парсинга при `dev:up`: убедитесь, что Supabase запущен; задайте переменные вручную в `.env.local`.
- RLS «permission denied»: убедитесь, что пишете `user_id = auth.uid()` и пользователь авторизован; для админ‑доступа добавьте роль.

---

## Документация
- Архитектура: [docs/architecture.md](docs/architecture.md)
- Разработка: [docs/development.md](docs/development.md)
- Supabase и миграции: [docs/supabase.md](docs/supabase.md)
- Схема БД: [docs/database.md](docs/database.md)
- UI‑компоненты: [docs/components.md](docs/components.md)
- Деплой: [docs/deployment.md](docs/deployment.md)

## Лицензия
Укажите здесь условия лицензии проекта, если нужно.
