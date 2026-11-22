/**
 * IMS branding — the single source of truth for logo, colours and
 * institutional copy. Components must read from here rather than
 * hardcoding brand values.
 *
 * Logo source (verified 2026-11-22): the SVG served in the header of the
 * official IMS India website —
 *   https://www.imsindia.com/ims-india/wp-content/themes/ims-india-new/img/icons/logo.svg
 * It is dark ink (#231F20) on white, so on dark scenes it is always shown on
 * a white plate rather than recoloured. Replace the file in
 * public/assets/branding/ to swap the logo; nothing else needs to change.
 */

const base = import.meta.env.BASE_URL;

export const branding = {
  brandName: 'IMS',
  website: 'https://www.imsindia.com/',

  logo: {
    src: `${base}assets/branding/ims-logo.svg`,
    alt: 'IMS logo',
    /** Native viewBox of the official SVG: 72 × 48. */
    aspectRatio: 72 / 48,
    /** The official logo is dark-on-white; show it on this plate on dark backgrounds. */
    plateColor: '#FFFFFF',
    /** Set true only if the official logo could not be verified. */
    isPlaceholder: false,
  },

  /**
   * Provisional brand references from the brief. The official logo itself is
   * monochrome (#231F20 on white), so IMS Blue is used as the recognisable
   * accent across the experience.
   */
  colors: {
    imsBlue: '#0481FE',
    darkGrey: '#333333',
    warmPeach: '#F8BB86',
    logoInk: '#231F20',
  },

  presentedByLabel: 'PRESENTED BY',

  /** Kept factual and proportionate (brief §3.7, §20). */
  description:
    'IMS is an institute that prepares students for CAT and other management entrance examinations through classroom learning, mentoring, mock tests and learning resources.',

  /**
   * Taken from the official centre page on 2026-11-22.
   * Re-verify before the event: https://www.imsindia.com/center/vadodara/
   */
  vadodaraCentre: {
    show: false,
    name: 'IMS Vadodara',
    address: '316, Atlantis, Opp. Vadodara Central, Sarabhai Road, Vadodara - 390007',
    email: 'vadodara@imsindia.com',
    sourceUrl: 'https://www.imsindia.com/center/vadodara/',
    verifiedOn: '2026-11-22',
  },
} as const;

/** Expose brand colours as CSS custom properties so styles follow the config. */
export function applyBrandingVars(root: HTMLElement = document.documentElement) {
  root.style.setProperty('--brand-ims-blue', branding.colors.imsBlue);
  root.style.setProperty('--brand-grey', branding.colors.darkGrey);
  root.style.setProperty('--brand-peach', branding.colors.warmPeach);
}
