// ============================================================================
// ACTIVE IMPLEMENTATION (Integrated from Desktop)
// ============================================================================
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, resolveMediaUrl } from "../../services/api";
import "./Gallery.css";

const galleryData = [
  {
    id: "sih2026",
    year: "2026",
    category: "hackathon",
    title: "SIH Hackathon",
    date: "August 2026",
    description:
      "The Institution's Innovation Council at VVITU University successfully organized Smart India Hackathon 2026. This national-level event provided a platform for students to demonstrate their technical prowess and improve their skills through real-world applications.",
    images: ["/images/sih1.png"],
  },
  {
    id: "idea2026",
    year: "2026",
    category: "Incub",
    title: "Incubation Visit",
    date: "August 22, 2026",
    description:
      "VVITU IIC visited to RVRJC, which helped students to gain practical understanding of the Incubation and learn about Entrepreneurs. The session focused on bridging the gap between academic learning and real-world startup strategies.",
    images: [
      "/images/incub1.png",
      "/images/incub2.png",
      "/images/incub3.png",
      "/images/incub4.png",
    ],
  },
  {
    id: "idea",
    year: "2026",
    category: "Incub",
    title: "Incubation Visit",
    date: "March 25, 2026",
    description: "VVITU IIC visited to KL University on March 25, 2026.",
    images: ["/images/inckl1.png", "/images/inckl2.png"],
  },
  {
    id: "idea2025",
    year: "2025",
    category: "Incub",
    title: "Incubation Visit",
    date: "December 25, 2025",
    description:
      "VVITU IIC visited to SRM on December 25, 2025. The session focused on bridging the gap between academic learning and real-world startup strategies.",
    images: ["/images/isrm1.png", "/images/isrm2.png"],
  },
  {
    id: "coding2025",
    year: "2025",
    category: "hackathon",
    title: "Innovate it",
    date: "Oct 15, 2025",
    description:
      "Held on October 15th, 'INNOVATE-IT' was a dedicated ideation platform designed to foster the entrepreneurial spirit. Student teams of 2-3 members showcased their problem-solving skills, presenting unique concepts under the theme 'Ignite Ideas, Inspire Action.'",
    images: ["/images/inno1.png", "/images/inno2.png"],
  },
  {
    id: "pitch2025",
    year: "2025",
    category: "workshop",
    title: "Tech Talks",
    date: "Nov 7, 2025",
    description:
      "From student to founder! Our students received invaluable mentorship from the host MR.Dileep Sajja who broke down the importance of entrepreneurship and shared the essential strategies needed to build a business from scratch.",
    images: ["/images/techt.png"],
  },
];

const categoryLabels = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  Incub: "Incubation Visit",
};
const categories = [...new Set(galleryData.map((item) => item.category))];
const filterOptions = [
  { label: "All", value: "all" },
  ...["hackathon", "workshop", ...categories]
    .filter(
      (value, index, values) =>
        categories.includes(value) && values.indexOf(value) === index,
    )
    .map((value) => ({ label: categoryLabels[value] || value, value })),
];
const galleryYears = [...new Set(galleryData.map((item) => item.year))];
const photoTotal = galleryData.reduce(
  (total, item) => total + item.images.length,
  0,
);

function Gallery() {
  const [uploadedGallery, setUploadedGallery] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState({ open: false, event: null, photoIdx: 0 });
  const [coverIndex, setCoverIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);
  const pointerStart = useRef(null);
  const didSwipe = useRef(false);
  const displayGallery = [...galleryData, ...uploadedGallery];
  const featuredGallery = displayGallery.slice(0, 7);
  const typedHeadline =
    "Every photo tells a story of an idea brought to life. Explore, engage, and innovate.";
  const typedLeadEnd = typedHeadline.indexOf(" Explore,");

  const filteredGallery = displayGallery.filter((item) => {
    const categoryMatch = filter === "all" || item.category === filter;
    return categoryMatch;
  });
  const visibleYears = [...new Set(displayGallery.map((item) => item.year))].filter((eventYear) =>
    filteredGallery.some((item) => item.year === eventYear),
  );

  useEffect(() => {
    let mounted = true;
    api.gallery.getAll().then((response) => {
      const uploaded = (response.galleryImages || []).map((image) => ({
        id: `uploaded-${image.id}`,
        year: image.created_at ? new Date(image.created_at).getFullYear().toString() : "2026",
        category: "uploaded",
        title: image.caption || "IIC Gallery",
        date: image.created_at ? new Date(image.created_at).toLocaleDateString() : "Recently",
        description: image.caption || "Images from the Institution's Innovation Council.",
        images: [resolveMediaUrl(image.public_url || image.image_url)],
      }));
      if (mounted) setUploadedGallery(uploaded);
    }).catch((error) => console.warn("[Gallery] Could not fetch uploaded images:", error));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (typingFinished) return undefined;
    if (typedTitle.length >= typedHeadline.length) {
      setTypingFinished(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTypedTitle(typedHeadline.slice(0, typedTitle.length + 1));
    }, 20);

    return () => window.clearTimeout(timer);
  }, [typedHeadline, typedTitle, typingFinished]);

  useEffect(() => {
    if (
      modal.open ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setCoverIndex((index) => (index + 1) % featuredGallery.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [featuredGallery.length, modal.open]);

  useEffect(() => {
    if (!modal.open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal.open]);

  useEffect(() => {
    if (!modal.open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModal({ open: false, event: null, photoIdx: 0 });
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const direction = event.key === "ArrowRight" ? 1 : -1;
        setModal((current) => {
          if (!current.event) return current;
          const imageCount = current.event.images.length;
          return {
            ...current,
            photoIdx: (current.photoIdx + direction + imageCount) % imageCount,
          };
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal.open]);

  const moveCover = (step) => {
    setCoverIndex(
      (index) =>
        (index + step + featuredGallery.length) % featuredGallery.length,
    );
  };

  const handleCoverPointerUp = (event) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 45) {
      didSwipe.current = true;
      moveCover(distance < 0 ? 1 : -1);
    }
  };

  const handleCardPointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const imageStack = event.currentTarget.querySelector(".event-image-stack");
    const bounds = imageStack.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    imageStack.style.setProperty("--tilt-x", `${-vertical * 9}deg`);
    imageStack.style.setProperty("--tilt-y", `${horizontal * 11}deg`);
  };

  const resetCardTilt = (event) => {
    const imageStack = event.currentTarget.querySelector(".event-image-stack");
    imageStack.style.removeProperty("--tilt-x");
    imageStack.style.removeProperty("--tilt-y");
  };

  const openModal = (event) => {
    setModal({ open: true, event, photoIdx: 0 });
  };
  const closeModal = () => setModal({ open: false, event: null, photoIdx: 0 });
  const nextPhoto = () => {
    if (!modal.event) return;
    setModal((m) => ({
      ...m,
      photoIdx: (m.photoIdx + 1) % m.event.images.length,
    }));
  };
  const prevPhoto = () => {
    if (!modal.event) return;
    setModal((m) => ({
      ...m,
      photoIdx:
        (m.photoIdx - 1 + m.event.images.length) % m.event.images.length,
    }));
  };

  return (
    <div className="wrap gallery-page">
      <main>
        <div className="hero-gallery">
          <div className="hero-quote-card">
            <div className="hero-quote-badge" aria-hidden="true">
              “
            </div>
            <p className="hero-intro-line">
              <span className="typed-text quote-first-sentence">
                {typedTitle.slice(0, typedLeadEnd)}
              </span>
              {typedTitle.length > typedLeadEnd && (
                <>
                  <br />
                  <span className="typed-text">
                    {typedTitle.slice(typedLeadEnd).trimStart()}
                  </span>
                </>
              )}
              {!typingFinished && (
                <span className="typing-cursor" aria-hidden="true" />
              )}
            </p>
          </div>
          <motion.div
            className="hero-highlight-card"
            aria-label="Gallery highlight panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="hero-highlight-text">
              INNOVATION COUNCIL · EVENTS GALLERY
            </span>
          </motion.div>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A curated collection of gatherings that inspire, connect and leave a lasting impression.
          </motion.p>
          <motion.div
            className="hero-stats"
            aria-label="Gallery statistics"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong className="stat-yellow">{displayGallery.length}</strong>
              <span>Events</span>
            </motion.div>
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong className="stat-red">{photoTotal}</strong>
              <span>Photos</span>
            </motion.div>
            <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong className="stat-blue">{galleryYears.length}</strong>
              <span>Years</span>
            </motion.div>
          </motion.div>

          <motion.section
            className="coverflow-section"
            aria-label="Featured IIC event photos"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="coverflow-stage"
              onPointerDown={(event) => {
                pointerStart.current = event.clientX;
              }}
              onPointerUp={handleCoverPointerUp}
            >
              {featuredGallery.map((item, index) => {
                const offset = index - coverIndex;
                const normalizedOffset = Math.abs(offset);
                const isActive = offset === 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`coverflow-card${isActive ? " is-active" : ""}`}
                    onClick={() => {
                      if (isActive) {
                        openModal(item);
                      } else {
                        moveCover(offset < 0 ? -1 : 1);
                      }
                    }}
                    style={{
                      opacity: normalizedOffset > 2 ? 0 : 1,
                      transform: `translate(-50%, -50%) translateX(${offset * 210}px) translateZ(${normalizedOffset * -120}px) rotateY(${offset * -28}deg) scale(${isActive ? 1 : 0.9})`,
                      zIndex: 100 - normalizedOffset,
                    }}
                    aria-label={`View ${item.title}`}
                  >
                    <img src={item.images[0]} alt={item.title} loading="lazy" />
                    <span className="coverflow-caption">
                      <small>{item.date}</small>
                      <strong>{item.title}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="coverflow-controls" aria-label="Carousel controls">
              <button
                type="button"
                onClick={() => moveCover(-1)}
                aria-label="Previous photo set"
              >
                ‹
              </button>
              <span>
                {coverIndex + 1} / {featuredGallery.length}
              </span>
              <button
                type="button"
                onClick={() => moveCover(1)}
                aria-label="Next photo set"
              >
                ›
              </button>
            </div>
          </motion.section>
        </div>
        <motion.section
          className="event-library"
          aria-labelledby="past-events-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="library-heading"
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <h2 id="past-events-title">Past events</h2>
            </div>
          </motion.div>
          <motion.div
            className="filter-container"
            aria-label="Filter by category"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                className={
                  "filter-btn" + (filter === opt.value ? " active" : "")
                }
                type="button"
                aria-pressed={filter === opt.value}
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
            <p className="result-count">
              {filteredGallery.length} events <i />{" "}
              {filteredGallery.reduce(
                (total, item) => total + item.images.length,
                0,
              )}{" "}
              photos
            </p>
          </motion.div>
          {filteredGallery.length === 0 ? (
            <p className="empty-state">No events match these filters.</p>
          ) : (
            visibleYears.map((eventYear) => (
              <motion.section
                className="year-section"
                key={eventYear}
                aria-labelledby={`year-${eventYear}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.h3
                  className="year-heading"
                  id={`year-${eventYear}`}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {eventYear}
                </motion.h3>
                <div className="gallery-grid">
                  {filteredGallery
                    .filter((item) => item.year === eventYear)
                    .map((item, itemIdx) => (
                      <motion.button
                        className="gallery-item"
                        key={item.id}
                        type="button"
                        onClick={() => openModal(item)}
                        onPointerMove={handleCardPointerMove}
                        onPointerLeave={resetCardTilt}
                        aria-label={`Open ${item.title}, ${item.date}`}
                        initial={{ opacity: 0, y: 32, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                          delay: (itemIdx % 3) * 0.08,
                        }}
                        whileHover={{
                          y: -8,
                          transition: { duration: 0.22, ease: "easeOut" },
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className={`event-image-stack${item.images.length > 1 ? " has-photo-stack" : ""}`}
                        >
                          {item.images.length > 1 &&
                            item.images.slice(1, 2).map((image, index) => {
                              const stackLevel = index + 1;
                              return (
                                <img
                                  className="stack-photo"
                                  key={image}
                                  src={image}
                                  alt=""
                                  loading="lazy"
                                  style={{
                                    zIndex: stackLevel,
                                    transform: `translate(${-stackLevel * 4}px, ${stackLevel * 4}px) rotate(${-stackLevel * 1.7}deg)`,
                                  }}
                                />
                              );
                            })}
                          <img
                            className="stack-cover"
                            src={item.images[0]}
                            alt=""
                            loading="lazy"
                          />
                          <span className="event-tag">
                            {categoryLabels[item.category] || item.category}
                          </span>
                          <span className="photo-tag">
                            {item.images.length}{" "}
                            {item.images.length === 1 ? "photo" : "photos"}
                          </span>
                        </span>
                        <span className="event-meta">
                          <small>{item.date}</small>
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </span>
                      </motion.button>
                    ))}
                </div>
              </motion.section>
            ))
          )}
        </motion.section>
      </main>
      {/* Modal for gallery images */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            className="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "fixed",
              inset: 0,
              background: "rgba(10,10,30,0.95)",
              zIndex: 1000,
            }}
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                maxWidth: "100vw",
                width: "90vw",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label={`${modal.event.title} photo album`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 40,
                  height: 40,
                  background: "rgba(255,255,255,0.9)",
                  border: "none",
                  borderRadius: "50%",
                  color: "#2E2A8F",
                  fontSize: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1001,
                }}
                onClick={closeModal}
              >
                &times;
              </button>
              <img
                className="modal-image"
                src={modal.event.images[modal.photoIdx]}
                alt={modal.event.title}
                style={{
                  width: "100%",
                  height: "60vh",
                  objectFit: "contain",
                  background: "#000",
                }}
              />
              <div
                className="modal-info"
                style={{
                  padding: "20px 30px",
                  background: "#fff",
                  color: "#222",
                  borderTop: "4px solid #F4A238",
                }}
              >
                <div
                  className="modal-header-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <h3
                    className="modal-title"
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#2E2A8F",
                      margin: 0,
                    }}
                  >
                    {modal.event.title}
                  </h3>
                  <span
                    className="photo-counter"
                    style={{
                      fontSize: 13,
                      background: "#eee",
                      padding: "4px 10px",
                      borderRadius: 12,
                      color: "#555",
                      fontWeight: 600,
                    }}
                  >
                    {modal.photoIdx + 1} / {modal.event.images.length}
                  </span>
                </div>
                <p
                  className="modal-date"
                  style={{
                    fontSize: 14,
                    color: "#F4A238",
                    fontWeight: 600,
                    margin: "0 0 12px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {modal.event.date}
                </p>
                <p
                  className="modal-description"
                  style={{
                    fontSize: 15,
                    color: "#6b6b6b",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {modal.event.description}
                </p>
                <div className="album-thumbnails" aria-label="Event photos">
                  {modal.event.images.map((image, index) => (
                    <button
                      className={`album-thumbnail${modal.photoIdx === index ? " active" : ""}`}
                      key={image}
                      type="button"
                      aria-label={`Show photo ${index + 1}`}
                      aria-pressed={modal.photoIdx === index}
                      onClick={() =>
                        setModal((current) => ({ ...current, photoIdx: index }))
                      }
                    >
                      <img src={image} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
              <>
                <button
                  className="modal-nav modal-prev"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 30,
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#2E2A8F",
                    fontSize: 24,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1001,
                  }}
                  onClick={prevPhoto}
                >
                  &lt;
                </button>
                <button
                  className="modal-nav modal-next"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 30,
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#2E2A8F",
                    fontSize: 24,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1001,
                  }}
                  onClick={nextPhoto}
                >
                  &gt;
                </button>
              </>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
