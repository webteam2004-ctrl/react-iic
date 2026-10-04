import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './AccordionGallery.css';

function AccordionGallery({
  items,
  defaultIndex = 2,
  expandRatio = 0.52,
  trigger = 'hover',
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  grayscale = true,
  showLabels = true,
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  height = 460,
  gap = 10,
  radius = 16,
  orientation = 'horizontal'
}) {
  const initialIndex = Math.min(Math.max(defaultIndex, 0), items.length - 1);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [selectedItem, setSelectedItem] = useState(null);
  const activeGrow = items.length > 1
    ? (expandRatio * (items.length - 1)) / (1 - expandRatio)
    : 1;
  const cssEase = ease === 'power3.out' ? 'cubic-bezier(0.22, 1, 0.36, 1)' : ease;

  useEffect(() => {
    if (!selectedItem) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedItem(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedItem]);

  const handleKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
  };

  return (
    <>
    <div
      className={`accordion-gallery${orientation === 'vertical' ? ' accordion-gallery--vertical' : ''}`}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        '--ag-duration': `${duration}s`,
        '--ag-ease': cssEase,
        height: orientation === 'vertical' ? `${Math.round(height * 1.6)}px` : `${height}px`
      }}
      role="group"
      aria-label="Startup stories"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const panelTilt = isActive ? 0 : index < activeIndex ? tilt : -tilt;
        const drift = Math.max(-1.5, Math.min(1.5, activeIndex - index));
        const imageShift = isActive ? 0 : drift * parallax * 24;

        return (
          <button
            key={item.image}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            type="button"
            style={{
              flexGrow: isActive ? activeGrow : 1,
              '--ag-tilt': `${panelTilt}deg`,
              '--ag-label-delay': isActive ? `${stagger}s` : '0s',
              borderRadius: `${radius}px`
            }}
            aria-label={item.label}
            aria-pressed={isActive}
            onMouseEnter={() => trigger === 'hover' && setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => {
              setActiveIndex(index);
              setSelectedItem(item);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <img
              className="ag-panel__image"
              src={item.image}
              alt={item.alt || item.label}
              draggable="false"
              style={{
                filter: grayscale && !isActive ? 'grayscale(1) brightness(0.68)' : 'none',
                transform: `scale(1.08) translateX(${imageShift}px)`
              }}
            />
            <span className="ag-panel__overlay" aria-hidden="true" />
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span className="ag-panel__bar" />
                <span className="ag-panel__text">{item.label}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
    {selectedItem && createPortal(
      <div
        className="ag-story-backdrop"
        onClick={(event) => event.target === event.currentTarget && setSelectedItem(null)}
        role="presentation"
      >
        <section
          className="ag-story-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ag-story-title"
        >
          <button
            className="ag-story-close"
            type="button"
            aria-label="Close startup story"
            onClick={() => setSelectedItem(null)}
          >
            ×
          </button>
          <img
            className="ag-story-image"
            src={selectedItem.image}
            alt={selectedItem.alt || selectedItem.label}
          />
          <div className="ag-story-content">
            <p className="ag-story-eyebrow">Startup story</p>
            <h2 id="ag-story-title">{selectedItem.storyTitle || selectedItem.label}</h2>
            <p className="ag-story-description">{selectedItem.description}</p>
          </div>
        </section>
      </div>,
      document.body
    )}
    </>
  );
}

export default AccordionGallery;