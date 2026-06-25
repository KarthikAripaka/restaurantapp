/**
 * FlyToCart — clones the food image and animates it in a curved arc to the cart icon.
 * Usage: triggerFlyToCart(sourceElement, cartElement)
 */

export const triggerFlyToCart = (sourceEl, cartEl, onComplete) => {
  if (!sourceEl || !cartEl) { onComplete?.(); return; }

  const srcRect  = sourceEl.getBoundingClientRect();
  const cartRect = cartEl.getBoundingClientRect();

  const img = sourceEl.tagName === 'IMG' ? sourceEl : sourceEl.querySelector('img');

  // Create flying clone
  const clone = document.createElement('div');
  clone.className = 'fly-item';
  clone.style.cssText = `
    width: ${srcRect.width}px;
    height: ${srcRect.height}px;
    left: ${srcRect.left}px;
    top: ${srcRect.top}px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 9999;
    position: fixed;
    pointer-events: none;
    transition: none;
  `;

  if (img) {
    const cloneImg = document.createElement('img');
    cloneImg.src = img.src;
    cloneImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    clone.appendChild(cloneImg);
  } else {
    clone.style.background = '#f97316';
    clone.textContent = '🍽️';
    clone.style.display = 'flex';
    clone.style.alignItems = 'center';
    clone.style.justifyContent = 'center';
    clone.style.fontSize = '24px';
  }

  document.body.appendChild(clone);

  // Calculate destination
  const destX = cartRect.left + cartRect.width / 2 - srcRect.width / 2;
  const destY = cartRect.top + cartRect.height / 2 - srcRect.height / 2;

  // Bezier curve control point (arc upward)
  const cpX = (srcRect.left + destX) / 2;
  const cpY = Math.min(srcRect.top, destY) - 120;

  const duration = 650;
  const start = performance.now();

  const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animate = (now) => {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const e = easeInOut(t);

    // Quadratic bezier
    const x = (1 - e) * (1 - e) * srcRect.left + 2 * (1 - e) * e * cpX + e * e * destX;
    const y = (1 - e) * (1 - e) * srcRect.top  + 2 * (1 - e) * e * cpY + e * e * destY;

    const scale = 1 - e * 0.7; // shrink toward cart

    clone.style.transform = `translate(${x - srcRect.left}px, ${y - srcRect.top}px) scale(${scale})`;
    clone.style.opacity = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(clone);
      onComplete?.();
    }
  };

  requestAnimationFrame(animate);
};
