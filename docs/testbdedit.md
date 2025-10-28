## Работа с базой данных в SQLEditor
#### Очистка всей базы заказов
```
TRUNCATE TABLE public.deals RESTART IDENTITY CASCADE;
```

#### Очистка всей базы заказов у конкретного пользователя
```
DELETE FROM public.deals
WHERE user_id = 'ВАШ_АЙДИ'::uuid;
```

#### Создание рандомных данных для теста
```
-- Генерация ~500 заказов: album_price ≈ 4000 за альбом, amount = album_price * children_count
-- Пользователь (заменить на своего): fbc47d0d-f225-481f-b5d9-66251deee48a

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

WITH
  src AS (
    SELECT
      gs AS idx,
      CASE
        WHEN random() < 0.25 THEN 'current'
        WHEN random() < 0.35 THEN 'last_month'
        ELSE 'older'
      END AS bucket
    FROM generate_series(1, 500) AS gs
  ),
  dated AS (
    SELECT
      idx,
      bucket,
      CASE bucket
        WHEN 'current' THEN
          (date_trunc('month', now())
           + ((random() * 27)::int || ' days')::interval
           + ((random() * 24)::int || ' hours')::interval)
        WHEN 'last_month' THEN
          (date_trunc('month', now()) - interval '1 month'
           + ((random() * 27)::int || ' days')::interval
           + ((random() * 24)::int || ' hours')::interval)
        ELSE
          (date_trunc('month', now()) - ((2 + (random() * 9)::int) || ' months')::interval
           + ((random() * 27)::int || ' days')::interval
           + ((random() * 24)::int || ' hours')::interval)
      END AS created_at
    FROM src
  ),
  normalized AS (
    SELECT
      idx,
      bucket,
      created_at,

      -- Кол-во людей ≈ 20 (12..30)
      (12 + (random() * 18)::int) AS children_count,

      -- Цена альбома за штуку ≈ 4000 (границы 2500..7000)
      GREATEST(2500, LEAST(7000, round(4000 + (random() - 0.5) * 1600)))::numeric AS album_price,

      -- Печать за штуку ≈ 1200 (800..1800)
      GREATEST(800, LEAST(1800, round(1200 + (random() - 0.5) * 600)))::numeric AS print_cost,

      -- Прочие фикс. расходы (0..600)
      (random() * 600)::int::numeric AS fixed_expenses,

      -- Выплаты (до 5%) и не у всех
      CASE WHEN random() < 0.5 THEN 'percent' ELSE NULL END AS photographer_payment_type,
      CASE WHEN random() < 0.5 THEN round((random() * 5)::numeric, 2) ELSE NULL END AS photographer_percent,
      NULL::numeric AS photographer_fixed,

      CASE WHEN random() < 0.4 THEN 'percent' ELSE NULL END AS retoucher_payment_type,
      CASE WHEN random() < 0.4 THEN round((random() * 5)::numeric, 2) ELSE NULL END AS retoucher_percent,
      NULL::numeric AS retoucher_fixed,

      CASE WHEN random() < 0.3 THEN 'percent' ELSE NULL END AS school_payment_type,
      CASE WHEN random() < 0.3 THEN round((random() * 5)::numeric, 2) ELSE NULL END AS school_percent,
      NULL::numeric AS school_fixed,

      CASE WHEN random() < 0.25 THEN 'percent' ELSE NULL END AS layout_payment_type,
      CASE WHEN random() < 0.25 THEN round((random() * 5)::numeric, 2) ELSE NULL END AS layout_percent,
      NULL::numeric AS layout_fixed,

      -- Налоги: только допустимые
      CASE WHEN random() < 0.4 THEN 'revenue' ELSE 'net_profit' END AS tax_base,
      CASE WHEN random() < 0.4 THEN round((random() * 6)::numeric, 2) ELSE 6::numeric END AS tax_percent,

      -- Контакты иногда
      CASE WHEN random() < 0.6 THEN ('+7' || (9000000000 + floor(random()*99999999))::bigint)::text ELSE NULL END AS phone,
      CASE WHEN random() < 0.5 THEN ('parent' || (1000 + (random()*9000)::int)::text || '@example.com') ELSE NULL END AS email,

      -- Теги иногда
      CASE
        WHEN random() < 0.5 THEN ARRAY['школа','альбом']
        WHEN random() < 0.65 THEN ARRAY['выпускной','печать']
        WHEN random() < 0.75 THEN ARRAY['детсад']
        ELSE NULL
      END AS tags
    FROM dated
  ),
  with_amount AS (
    SELECT
      *,
      -- Общая сумма заказа = цена альбома * кол-во
      (album_price * children_count)::numeric AS amount
    FROM normalized
  ),
  with_status AS (
    SELECT
      n.*,
      CASE
        WHEN bucket = 'older' THEN
          CASE WHEN random() < 0.90 THEN 'completed'
               ELSE (ARRAY['new','contact','negotiation','contract','shooting','editing','delivery','lost'])[1 + floor(random()*8)]
          END
        WHEN bucket = 'last_month' THEN
          CASE WHEN random() < 0.85 THEN 'completed'
               ELSE (ARRAY['new','contact','negotiation','contract','shooting','editing','delivery','lost'])[1 + floor(random()*8)]
          END
        ELSE
          CASE WHEN random() < 0.40 THEN 'completed'
               ELSE (ARRAY['new','contact','negotiation','contract','shooting','editing','delivery','lost'])[1 + floor(random()*8)]
          END
      END AS status
    FROM with_amount n
  ),
  prepared AS (
    SELECT
      gen_random_uuid() AS id,
      FORMAT('Заказ #%s — Класс %s', idx, 1 + (idx % 11)) AS title,

      amount,
      children_count,
      print_cost,
      fixed_expenses,

      '[]'::jsonb AS links,
      '[]'::jsonb AS stage_history,

      status,
      tags,

      NULL::uuid AS company_id,
      NULL::uuid AS contact_id,

      phone,
      email,

      tax_base,
      tax_percent,

      photographer_payment_type, photographer_percent, photographer_fixed,
      retoucher_payment_type, retoucher_percent, retoucher_fixed,
      school_payment_type, school_percent, school_fixed,
      layout_payment_type, layout_percent, layout_fixed,

      'fbc47d0d-f225-481f-b5d9-66251deee48a'::uuid AS user_id,

      created_at,
      created_at AS updated_at
    FROM with_status
  )
INSERT INTO public.deals (
  id, user_id, title,
  amount, print_cost, children_count, fixed_expenses,
  school_payment_type, school_percent, school_fixed,
  photographer_payment_type, photographer_percent, photographer_fixed,
  retoucher_payment_type, retoucher_percent, retoucher_fixed,
  layout_payment_type, layout_percent, layout_fixed,
  tax_base, tax_percent,
  description, phone, email, links, stage_history, status, tags,
  contact_id, company_id, created_at, updated_at
)
SELECT
  id, user_id, title,
  amount, print_cost, children_count, fixed_expenses,
  school_payment_type, school_percent, school_fixed,
  photographer_payment_type, photographer_percent, photographer_fixed,
  retoucher_payment_type, retoucher_percent, retoucher_fixed,
  layout_payment_type, layout_percent, layout_fixed,
  tax_base, tax_percent,
  NULL::text, phone, email, links, stage_history, status, tags,
  contact_id, company_id, created_at, updated_at
FROM prepared;
```
