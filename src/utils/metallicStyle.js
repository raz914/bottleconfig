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
// 1. Digital Simulation: SHARP Brushed Steel Texture (CSS Pattern)
// Uses vector-based lines instead of noise to ensure 100% sharpness (no blur).
// Horizontal grain (0deg) – fine 1px lines to mimic Yeti brushed steel.
// ---------------------------------------------------------------------------
const STEEL_TEXTURE_CSS = `repeating-linear-gradient(0deg, 
    transparent 0px, 
    transparent 1px, 
    rgba(0,0,0,0.08) 1px, 
    rgba(0,0,0,0.08) 2px,
    transparent 2px,
    transparent 4px,
    rgba(0,0,0,0.05) 4px,
    rgba(0,0,0,0.05) 5px
)`;

// ---------------------------------------------------------------------------
// 2. Anisotropic Reflection Gradient (Physics-Based Cylinder)
// "Bright – Little bit Darker – Dark – Brighter"
// Simulates continuous Fresnel falloff on a cylindrical brushed surface.
// ---------------------------------------------------------------------------
const ANISOTROPIC_STEEL_GRADIENT = `linear-gradient(105deg, 
    #e8e9eb 0%,    /* Specular Main (Left Light) */
    #ffffff 20%,   /* Peak Highlight */
    #b0b2b8 40%,   /* Smooth Falloff */
    #5e6066 55%,   /* Core Shadow (Darkest at 55%) */
    #999999 75%,   /* Lightening (Start of Right Highlight) */
    #d9d9d9 100%   /* Broad Fresnel Rim (35-40% Width) */
)`;

// ---------------------------------------------------------------------------
// 3. White Bottle Gradient (Darker Base for Multiply)
// Darker tones that will "stain" the white bottle when multiplied.
// ---------------------------------------------------------------------------
const WHITE_BOTTLE_STEEL_GRADIENT = `linear-gradient(105deg, 
    #999999 0%,    /* Mid-Grey Start */
    #cccccc 25%,   /* Muted Highlight */
    #777777 40%,   /* Darker Transition */
    #444444 55%,   /* Deep Core Shadow (At 55%) */
    #888888 75%,   /* Lightening */
    #bfbfbf 100%   /* Broad Bright Rim (Matches Left but darker) */
)`;

/**
 * Return a CSS gradient string for the metallic engraving effect (brushed steel).
 * @param {string} selectedColor - Bottle colour id ('white', 'black', etc.)
 * @returns {string} CSS background value (multiple layers)
 */
export const getMetallicGradientCSS = (selectedColor) => {
    if (selectedColor === 'white') {
        return `
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 100%),
            ${STEEL_TEXTURE_CSS},
            ${WHITE_BOTTLE_STEEL_GRADIENT}
        `;
    }
    return `
        ${STEEL_TEXTURE_CSS},
        ${ANISOTROPIC_STEEL_GRADIENT}
    `;
};

/**
 * Metallic text filter for live preview.
 * White: inner-shadow style drop-shadow + contrast. Others: brightness only.
 * @param {string} selectedColor
 * @returns {string}
 */
export const getMetallicTextFilterCSS = (selectedColor) =>
    selectedColor === 'white'
        ? 'drop-shadow(0 1px 1px rgba(51,51,51,0.4)) contrast(1.1)'
        : 'brightness(1.05)';

/**
 * Blend mode for layered metallic gradient (multiply so texture etches into metal).
 * @returns {string}
 */
export const getMetallicBlendMode = () => 'multiply, normal';

/**
 * Whether metallic text should use shadow in canvas export.
 * @param {string} selectedColor
 * @returns {boolean}
 */
export const shouldUseMetallicTextShadow = (selectedColor) => selectedColor !== 'white';

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
