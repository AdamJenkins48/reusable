# ReviewsSection

Автономный React-компонент карусели отзывов с Яндекс Карт. Каталог можно переносить целиком в другой React/Next.js проект: внешние UI-библиотеки и стили хост-приложения не требуются.

## Файлы

- `ReviewsSection.tsx` — карусель, адаптивность, свайп и модальное окно.
- `ReviewsSection.module.css` — структурные стили без собственной цветовой гаммы.
- `types.ts` — публичные типы пропсов и данных.
- `yandexReviews.ts` — текущая выгрузка отзывов.
- `index.ts` — публичная точка входа.

## Подключение

```tsx
import { ReviewsSection, type ReviewsColors } from "./reviews";

const colors: ReviewsColors = {
  accent: "var(--brand)",
  accentHover: "var(--brand-hover)",
  text: "var(--foreground)",
  bodyText: "var(--body-text)",
  mutedText: "var(--muted)",
  border: "var(--border)",
  background: "var(--background)",
  surface: "var(--surface)",
  onAccent: "var(--on-brand)",
  emptyStar: "var(--muted-border)",
  overlay: "var(--overlay)",
};

export function Page() {
  return <ReviewsSection colors={colors} mapSource="niipppk" />;
}
```

`colors` обязателен: компонент не содержит брендовой палитры и получает все цвета от приложения. Дополнительно можно передать собственные `data`, `title`, `subtitle`, `mapSource`, `shuffle` и `className`.

Проект должен поддерживать React 19+, TypeScript и CSS Modules. Для Next.js директива `"use client"` уже добавлена.
