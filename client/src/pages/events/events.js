// ============================================================================
// ACTIVE IMPLEMENTATION (Integrated from Desktop)
// ============================================================================
import { useEffect, useState } from "react";
import styles from "./Events.module.css";

const classNames = (...names) =>
  names.filter(Boolean).map((name) => styles[name]).join(" ");


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
    description:
      "Smart India Hackathon 2024, a platform where students worked on innovative solutions for real-world problem statements.",
  },
  {
    id: "h2",
    category: "Hackathons",
    title: "SIH 2025",
    image: "/events/hackathons/sih2025.jpeg",
    date: "2025",
    displayDate: "2025",
    description:
      "Smart India Hackathon 2025 encouraged students to collaborate, innovate, and develop technology-driven solutions.",
  },
  {
    id: "i4",
    category: "Ideathons",
    title: "Inter-Institutional Startup Competition",
    image: "/events/ideathons/iiscideathon.jpeg",
    date: "2023",
    displayDate: "2023",
    description:
      "An inter-institutional competition focused on startup ideas, innovation, entrepreneurship, and collaboration among students.",
  },
  {
    id: "i5",
    category: "Ideathons",
    title: "Innovate It",
    image: "/events/ideathons/innovateit_ideathon.jpeg",
    date: "2022",
    displayDate: "2022",
    description:
      "An ideathon conducted to discover and encourage innovative student ideas with the potential to solve real-world problems.",
  },
  {
    id: "t1",
    category: "Technical Events",
    title: "Invention Through Innovation",
    image: "/events/technicalevents/te1.jpeg",
    date: "2023",
    displayDate: "2023",
    description:
      "An innovation-focused event that encouraged students to explore creative ideas, inventions, and practical solutions.",
  },
  {
    id: "t2",
    category: "Technical Events",
    title: "Innovation Experience",
    image: "/events/technicalevents/te2.jpeg",
    date: "2022",
    displayDate: "2022",
    description:
      "A multi-event innovation experience featuring Marketing Magics, Scavenger Hunt, Stock Wars, and other creative challenges.",
  },
  {
    id: "t3",
    category: "Technical Events",
    title: "Innovation Intramurals",
    image: "/events/technicalevents/te3.jpeg",
    displayDate: "2022",
    description:
      "A two-day intramural event featuring innovation-based activities, mathematics, ideas, and engaging student challenges.",
  },
  {
    id: "t4",
    category: "Technical Events",
    title: "Mind Mashrims",
    image: "/events/technicalevents/te4.jpeg",
    displayDate: "2022",
    description:
      "A technical and creative event designed to challenge students through engaging activities and innovative thinking.",
  },
  {
    id: "t5",
    category: "Technical Events",
    title: "Stock Wars",
    image: "/events/technicalevents/te5.jpeg",
    displayDate: "2022",
    description:
      "A technical event related to stock markets, where participants explored investment strategies and decision-making.",
  },
  {
    id: "t6",
    category: "Technical Events",
    title: "Innovation Hunt",
    image: "/events/technicalevents/te6.jpeg",
    displayDate: "2022",
    description:
      "An innovation-based event focused on exploring the journey from innovative ideas and investment towards entrepreneurship.",
  },
  {
    id: "t7",
    category: "Technical Events",
    title: "Recall Masters",
    image: "/events/technicalevents/te7.jpeg",
    displayDate: "2023",
    description:
      "A challenging event designed to test participants’ memory, recall ability, observation, and quick thinking.",
  },
  {
    id: "t8",
    category: "Technical Events",
    title: "Memory Wizards",
    image: "/events/technicalevents/te8.jpeg",
    displayDate: "2023",
    description:
      "An engaging memory-based competition that challenged students to demonstrate their recall and observation skills.",
  },
  {
    id: "t9",
    category: "Technical Events",
    title: "Techmania",
    image: "/events/technicalevents/te9.jpeg",
    displayDate: "2023",
    description:
      "A technical event bringing together students through technology, innovation, creativity, and exciting challenges.",
  },
];

const accentNames = ["rose", "blue", "amber"];
const eventsPerRow = 3;

const getEventTimestamp = ({ date, displayDate }) => {
  const timestamp = Date.parse(String(date ?? displayDate ?? ""));
  return Number.isNaN(timestamp) ? null : timestamp;
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function RowTurnArrow({ reverse, colorIndex }) {
  return (
    <svg
      className={classNames("row-turn", `turn-${colorIndex}`, reverse && "reverse")}
      viewBox="0 0 140 580"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g transform={reverse ? "translate(140 0) scale(-1 1)" : undefined}>
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
      <g transform={reverse ? "translate(112 0) scale(-1 1)" : undefined}>
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
  const [activeFilter, setActiveFilter] =
    useState("All Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
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
        activeFilter === "All Events" || event.category === activeFilter,
    )
    .sort((a, b) => {
      const timestampA = getEventTimestamp(a);
      const timestampB = getEventTimestamp(b);
      if (timestampA === null) return timestampB === null ? 0 : 1;
      if (timestampB === null) return -1;
      return timestampB - timestampA;
    });
  const timelineRows = Array.from(
    { length: Math.ceil(filteredEvents.length / eventsPerRow) },
    (_, index) =>
      filteredEvents.slice(
        index * eventsPerRow,
        index * eventsPerRow + eventsPerRow,
      ),
  );

  useEffect(() => {
    if (!selectedEvent) return;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedEvent(null);
    };

    document.body.classList.add(styles["modal-open"]);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove(styles["modal-open"]);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedEvent]);

  useEffect(() => {
    const rows = document.querySelectorAll("[data-timeline-row]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      rows.forEach((row) => row.classList.add(styles["is-visible"]));
      return;
    }

    rows.forEach((row) => row.classList.add(styles["motion-ready"]));
    // Commit the hidden starting state before observing visible rows.
    void rows[0]?.offsetWidth;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles["is-visible"]);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -28% 0px" },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [activeFilter]);

  useEffect(() => {
    const featuredCard = document.querySelector(
      "[data-featured-card]",
    );
    if (!featuredCard) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      featuredCard.classList.add(styles["is-visible"]);
      return;
    }

    featuredCard.classList.add(styles["motion-ready"]);
    // Commit the translated starting state before triggering the reveal.
    void featuredCard.offsetWidth;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        featuredCard.classList.add(styles["is-visible"]);
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(featuredCard);
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles["events-page"]}>
      <header className={styles["events-hero"]}>
        <div className={styles["hero-top"]}>
          <p className={styles["eyebrow"]}>IIC VVITU · THINK BEYOND LIMITS</p>
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
                <span>{typedTitle.slice(breakIndex).trimStart()}</span>
              </>
            )}
            {!typingFinished && (
              <span className={styles["heading-cursor"]} aria-hidden="true" />
            )}
          </h1>

          <p className={styles["hero-copy"]}>
            From exciting competitions to hands-on workshops, discover opportunities that transform {" "}
            <br className={styles["hero-copy-break"]} />
            curiosity into confidence and ideas into impact.
          </p>
        </div>
      </header>

      <section className={styles["live-section"]} aria-labelledby="live-title">
        <div className={styles["section-heading"]}>
          <div>
            <p className={styles["section-kicker"]}>Featured</p>
            <h2 id="live-title">Latest event</h2>
          </div>
          <span className={styles["heading-rule"]} />
        </div>

        <article className={styles["featured-card"]} data-featured-card>
          <div className={styles["featured-art"]}>
            <p className={styles["archive-label"]}>IIC VVITU / Event archive</p>
            <span className={styles["status-pill"]}>
              <span aria-hidden="true">•</span>
              Completed
            </span>
            <div className={styles["featured-poster-frame"]}>
              <img
                src="https://vspgdcjylvxjdgaugjwq.supabase.co/storage/v1/object/public/gallery/SIH2026/Screenshot%202026-08-21%20161227_imgupscaler.ai_General_4K.jpg"
                alt="Smart India Hackathon event poster"
              />
            </div>
          </div>
          <div className={styles["featured-content"]}>
            <p className={styles["event-type"]}>
              National innovation challenge
            </p>
            <h3>Smart India Hackathon</h3>
            <p>Ideas shared. Possibilities opened.</p>

            <div className={styles["featured-meta"]}>
              <span>
                <CalendarIcon />
                2026
              </span>
              <span>
                <ClockIcon />
                National challenge
              </span>
              <span>
                <LocationIcon />
                VVITU
              </span>
            </div>

            <div className={styles["featured-footer"]}>
              <button
                type="button"
                className={styles["registration-closed"]}
                aria-disabled="true"
                onPointerMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const progress = Math.max(
                    0,
                    Math.min(1, (event.clientX - bounds.left) / bounds.width),
                  );
                  const red = 255 - Math.round(progress * 28);
                  const green = 241 - Math.round(progress * 14);
                  const blue = 246 - Math.round(progress * 18);
                  event.currentTarget.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
                  event.currentTarget.style.borderColor = `rgb(${217 - Math.round(progress * 18)}, ${169 - Math.round(progress * 12)}, ${182 - Math.round(progress * 14)})`;
                  event.currentTarget.style.color = `rgb(${162 - Math.round(progress * 12)}, ${61 - Math.round(progress * 10)}, ${82 - Math.round(progress * 10)})`;
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.removeProperty("background-color");
                  event.currentTarget.style.removeProperty("border-color");
                  event.currentTarget.style.removeProperty("color");
                }}
              >
                Registrations closed
              </button>
              <button type="button" className={styles["event-details-button"]}>
                View event details <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className={styles["past-section"]} aria-labelledby="past-title">
        <div className={styles["section-heading"]}>
          <div>
            <p className={styles["section-kicker"]}>Our journey</p>
            <h2 id="past-title">Past events</h2>
          </div>
          <span className={styles["heading-rule"]} />
        </div>

        <div className={styles["filters"]} aria-label="Filter events">
          {categories.map((category) => (
            <button
              key={category}
              className={classNames("filter", activeFilter === category && "active")}
              type="button"
              aria-pressed={activeFilter === category}
              onClick={() => setActiveFilter(category)}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                event.currentTarget.style.setProperty("--move-x", `${x * 5}px`);
                event.currentTarget.style.setProperty("--move-y", `${y * 4}px`);
                event.currentTarget.style.setProperty(
                  "--tilt",
                  `${x * 2.5}deg`,
                );
                event.currentTarget.style.backgroundColor =
                  x < -0.12 ? "#fff1f4" : x > 0.12 ? "#edf7ff" : "#fff9e9";
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty("--move-x");
                event.currentTarget.style.removeProperty("--move-y");
                event.currentTarget.style.removeProperty("--tilt");
                event.currentTarget.style.removeProperty("background-color");
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
                className={classNames("timeline-row", isReverse && "reverse")}
                key={`${activeFilter}-row-${rowIndex}`}
                data-timeline-row
              >
                {row.map((event, eventIndex) => {
                  const index = rowIndex * eventsPerRow + eventIndex;
                  const accent = accentNames[index % accentNames.length];

                  return (
                    <div
                      className={classNames(
                        "timeline-step",
                        index === filteredEvents.length - 1 && "final-step",
                      )}
                      key={event.id}
                    >
                      <article className={classNames("event-card", accent)}>
                        <span className={styles["card-trace"]} aria-hidden="true" />
                        <span className={styles["event-number"]}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className={styles["poster-frame"]}>
                          <div className={styles["poster-fallback"]}>
                            <span>{event.category}</span>
                            <strong>{event.title}</strong>
                          </div>
                          <img
                            src={event.image}
                            alt=""
                            loading="lazy"
                            onError={(error) => {
                              error.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className={styles["date-ribbon"]}>
                          <CalendarIcon />
                          <span>{event.displayDate}</span>
                        </div>

                        <div className={styles["event-card-content"]}>
                          <h3>{event.title}</h3>
                          <span className={styles["description"]}>
                            {event.description}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={styles["card-hitbox"]}
                          onClick={() => setSelectedEvent(event)}
                          aria-label={`View details for ${event.title}`}
                        />
                      </article>

                      {eventIndex < row.length - 1 && (
                        <span
                          className={classNames("event-connector", `connector-${index % 3}`)}
                          aria-hidden="true"
                        >
                          <EventConnector reverse={isReverse} />
                        </span>
                      )}
                    </div>
                  );
                })}

                {rowIndex < timelineRows.length - 1 && (
                  <RowTurnArrow
                    reverse={isReverse}
                    colorIndex={rowIndex % 3}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {selectedEvent && (
        <div
          className={styles["modal-overlay"]}
          onMouseDown={() => setSelectedEvent(null)}
        >
          <div
            className={styles["event-details-modal"]}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className={styles["modal-close"]}
              type="button"
              aria-label="Close event details"
              onClick={() => setSelectedEvent(null)}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className={styles["details-top"]}>
              <div className={styles["details-intro"]}>
                <p className={styles["details-kicker"]}>
                  IIC VVITU / {selectedEvent.category}
                </p>
                <h2 id="modal-title">{selectedEvent.title}</h2>
                <p className={styles["details-description"]}>
                  {selectedEvent.description}
                </p>
              </div>
              <div className={styles["details-aside"]}>
                <span className={styles["details-status"]}>
                  <span aria-hidden="true" />
                  Archived
                </span>
                <h3>Event highlights</h3>
                <div className={styles["details-thumbnail"]}>
                  <img
                    src={selectedEvent.image}
                    alt={`${selectedEvent.title} event poster`}
                    onError={(error) => {
                      error.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={styles["details-tiles"]}>
              <div className={classNames("details-tile", "details-when")}>
                <CalendarIcon />
                <span>When</span>
                <strong>{selectedEvent.displayDate}</strong>
              </div>
              <div className={styles["details-tile"]}>
                <LocationIcon />
                <span>Where</span>
                <strong>Not specified</strong>
              </div>
              <div className={styles["details-tile"]}>
                <ClockIcon />
                <span>Format</span>
                <strong>{selectedEvent.category}</strong>
              </div>
            </div>

            <div className={styles["details-footer"]}>
              <span>Registrations are closed for this past event.</span>
              <button
                type="button"
                className={styles["modal-done"]}
                onClick={() => setSelectedEvent(null)}
              >
                Back to events <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
