import { useEffect, useRef } from 'react';

const EDITABLE = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]';

export function visibleViewport(viewport, innerHeight) {
  return {
    height: Math.max(1, viewport?.height || innerHeight),
    top: Math.max(0, viewport?.offsetTop || 0),
  };
}

// Scroll the modal's content, never the document behind it. Leave visible fields alone.
export function focusScrollTop({ top, bottom, height, viewportTop, viewportBottom, scrollTop, maxScroll }) {
  if (top >= viewportTop && bottom <= viewportBottom) return scrollTop;
  const room = Math.max(0, viewportBottom - viewportTop);
  const desiredTop = viewportTop + Math.max(0, (room - height) / 2);
  return Math.max(0, Math.min(maxScroll, scrollTop + top - desiredTop));
}

export function useModalViewport() {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    if (!backdrop || !content) return;
    const viewport = window.visualViewport;
    const body = document.body;
    const originalFocus = document.activeElement;
    const pageX = window.scrollX;
    const pageY = window.scrollY;
    const properties = ['position', 'top', 'left', 'width', 'overflow'];
    const previous = properties.map(key => [key, body.style[key]]);
    Object.assign(body.style, { position: 'fixed', top: `${-pageY}px`, left: `${-pageX}px`, width: '100%', overflow: 'hidden' });
    let baseline = Math.max(window.innerHeight, viewport?.height || 0);
    let wasKeyboardOpen = false;
    let savedScroll = content.scrollTop;
    let frame = 0;
    let timers = [];

    const focusedField = () => {
      const element = document.activeElement;
      return element?.matches(EDITABLE) && content.contains(element) ? element : null;
    };
    const reveal = () => {
      const field = focusedField();
      if (!field) return;
      const bounds = content.getBoundingClientRect();
      const rect = field.getBoundingClientRect();
      const actionsHeight = content.querySelector('.form-actions')?.getBoundingClientRect().height || 0;
      const current = visibleViewport(viewport, window.innerHeight);
      const next = focusScrollTop({
        top: rect.top, bottom: rect.bottom, height: rect.height,
        viewportTop: Math.max(bounds.top, current.top) + 12,
        viewportBottom: Math.min(bounds.bottom, current.top + current.height) - actionsHeight - 16,
        scrollTop: content.scrollTop, maxScroll: Math.max(0, content.scrollHeight - content.clientHeight),
      });
      if (Math.abs(next - content.scrollTop) > 1) content.scrollTo({ top: next, behavior: 'auto' });
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = visibleViewport(viewport, window.innerHeight);
        if (!focusedField()) baseline = Math.max(window.innerHeight, current.height);
        const keyboardOpen = !!focusedField() && baseline - current.height > 100;
        backdrop.style.setProperty('--modal-viewport-height', `${current.height}px`);
        backdrop.style.setProperty('--modal-viewport-top', `${current.top}px`);
        backdrop.dataset.keyboardOpen = String(keyboardOpen);
        if (wasKeyboardOpen && !keyboardOpen) content.scrollTop = savedScroll;
        else reveal();
        wasKeyboardOpen = keyboardOpen;
      });
    };
    const onFocus = () => {
      if (!wasKeyboardOpen) savedScroll = content.scrollTop;
      timers.forEach(clearTimeout);
      update();
      // iOS keyboard animation can resize/pan the visual viewport after focus.
      timers = [120, 320].map(delay => setTimeout(update, delay));
    };
    content.addEventListener('focusin', onFocus);
    content.addEventListener('input', update);
    content.addEventListener('focusout', update);
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    onFocus(); // Also catches React autoFocus, which runs before this effect.

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      content.removeEventListener('focusin', onFocus);
      content.removeEventListener('input', update);
      content.removeEventListener('focusout', update);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      focusedField()?.blur();
      for (const [key, value] of previous) body.style[key] = value;
      const root = document.documentElement;
      const scrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(pageX, pageY);
      root.style.scrollBehavior = scrollBehavior;
      if (originalFocus?.isConnected && !originalFocus.matches(EDITABLE)) originalFocus.focus({ preventScroll: true });
    };
  }, []);

  return { backdropRef, contentRef };
}
