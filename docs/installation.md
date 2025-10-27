# Установка PhotoCRM

## Системные требования

- **Windows** 10/11
- **Node.js** 18+ 
- **Docker Desktop**
- **Supabase CLI**

## Пошаговая установка

### 1. Установка Node.js

**Способ 1: Через winget (рекомендуется)**
```powershell
winget install OpenJS.NodeJS.LTS
```

**Способ 2: Скачать с сайта**
- Перейдите на https://nodejs.org/
- Скачайте LTS версию
- Установите с настройками по умолчанию

**Проверка:**
```powershell
node --version  # должно быть >= 18
npm --version
```

### 2. Установка Docker Desktop

**Способ 1: Через winget**
```powershell
winget install Docker.DockerDesktop
```

**Способ 2: Скачать с сайта**
- Перейдите на https://www.docker.com/products/docker-desktop/
- Скачайте Docker Desktop для Windows
- Установите и запустите приложение
- Дождитесь статуса "Docker is running"

**Проверка:**
```powershell
docker --version
```

### 3. Установка Supabase CLI

**Способ 1: Скачивание вручную (рекомендуется)**

1. Перейдите на https://github.com/supabase/cli/releases
2. Скачайте `supabase_windows_amd64.tar.gz` (последняя версия)
3. Распакуйте архив в папку `C:\supabase\`
4. Добавьте путь в переменную PATH:
   ```powershell
   setx PATH "%PATH%;C:\supabase"
   ```
5. Перезапустите терминал

**Способ 2: Через Chocolatey (если установлен)**
```powershell
choco install supabase
```

**Способ 3: Через Scoop (если установлен)**
```powershell
scoop install supabase
```

**Проверка:**
```powershell
supabase --version
```

### 4. Установка зависимостей проекта
Устанавливаются один раз - после копирования проекта

1. **Скачайте проект:**
    ```powershell
   git clone https://github.com/zikepline/PhotoCRM_zikepline.git
   cd PhotoCRM_zikepline
   ```

2. **Установите зависимости:**
   ```powershell
   npm install
   ```

## Проверка установки

Выполните все команды по порядку:

```powershell
# Проверка Node.js
node --version    # >= 18
npm --version

# Проверка Docker
docker --version

# Проверка Supabase CLI
supabase --version

# Проверка зависимостей проекта
npm list --depth=0
```

## Запуск проекта

После успешной установки всех компонентов:

### Автоматический запуск
```powershell
npm run dev:up
```

### Или ручной запуск
   ```powershell
   # Запуск backend
   supabase start
   ```
   
   ### Переменные окружения
   
   Создайте файл `.env.local` в корне проекта через консоль:
   ```
   echo "VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ВАШ_КЛЮЧ_ИЗ_STATUS" > .env.local
   ```
   
   **Получить ключи**: `supabase status`
   
   ```powershell
   # Запуск fronted
   npm run dev
   ```                              

Откройте браузер: http://localhost:8080

## Решение проблем

### Node.js не найден
- Перезапустите терминал после установки
- Проверьте переменную PATH: `echo $env:PATH`

### Docker не запускается
- Убедитесь, что Docker Desktop запущен
- Проверьте, что виртуализация включена в BIOS
- Перезапустите Docker Desktop

### Supabase CLI не найден
- Убедитесь, что файл `supabase.exe` находится в `C:\supabase\`
- Проверьте переменную PATH: `echo $env:PATH`
- Перезапустите терминал

### npm install не работает
- Проверьте подключение к интернету
- Очистите кеш: `npm cache clean --force`
- Удалите `node_modules` и `package-lock.json`, затем `npm install`

## Дополнительная помощь

- **Полная документация**: [docs/development.md](docs/development.md)
- **Работа с Supabase**: [docs/supabase.md](docs/supabase.md)
- **Проблемы с запуском**: см. раздел "Частые проблемы" в документации
