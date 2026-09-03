import { mountProgramCatalog } from "./index.js";

const root = document.querySelector("#programs-root");
const type = document.body.dataset.programType || null;
const titles = {
  "professional-retraining": "Профессиональная переподготовка",
  "advanced-training": "Повышение квалификации",
};

const catalog = mountProgramCatalog({
  root,
  lockedType: type,
  title: titles[type] || "Программы ПП и ПК",
  dataUrls: type
    ? [
        type === "professional-retraining"
          ? "./data/professional-retraining.json"
          : "./data/advanced-training.json",
      ]
    : undefined,
  onConsult: (state) => {
    root.dispatchEvent(
      new CustomEvent("demo-consult", { bubbles: true, detail: state })
    );
  },
});

catalog.ready.catch((error) => console.error("[program-catalog]", error));
