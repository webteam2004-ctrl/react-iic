import { useEffect, useState } from "react";
import styles from "./Events.module.css";

const classNames = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const categories = [
  "All Events",
  "Hackathons",
  "Ideathons",
  "Technical Events",
];

const events = [
  {
    id: "h1",
    category: "Hackathons",
    title: "SIH 2024",
    image: "/events/hackathons/sih2024.jpeg",
    date: "2024",
    displayDate: "2024",
  },
  {
    id: "h2",
    category: "Hackathons",
    title: "SIH 2025",
    image: "/events/hackathons/sih2025.jpeg",
    date: "2025",
    displayDate: "2025",
  },
  {
    id: "i4",
    category: "Ideathons",
    title: "Inter-Institutional Startup Competition",
    image: "/events/ideathons/iiscideathon.jpeg",
    date: "2023",
    displayDate: "2023",
  },
  {
    id: "i5",
    category: "Ideathons",
    title: "Innovate It",
    image: "/events/ideathons/innovateit_ideathon.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t1",
    category: "Technical Events",
    title: "Invention Through Innovation",
    image: "/events/technicalevents/te1.jpeg",
    date: "2023",
    displayDate: "2023",
  },
  {
    id: "t2",
    category: "Technical Events",
    title: "Innovation Experience",
    image: "/events/technicalevents/te2.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t3",
    category: "Technical Events",
    title: "Innovation Intramurals",
    image: "/events/technicalevents/te3.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t4",
    category: "Technical Events",
    title: "Mind Mashrims",
    image: "/events/technicalevents/te4.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t5",
    category: "Technical Events",
    title: "Stock Wars",
    image: "/events/technicalevents/te5.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t6",
    category: "Technical Events",
    title: "Innovation Hunt",
    image: "/events/technicalevents/te6.jpeg",
    date: "2022",
    displayDate: "2022",
  },
  {
    id: "t7",
    category: "Technical Events",
    title: "Recall Masters",
    image: "/events/technicalevents/te7.jpeg",
    date: "2023",
    displayDate: "2023",
  },
  {
    id: "t8",
    category: "Technical Events",
    title: "Memory Wizards",
    image: "/events/technicalevents/te8.jpeg",
    date: "2023",
    displayDate: "2023",
  },
  {
    id: "t9",
    category: "Technical Events",
    title: "Techmania",
    image: "/events/technicalevents/te9.jpeg",
    date: "2023",
    displayDate: "2023",
  },
];

const accentNames = ["rose", "blue", "amber"];
const eventsPerRow = 3;

const getEventTimestamp = ({ date, displayDate }) => {
  const timestamp = Date.parse(String(date ?? displayDate ?? ""));
  return Number.isNaN(timestamp) ? null : timestamp;
};

const syncPosterRibbonWidth = (posterFrame) => {
  const image = posterFrame.querySelector("img");
  const ribbon = posterFrame.nextElementSibling;

  if (!(ribbon instanceof HTMLElement)) return;

  if (!image || image.style.display === "none" || !image.naturalWidth) {
    ribbon.style.width = "calc(100% + 80px)";
    return;
  }

  const { width, height } = posterFrame.getBoundingClientRect();

  const imageWidth = Math.min(
    width,
    height * (image.naturalWidth / image.naturalHeight),
  );

  ribbon.style.width = `${imageWidth + 80}px`;
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function RowTurnArrow({ reverse, colorIndex, height = 560 }) {
  return (
    <svg
      className={classNames(
        "row-turn",
        `turn-${colorIndex}`,
        reverse && "reverse",
      )}
      style={{ height: `${height}px` }}
      viewBox="0 0 140 580"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g
        transform={
          reverse ? "translate(140 0) scale(-1 1)" : undefined
        }
      >
        <path
          className={styles["turn-path"]}
          pathLength="1"
          d="M4 8h63c33 0 53 17 53 49v454c0 32-20 49-53 49H14"
        />

        <path
          className={styles["turn-tip"]}
          pathLength="1"
          d="m29 544-17 16 17 16"
        />
      </g>
    </svg>
  );
}

function EventConnector({ reverse }) {
  return (
    <svg viewBox="0 0 112 150" aria-hidden="true">
      <g
        transform={
          reverse ? "translate(112 0) scale(-1 1)" : undefined
        }
      >
        <path
          className={styles["connector-path"]}
          pathLength="1"
          d="M3 131h31c14 0 22-7 26-20l17-66c3-12 10-18 22-18h8"
        />

        <path
          className={styles["connector-tip"]}
          pathLength="1"
          d="m92 12 16 15-18 14"
        />
      </g>
    </svg>
  );
}

export default function Events() {
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [typedTitle, setTypedTitle] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);

  const typedHeadline = "Dream it. Challenge it. Make it happen.";
  const breakIndex = "Dream it. Challenge it.".length;

  useEffect(() => {
    if (typingFinished) return undefined;

    if (typedTitle.length >= typedHeadline.length) {
      setTypingFinished(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTypedTitle(typedHeadline.slice(0, typedTitle.length + 1));
    }, 32);

    return () => window.clearTimeout(timer);
  }, [typedHeadline, typedTitle, typingFinished]);

  const filteredEvents = events
    .filter(
      (event) =>
        activeFilter === "All Events" ||
        event.category === activeFilter,
    )
    .sort((a, b) => {
      const timestampA = getEventTimestamp(a);
      const timestampB = getEventTimestamp(b);

      if (timestampA === null) {
        return timestampB === null ? 0 : 1;
      }

      if (timestampB === null) return -1;

      return timestampB - timestampA;
    });

  const timelineRows = Array.from(
    {
      length: Math.ceil(filteredEvents.length / eventsPerRow),
    },
    (_, index) =>
      filteredEvents.slice(
        index * eventsPerRow,
        index * eventsPerRow + eventsPerRow,
      ),
  );

  useEffect(() => {
    const rows = document.querySelectorAll("[data-timeline-row]");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      rows.forEach((row) => {
        row.classList.add(styles["is-visible"]);
      });

      return undefined;
    }

    rows.forEach((row) => {
      row.classList.add(styles["motion-ready"]);
    });

    void rows[0]?.offsetWidth;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(styles["is-visible"]);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -28% 0px",
      },
    );

    rows.forEach((row) => observer.observe(row));

    return () => observer.disconnect();
  }, [activeFilter]);

  useEffect(() => {
    const posterFrames = document.querySelectorAll(
      `.${styles["poster-frame"]}`,
    );

    const observers = [];

    posterFrames.forEach((posterFrame) => {
      const image = posterFrame.querySelector("img");
      const syncWidth = () => syncPosterRibbonWidth(posterFrame);
      const observer = new ResizeObserver(syncWidth);

      observer.observe(posterFrame);
      image?.addEventListener("load", syncWidth);
      image?.addEventListener("error", syncWidth);

      syncWidth();

      observers.push({
        observer,
        image,
        syncWidth,
      });
    });

    return () => {
      observers.forEach(({ observer, image, syncWidth }) => {
        observer.disconnect();
        image?.removeEventListener("load", syncWidth);
        image?.removeEventListener("error", syncWidth);
      });
    };
  }, [activeFilter]);

  return (
    <main className={styles["events-page"]}>
      <header className={styles["events-hero"]}>
        <div className={styles["hero-top"]}>
          <p className={styles["eyebrow"]}>
            IIC VVITU · THINK BEYOND LIMITS
          </p>
        </div>

        <div className={styles["hero-layout"]}>
          <h1>
            <span>
              {typedTitle.length <= breakIndex
                ? typedTitle
                : typedTitle.slice(0, breakIndex)}
            </span>

            {typedTitle.length > breakIndex && (
              <>
                <br />

                <span>
                  {typedTitle.slice(breakIndex).trimStart()}
                </span>
              </>
            )}

            {!typingFinished && (
              <span
                className={styles["heading-cursor"]}
                aria-hidden="true"
              />
            )}
          </h1>

          <p className={styles["hero-copy"]}>
            From exciting competitions to hands-on workshops,
            discover opportunities that transform{" "}
            <br className={styles["hero-copy-break"]} />
            curiosity into confidence and ideas into impact.
          </p>
        </div>
      </header>

      <section
        className={styles["past-section"]}
        aria-labelledby="past-title"
      >
        <div className={styles["section-heading"]}>
          <div>
            <p className={styles["section-kicker"]}>
              Our journey
            </p>

            <h2 id="past-title">Past events</h2>
          </div>

          <span className={styles["heading-rule"]} />
        </div>

        <div
          className={styles["filters"]}
          aria-label="Filter events"
        >
          {categories.map((category) => (
            <button
              key={category}
              className={classNames(
                "filter",
                activeFilter === category && "active",
              )}
              type="button"
              aria-pressed={activeFilter === category}
              onClick={() => setActiveFilter(category)}
              onPointerMove={(event) => {
                const bounds =
                  event.currentTarget.getBoundingClientRect();

                const x =
                  (event.clientX - bounds.left) / bounds.width -
                  0.5;

                const y =
                  (event.clientY - bounds.top) / bounds.height -
                  0.5;

                event.currentTarget.style.setProperty(
                  "--move-x",
                  `${x * 5}px`,
                );

                event.currentTarget.style.setProperty(
                  "--move-y",
                  `${y * 4}px`,
                );

                event.currentTarget.style.setProperty(
                  "--tilt",
                  `${x * 2.5}deg`,
                );

                event.currentTarget.style.backgroundColor =
                  x < -0.12
                    ? "#fff1f4"
                    : x > 0.12
                      ? "#edf7ff"
                      : "#fff9e9";
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty(
                  "--move-x",
                );

                event.currentTarget.style.removeProperty(
                  "--move-y",
                );

                event.currentTarget.style.removeProperty(
                  "--tilt",
                );

                event.currentTarget.style.removeProperty(
                  "background-color",
                );
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles["timeline-board"]}>
          {timelineRows.map((row, rowIndex) => {
            const isReverse = rowIndex % 2 === 1;

            return (
              <div
                className={classNames(
                  "timeline-row",
                  isReverse && "reverse",
                )}
                key={`${activeFilter}-row-${rowIndex}`}
                data-timeline-row
              >
                {row.map((event, eventIndex) => {
                  const index =
                    rowIndex * eventsPerRow + eventIndex;

                  const accent =
                    accentNames[index % accentNames.length];

                  return (
                    <div
                      className={classNames(
                        "timeline-step",
                        index === filteredEvents.length - 1 &&
                          "final-step",
                      )}
                      key={event.id}
                    >
                      <article
                        className={classNames(
                          "event-card",
                          accent,
                        )}
                      >
                        <span
                          className={styles["card-trace"]}
                          aria-hidden="true"
                        />

                        <span
                          className={styles["event-number"]}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div
                          className={styles["poster-frame"]}
                        >
                          <div
                            className={
                              styles["poster-fallback"]
                            }
                          >
                            <span>{event.category}</span>
                            <strong>{event.title}</strong>
                          </div>

                          <img
                            src={event.image}
                            alt={event.title}
                            loading="lazy"
                            onError={(error) => {
                              error.currentTarget.style.display =
                                "none";
                            }}
                          />
                        </div>

                        <div
                          className={styles["date-ribbon"]}
                        >
                          <CalendarIcon />
                          <span>{event.displayDate}</span>
                        </div>

                      </article>

                      {eventIndex < row.length - 1 && (
                        <span
                          className={classNames(
                            "event-connector",
                            `connector-${index % 3}`,
                          )}
                          aria-hidden="true"
                        >
                          <EventConnector
                            reverse={isReverse}
                          />
                        </span>
                      )}
                    </div>
                  );
                })}

                {rowIndex < timelineRows.length - 1 && (
                  <RowTurnArrow
                    reverse={isReverse}
                    colorIndex={rowIndex % 3}
                    height={Math.max(280, 170 + row.length * 65)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}