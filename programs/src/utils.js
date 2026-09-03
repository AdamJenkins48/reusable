export function createElement(tag, className = "", attributes = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  Object.entries(attributes).forEach(([name, value]) => {
    if (value == null || value === false) return;
    if (name === "text") {
      element.textContent = String(value);
    } else if (name === "html") {
      element.innerHTML = String(value);
    } else if (name in element && name !== "style") {
      element[name] = value;
    } else {
      element.setAttribute(name, value === true ? "" : String(value));
    }
  });
  return element;
}

export function applyStyle(element, style) {
  if (!element || !style) return;
  if (typeof style === "string") {
    element.style.cssText += style;
    return;
  }
  Object.entries(style).forEach(([property, value]) => {
    if (value == null) return;
    if (property.startsWith("--") || property.includes("-")) {
      element.style.setProperty(property, String(value));
    } else {
      element.style[property] = value;
    }
  });
}

export function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

export function alphaSortKey(title) {
  const cleaned = String(title || "")
    .replace(/^[«»"„‟‹›'\s]+/u, "")
    .replace(/ё/g, "е")
    .trim();
  const lower = cleaned.toLocaleLowerCase("ru");
  return `${/^[a-zа-я]/iu.test(lower) ? "0" : "1"}\0${lower}`;
}

export function plural(number, one, few, many) {
  const mod10 = number % 10;
  const mod100 = number % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function toCssVariableName(key) {
  if (key.startsWith("--")) return key;
  return `--catalog-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}
