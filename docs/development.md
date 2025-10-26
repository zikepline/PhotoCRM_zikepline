# Руководство по разработке PhotoCRM

## Системные требования

- Как проверить наличие: выполните в PowerShell
```powershell
winget --version
```
Если команда не найдена — установите «App Installer» из Microsoft Store и перезапустите PowerShell. При отсутствии Winget можно использовать альтернативы (ручные инсталляторы, Chocolatey, Scoop), но шаги ниже предполагают наличие Winget.

## Установка зависимостей

### 1. Node.js и npm
```powershell
# Через winget (рекомендуется)
winget install OpenJS.NodeJS.LTS

# Проверка
node -v  # >= 18
npm -v
```

### 2. Docker Desktop
```powershell
# Через winget
winget install Docker.DockerDesktop

# Или скачайте с https://www.docker.com/products/docker-desktop/
# Запустите Docker Desktop и дождитесь статуса "Docker is running"
docker --version
```

### 3. Supabase CLI

**Способ 1: Скачивание вручную (рекомендуется)**
1. Перейдите на https://github.com/supabase/cli/releases
2. Скачайте `supabase_windows_amd64.tar.gz`
3. Распакуйте в папку `C:\supabase\`
4. Добавьте `C:\supabase\` в переменную PATH:
   ```powershell
   setx PATH "%PATH%;C:\supabase"
   ```
5. Перезапустите терминал и проверьте:
   ```powershell
   supabase --version
   ```

**Способ 2: Через Chocolatey (если установлен)**
```powershell
choco install supabase
```

**Способ 3: Через Scoop (если установлен)**
```powershell
scoop install supabase
```

### 4. Установка зависимостей проекта
```powershell
# Перейдите в папку проекта
cd "путь\к\проекту\PhotoCRM_zikepline"

# Установите зависимости
npm install
```

## Запуск проекта

### Способ 1: Автоматический запуск (рекомендуется)
```powershell
npm run dev:up
```
Этот скрипт:
- Запустит локальный Supabase
- Создаст/обновит `.env.local` с правильными ключами
- Запустит Vite dev-сервер

### Способ 2: Ручной запуск

**Шаг 1: Запустите Supabase**
```powershell
supabase start
```

**Шаг 2: Проверьте статус и скопируйте ключи**
```powershell
supabase status
# Скопируйте API URL и Publishable key из вывода
```

**Шаг 3: Создайте .env.local**
Создайте файл `.env.local` в корне проекта через блокнот:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ВАШ_КЛЮЧ_ИЗ_STATUS
```

**Шаг 4: Запустите Vite**
```powershell
npm run dev
```

### Способ 3: Через PowerShell (создание .env.local)
```powershell
# После запуска supabase start
$envContent = @"
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ВАШ_КЛЮЧ
"@
Set-Content -Path .\.env.local -Value $envContent -Encoding utf8
```

## Проверка работоспособности

1. **Откройте браузер**: http://localhost:8080
2. **Должна открыться страница входа** (`/auth`)
3. **Зарегистрируйте нового пользователя** (email/пароль)
4. **После входа** вы попадете на панель управления
5. **Откройте Supabase Studio**: http://localhost:54323
   - Table editor → `public.profiles` — должна появиться запись пользователя
   - Создайте тестовый заказ через UI и проверьте таблицу `public.deals`

## Полезные команды

```powershell
# Разработка
npm run dev              # Запуск Vite dev-сервера
npm run dev:up          # Автоматический запуск (Supabase + Vite)
npm run dev:down        # Остановка Supabase

# База данных
npm run db:start        # Запуск Supabase
npm run db:status       # Статус Supabase
npm run db:reset        # Сброс БД и применение миграций

# Сборка
npm run build           # Продакшн сборка
npm run build:dev       # Dev сборка
npm run preview         # Предпросмотр сборки
npm run lint            # Линтинг кода
```

## Доступ к админ-панели

Для доступа к админ-панели (`/admin`) добавьте себе роль администратора:

1. Откройте Supabase Studio: http://localhost:54323
2. Перейдите в SQL Editor
3. Выполните запрос:
```sql
insert into public.user_roles (user_id, role)
values ('<ваш_user_id>', 'admin')
on conflict (user_id, role) do nothing;
```

`<ваш_user_id>` можно найти в таблице `auth.users` в Studio.

## Структура проекта

```
src/
├── components/          # UI компоненты
│   ├── ui/             # shadcn/ui компоненты
│   ├── auth/           # Аутентификация
│   ├── dashboard/      # Панель управления
│   ├── deals/          # Управление заказами
│   └── layout/         # Макет приложения
├── pages/              # Страницы приложения
├── integrations/       # Интеграции
│   └── supabase/       # Supabase клиент и типы
├── lib/                # Утилиты и хелперы
├── types/              # TypeScript типы
└── contexts/           # React контексты
```

## Переменные окружения

- `VITE_SUPABASE_URL` — URL API Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` — публичный anon key

Файл `.env.local` создается автоматически при использовании `npm run dev:up`.

## Частые проблемы и решения

### 1. "Supabase CLI не найден"
**Решение**: Установите Supabase CLI одним из способов выше и перезапустите терминал.

### 2. "failed to parse environment file: .env.local"
**Решение**: Удалите `.env.local` и создайте заново через блокнот:
```powershell
del .env.local
# Создайте через блокнот с правильным содержимым
```

### 3. "Docker Desktop не запущен"
**Решение**: Запустите Docker Desktop и дождитесь статуса "Docker is running".

### 4. Белая страница в браузере
**Решение**: 
- Проверьте, что Supabase запущен: `supabase status`
- Убедитесь, что `.env.local` содержит правильные ключи
- Откройте консоль разработчика (F12) и посмотрите на ошибки

### 5. Порт 8080 занят
**Решение**: Измените порт в `vite.config.ts` или запустите:
```powershell
npm run dev -- --port 5173
```

### 6. RLS "permission denied"
**Решение**: Убедитесь, что:
- Пользователь авторизован
- В запросах используется `user_id = auth.uid()`
- Для админ-доступа добавлена роль `admin`

## Остановка и перезапуск

- **Остановка фронтенда**: `Ctrl + C` в терминале с Vite
- **Остановка Supabase**: `npm run dev:down` или `supabase stop`
- **Полный перезапуск**: `npm run dev:up`

**Важно**: Данные локальной БД сохраняются между перезапусками. Они удаляются только при явном сбросе (`npm run db:reset`).

## Резервное копирование

```powershell
# Создание бэкапа
New-Item -ItemType Directory -Force -Path .\backups | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
supabase db dump -f "backups\local-$stamp.sql"

# Восстановление
supabase db reset
supabase db restore -f "backups\local-<timestamp>.sql"
```
