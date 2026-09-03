# Каталог программ ПП и ПК

Автономная версия каталога АНО ДПО «НИИПППК», подготовленная для отдельного GitHub-репозитория. Реализация не зависит от компонентов основного сайта: это обычные ES-модули и CSS без UI-фреймворка.

## Состав

- `data/professional-retraining.json` — 2831 программа профессиональной переподготовки;
- `data/advanced-training.json` — 2292 программы повышения квалификации;
- `data/directions.json` — справочник публичных направлений;
- `src/components/ProgramSearch.js` — поиск;
- `src/components/ProgramFilters.js` — фильтры;
- `src/components/ProgramCard.js` — карточка программы, отображаемая в результатах;
- `src/components/ProgramCatalog.js` — контейнер, состояние, сортировка и пагинация;
- `src/styles/program-catalog.css` — текущий внешний вид каталога;
- `index.html` — общий каталог;
- `professional-retraining.html` и `advanced-training.html` — отдельные страницы ПП и ПК.

## Запуск

```bash
npm install
npm run dev
```

Для GitHub Pages:

```bash
npm run build
```

Публикуйте содержимое `dist`. В `vite.config.js` уже установлен относительный `base`, поэтому проект работает и в подпапке GitHub Pages.

## Подключение

Подключите таблицу стилей и передайте контейнер:

```html
<link rel="stylesheet" href="./src/styles/program-catalog.css">
<div id="catalog"></div>
<script type="module">
  import { mountProgramCatalog } from "./src/index.js";

  const catalog = mountProgramCatalog({
    root: "#catalog",
    lockedType: "professional-retraining",
    dataUrls: ["./data/professional-retraining.json"],
  });

  await catalog.ready;
</script>
```

`lockedType` принимает `professional-retraining`, `advanced-training` или `null` для общего каталога. Вместо `dataUrls` можно сразу передать `programs: [...]`.

## Изменение стилей через props

Исходный дизайн используется по умолчанию. Цвета меняются через `theme`, классы — через `classNames`, точечные inline-стили — через `styles`:

```js
mountProgramCatalog({
  root: "#catalog",
  theme: {
    ink: "#20233a",
    accent: "#6657d9",
    accentDark: "#4939b8",
    soft: "#efedff",
    orange: "#d56b2d",
    orangeSoft: "#fff0e8",
    line: "#deddea",
    page: "#f7f7fb",
    surface: "#ffffff",
  },
  classNames: {
    root: "my-catalog",
    search: "my-search",
    filters: "my-filters",
    card: "my-card",
  },
  styles: {
    root: { paddingTop: "32px" },
    search: { borderRadius: "24px" },
    filters: { top: "80px" },
    card: { borderRadius: "6px" },
  },
});
```

В `theme` также можно передавать полные имена CSS-переменных, например `"--catalog-accent": "#6657d9"`.

## Отдельные компоненты

Все части экспортируются из `src/index.js` и могут использоваться без контейнера:

```js
import {
  ProgramSearch,
  ProgramFilters,
  ProgramCard,
  createProgramCard,
} from "./src/index.js";
```

Карточка принимает те же props для класса и стиля:

```js
const card = createProgramCard(program, {
  className: "compact-card",
  style: { backgroundColor: "#fffbe8" },
  linkBuilder: (item) => `/courses/${item.slug}/`,
  actionLabel: "Подробнее",
});

document.querySelector("ul").append(card);
```

Кнопки обращения к методисту вызывают `onConsult(state)`. Если callback не передан, каталог создаёт DOM-событие `program-consult`. Ошибки загрузки создают событие `program-catalog-error`.

## Обновление данных в исходном репозитории

Команда ниже повторно формирует два JSON-файла из `../public/data/programs/index.json` и сохраняет вычисленные публичные направления:

```bash
npm run sync:data
```

Этот служебный скрипт рассчитан на расположение папки `programs` внутри основного репозитория НИИПППК. Уже сформированные JSON-файлы полностью автономны и для публикации скрипт не нужен.
