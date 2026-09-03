import { applyStyle, createElement } from "../utils.js";

const SEARCH_ICON = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="1.8"/>
    <path d="m16.2 16.2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;

export class ProgramSearch {
  constructor({
    id = "program-query",
    value = "",
    placeholder = "Профессия или тема: бухгалтер, психология, охрана труда",
    label = "Поиск программы",
    buttonLabel = "Найти",
    className = "",
    style,
    onChange = () => {},
    onSubmit = () => {},
  } = {}) {
    this.onChange = onChange;
    this.onSubmit = onSubmit;
    this.element = createElement(
      "form",
      `program-catalog__search ${className}`.trim(),
      { role: "search" }
    );
    applyStyle(this.element, style);
    this.element.insertAdjacentHTML("beforeend", SEARCH_ICON);

    const hiddenLabel = createElement("label", "program-catalog__visually-hidden", {
      htmlFor: id,
      text: label,
    });
    this.input = createElement("input", "", {
      id,
      type: "search",
      autocomplete: "off",
      placeholder,
      value,
    });
    const button = createElement("button", "", {
      type: "submit",
      text: buttonLabel,
    });
    this.element.append(hiddenLabel, this.input, button);

    this.handleInput = () => this.onChange(this.input.value);
    this.handleSubmit = (event) => {
      event.preventDefault();
      this.onSubmit(this.input.value);
    };
    this.input.addEventListener("input", this.handleInput);
    this.element.addEventListener("submit", this.handleSubmit);
  }

  setValue(value) {
    this.input.value = value || "";
  }

  destroy() {
    this.input.removeEventListener("input", this.handleInput);
    this.element.removeEventListener("submit", this.handleSubmit);
  }
}
