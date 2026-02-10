/**
 * Canvas-based snapshot capture for iOS Safari compatibility.
 * iOS Safari has issues with html-to-image's SVG foreignObject approach,
 * so we use direct canvas drawing as a fallback.
 */

import {
    monogramStyles,
    convertToCircleGlyphs,
    getCircleFontFamily,
    usesCircleGlyphs,
    convertToNGramGlyphs,
    getNGramFontFamily,
    usesNGramGlyphs,
    shouldDisplayMonogram,
    getMonogramFontSize
} from '../data/monogramConfig';
import { DESKTOP_POSITIONS, MOBILE_POSITIONS, GRAPHIC_MAX_SIZE } from '../data/capturePositions';

// =============================================================================
// iOS Detection
// =============================================================================

/**
 * Detect if the current device is iOS (iPhone/iPad) including iPadOS
 * iPadOS reports as "MacIntel" but has touch support
 */
export const isIOSDevice = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // Classic iOS detection
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        return true;
    }

    // iPadOS 13+ detection (reports as MacIntel but has touch)
    if (platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        return true;
    }

    // Additional check for Safari on iOS via webkit
    if (/Safari/.test(ua) && /Apple/.test(navigator.vendor)) {
        if ('ontouchstart' in window && navigator.maxTouchPoints > 1) {
            // Could be iOS Safari
            // Check for lack of mouse events typical on desktop
            if (!/Macintosh/.test(ua) || navigator.maxTouchPoints > 1) {
                return true;
            }
        }
    }

    return false;
};

// =============================================================================
// Image Loading Helper
// =============================================================================

/**
 * Load an image and return a promise that resolves with the loaded Image element
 */
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

// =============================================================================
// Canvas Positioning Constants (matching BottlePreview.jsx capture mode)
// =============================================================================

// Resolution multiplier for high-quality capture (e.g., Retina)
const RESOLUTION_SCALE = 3;

// Canvas dimensions for bottle snapshot
const BOTTLE_CANVAS_WIDTH = 300 * RESOLUTION_SCALE;
const BOTTLE_CANVAS_HEIGHT = 500 * RESOLUTION_SCALE;

// Canvas dimensions for design-only snapshot
const DESIGN_CANVAS_SIZE = 300 * RESOLUTION_SCALE;

// Base font size scaled
const BASE_FONT_SIZE = 16 * RESOLUTION_SCALE;

/**
 * Convert percentage-based positioning to pixel coordinates
 * CSS uses top/bottom/left/right percentages from container edges
 */
const getPixelBounds = (percentPos, canvasWidth, canvasHeight) => {
    const topPercent = parseFloat(percentPos.top) / 100;
    const bottomPercent = parseFloat(percentPos.bottom) / 100;
    const leftPercent = parseFloat(percentPos.left) / 100;
    const rightPercent = parseFloat(percentPos.right) / 100;

    const x = leftPercent * canvasWidth;
    const y = topPercent * canvasHeight;
    const width = canvasWidth - (leftPercent * canvasWidth) - (rightPercent * canvasWidth);
    const height = canvasHeight - (topPercent * canvasHeight) - (bottomPercent * canvasHeight);

    return { x, y, width, height };
};

// Positions imported from ../data/capturePositions.js

// =============================================================================
// Font Style Helpers
// =============================================================================

/**
 * Get the font family string for a given font name from the fonts array
 */
const getFontFamily = (fontName, fonts) => {
    const font = fonts.find(f => f.name === fontName);
    if (font && font.style && font.style.fontFamily) {
        return font.style.fontFamily;
    }
    return 'sans-serif';
};

/**
 * Get font weight from font style
 */
const getFontWeight = (fontName, fonts) => {
    const font = fonts.find(f => f.name === fontName);
    if (font && font.style && font.style.fontWeight) {
        return font.style.fontWeight;
    }
    return 'normal';
};

/**
 * Get font style (italic) from font style
 */
const getFontStyle = (fontName, fonts) => {
    const font = fonts.find(f => f.name === fontName);
    if (font && font.style && font.style.fontStyle) {
        return font.style.fontStyle;
    }
    return 'normal';
};

// =============================================================================
// Canvas Drawing Functions
// =============================================================================

/**
 * Draw an image like CSS `object-fit: contain` within a destination box.
 */
const drawImageContain = (ctx, img, dx, dy, dw, dh) => {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const scale = Math.min(dw / iw, dh / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = dx + (dw - w) / 2;
    const y = dy + (dh - h) / 2;

    ctx.drawImage(img, x, y, w, h);
};

/**
 * Create metallic gradient matching BottlePreview.jsx CSS gradients
 * Matches:
 * - White bottle: linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)
 * - Colored bottles: linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)
 * 
 * Enhanced with brightness(1.1) simulation for lighter appearance
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bounds - {x, y, width, height}
 * @param {string} selectedColor - Bottle color ('white', 'black', etc.)
 * @returns {CanvasGradient} Linear gradient for metallic silver effect
 */
const createMetallicGradient = (ctx, bounds, selectedColor) => {
    // Horizontal gradient (90deg in CSS)
    const gradient = ctx.createLinearGradient(
        bounds.x,
        bounds.y + bounds.height / 2,
        bounds.x + bounds.width,
        bounds.y + bounds.height / 2
    );

    if (selectedColor === 'white') {
        // Slightly darker gradient for white bottle, lightened for brightness(1.1)
        // Original: #b8b7b7ff, #9e9e9e, #656565
        // Brightened by ~10%: 
        gradient.addColorStop(0, '#cac9c9');      // was #b8b7b7ff
        gradient.addColorStop(0.5, '#aeaeae');    // was #9e9e9e
        gradient.addColorStop(1, '#717171');      // was #656565
    } else {
        // Lighter gradient for colored bottles, lightened for brightness(1.1)
        // Original: #e6e5e5ff, #9e9e9e, #656565
        // Brightened by ~10%:
        gradient.addColorStop(0, '#f5f4f4');      // was #e6e5e5ff
        gradient.addColorStop(0.5, '#aeaeae');    // was #9e9e9e
        gradient.addColorStop(1, '#717171');      // was #656565
    }

    return gradient;
};

/**
 * Calculate font size using cqi-based formula matching BottlePreview.jsx
 * 
 * BottlePreview uses CSS container query units (cqi):
 * - FRONT: max(4px, min((100/len)cqi, 18cqi))
 * - BACK:  max(8px, min((100/len)cqi, 34cqi))
 * 
 * where 1cqi = boundsWidth / 100
 * 
 * @param {string} text - The text to render
 * @param {number} boundsWidth - Width of the container in pixels (for cqi calc)
 * @param {string} side - 'FRONT' or 'BACK'
 * @returns {number} Font size in pixels
 */
const calculateCqiFontSize = (text, boundsWidth, side) => {
    const len = Math.max(1, text.length);
    const cqi = boundsWidth / 100; // 1cqi in pixels

    if (side === 'FRONT') {
        // max(4px, min((100/len)cqi, 18cqi))
        const dynamicSize = (100 / len) * cqi;
        const maxSize = 18 * cqi;
        return Math.max(4 * RESOLUTION_SCALE, Math.min(dynamicSize, maxSize));
    } else {
        // BACK: max(8px, min((100/len)cqi, 34cqi))
        const dynamicSize = (150 / len) * cqi;
        const maxSize = 54 * cqi;
        return Math.max(8 * RESOLUTION_SCALE, Math.min(dynamicSize, maxSize));
    }
};

/**
 * Draw text on canvas with proper centering, using cqi-based sizing
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {object} bounds - {x, y, width, height}
 * @param {string} fontFamily 
 * @param {string} fontWeight 
 * @param {string} fontStyle 
 * @param {string} selectedColor - Bottle color for gradient selection
 * @param {string} side - 'FRONT' or 'BACK' (for font size calculation)
 * @param {boolean} isVertical - whether text is vertical (BACK side option)
 */
const drawTextOnCanvas = (ctx, text, bounds, fontFamily, fontWeight, fontStyle, selectedColor, side, isVertical = false) => {
    if (!text) return;

    ctx.save();

    // Add drop shadow to match CSS filter
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2 * RESOLUTION_SCALE;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1 * RESOLUTION_SCALE;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const rawLines = String(text).replace(/\r\n/g, '\n').split('\n');
    const letterSpacingPx = 0.5 * RESOLUTION_SCALE; // matches DOM letterSpacing: 0.5px
    const lineHeight = 1.2; // matches DOM
    // Canvas text metrics can still differ slightly from DOM glyph rendering.
    // Use a more conservative margin to avoid clipping across fonts/devices.
    const fitScale = 0.82;

    const measureLine = (line, sizePx) => {
        ctx.font = `${fontStyle} ${fontWeight} ${sizePx}px ${fontFamily}`;
        const base = ctx.measureText(line).width;
        // CSS letter-spacing applies after every character including last
        const extra = (line?.length || 0) * letterSpacingPx;
        return base + extra;
    };

    const fitFontSizeHorizontal = () => {
        const hardMinPx = 1 * RESOLUTION_SCALE;
        const maxPx = Math.max(hardMinPx, (side === 'FRONT' ? 0.18 : 0.54) * bounds.width);

        const fits = (sizePx) => {
            const maxLineWidth = Math.max(0, ...rawLines.map(l => measureLine(l, sizePx)));
            const totalHeight = rawLines.length * sizePx * lineHeight;
            return (
                maxLineWidth <= bounds.width * fitScale &&
                totalHeight <= bounds.height * fitScale
            );
        };

        let lo = hardMinPx;
        let hi = maxPx;
        let best = hardMinPx;
        for (let i = 0; i < 16; i++) {
            const mid = (lo + hi) / 2;
            if (fits(mid)) {
                best = mid;
                lo = mid;
            } else {
                hi = mid;
            }
        }
        return best;
    };

    if (isVertical) {
        // Vertical text (writing-mode: vertical-rl in CSS)
        // For vertical, use height as the "inline-size" for cqi calculation
        // and allow wrapping into new columns when needed (matches existing DOM behavior).
        const fontSize = calculateCqiFontSize(text, bounds.height, side);
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);

        // Create gradient AFTER transform so it's in the rotated coordinate space.
        // CSS uses a horizontal gradient (90deg = left-to-right in screen space).
        // After rotating 90deg clockwise:
        //   - Local +X maps to original +Y (down)
        //   - Local +Y maps to original -X (left)
        // To get a left-to-right gradient in original screen space, we need
        // the gradient to go from local +Y to local -Y (i.e., along local Y axis).
        const gradient = ctx.createLinearGradient(
            0, bounds.width / 2,    // maps to original left edge
            0, -bounds.width / 2    // maps to original right edge
        );
        if (selectedColor === 'white') {
            gradient.addColorStop(0, '#cac9c9');
            gradient.addColorStop(0.5, '#aeaeae');
            gradient.addColorStop(1, '#717171');
        } else {
            gradient.addColorStop(0, '#f5f4f4');
            gradient.addColorStop(0.5, '#aeaeae');
            gradient.addColorStop(1, '#717171');
        }
        ctx.fillStyle = gradient;

        // Multiline/wrapping behavior (match DOM more closely):
        // Instead of drawing per-character (which loses kerning and can look like "random gaps"),
        // we draw whole string runs per column using `fillText`, and wrap into new columns when
        // the measured width exceeds the available vertical space.
        //
        // In rotated coords (+90deg):
        // - text advances along +X, which maps to DOWN in the original canvas
        // - increasing Y maps to LEFT in the original canvas (new columns move left)
        const colAdvance = fontSize * 1.05; // distance between columns
        const maxRun = bounds.height;

        const columns = [];
        let current = '';

        const pushCurrent = () => {
            const trimmed = current.replace(/^\s+/, ''); // avoid leading spaces per column
            if (trimmed) columns.push(trimmed);
            current = '';
        };

        for (const ch of String(text)) {
            if (ch === '\n') {
                pushCurrent();
                continue;
            }

            // Skip leading whitespace in a new column
            if (!current && (ch === ' ' || ch === '\t')) continue;

            const next = current + ch;
            const w = ctx.measureText(next).width;
            if (current && w > maxRun) {
                pushCurrent();
                // don't start a column with whitespace
                if (ch === ' ' || ch === '\t') continue;
                current = ch;
            } else {
                current = next;
            }
        }
        pushCurrent();
        if (!columns.length) columns.push('');

        // Center columns within the available width.
        // Column 0 is the "first" column (rightmost in vertical-rl), subsequent columns go left.
        const colsWidth = (columns.length - 1) * colAdvance;
        const startY = -colsWidth / 2;

        columns.forEach((run, colIdx) => {
            const y = startY + colIdx * colAdvance;
            // With textAlign='center', x=0 centers the run within the available vertical space.
            ctx.fillText(run, 0, y);
        });
    } else {
        // Horizontal text: manual line breaks only; shrink-to-fit inside bounds.
        const fontSize = fitFontSizeHorizontal();
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        // Create gradient for horizontal text (in original coordinate space)
        const gradient = createMetallicGradient(ctx, bounds, selectedColor);
        ctx.fillStyle = gradient;

        const totalHeight = rawLines.length * fontSize * lineHeight;
        const firstLineY = centerY - (totalHeight / 2) + (fontSize * lineHeight) / 2;

        rawLines.forEach((line, idx) => {
            const y = firstLineY + idx * fontSize * lineHeight;
            ctx.fillText(line, centerX, y);
        });
    }

    ctx.restore();
};

/**
 * Parse CSS font size value and convert to pixels
 * Handles: em, cqi, px, and max/min expressions
 * 
 * @param {string} cssValue - CSS font size like "5em", "17cqi", "max(4px, min(50cqi, 17cqi))"
 * @param {number} boundsWidth - Width of container in pixels (for cqi calculation)
 * @param {number} baseFontSize - Base font size in pixels for em calculation
 * @returns {number} Font size in pixels
 */
const parseCssFontSize = (cssValue, boundsWidth, baseFontSize = BASE_FONT_SIZE) => {
    if (!cssValue) return baseFontSize;

    const str = String(cssValue).trim();

    // Handle simple em values like "5em", "2.2em"
    if (/^[\d.]+em$/i.test(str)) {
        const emValue = parseFloat(str);
        // In the actual DOM, `em` resolves against the inherited font-size (typically 16px).
        // Using a fixed baseFontSize here matches CSS behavior and avoids size drift vs preview.
        return emValue * baseFontSize;
    }

    // Handle simple cqi values like "17cqi"
    if (/^[\d.]+cqi$/i.test(str)) {
        const cqiValue = parseFloat(str);
        return (boundsWidth / 100) * cqiValue;
    }

    // Handle simple px values
    if (/^[\d.]+px$/i.test(str)) {
        return parseFloat(str) * RESOLUTION_SCALE;
    }

    // Handle max/min expressions like "max(4px, min(50cqi, 17cqi))"
    if (str.startsWith('max(') || str.startsWith('min(')) {
        // Extract numbers and units, evaluate expression
        // This is a simplified parser for common patterns
        const cqi = boundsWidth / 100;

        // Replace cqi values with calculated pixels
        let expr = str.replace(/([\d.]+)cqi/g, (_, num) => String(parseFloat(num) * cqi));
        // Replace px values with scaled pixels
        expr = expr.replace(/([\d.]+)px/g, (_, num) => String(parseFloat(num) * RESOLUTION_SCALE));
        // Replace em values with scaled pixels
        expr = expr.replace(/([\d.]+)em/g, (_, num) => String(parseFloat(num) * baseFontSize));

        // Evaluate max/min
        try {
            // Safe eval using Function constructor with only Math operations
            const evalExpr = expr
                .replace(/max/g, 'Math.max')
                .replace(/min/g, 'Math.min');
            return new Function('return ' + evalExpr)();
        } catch (e) {
            console.warn('Failed to parse CSS font size:', cssValue, e);
            return baseFontSize;
        }
    }

    // Fallback
    return (parseFloat(str) || 16) * RESOLUTION_SCALE;
};

/**
 * Draw monogram on canvas using proper sizing from getMonogramFontSize
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} monogramInput 
 * @param {string} selectedMonogram 
 * @param {object} bounds - {x, y, width, height}
 * @param {string} selectedColor 
 * @param {string} side - 'FRONT' or 'BACK'
 */
const drawMonogramOnCanvas = (ctx, monogramInput, selectedMonogram, bounds, selectedColor, side) => {
    if (!monogramInput || !shouldDisplayMonogram(selectedMonogram, monogramInput.length)) return;

    ctx.save();

    // Use metallic gradient instead of solid color
    const gradient = createMetallicGradient(ctx, bounds, selectedColor);
    ctx.fillStyle = gradient;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    let displayText = monogramInput;
    let fontFamily = 'sans-serif';
    let offsetX = 0;
    const monogramStyle = monogramStyles.find(m => m.name === selectedMonogram);

    // Get font size from monogramConfig (same as BottlePreview uses)
    // isMobile = false for capture mode
    const cssFontSize = getMonogramFontSize(selectedMonogram, side, monogramInput.length, false);
    const fontSize = parseCssFontSize(cssFontSize, bounds.width);

    if (usesCircleGlyphs(selectedMonogram)) {
        displayText = convertToCircleGlyphs(monogramInput, selectedMonogram);
        fontFamily = getCircleFontFamily(monogramInput.length);
    } else if (usesNGramGlyphs(selectedMonogram)) {
        displayText = convertToNGramGlyphs(monogramInput);
        fontFamily = getNGramFontFamily(monogramInput.length);
        // N-Gram monogram has a slight left offset in the UI (margin-left: .1em) on BACK only
        if (side === 'BACK') {
            offsetX = fontSize * 0.05;
        }
    } else if (monogramStyle) {
        fontFamily = monogramStyle.style?.fontFamily || 'sans-serif';
        // Handle maxLength === 1 monograms
        if (monogramStyle.maxLength === 1) {
            displayText = monogramInput.charAt(0);
        }
    }

    ctx.font = `normal normal ${fontSize}px ${fontFamily}`;

    // For middleLarger style (like Roman), draw with size variations
    if (monogramStyle?.middleLarger && monogramInput.length === 3) {
        const smallSize = fontSize * 0.75;
        const largeSize = fontSize;

        // Draw left character (smaller)
        ctx.font = `normal normal ${smallSize}px ${fontFamily}`;
        const leftMetrics = ctx.measureText(monogramInput[0]);

        // Draw middle character (larger)
        ctx.font = `normal normal ${largeSize}px ${fontFamily}`;
        const middleMetrics = ctx.measureText(monogramInput[1]);

        // Draw right character (smaller)
        ctx.font = `normal normal ${smallSize}px ${fontFamily}`;
        const rightMetrics = ctx.measureText(monogramInput[2]);

        const totalWidth = leftMetrics.width + middleMetrics.width + rightMetrics.width;
        let currentX = centerX - totalWidth / 2;

        // Draw each character
        ctx.font = `normal normal ${smallSize}px ${fontFamily}`;
        ctx.fillText(monogramInput[0], currentX + leftMetrics.width / 2, centerY);
        currentX += leftMetrics.width;

        ctx.font = `normal normal ${largeSize}px ${fontFamily}`;
        ctx.fillText(monogramInput[1], currentX + middleMetrics.width / 2, centerY);
        currentX += middleMetrics.width;

        ctx.font = `normal normal ${smallSize}px ${fontFamily}`;
        ctx.fillText(monogramInput[2], currentX + rightMetrics.width / 2, centerY);
    } else if (selectedMonogram === 'Vine') {
        // Vine monogram: apply letter-spacing manually (canvas doesn't support CSS letter-spacing)
        // From monogramConfig: letterSpacing: '.55em'
        // Note: CSS marginLeft (0.6em) compensates for letter-spacing's trailing space,
        // but our canvas implementation doesn't add trailing space, so we skip marginLeft.
        const letterSpacing = fontSize * 0.55; // Convert em to px

        // Measure total width including spacing (no trailing space after last char)
        let totalWidth = 0;
        const charWidths = [];
        for (let i = 0; i < displayText.length; i++) {
            const charWidth = ctx.measureText(displayText[i]).width;
            charWidths.push(charWidth);
            totalWidth += charWidth;
            if (i < displayText.length - 1) {
                totalWidth += letterSpacing;
            }
        }

        // Start position (centered)
        let currentX = centerX - totalWidth / 2;

        // Draw each character with spacing
        for (let i = 0; i < displayText.length; i++) {
            ctx.fillText(displayText[i], currentX + charWidths[i] / 2, centerY);
            currentX += charWidths[i] + letterSpacing;
        }
    } else {
        // Standard monogram drawing
        ctx.fillText(displayText, centerX + offsetX, centerY);
    }

    ctx.restore();
};

/**
 * Draw graphic on canvas with gradient masking for gallery SVGs
 */
const drawGraphicOnCanvas = async (ctx, graphic, bounds, selectedColor, maxPercent = 0.75) => {
    if (!graphic || !graphic.src) return;

    try {
        const maskSrc = graphic.isUpload ? graphic.maskSrc : graphic.src;
        const sourceSrc = maskSrc || graphic.src;
        const img = await loadImage(sourceSrc);

        const scale = graphic.scale || 0.5;
        const maxSize = Math.min(bounds.width, bounds.height) * maxPercent;

        // Calculate aspect-ratio-preserving dimensions
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight;

        if (imgAspect > 1) {
            drawWidth = maxSize * scale;
            drawHeight = drawWidth / imgAspect;
        } else {
            drawHeight = maxSize * scale;
            drawWidth = drawHeight * imgAspect;
        }

        const drawX = bounds.x + (bounds.width - drawWidth) / 2;
        const drawY = bounds.y + (bounds.height - drawHeight) / 2;

        ctx.save();

        const useMetalMask = !graphic.isUpload || !!graphic.maskSrc;

        // Match BottlePreview behavior
        if (useMetalMask) {
            // Metallic gradient with mask (gallery SVGs and uploads with mask)
            // Create a temporary canvas for the gradient + mask composition
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = drawWidth;
            tempCanvas.height = drawHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Step 1: Fill the temp canvas with metallic gradient
            const tempBounds = { x: 0, y: 0, width: drawWidth, height: drawHeight };
            const gradient = createMetallicGradient(tempCtx, tempBounds, selectedColor);
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(0, 0, drawWidth, drawHeight);

            // Step 2: Apply the graphic as a mask using destination-in
            tempCtx.globalCompositeOperation = 'destination-in';
            tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);

            // Step 3: Draw the masked gradient result onto the main canvas
            ctx.globalAlpha = 0.95;
            ctx.filter = 'contrast(1.1) brightness(1.1) drop-shadow(0px 1px 1px rgba(0,0,0,0.3))';
            ctx.drawImage(tempCanvas, drawX, drawY);
        } else {
            // Uploaded images without mask fallback to grayscale
            ctx.filter = 'grayscale(100%) contrast(1.2) brightness(1.2)';
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.9;
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }

        ctx.restore();
    } catch (err) {
        console.warn('Failed to load graphic for canvas capture:', err);
    }
};

// =============================================================================
// Main Capture Functions
// =============================================================================

/**
 * Capture bottle snapshot using canvas compositor
 * @param {string} side - 'FRONT' or 'BACK'
 * @param {object} customization - The customization state object
 * @param {string} selectedColor - The selected bottle color
 * @param {string} selectedFont - The selected font name
 * @param {string} selectedMonogram - The selected monogram style
 * @param {array} fonts - Array of font objects with name and style
 * @returns {Promise<string>} - PNG data URL
 */
export const captureBottleSnapshotCanvas = async (
    side,
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    fonts
) => {
    const canvas = document.createElement('canvas');
    canvas.width = BOTTLE_CANVAS_WIDTH;
    canvas.height = BOTTLE_CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    // 1. Draw bottle base image
    const bottleImagePath = side === 'FRONT'
        ? `bottle/front/${selectedColor}.webp`
        : `bottle/back/${selectedColor}back.webp`;

    try {
        const bottleImg = await loadImage(bottleImagePath);
        // Match the UI: <img className="w-full h-full object-contain" ... />
        drawImageContain(ctx, bottleImg, 0, 0, BOTTLE_CANVAS_WIDTH, BOTTLE_CANVAS_HEIGHT);
    } catch (err) {
        console.warn('Failed to load bottle image:', err);
        // Fill with a placeholder background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, BOTTLE_CANVAS_WIDTH, BOTTLE_CANVAS_HEIGHT);
    }

    // 2. Get customization for this side
    const config = customization[side];
    const textInput = config?.text || '';
    const monogramInput = config?.monogram || '';
    const graphicInput = config?.graphic || null;
    const isVertical = side === 'BACK' && config?.isVertical;

    // 3. Draw overlays - use mobile positions on iOS for accurate capture
    const isMobile = isIOSDevice();
    const positions = isMobile ? MOBILE_POSITIONS[side] : DESKTOP_POSITIONS[side];

    // Draw text
    if (textInput) {
        const textPos = isVertical ? positions.textVertical : positions.text;
        const textBounds = getPixelBounds(textPos, BOTTLE_CANVAS_WIDTH, BOTTLE_CANVAS_HEIGHT);
        const fontFamily = getFontFamily(selectedFont, fonts);
        const fontWeight = getFontWeight(selectedFont, fonts);
        const fontStyle = getFontStyle(selectedFont, fonts);
        drawTextOnCanvas(ctx, textInput, textBounds, fontFamily, fontWeight, fontStyle, selectedColor, side, isVertical);
    }

    // Draw monogram
    if (monogramInput) {
        const monogramBounds = getPixelBounds(positions.monogram, BOTTLE_CANVAS_WIDTH, BOTTLE_CANVAS_HEIGHT);
        drawMonogramOnCanvas(ctx, monogramInput, selectedMonogram, monogramBounds, selectedColor, side);
    }

    // Draw graphic
    if (graphicInput) {
        const sizeConfig = isMobile ? GRAPHIC_MAX_SIZE.test : GRAPHIC_MAX_SIZE.desktop;
        const maxPercent = sizeConfig[side];
        const graphicBounds = getPixelBounds(positions.graphic, BOTTLE_CANVAS_WIDTH, BOTTLE_CANVAS_HEIGHT);
        await drawGraphicOnCanvas(ctx, graphicInput, graphicBounds, selectedColor, maxPercent);
    }

    return canvas.toDataURL('image/png');
};

/**
 * Capture design-only snapshot (no bottle, just the design element)
 * @param {string} side - 'FRONT' or 'BACK'
 * @param {object} customization - The customization state object
 * @param {string} selectedColor - The selected bottle color
 * @param {string} selectedFont - The selected font name
 * @param {string} selectedMonogram - The selected monogram style
 * @param {array} fonts - Array of font objects with name and style
 * @returns {Promise<string|null>} - PNG data URL or null if no content
 */
export const captureDesignSnapshotCanvas = async (
    side,
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    fonts
) => {
    const config = customization[side];
    const textInput = config?.text || '';
    const monogramInput = config?.monogram || '';
    const graphicInput = config?.graphic || null;

    // Return null if no content
    if (!textInput && !monogramInput && !graphicInput) {
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = DESIGN_CANVAS_SIZE;
    canvas.height = DESIGN_CANVAS_SIZE;
    const ctx = canvas.getContext('2d');

    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    // Transparent background (default)
    ctx.clearRect(0, 0, DESIGN_CANVAS_SIZE, DESIGN_CANVAS_SIZE);

    // Design bounds fill the canvas with some padding
    const padding = 20 * RESOLUTION_SCALE;
    const bounds = {
        x: padding,
        y: padding,
        width: DESIGN_CANVAS_SIZE - padding * 2,
        height: DESIGN_CANVAS_SIZE - padding * 2
    };

    const isVertical = side === 'BACK' && config?.isVertical;

    // Draw text - use 'white' bottle color for dark gradient
    if (textInput) {
        const fontFamily = getFontFamily(selectedFont, fonts);
        const fontWeight = getFontWeight(selectedFont, fonts);
        const fontStyle = getFontStyle(selectedFont, fonts);
        drawTextOnCanvas(ctx, textInput, bounds, fontFamily, fontWeight, fontStyle, 'white', side, isVertical);
    }

    // Draw monogram
    if (monogramInput && shouldDisplayMonogram(selectedMonogram, monogramInput.length)) {
        // For design capture, we use a fixed dark color
        drawMonogramOnCanvas(ctx, monogramInput, selectedMonogram, bounds, 'white', side); // 'white' bottle gives dark text
    }

    // Draw graphic
    if (graphicInput) {
        await drawGraphicOnCanvas(ctx, graphicInput, bounds, 'white');
    }

    return canvas.toDataURL('image/png');
};
