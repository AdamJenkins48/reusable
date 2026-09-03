"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type {
  Review,
  ReviewsColors,
  ReviewsData,
  ReviewsSectionProps,
} from "./types";
import { yandexReviews } from "./yandexReviews";
import styles from "./ReviewsSection.module.css";

const monthNames = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

type ReviewsStyle = CSSProperties & Record<`--reviews-${string}`, string>;

function getColorVariables(colors: ReviewsColors): ReviewsStyle {
  return {
    "--reviews-accent": colors.accent,
    "--reviews-accent-hover": colors.accentHover,
    "--reviews-text": colors.text,
    "--reviews-body-text": colors.bodyText,
    "--reviews-muted-text": colors.mutedText,
    "--reviews-border": colors.border,
    "--reviews-background": colors.background,
    "--reviews-surface": colors.surface,
    "--reviews-on-accent": colors.onAccent,
    "--reviews-empty-star": colors.emptyStar,
    "--reviews-overlay": colors.overlay,
  };
}

function shuffleReviews(items: readonly Review[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${monthNames[month - 1] ?? ""} ${year}`;
}

function getInitial(name: string) {
  return name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().charAt(0).toUpperCase() || "★";
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

function Stars({ rating, large = false }: { rating: number; large?: boolean }) {
  return (
    <span
      className={`${styles.stars} ${large ? styles.starsLarge : ""}`}
      role="img"
      aria-label={`Оценка ${rating} из 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} className={star > rating ? styles.emptyStar : undefined}>
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </Icon>
      ))}
    </span>
  );
}

function Avatar({ review, avatarTemplate }: { review: Review; avatarTemplate: string }) {
  const avatarUrl = review.a ? avatarTemplate.replace("{id}", review.a) : undefined;

  return (
    <span className={styles.avatar} aria-hidden="true">
      {getInitial(review.n)}
      {avatarUrl ? <span className={styles.avatarImage} style={{ backgroundImage: `url("${avatarUrl}")` }} /> : null}
    </span>
  );
}

function ReviewDetails({ review, data }: { review: Review; data: ReviewsData }) {
  const source = data.sources[review.s];

  return (
    <>
      <div className={styles.cardHead}>
        <Avatar review={review} avatarTemplate={data.avatarTemplate} />
        <div className={styles.author}>
          <p className={styles.name}>{review.n}</p>
          <Stars rating={review.r} />
        </div>
      </div>
      <p className={styles.date}>
        {formatDate(review.d)}{source?.city ? ` • ${source.city}` : ""}
      </p>
    </>
  );
}

function ReviewCard({
  review,
  data,
  onOpen,
}: {
  review: Review;
  data: ReviewsData;
  onOpen: (review: Review) => void;
}) {
  return (
    <article className={styles.card}>
      <ReviewDetails review={review} data={data} />
      <p className={styles.text}>{review.t}</p>
      <button type="button" className={styles.moreButton} onClick={() => onOpen(review)}>
        Читать полностью
      </button>
    </article>
  );
}

function ReviewModal({
  review,
  data,
  onClose,
}: {
  review: Review | null;
  data: ReviewsData;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (review && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!review && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [review]);

  useEffect(() => {
    if (!review) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [review]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-modal="true"
      aria-label="Полный текст отзыва"
      onMouseDown={handleBackdropClick}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={() => { if (review) onClose(); }}
    >
      <div className={styles.modalBox} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Закрыть">
          <Icon><path d="m19 6.4-1.4-1.4-5.6 5.6L6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" /></Icon>
        </button>
        {review ? (
          <div className={styles.modalContent}>
            <ReviewDetails review={review} data={data} />
            <p className={styles.modalText}>{review.t}</p>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function getPageSize() {
  if (window.matchMedia("(min-width: 1101px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 2;
  return 1;
}

export function ReviewsSection({
  colors,
  data = yandexReviews,
  title = "Более 280 положительных отзывов клиентов",
  subtitle = "Оценки выпускников на основе отзывов в Яндекс Картах",
  mapSource,
  shuffle = true,
  className = "",
}: ReviewsSectionProps) {
  const titleId = useId();
  const [reviews, setReviews] = useState<Review[]>(() => [...data.items]);
  const [pageSize, setPageSize] = useState(1);
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const pointerStart = useRef<number | null>(null);

  useEffect(() => {
    const updatePageSize = () => setPageSize(getPageSize());
    const initialFrame = window.requestAnimationFrame(() => {
      setReviews(shuffle ? shuffleReviews(data.items) : [...data.items]);
      updatePageSize();
    });
    window.addEventListener("resize", updatePageSize);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("resize", updatePageSize);
    };
  }, [data, shuffle]);

  const pageCount = Math.ceil(reviews.length / pageSize);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const visibleReviews = useMemo(
    () => reviews.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [pageSize, reviews, safePage],
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.max(0, Math.min(nextPage, pageCount - 1)));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 45) return;
    goToPage(safePage + (distance < 0 ? 1 : -1));
  };

  const sources = Object.values(data.sources);
  const votes = sources.reduce((total, source) => total + source.votes, 0);
  const weightedRating = sources.reduce((total, source) => total + source.rating * source.votes, 0);
  const rating = votes ? weightedRating / votes : 0;
  const sourceLink = (mapSource ? data.sources[mapSource] : undefined) ?? sources[0];
  const firstVisible = reviews.length ? safePage * pageSize + 1 : 0;
  const lastVisible = Math.min(firstVisible + pageSize - 1, reviews.length);

  return (
    <section
      className={`${styles.section} ${className}`.trim()}
      style={getColorVariables(colors)}
      aria-labelledby={titleId}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>

          <div className={styles.summary}>
            <div className={styles.score}>
              <strong className={styles.scoreValue}>{rating.toFixed(1)}</strong>
              <span className={styles.scoreMeta}>
                <Stars rating={Math.round(rating)} large />
                <span className={styles.scoreCaption}>{votes} оценок</span>
              </span>
            </div>
            {sourceLink?.url ? (
              <a className={styles.mapLink} href={sourceLink.url} target="_blank" rel="noopener nofollow">
                <Icon className={styles.pinIcon}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                </Icon>
                Смотреть на Яндекс Картах
              </a>
            ) : null}
          </div>
        </div>

        {reviews.length ? (
          <div
            className={styles.carousel}
            role="region"
            aria-roledescription="карусель"
            aria-label="Отзывы клиентов"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") goToPage(safePage - 1);
              if (event.key === "ArrowRight") goToPage(safePage + 1);
            }}
          >
            <div
              className={styles.viewport}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => { pointerStart.current = null; }}
            >
              <div className={styles.cards}>
                {visibleReviews.map((review) => (
                  <ReviewCard
                    key={`${review.s}-${review.n}-${review.d}`}
                    review={review}
                    data={data}
                    onOpen={setSelectedReview}
                  />
                ))}
              </div>
            </div>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 0}
                aria-label="Предыдущие отзывы"
              >
                <Icon><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z" /></Icon>
              </button>
              <span className={styles.counter} aria-live="polite">
                {pageSize > 1 ? `${firstVisible}–${lastVisible}` : firstVisible} из {reviews.length}
              </span>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= pageCount - 1}
                aria-label="Следующие отзывы"
              >
                <Icon><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z" /></Icon>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ReviewModal review={selectedReview} data={data} onClose={() => setSelectedReview(null)} />
    </section>
  );
}
