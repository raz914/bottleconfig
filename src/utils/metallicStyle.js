/**
 * Shared metallic gradient tokens for engraving effects.
 *
 * Single source of truth consumed by:
 *   - BottlePreview.jsx  (live preview – CSS gradient)
 *   - DesignCapture.jsx  (design capture – CSS gradient)
 *   - UploadView.jsx     (upload preview – CSS gradient)
 *   - canvasCapture.js   (canvas export – pre-brightened color stops)
 *
 * White bottle gets a darker gradient so engravings remain clearly visible
 * against the light bottle surface.
 */

// ---------------------------------------------------------------------------
// CSS gradient values (used with background + background-clip: text / mask)
// The CSS filter `brightness(1.1)` is applied separately in the components,
// so these are the "base" colours before that filter lightens them on screen.
// ---------------------------------------------------------------------------
// #a8a7a7ff 0%, #8e8e8e 50%, #555555 100%
const CSS_STOPS = {
    white: { start: '#a8a7a7', mid: '#8e8e8e', end: '#555555' },
    other: { start: '#e6e5e5ff', mid: '#9e9e9e', end: '#656565' },
};

/**
 * Return a CSS linear-gradient string for the metallic engraving effect.
 * @param {string} selectedColor - Bottle colour id ('white', 'black', etc.)
 * @returns {string} CSS linear-gradient value
 */
export const getMetallicGradientCSS = (selectedColor) => {
    const s = selectedColor === 'white' ? CSS_STOPS.white : CSS_STOPS.other;
    return `linear-gradient(90deg, ${s.start} 0%, ${s.mid} 50%, ${s.end} 100%)`;
};

// ---------------------------------------------------------------------------
// Canvas colour-stop values (pre-brightened ≈ +10 %)
// canvasCapture.js applies contrast/brightness via canvas operations, so we
// bake a ~10 % brightness lift into the stop colours to match the CSS filter.
// ---------------------------------------------------------------------------

const CANVAS_STOPS = {
    white: { start: '#b9b8b8', mid: '#9c9c9c', end: '#5e5e5e' },
    other: { start: '#f5f4f4', mid: '#aeaeae', end: '#717171' },
};

/**
 * Return the three {color, offset} triplets for a canvas linear gradient.
 * @param {string} selectedColor
 * @returns {{ start: string, mid: string, end: string }}
 */
export const getMetallicCanvasStops = (selectedColor) =>
    selectedColor === 'white' ? CANVAS_STOPS.white : CANVAS_STOPS.other;

// ---------------------------------------------------------------------------
// Safe CSS url() helper
// Wraps a URL string in double-quoted url("...") so paths with spaces,
// apostrophes, or other special characters don't break CSS parsing.
// ---------------------------------------------------------------------------

/**
 * Return a safely quoted CSS `url("...")` value.
 * Handles paths like `gallery/Valentine's Day/heart-hooks.svg`.
 * @param {string} value - Image URL / path / data-URI
 * @returns {string} CSS url() value, or 'none' if falsy
 */
export const cssUrl = (value) => {
    if (!value || typeof value !== 'string') return 'none';
    // Escape any double-quotes inside the URL itself
    return `url("${value.replace(/"/g, '\\"')}")`;
};
