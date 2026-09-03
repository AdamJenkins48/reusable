export interface ReviewSource {
  title: string;
  city: string;
  rating: number;
  votes: number;
  url: string;
}

export interface Review {
  s: string;
  n: string;
  l: number;
  d: string;
  r: number;
  a: string;
  t: string;
}

export interface ReviewsData {
  avatarTemplate: string;
  sources: Record<string, ReviewSource>;
  items: readonly Review[];
}

/**
 * All visual colors are supplied by the host application. CSS color formats and
 * CSS custom properties such as `var(--brand)` are both supported.
 */
export interface ReviewsColors {
  accent: string;
  accentHover: string;
  text: string;
  bodyText: string;
  mutedText: string;
  border: string;
  background: string;
  surface: string;
  onAccent: string;
  emptyStar: string;
  overlay: string;
}

export interface ReviewsSectionProps {
  /** Required palette owned by the host application. */
  colors: ReviewsColors;
  /** Defaults to the bundled Yandex reviews export. */
  data?: ReviewsData;
  title?: string;
  subtitle?: string;
  /** Source key whose URL is used by the Yandex Maps link. */
  mapSource?: string;
  /** Randomize reviews on mount. Defaults to true. */
  shuffle?: boolean;
  className?: string;
}
