import { useEffect, useRef } from 'react';

export interface KeyboardHandlers {
  next: () => void;
  prev: () => void;
  togglePause: () => void;
  toggleFullscreen: () => void;
  restart: () => void;
  toggleSound: () => void;
  toggleHelp: () => void;
  escape: () => void;
}

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

/**
 * Presenter shortcuts. PageUp/PageDown are included because most wireless
 * presentation clickers send them.
 */
export function useKeyboardControls(handlers: KeyboardHandlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const h = ref.current;
      let action: (() => void) | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          action = h.next;
          break;
        case 'ArrowLeft':
        case 'PageUp':
          action = h.prev;
          break;
        case ' ':
          if (!e.repeat) action = h.togglePause;
          break;
        case 'f':
        case 'F':
          if (!e.repeat) action = h.toggleFullscreen;
          break;
        case 'r':
        case 'R':
          if (!e.repeat) action = h.restart;
          break;
        case 'm':
        case 'M':
          if (!e.repeat) action = h.toggleSound;
          break;
        case '?':
        case 'h':
        case 'H':
          if (!e.repeat) action = h.toggleHelp;
          break;
        case 'Escape':
          action = h.escape;
          break;
      }
      if (!action) return;
      e.preventDefault();
      // Stop Space/Enter from also "clicking" whichever control has focus.
      if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
      action();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
