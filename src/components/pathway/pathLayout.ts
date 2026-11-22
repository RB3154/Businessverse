/** Shared geometry so Act 05 can pick the pathway up exactly where Act 04 leaves it. */
export const PATH_Y = 250;
export const NODE_X = [260, 610, 960, 1310, 1660];

/** The boardroom's growth curve and the straight pathway share one command structure, so GSAP can morph between them. */
export const CURVE_D = 'M260 720 C600 712 760 500 960 488 C1160 476 1400 470 1660 468';
export const TRACK_D = `M260 ${PATH_Y} C600 ${PATH_Y} 760 ${PATH_Y} 960 ${PATH_Y} C1160 ${PATH_Y} 1400 ${PATH_Y} 1660 ${PATH_Y}`;
