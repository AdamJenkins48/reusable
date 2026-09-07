"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { defaultGratitudeLetters } from "./letters";
import styles from "./GratitudeLetters.module.css";
import type { GratitudeLetterItem, GratitudeLettersProps } from "./types";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function GratitudeLetters({
  letters = defaultGratitudeLetters,
  title = "Благодарственные письма",
  className,
  style,
}: GratitudeLettersProps) {
  const titleId = useId();
  const dialogTitleId = useId();
  const [activeLetter, setActiveLetter] = useState<GratitudeLetterItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const closeLetter = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeLetter) {
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [activeLetter]);

  useEffect(() => {
    if (!activeLetter) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeLetter]);

  if (letters.length === 0) return null;

  return (
    <section
      aria-labelledby={titleId}
      className={joinClassNames(styles.section, className)}
      style={style}
    >
      <div className={styles.inner}>
        <h2 id={titleId} className={styles.title}>{title}</h2>

        <ul className={styles.list}>
          {letters.map((letter) => (
            <li key={letter.id} className={styles.item}>
              <button
                ref={(node) => {
                  triggerRefs.current[letter.id] = node;
                }}
                type="button"
                className={styles.previewButton}
                aria-haspopup="dialog"
                aria-expanded={activeLetter?.id === letter.id}
                aria-label={`Открыть благодарственное письмо ${letter.organization}`}
                onClick={() => setActiveLetter(letter)}
              >
                <img
                  src={letter.image}
                  alt=""
                  width={letter.width}
                  height={letter.height}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </button>
              <h3 className={styles.organization}>{letter.organization}</h3>
              <p className={styles.excerpt}>{letter.excerpt}</p>
              <time className={styles.date} dateTime={letter.dateTime}>{letter.date}</time>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.overlay}
        aria-labelledby={dialogTitleId}
        onClose={() => {
          const closedId = activeLetter?.id;
          setActiveLetter(null);
          if (closedId) {
            window.requestAnimationFrame(() => triggerRefs.current[closedId]?.focus());
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLetter();
        }}
      >
        {activeLetter && (
          <>
            <h2 id={dialogTitleId} className={styles.visuallyHidden}>
              Благодарственное письмо {activeLetter.organization}
            </h2>
            <button
              type="button"
              className={styles.expandedDocument}
              aria-label="Закрыть благодарственное письмо"
              onClick={closeLetter}
            >
              <img
                src={activeLetter.image}
                alt={`Скан благодарственного письма ${activeLetter.organization}`}
                width={activeLetter.width}
                height={activeLetter.height}
                className={styles.expandedImage}
              />
              <span className={styles.closeBadge} aria-hidden="true">×</span>
            </button>
            <p className={styles.closeHint}>Нажмите на изображение или Esc, чтобы закрыть</p>
          </>
        )}
      </dialog>
    </section>
  );
}
