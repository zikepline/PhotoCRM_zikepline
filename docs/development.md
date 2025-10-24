# Руководство по разработке

## Winget (что это и нужно ли его ставить)
Winget — это менеджер пакетов Windows (Windows Package Manager). В Windows 11 и большинстве актуальных версий Windows 10 он уже предустановлен как компонент «App Installer».

- Как проверить наличие: выполните в PowerShell
```powershell
winget --version
```
Если команда не найдена — установите «App Installer» из Microsoft Store и перезапустите PowerShell. При отсутствии Winget можно использовать альтернативы (ручные инсталляторы, Chocolatey, Scoop), но шаги ниже предполагают наличие Winget.

## Установка всего необходимого (Windows, PowerShell)
1) Node.js (LTS) и npm — через Winget (предпочтительно):
```powershell
winget install OpenJS.NodeJS.LTS
# Перезапустите PowerShell, затем проверьте
node -v; npm -v
```
Альтернатива: установщик с сайта Node.js (LTS) — затем перезапустить терминал.

2) Docker Desktop:
```powershell
winget install Docker.DockerDesktop
# Запустите Docker Desktop вручную и дождитесь статуса "Docker is running"
docker version
```

3) Supabase CLI:
```powershell
# Вариант 1 (простой):
npm i -g supabase

# Вариант 2 (через Scoop):
iwr -useb get.scoop.sh | iex
scoop install supabase

# Вариант 3 (через Chocolatey, PowerShell от Администратора):
choco install supabase

# Проверка
supabase --version
```

4) Установите зависимости проекта:
```powershell
npm i
```

## Проверка установок
```powershell
node -v            # >= 18
npm -v
docker version     # и Client, и Server доступны
supabase --version
```

## Запуск бэкенда (Supabase) и фронтенда
Есть два способа — один скрипт или по отдельности.

### Способ A (рекомендуется): один скрипт
```powershell
npm run dev:up
```
Скрипт:
- запустит локальный Supabase (`supabase start`),
- распарсит `supabase status` и заполнит `.env.local` переменными `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`,
- запустит Vite Dev Server.

Остановить Supabase: `npm run dev:down` (или `supabase stop`).

Это безопасно: данные локальной БД сохранятся. Таблицы/данные удаляются только при явном сбросе (`npm run db:reset` / `supabase db reset`) или ручном удалении Docker volumes.

### Способ B: по отдельности
1) Запустите Supabase (бэкенд):
```powershell
supabase start
supabase status
# Ожидаемые строки:
# API URL: http://localhost:54321
# Studio URL: http://localhost:54323
# anon key: <ключ>
```

2) Создайте/обновите `.env.local` в корне проекта значениями из `supabase status`:
```powershell
$envContent = @"
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
"@
Set-Content -Path .\.env.local -Value $envContent -NoNewline:$false
```
Альтернатива (откроется Блокнот):
```powershell
notepad .\.env.local
# Вставьте две строки из примера выше и сохраните файл
```

3) Запустите фронтенд (Vite):
```powershell
npm run dev
# По умолчанию доступно на http://localhost:8080 (см. vite.config.ts)
```

## Быстрый старт (кратко)
```powershell
npm i
npm run dev:up  # Supabase + .env.local + Vite
```
Альтернатива с облачным Supabase:
```powershell
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
- Supabase CLI не найден: установите CLI и проверьте `supabase --version` (перезапустите PowerShell для обновления PATH).
- `dev:up` не смог распарсить `supabase status`: запустите `supabase start` вручную и заполните `.env.local`.
- Порт 8080 занят: поменяйте `server.port` в `vite.config.ts` или запустите `vite --port 5173`.
- Docker Desktop не запущен: откройте приложение и дождитесь "Docker is running".
- RLS `permission denied`: убедитесь, что записываете `user_id = auth.uid()` и пользователь авторизован; для админ‑доступа добавьте роль.
