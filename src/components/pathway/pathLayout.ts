/** Shared geometry so the finale can pick the pathway up exactly where it was left. */
export const PATH_Y = 250;
export const NODE_X = [240, 528, 816, 1104, 1392, 1680];

/** The boardroom's growth curve and the straight pathway share one command structure, so GSAP can morph between them. */
export const CURVE_D = 'M240 720 C600 712 760 500 960 488 C1160 476 1400 470 1680 468';
export const TRACK_D = `M240 ${PATH_Y} C600 ${PATH_Y} 760 ${PATH_Y} 960 ${PATH_Y} C1160 ${PATH_Y} 1400 ${PATH_Y} 1680 ${PATH_Y}`;
