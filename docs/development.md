# Руководство по разработке

## Установка всего необходимого
1) Node.js (LTS) и npm — Linux (через nvm):
```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v && npm -v
```

2) Docker (для локального Supabase):
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker "$USER" && newgrp docker
docker version
```

3) Supabase CLI (Linux):
```bash
curl -fsSL https://cli.supabase.com/install/linux | sh
supabase --version
```
Альтернатива: `npm i -g supabase`.

4) Установите зависимости проекта:
```bash
npm i
```

## Проверка установок
```bash
node -v            # >= 18
npm -v
docker version     # и Client, и Server доступны
supabase --version
```

## Запуск бэкенда (Supabase) и фронтенда
Есть два способа — один скрипт или по отдельности.

### Способ A (рекомендуется): один скрипт
```bash
npm run dev:up
```
Скрипт:
- запустит локальный Supabase (`supabase start`),
- распарсит `supabase status` и заполнит `.env.local` переменными `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`,
- запустит Vite Dev Server.

Остановить Supabase: `npm run dev:down` (или `supabase stop`).

### Способ B: по отдельности
1) Запустите Supabase (бэкенд):
```bash
supabase start
supabase status
# Ожидаемые строки:
# API URL: http://localhost:54321
# Studio URL: http://localhost:54323
# anon key: <ключ>
```

2) Создайте/обновите `.env.local` в корне проекта значениями из `supabase status`:
```bash
printf "VITE_SUPABASE_URL=http://localhost:54321\nVITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>\n" > .env.local
```

3) Запустите фронтенд (Vite):
```bash
npm run dev
# По умолчанию доступно на http://localhost:8080 (см. vite.config.ts)
```

## Быстрый старт (кратко)
```bash
npm i
npm run dev:up  # Supabase + .env.local + Vite
```
Альтернатива с облачным Supabase:
```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

npm run dev
```

## Проверка работоспособности (чек‑лист)
- Откройте `http://localhost:8080` — должна открыться страница входа (`/auth`).
- Зарегистрируйте нового пользователя (email/пароль). После входа вы попадёте на панель.
- Откройте Studio: `http://localhost:54323` → Table editor → `public.profiles` — должна появиться запись вашего пользователя (создаётся триггером).
- Создайте тестовый заказ через UI — в Studio проверьте таблицу `public.deals`.
- Для доступа к админке добавьте себе роль (в Studio → SQL Editor):
```sql
insert into public.user_roles (user_id, role)
values ('<ваш_user_id>', 'admin')
on conflict (user_id, role) do nothing;
```
- Перейдите на `/admin` — доступен при роли `admin`.

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

## Частые проблемы
- Supabase CLI не найден: установите CLI и проверьте `supabase --version`.
- `dev:up` не смог распарсить `supabase status`: запустите `supabase start` вручную и заполните `.env.local`.
- Порт 8080 занят: поменяйте `server.port` в `vite.config.ts` или запустите `vite --port 5173`.
- RLS `permission denied`: убедитесь, что записываете `user_id = auth.uid()` и пользователь авторизован; для админ‑доступа добавьте роль.
