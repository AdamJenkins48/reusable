import { applyStyle, createElement, normalize } from "../utils.js";
import { PROGRAM_TYPES } from "./ProgramCard.js";

export const HOUR_RANGES = [
  { id: "h72", label: "до 72 ч.", min: 0, max: 72 },
  { id: "h144", label: "73–144 ч.", min: 73, max: 144 },
  { id: "h249", label: "145–249 ч.", min: 145, max: 249 },
  { id: "h500", label: "250–500 ч.", min: 250, max: 500 },
  { id: "hbig", label: "более 500 ч.", min: 501, max: Infinity },
];

export const EDUCATION_BASES = [
  { id: "secondary-vocational", label: "Среднее профессиональное" },
  { id: "higher", label: "Высшее" },
];

const SEARCH_ICON = `
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="1.8"/>
    <path d="m16.2 16.2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;

export class ProgramFilters {
  constructor({
    id = "program-filter",
    lockedType = null,
    className = "",
    style,
    labels = {},
    onChange = () => {},
    onApply = () => {},
  } = {}) {
    this.lockedType = lockedType;
    this.onChange = onChange;
    this.onApply = onApply;
    this.element = createElement(
      "aside",
      `program-catalog__sidebar ${className}`.trim(),
      { "aria-label": labels.filters || "Фильтры каталога" }
    );
    applyStyle(this.element, style);

    const head = createElement("div", "program-catalog__sidebar-head");
    head.append(
      createElement("strong", "", { text: labels.filters || "Фильтры" }),
      createElement("button", "", {
        type: "button",
        text: labels.apply || "Показать",
      })
    );
    head.querySelector("button").addEventListener("click", () => this.onApply());
    this.element.append(head);

    this.typeFacet = this.#facet(labels.type || "Вид обучения");
    this.typeFacet.body.classList.add("program-catalog__types");
    if (lockedType) this.typeFacet.wrapper.hidden = true;

    this.directionFacet = this.#facet(labels.direction || "Направление");
    const directionSearch = createElement("div", "program-catalog__topic-search");
    directionSearch.insertAdjacentHTML("beforeend", SEARCH_ICON);
    const directionInputId = `${id}-direction-query`;
    directionSearch.append(
      createElement("label", "program-catalog__visually-hidden", {
        htmlFor: directionInputId,
        text: labels.directionSearch || "Поиск направления",
      })
    );
    this.directionQuery = createElement("input", "", {
      id: directionInputId,
      type: "search",
      placeholder: labels.directionPlaceholder || "Найти направление",
      autocomplete: "off",
    });
    directionSearch.append(this.directionQuery);
    this.directionFacet.wrapper.insertBefore(directionSearch, this.directionFacet.body);
    this.directionFacet.body.classList.add("program-catalog__directions");

    this.hoursFacet = this.#facet(labels.hours || "Объём программы");
    this.hoursFacet.body.classList.add("program-catalog__checks");
    this.educationFacet = this.#facet(labels.education || "Требуемое образование");
    this.educationFacet.body.classList.add("program-catalog__checks");

    this.handleClick = (event) => {
      const typeButton = event.target.closest("[data-type]");
      if (typeButton && !typeButton.disabled && !this.lockedType) {
        this.onChange({ group: "type", value: typeButton.dataset.type });
        return;
      }
      const directionButton = event.target.closest("[data-direction]");
      if (directionButton && !directionButton.disabled) {
        this.onChange({ group: "direction", value: directionButton.dataset.direction });
      }
    };
    this.handleChange = (event) => {
      const input = event.target.closest("input[type='checkbox'][data-group]");
      if (!input) return;
      this.onChange({
        group: input.dataset.group,
        value: input.value,
        checked: input.checked,
      });
    };
    this.handleDirectionQuery = () => this.renderDirections();
    this.element.addEventListener("click", this.handleClick);
    this.element.addEventListener("change", this.handleChange);
    this.directionQuery.addEventListener("input", this.handleDirectionQuery);
  }

  #facet(title) {
    const wrapper = createElement("div", "program-catalog__facet");
    const heading = createElement("h3", "", { text: title });
    const body = createElement("div");
    wrapper.append(heading, body);
    this.element.append(wrapper);
    return { wrapper, body };
  }

  update({ state, programs, directions, matches }) {
    this.state = state;
    this.programs = programs;
    this.directions = directions;
    this.matches = matches;
    this.renderTypes();
    this.renderDirections();
    this.renderChecks();
  }

  renderTypes() {
    const pool = this.programs.filter((program) => this.matches(program, "type"));
    const options = [
      ["all", "Все программы"],
      ...Object.entries(PROGRAM_TYPES).map(([value, item]) => [value, item.label]),
    ];
    this.typeFacet.body.replaceChildren(
      ...options.map(([value, label]) => {
        const count =
          value === "all"
            ? pool.length
            : pool.filter((program) => program.programType === value).length;
        const button = createElement("button", "", {
          type: "button",
          "aria-pressed": String(this.state.type === value),
          disabled: value !== "all" && count === 0,
        });
        button.dataset.type = value;
        button.append(
          createElement("span", "", { text: label }),
          createElement("b", "", { text: count })
        );
        return button;
      })
    );
  }

  renderDirections() {
    if (!this.programs) return;
    const needle = normalize(this.directionQuery.value);
    const pool = this.programs.filter((program) => this.matches(program, "direction"));
    const counts = Object.create(null);
    pool.forEach((program) => {
      counts[program.browseDirectionSlug] = (counts[program.browseDirectionSlug] || 0) + 1;
    });
    const visible = this.directions.filter(
      (direction) => !needle || normalize(direction.title).includes(needle)
    );
    const nodes = [];
    if (!needle) {
      const all = createElement("button", "", {
        type: "button",
        "aria-pressed": String(this.state.direction === "all"),
      });
      all.dataset.direction = "all";
      all.append(
        createElement("span", "", { text: "Все направления" }),
        createElement("b", "", { text: pool.length })
      );
      nodes.push(all);
    }
    visible.forEach((direction) => {
      const count = counts[direction.slug] || 0;
      const button = createElement("button", "", {
        type: "button",
        "aria-pressed": String(this.state.direction === direction.slug),
        disabled: count === 0,
      });
      button.dataset.direction = direction.slug;
      button.append(
        createElement("span", "", { text: direction.title }),
        createElement("b", "", { text: count })
      );
      nodes.push(button);
    });
    if (!nodes.length) {
      nodes.push(createElement("p", "program-catalog__none", { text: "Направление не найдено" }));
    }
    this.directionFacet.body.replaceChildren(...nodes);
  }

  renderChecks() {
    const hoursPool = this.programs.filter((program) => this.matches(program, "hours"));
    this.hoursFacet.body.replaceChildren(
      ...HOUR_RANGES.map((range) => {
        const count = hoursPool.filter((program) => {
          const value = Number(program.hours || 0);
          return value >= range.min && value <= range.max;
        }).length;
        return this.#checkbox("hours", range.id, range.label, count, this.state.hours.has(range.id));
      })
    );
    const educationPool = this.programs.filter((program) => this.matches(program, "education"));
    this.educationFacet.body.replaceChildren(
      ...EDUCATION_BASES.map((base) => {
        const count = educationPool.filter((program) =>
          (program.educationLevels || []).includes(base.id)
        ).length;
        return this.#checkbox(
          "education",
          base.id,
          base.label,
          count,
          this.state.education.has(base.id)
        );
      })
    );
  }

  #checkbox(group, value, label, count, checked) {
    const wrapper = createElement("label", count ? "" : "is-disabled");
    const input = createElement("input", "", {
      type: "checkbox",
      value,
      checked,
      disabled: count === 0,
    });
    input.dataset.group = group;
    wrapper.append(
      input,
      createElement("span", "", { text: label }),
      createElement("b", "", { text: count })
    );
    return wrapper;
  }

  setDirectionQuery(value = "") {
    this.directionQuery.value = value;
  }

  destroy() {
    this.element.removeEventListener("click", this.handleClick);
    this.element.removeEventListener("change", this.handleChange);
    this.directionQuery.removeEventListener("input", this.handleDirectionQuery);
  }
}
