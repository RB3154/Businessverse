export const isFullscreen = () => Boolean(document.fullscreenElement);

/** Browsers may refuse fullscreen outside a user gesture; fail quietly. */
export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
  } catch (error) {
    console.warn('[Businessverse] Fullscreen request was blocked by the browser.', error);
  }
}
