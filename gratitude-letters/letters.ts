import type { GratitudeLetterItem } from "./types";

export const defaultGratitudeLetters: readonly GratitudeLetterItem[] = [
  {
    id: "serafim",
    organization: "АНО «Детский православный приют «Серафим»",
    excerpt:
      "Приют подтверждает партнерство с ООО «Научно-инновационный институт профессиональной переподготовки и повышения квалификации» и поддержку его деятельности ежемесячными пожертвованиями.",
    date: "11.03.2025",
    dateTime: "2025-03-11",
    image: new URL("./assets/gratitude-letter-serafim.webp", import.meta.url).href,
    width: 725,
    height: 1024,
  },
  {
    id: "medis",
    organization: "ООО «Клиника «МЭДИС»",
    excerpt:
      "Выражаем Вам искреннюю благодарность и признательность за профессионализм и высокий уровень организации обучения сотрудников нашей компании.",
    date: "02.09.2026",
    dateTime: "2026-09-02",
    image: new URL("./assets/gratitude-letter-medis.webp", import.meta.url).href,
    width: 723,
    height: 1024,
  },
  {
    id: "cni",
    organization: "ООО «ЦНИ»",
    excerpt:
      "Выражаем искреннюю благодарность за профессионализм, ответственное отношение к работе и высокий уровень организации образовательного процесса.",
    date: "02.09.2026",
    dateTime: "2026-09-02",
    image: new URL("./assets/gratitude-letter-cni.webp", import.meta.url).href,
    width: 723,
    height: 1024,
  },
  {
    id: "vblagodarnost",
    organization: "Благотворительный фонд «ВБлагодарность»",
    excerpt:
      "Фонд подтверждает, что ООО «Научно-инновационный институт профессиональной переподготовки и повышения квалификации» является партнером Фонда и поддерживает его деятельность ежемесячными пожертвованиями.",
    date: "25.10.2024",
    dateTime: "2024-10-25",
    image: new URL("./assets/gratitude-letter-vblagodarnost.webp", import.meta.url).href,
    width: 879,
    height: 1280,
  },
];
