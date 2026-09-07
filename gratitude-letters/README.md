# Блок «Благодарственные письма»

Самостоятельный React-модуль галереи благодарственных писем. Он не зависит от Next.js, Tailwind CSS или стилей портала. Единственная внешняя зависимость — React 18 или новее.

## Состав

- `GratitudeLetters.tsx` — компонент галереи и модального просмотра;
- `GratitudeLetters.module.css` — полностью изолированные стили;
- `letters.ts` — данные трех писем и ссылки на локальные изображения;
- `types.ts` — публичные типы;
- `styles.d.ts` — типы для CSS Modules;
- `assets/` — изображения писем в WebP;
- `index.ts` — единая точка импорта.

## Подключение

Скопируйте всю папку `gratitude-letters` в исходный код React-портала, не меняя взаимное расположение файлов. Сборщик должен поддерживать CSS Modules и стандартную конструкцию `new URL(..., import.meta.url)` для локальных ресурсов. Это поддерживается актуальными версиями Next.js, Vite и Webpack.

```tsx
import { GratitudeLetters } from "./gratitude-letters";

export function HomePage() {
  return <GratitudeLetters />;
}
```

Для Next.js App Router дополнительная директива `"use client"` не требуется: она уже указана внутри компонента.

## Собственный набор писем

```tsx
import {
  GratitudeLetters,
  type GratitudeLetterItem,
} from "./gratitude-letters";

const letters: GratitudeLetterItem[] = [
  {
    id: "partner-name",
    organization: "Название организации",
    excerpt: "Краткий текст благодарности.",
    date: "01.01.2026",
    dateTime: "2026-01-01",
    image: "/documents/partner-letter.webp",
    width: 723,
    height: 1024,
  },
];

export function HomePage() {
  return <GratitudeLetters letters={letters} title="Отзывы партнеров" />;
}
```

## Настройка цветов

Цвета меняются через CSS-переменные, переданные в `style`:

```tsx
<GratitudeLetters
  style={{
    "--gratitude-accent": "#087d91",
    "--gratitude-focus": "#059fb9",
    "--gratitude-heading": "#111a2f",
  } as React.CSSProperties}
/>
```

Модальное окно закрывается кликом по документу, кликом за его пределами или клавишей `Esc`. После закрытия фокус возвращается к карточке, с которой было открыто письмо.
