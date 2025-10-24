# Деплой

## Сборка
```bash
npm run build
```
Артефакты появятся в каталоге `dist/`.

## Хостинг
Подойдёт любой статический хостинг: Vercel, Netlify, GitHub Pages, S3+CloudFront и т. п.

Обязательно включите SPA‑fallback на `index.html` (все маршруты должны отдавать `index.html`).

## Переменные окружения на хостинге
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Supabase (облако)
- Создайте проект в Supabase и возьмите `Project URL` + `anon key`.
- Примените миграции при необходимости (см. Supabase CLI: `db push`/`migrate`).

## Безопасность
- Никогда не используйте `service_role` ключ в клиенте.
- Проверьте RLS‑политики перед продакшеном.
