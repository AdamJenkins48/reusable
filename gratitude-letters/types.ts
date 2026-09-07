import type { CSSProperties } from "react";

export interface GratitudeLetterItem {
  id: string;
  organization: string;
  excerpt: string;
  date: string;
  dateTime: string;
  image: string;
  width: number;
  height: number;
}

export interface GratitudeLettersProps {
  letters?: readonly GratitudeLetterItem[];
  title?: string;
  className?: string;
  style?: CSSProperties;
}
