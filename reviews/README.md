# ReviewsSection

Автономный React-компонент карусели оригинальных отзывов о НИИПППК с Яндекс Карт и 2ГИС. Каталог можно переносить целиком в другой React/Next.js проект: внешние UI-библиотеки и стили хост-приложения не требуются.

## Файлы

- `ReviewsSection.tsx` — карусель, адаптивность, свайп и модальное окно.
- `ReviewsSection.module.css` — структурные стили без собственной цветовой гаммы.
- `types.ts` — публичные типы пропсов и данных.
- `yandexReviews.ts` — текущая объединённая выгрузка отзывов НИИПППК из Яндекс Карт и 2ГИС.
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
  return <ReviewsSection colors={colors} />;
}
```

`colors` обязателен: компонент не содержит брендовой палитры и получает все цвета от приложения. По умолчанию отображаются ссылки на оба первоисточника. Дополнительно можно передать собственные `data`, `title`, `subtitle`, `mapSource`, `shuffle` и `className`; `mapSource` ограничивает вывод одной площадкой только для ссылки и не фильтрует отзывы.

Проект должен поддерживать React 19+, TypeScript и CSS Modules. Для Next.js директива `"use client"` уже добавлена.
