import React from 'react';
import './AutoScrollGallery.css';

function AutoScrollGallery({ items, direction = 'left', duration = 48, label }) {
  const copies = [0, 1];

  return (
    <div className="auto-gallery" role="region" aria-label={label}>
      <div
        className={`auto-gallery__track auto-gallery__track--${direction}`}
        style={{ '--auto-gallery-duration': `${duration}s` }}
      >
        {copies.map((copy) => (
          <div
            className="auto-gallery__group"
            key={copy}
            aria-hidden={copy === 1 ? 'true' : undefined}
          >
            {items.map((item, index) => (
              <figure className="auto-gallery__item" key={`${copy}-${index}-${item.image}`}>
                <img
                  src={item.image}
                  alt={copy === 1 ? '' : item.alt || item.text}
                  loading="lazy"
                  draggable="false"
                />
                <figcaption>{item.text}</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutoScrollGallery;