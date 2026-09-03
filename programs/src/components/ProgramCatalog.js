import { ProgramSearch } from "./ProgramSearch.js";
import {
  EDUCATION_BASES,
  HOUR_RANGES,
  ProgramFilters,
} from "./ProgramFilters.js";
import { createProgramCard, PROGRAM_TYPES } from "./ProgramCard.js";
import {
  alphaSortKey,
  applyStyle,
  createElement,
  normalize,
  plural,
  toCssVariableName,
} from "../utils.js";

const DEFAULT_DATA_URLS = [
  "./data/professional-retraining.json",
  "./data/advanced-training.json",
];

const DEFAULT_LABELS = {
  eyebrow: "Каталог программ",
  title: "Подберите программу обучения",
  loading: "Загрузка программ…",
  emptyTitle: "Под эти условия программ нет",
  emptyText:
    "Снимите один из фильтров или обратитесь к методисту — мы поможем подобрать программу.",
  reset: "Сбросить фильтры",
  consult: "Написать методисту",
  consultTitle: "Не нашли нужную программу?",
  consultText: "Методист бесплатно подберёт программу и поможет с учебным планом",
  consultButton: "Получить подборку",
  filters: "Фильтры",
  sorting: "Сортировка",
};

let instanceCounter = 0;

function findRange(id) {
  return HOUR_RANGES.find((range) => range.id === id);
}

function uniqueDirections(programs) {
  const bySlug = new Map();
  programs.forEach((program) => {
    if (!program.browseDirectionSlug) return;
    bySlug.set(program.browseDirectionSlug, {
      slug: program.browseDirectionSlug,
      title: program.browseDirectionTitle || program.direction || program.browseDirectionSlug,
    });
  });
  return [...bySlug.values()].sort((a, b) =>
    alphaSortKey(a.title).localeCompare(alphaSortKey(b.title), "ru")
  );
}

export class ProgramCatalog {
  constructor({
    root,
    programs = null,
    dataUrls = DEFAULT_DATA_URLS,
    lockedType = null,
    title,
    headingLevel = 1,
    pageSize = 20,
    syncUrl = true,
    theme = {},
    classNames = {},
    styles = {},
    labels = {},
    linkBuilder,
    onConsult = null,
    onStateChange = null,
  } = {}) {
    this.host = typeof root === "string" ? document.querySelector(root) : root;
    if (!this.host) throw new Error("ProgramCatalog: root element not found");

    this.id = `program-catalog-${++instanceCounter}`;
    this.pageSize = Math.max(1, Number(pageSize) || 20);
    this.syncUrl = Boolean(syncUrl);
    this.lockedType = PROGRAM_TYPES[lockedType] ? lockedType : null;
    this.dataUrls = dataUrls;
    this.linkBuilder = linkBuilder || ((program) => program.route || "#");
    this.onConsult = onConsult;
    this.onStateChange = onStateChange;
    this.labels = { ...DEFAULT_LABELS, ...labels };
    if (title) this.labels.title = title;
    this.classNames = classNames;
    this.styles = styles;
    this.programs = [];
    this.filtered = [];
    this.directions = [];
    this.maxHours = 0;
    this.state = {
      q: "",
      type: this.lockedType || "all",
      direction: "all",
      hours: new Set(),
      education: new Set(),
      sort: "alpha",
      limit: this.pageSize,
    };

    this.#build(headingLevel, theme);
    this.#readUrl();
    this.ready = this.#load(programs);
  }

  #build(headingLevel, theme) {
    this.element = createElement(
      "section",
      `program-catalog ${this.classNames.root || ""}`.trim()
    );
    this.element.id = this.id;
    applyStyle(this.element, this.styles.root);
    Object.entries(theme).forEach(([key, value]) => {
      if (value != null) this.element.style.setProperty(toCssVariableName(key), String(value));
    });

    const container = createElement("div", "program-catalog__container");
    const eyebrow = createElement("div", "program-catalog__eyebrow", {
      text: this.labels.eyebrow,
    });
    const headingTag = Number(headingLevel) === 2 ? "h2" : "h1";
    const heading = createElement(headingTag, "program-catalog__title", {
      text: this.labels.title,
    });

    this.search = new ProgramSearch({
      id: `${this.id}-query`,
      value: this.state.q,
      className: this.classNames.search,
      style: this.styles.search,
      placeholder: this.labels.searchPlaceholder,
      label: this.labels.searchLabel,
      buttonLabel: this.labels.searchButton,
      onChange: (value) => this.setSearch(value),
      onSubmit: (value) => this.setSearch(value),
    });

    const layout = createElement("div", "program-catalog__layout");
    this.filters = new ProgramFilters({
      id: this.id,
      lockedType: this.lockedType,
      className: this.classNames.filters,
      style: this.styles.filters,
      labels: this.labels,
      onChange: (change) => this.#applyFilterChange(change),
      onApply: () => this.#openFilters(false),
    });

    const results = createElement("div", "program-catalog__results", {
      "aria-label": this.labels.results || "Программы",
    });
    const toolbar = createElement("div", "program-catalog__toolbar");
    this.mobileFilters = createElement("button", "program-catalog__mobile-filters", {
      type: "button",
    });
    this.mobileFilters.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4"
          stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>
      ${this.labels.filters} <b hidden>0</b>`;
    this.badge = this.mobileFilters.querySelector("b");
    this.found = createElement("p", "program-catalog__found", {
      text: this.labels.loading,
      "aria-live": "polite",
    });
    const spacer = createElement("span", "program-catalog__spacer");
    const sortLabel = createElement("label", "program-catalog__sort", {
      text: this.labels.sorting,
    });
    this.sort = createElement("select", "", {
      "aria-label": this.labels.sorting,
    });
    [
      ["alpha", "по алфавиту"],
      ["hours-asc", "объём: сначала короткие"],
      ["hours-desc", "объём: сначала длинные"],
    ].forEach(([value, text]) =>
      this.sort.append(createElement("option", "", { value, text }))
    );
    sortLabel.append(this.sort);
    toolbar.append(this.mobileFilters, this.found, spacer, sortLabel);

    this.chips = createElement("div", "program-catalog__chips");
    this.rows = createElement("ul", "program-catalog__rows");
    this.more = createElement("button", "program-catalog__more", {
      type: "button",
      hidden: true,
    });
    this.empty = createElement("div", "program-catalog__empty", { hidden: true });
    this.emptyText = createElement("p", "", { text: this.labels.emptyText });
    const emptyActions = createElement("div");
    this.emptyReset = createElement("button", "", {
      type: "button",
      text: this.labels.reset,
    });
    const emptyConsult = createElement("button", "ghost", {
      type: "button",
      text: this.labels.consult,
    });
    emptyActions.append(this.emptyReset, emptyConsult);
    this.empty.append(
      createElement("strong", "", { text: this.labels.emptyTitle }),
      this.emptyText,
      emptyActions
    );

    const consult = createElement("div", "program-catalog__consult");
    const consultCopy = createElement("div");
    consultCopy.append(
      createElement("strong", "", { text: this.labels.consultTitle }),
      createElement("span", "", { text: this.labels.consultText })
    );
    const consultButton = createElement("button", "", {
      type: "button",
      text: this.labels.consultButton,
    });
    consult.append(consultCopy, consultButton);

    results.append(toolbar, this.chips, this.rows, this.more, this.empty, consult);
    layout.append(this.filters.element, results);
    container.append(eyebrow, heading, this.search.element, layout);
    this.scrim = createElement("div", "program-catalog__scrim", { hidden: true });
    this.element.append(container, this.scrim);
    this.host.replaceChildren(this.element);

    this.handleSort = () => {
      this.state.sort = this.sort.value;
      this.state.limit = this.pageSize;
      this.render();
    };
    this.handleChips = (event) => {
      const button = event.target.closest("[data-clear]");
      if (button) this.clearFilter(button.dataset.clear);
    };
    this.handleKeydown = (event) => {
      if (event.key === "Escape" && this.filters.element.classList.contains("is-open")) {
        this.#openFilters(false);
      }
    };
    this.handleConsult = () => {
      if (typeof this.onConsult === "function") {
        this.onConsult(this.getState());
      } else {
        this.element.dispatchEvent(
          new CustomEvent("program-consult", { bubbles: true, detail: this.getState() })
        );
      }
    };
    this.sort.addEventListener("change", this.handleSort);
    this.chips.addEventListener("click", this.handleChips);
    this.more.addEventListener("click", () => {
      this.state.limit += this.pageSize;
      this.render();
    });
    this.emptyReset.addEventListener("click", () => this.reset());
    emptyConsult.addEventListener("click", this.handleConsult);
    consultButton.addEventListener("click", this.handleConsult);
    this.mobileFilters.addEventListener("click", () => this.#openFilters(true));
    this.scrim.addEventListener("click", () => this.#openFilters(false));
    document.addEventListener("keydown", this.handleKeydown);
  }

  async #load(programs) {
    try {
      const source = Array.isArray(programs)
        ? programs
        : (
            await Promise.all(
              this.dataUrls.map(async (url) => {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
                return response.json();
              })
            )
          ).flatMap((payload) => payload.programs || payload);
      this.programs = source.filter((program) => !program.status || program.status === "ready");
      this.directions = uniqueDirections(this.programs);
      this.maxHours = Math.max(...this.programs.map((program) => Number(program.hours || 0)), 1);
      this.render();
      return this;
    } catch (error) {
      this.found.textContent = "Не удалось загрузить каталог программ.";
      this.element.dispatchEvent(
        new CustomEvent("program-catalog-error", { bubbles: true, detail: error })
      );
      throw error;
    }
  }

  matches(program, skip = "") {
    if (skip !== "type" && this.state.type !== "all" && program.programType !== this.state.type) {
      return false;
    }
    if (
      skip !== "direction" &&
      this.state.direction !== "all" &&
      program.browseDirectionSlug !== this.state.direction
    ) {
      return false;
    }
    if (skip !== "hours" && this.state.hours.size) {
      const hours = Number(program.hours || 0);
      if (
        ![...this.state.hours].some((id) => {
          const range = findRange(id);
          return range && hours >= range.min && hours <= range.max;
        })
      ) {
        return false;
      }
    }
    if (skip !== "education" && this.state.education.size) {
      const levels = program.educationLevels || [];
      if (![...this.state.education].some((level) => levels.includes(level))) return false;
    }
    return !this.state.q || normalize(program.title).includes(this.state.q);
  }

  #sortPrograms(programs) {
    const byAlpha = (a, b) =>
      alphaSortKey(a.title).localeCompare(alphaSortKey(b.title), "ru") ||
      String(a.slug).localeCompare(String(b.slug), "ru");
    const sorts = {
      alpha: byAlpha,
      "hours-asc": (a, b) => Number(a.hours || 0) - Number(b.hours || 0) || byAlpha(a, b),
      "hours-desc": (a, b) => Number(b.hours || 0) - Number(a.hours || 0) || byAlpha(a, b),
    };
    return [...programs].sort(sorts[this.state.sort] || byAlpha);
  }

  render() {
    this.filtered = this.#sortPrograms(this.programs.filter((program) => this.matches(program)));
    const visible = this.filtered.slice(0, this.state.limit);
    this.rows.replaceChildren(
      ...visible.map((program) =>
        createProgramCard(program, {
          maxHours: this.maxHours,
          className: this.classNames.card,
          style: this.styles.card,
          linkBuilder: this.linkBuilder,
          actionLabel: this.labels.cardAction,
        })
      )
    );
    this.rows.hidden = this.filtered.length === 0;
    this.empty.hidden = this.filtered.length !== 0;
    this.found.textContent = this.filtered.length
      ? `${this.filtered.length} ${plural(
          this.filtered.length,
          "программа",
          "программы",
          "программ"
        )}${this.filtered.length > visible.length ? ` · показано ${visible.length}` : ""}`
      : "Ничего не найдено";

    const rest = this.filtered.length - visible.length;
    this.more.hidden = rest <= 0;
    if (rest > 0) this.more.textContent = `Показать ещё ${Math.min(rest, this.pageSize)} из ${rest}`;
    this.#renderChips();
    this.filters.update({
      state: this.state,
      programs: this.programs,
      directions: this.directions,
      matches: (program, skip) => this.matches(program, skip),
    });
    this.#updateUrl();
    this.onStateChange?.(this.getState());
  }

  #renderChips() {
    const active = [];
    if (this.state.q) active.push(["q", `«${this.state.q}»`]);
    if (this.state.type !== "all" && !this.lockedType) {
      active.push(["type", PROGRAM_TYPES[this.state.type]?.label || this.state.type]);
    }
    if (this.state.direction !== "all") {
      active.push([
        "direction",
        this.directions.find((item) => item.slug === this.state.direction)?.title ||
          this.state.direction,
      ]);
    }
    this.state.hours.forEach((id) => active.push([`hours:${id}`, findRange(id)?.label || id]));
    this.state.education.forEach((id) => {
      active.push([
        `education:${id}`,
        EDUCATION_BASES.find((item) => item.id === id)?.label || id,
      ]);
    });
    const buttons = active.map(([key, label]) => {
      const button = createElement("button", "", { type: "button", text: label });
      button.dataset.clear = key;
      return button;
    });
    if (active.length > 1) {
      const reset = createElement("button", "reset", {
        type: "button",
        text: "Сбросить всё",
      });
      reset.dataset.clear = "all";
      buttons.push(reset);
    }
    this.chips.replaceChildren(...buttons);
    const count =
      Number(this.state.type !== "all" && !this.lockedType) +
      Number(this.state.direction !== "all") +
      this.state.hours.size +
      this.state.education.size +
      Number(Boolean(this.state.q));
    this.badge.hidden = count === 0;
    this.badge.textContent = count;
  }

  #applyFilterChange({ group, value, checked }) {
    if (group === "type") this.state.type = value;
    if (group === "direction") {
      this.state.direction = this.state.direction === value && value !== "all" ? "all" : value;
    }
    if (group === "hours" || group === "education") {
      checked ? this.state[group].add(value) : this.state[group].delete(value);
    }
    this.state.limit = this.pageSize;
    this.render();
  }

  setSearch(value) {
    this.state.q = normalize(value);
    this.state.limit = this.pageSize;
    this.render();
  }

  clearFilter(key) {
    if (key === "all") return this.reset();
    if (key === "q") {
      this.state.q = "";
      this.search.setValue("");
    } else if (key === "type" && !this.lockedType) {
      this.state.type = "all";
    } else if (key === "direction") {
      this.state.direction = "all";
    } else if (key.startsWith("hours:")) {
      this.state.hours.delete(key.slice(6));
    } else if (key.startsWith("education:")) {
      this.state.education.delete(key.slice(10));
    }
    this.state.limit = this.pageSize;
    this.render();
  }

  reset() {
    this.state.q = "";
    this.state.type = this.lockedType || "all";
    this.state.direction = "all";
    this.state.hours.clear();
    this.state.education.clear();
    this.state.sort = "alpha";
    this.state.limit = this.pageSize;
    this.search.setValue("");
    this.filters.setDirectionQuery("");
    this.sort.value = "alpha";
    this.render();
  }

  getState() {
    return {
      ...this.state,
      hours: [...this.state.hours],
      education: [...this.state.education],
      total: this.filtered.length,
    };
  }

  #readUrl() {
    if (!this.syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    const type = params.get("vid");
    if (!this.lockedType && PROGRAM_TYPES[type]) this.state.type = type;
    this.state.direction = params.get("napravlenie") || "all";
    params
      .get("obem")
      ?.split(",")
      .filter((id) => findRange(id))
      .forEach((id) => this.state.hours.add(id));
    params
      .get("baza")
      ?.split(",")
      .filter((id) => EDUCATION_BASES.some((base) => base.id === id))
      .forEach((id) => this.state.education.add(id));
    this.state.q = normalize(params.get("q"));
    const sort = params.get("sort");
    if (["alpha", "hours-asc", "hours-desc"].includes(sort)) this.state.sort = sort;
    this.search.setValue(params.get("q") || "");
    this.sort.value = this.state.sort;
  }

  #updateUrl() {
    if (!this.syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    ["vid", "napravlenie", "obem", "baza", "q", "sort"].forEach((key) => params.delete(key));
    if (this.state.type !== "all" && !this.lockedType) params.set("vid", this.state.type);
    if (this.state.direction !== "all") params.set("napravlenie", this.state.direction);
    if (this.state.hours.size) params.set("obem", [...this.state.hours].join(","));
    if (this.state.education.size) params.set("baza", [...this.state.education].join(","));
    if (this.state.q) params.set("q", this.state.q);
    if (this.state.sort !== "alpha") params.set("sort", this.state.sort);
    const query = params.toString();
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  }

  #openFilters(open) {
    this.filters.element.classList.toggle("is-open", open);
    this.scrim.hidden = !open;
    document.body.classList.toggle("program-catalog-lock", open);
  }

  destroy() {
    this.search.destroy();
    this.filters.destroy();
    this.sort.removeEventListener("change", this.handleSort);
    this.chips.removeEventListener("click", this.handleChips);
    document.removeEventListener("keydown", this.handleKeydown);
    document.body.classList.remove("program-catalog-lock");
    this.element.remove();
  }
}

export function mountProgramCatalog(props) {
  return new ProgramCatalog(props);
}
