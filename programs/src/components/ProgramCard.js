import { applyStyle, createElement, plural } from "../utils.js";

export const PROGRAM_TYPES = {
  "professional-retraining": {
    label: "Переподготовка",
    tag: "Переподготовка",
    document: "Диплом",
    rowClass: "pp",
  },
  "advanced-training": {
    label: "Повышение квалификации",
    tag: "Повышение квалификации",
    document: "Удостоверение",
    rowClass: "pk",
  },
};

function educationLabel(program) {
  const levels = program.educationLevels || [];
  const hasSecondary = levels.includes("secondary-vocational");
  const hasHigher = levels.includes("higher");
  if (hasSecondary && hasHigher) return "СПО или высшее";
  if (hasHigher) return "нужно высшее";
  if (hasSecondary) return "достаточно СПО";
  return "уточните требования";
}

function typePresentation(program) {
  return (
    PROGRAM_TYPES[program.programType] || {
      label: program.programTypeLabel || "Вид обучения",
      tag: program.programTypeLabel || "Вид обучения",
      document: "Документ уточняется",
      rowClass: "",
    }
  );
}

export function createProgramCard(
  program,
  {
    maxHours = 0,
    className = "",
    style,
    linkBuilder = (item) => item.route || "#",
    actionLabel = "Программа и план",
  } = {}
) {
  const type = typePresentation(program);
  const hours = Number(program.hours || 0);
  const duration = Math.max(1, Math.round(hours / 40));
  const width = maxHours ? Math.max(2, Math.round((hours / maxHours) * 100)) : 0;
  const href = linkBuilder(program);
  const direction = program.browseDirectionTitle || program.direction || "";

  const card = createElement(
    "li",
    `program-card ${type.rowClass} ${className}`.trim()
  );
  applyStyle(card, style);

  const name = createElement("div", "program-card__name");
  name.append(createElement("a", "", { href, text: program.title }));
  const tags = createElement("div", "program-card__tags");
  tags.append(
    createElement("span", "program-card__tag program-card__tag--type", {
      text: type.tag,
    }),
    createElement("span", "program-card__tag", { text: direction })
  );
  name.append(tags);

  const hoursBlock = createElement("div", "program-card__hours");
  const bar = createElement("div", "program-card__hours-bar", {
    role: "img",
    "aria-label": `Объём ${hours} академических часов`,
  });
  const fill = createElement("i");
  fill.style.width = `${width}%`;
  bar.append(fill);
  hoursBlock.append(
    createElement("strong", "", { text: `${hours} ч.` }),
    bar,
    createElement("small", "", {
      text: `≈ ${duration} ${plural(duration, "неделя", "недели", "недель")}`,
    })
  );

  const documentBlock = createElement("div", "program-card__document");
  documentBlock.append(
    createElement("strong", "", {
      text: program.documentType || type.document,
    }),
    createElement("span", "", { text: educationLabel(program) })
  );

  const action = createElement("div", "program-card__action");
  action.append(createElement("a", "", { href, text: actionLabel }));
  card.append(name, hoursBlock, documentBlock, action);
  return card;
}

export class ProgramCard {
  constructor(program, props = {}) {
    this.element = createProgramCard(program, props);
  }
}
