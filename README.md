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

См. подробную настройку в документации: 
- [Руководство по установке](docs/installation.md) - пошаговая установка всех компонентов
- [Руководство по разработке](docs/development.md) - запуск и работа с проектом
- [Работа с Supabase](docs/supabase.md) - база данных и миграции

---

## Быстрый старт

### Предварительные требования
- **Node.js** 18+ и npm
- **Docker Desktop** (скачать с https://www.docker.com/products/docker-desktop/)
- **Supabase CLI** (установить вручную с https://github.com/supabase/cli/releases)

### Установка и запуск

1. **Установите зависимости:**
```bash
npm install
```

2. **Запустите проект (автоматически):**
```bash
npm run dev:up
```

Скрипт автоматически:
- Запустит локальный Supabase
- Создаст `.env.local` с правильными ключами
- Запустит Vite dev-сервер

3. **Откройте браузер:**
- http://localhost:8080

### Альтернативный запуск (ручной)

1. **Запустите Supabase:**
```bash
supabase start
```
или
```bash
supabase start --ignore-health-check
```

2. **Создайте .env.local** (через блокнот):
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ВАШ_КЛЮЧ_ИЗ_STATUS
```

3. **Запустите Vite:**
```bash
npm run dev
```

**Документация**:
- [Руководство по установке](docs/installation.md) - установка всех компонентов
- [Руководство по разработке](docs/development.md) - запуск и работа с проектом

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
