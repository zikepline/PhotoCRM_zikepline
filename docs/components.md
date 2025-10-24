# UI‑компоненты и подходы

## Библиотеки
- shadcn/ui (Radix primitives)
- Tailwind CSS (+ `tailwindcss-animate`)
- Иконки: `lucide-react`

## Принципы
- Компоненты в `src/components/ui` оборачивают Radix и Tailwind‑классы.
- Утилита `cn` (`src/lib/utils.ts`) для условных классов.
- Дизайн‑токены и темы — в `src/index.css` (HSL‑переменные), расширяются в `tailwind.config.ts`.

## Примеры
Кнопка: `src/components/ui/button.tsx`.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Создать</Button>
```

Провайдеры уведомлений и тултипов подключены в `App.tsx` (`Toaster`, `Sonner`, `TooltipProvider`).
