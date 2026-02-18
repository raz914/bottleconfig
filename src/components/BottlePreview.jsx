import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';
import { DESKTOP_POSITIONS, MOBILE_POSITIONS, GRAPHIC_MAX_SIZE } from '../data/capturePositions';
import { getMetallicGradientCSS, getMetallicTextFilterCSS, getMetallicBlendMode, cssUrl } from '../utils/metallicStyle';
import { t } from '../i18n';

const BottlePreview = ({
    side, // 'FRONT' or 'BACK'
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    fonts,
    isMobile,
    isImageLoading,
    setIsImageLoading,
    view, // 'main', 'text', 'monogram', 'capture' etc.
    monogramScale = 1 // Scale factor for monogram font size (< 1 to shrink for capture)
}) => {

    const isCapture = view === 'capture';
    const isVertical = side === 'BACK' && customization.BACK?.isVertical;

    // Helper to apply monogramScale to CSS font-size strings (e.g. '5em' -> '4em' with scale 0.8)
    const scaleMonogramSize = (cssSize) => {
        if (monogramScale === 1 || !cssSize) return cssSize;
        // Simple em/px values like '5em' or '180px'
        const match = cssSize.match(/^([\d.]+)(em|px|rem|cqi)$/i);
        if (match) {
            return `${(parseFloat(match[1]) * monogramScale).toFixed(2)}${match[2]}`;
        }
        // For complex expressions like max(...), wrap with calc and scale
        return `calc(${cssSize} * ${monogramScale})`;
    };

    // Helper to get position with vertical text handling
    const getPositions = (positionsObj) => {
        const sidePos = positionsObj[side];
        return {
            ...sidePos,
            text: isVertical && sidePos.textVertical ? sidePos.textVertical : sidePos.text,
            boundary: isVertical && sidePos.boundaryVertical ? sidePos.boundaryVertical : sidePos.boundary,
        };
    };

    // Tailwind classes for responsive mode (normal viewing)
    const SIDE_CONFIG = {
        FRONT: {
            text: "top-[30%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[62%] md:bottom-[62%]",
            monogram: "top-[25.2%] md:top-[29%] left-[33%] md:left-[33%] right-[33%] md:right-[33%] bottom-[57%] md:bottom-[58%]",
            graphic: "top-[26%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[61%] md:bottom-[62%]",
            boundary: "top-[31%] md:top-[32.5%] left-[35%] md:left-[35%] right-[34%] md:right-[34%] bottom-[63%] md:bottom-[61%]",
            zoom: "scale-[1.7] translate-y-[25%] md:scale-[2.5] md:translate-y-[25%]"
        },
        BACK: {
            text: (side === 'BACK' && customization.BACK?.isVertical)
                ? "top-[38%] md:top-[40%] left-[38%] md:left-[36%] right-[38%] md:right-[36%] bottom-[25%] md:bottom-[25%]" // Vertical text: Taller box
                : "top-[38%] md:top-[39%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            monogram: "top-[30%] md:top-[28%] left-[26%] md:left-[26%] right-[26%] md:right-[26%] bottom-[24%] md:bottom-[26%]",
            graphic: "top-[33%] md:top-[33%] left-[20%] md:left-[36%] right-[20%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            boundary: (side === 'BACK' && customization.BACK?.isVertical)
                ? "top-[38%] md:top-[39%] left-[36%] md:left-[35.5%] right-[36%] md:right-[36%] bottom-[21%] md:bottom-[25%]"
                : "top-[39.5%] md:top-[40.5%] left-[36%] md:left-[35.5%] right-[36%] md:right-[35%] bottom-[31%] md:bottom-[31%]",
            zoom: "scale-[1.4] translate-y-[1%] md:scale-[2.5] md:translate-y-[-4%]"
        }
    };

    const currentConfig = SIDE_CONFIG[side];
    // Use mobile positions for capture mode on mobile devices
    const capturePos = (isCapture && isMobile) ? getPositions(MOBILE_POSITIONS) : getPositions(DESKTOP_POSITIONS);
    const config = customization[side];
    const textInput = config.text;
    const monogramInput = config.monogram;
    const graphicInput = config.graphic;
    const graphicRenderSrc = graphicInput?.isUpload
        ? (graphicInput.maskSrc || graphicInput.src)
        : graphicInput?.src;

    // Graphic loading state
    const [isGraphicLoading, setIsGraphicLoading] = useState(false);
    const [loadedGraphicSrc, setLoadedGraphicSrc] = useState(null);

    // Preload graphic when it changes
    useEffect(() => {
        if (graphicRenderSrc) {
            // Don't show loader for capture mode
            if (isCapture) {
                setLoadedGraphicSrc(graphicRenderSrc);
                return;
            }

            // Check if it's the same image already loaded
            if (graphicRenderSrc === loadedGraphicSrc) {
                return;
            }

            setIsGraphicLoading(true);
            const img = new Image();
            img.onload = () => {
                setLoadedGraphicSrc(graphicRenderSrc);
                setIsGraphicLoading(false);
            };
            img.onerror = () => {
                setLoadedGraphicSrc(graphicRenderSrc);
                setIsGraphicLoading(false);
            };
            img.src = graphicRenderSrc;
        } else {
            setLoadedGraphicSrc(null);
            setIsGraphicLoading(false);
        }
    }, [graphicRenderSrc, isCapture]);

    const handleImageLoad = () => {
        if (setIsImageLoading) setIsImageLoading(false);
    };

    const handleImageError = (e) => {
        console.warn("Image load error", e.target.src);
        if (setIsImageLoading) setIsImageLoading(false);
    };

    // Helper to get positioning style (inline for capture, classes for responsive)
    const getPositionStyle = (type) => {
        if (isCapture) {
            return { position: 'absolute', ...capturePos[type] };
        }
        return {}; // Use className instead
    };

    const getPositionClass = (type) => {
        if (isCapture) return 'absolute'; // Only base class, style handles positioning
        return `absolute ${currentConfig[type]}`;
    };

    // Container dimensions
    const containerStyle = isCapture ? {
        width: '300px',
        height: '500px',
        transform: 'none',
        marginBottom: 0,
        position: 'relative'
    } : {};

    const containerClass = isCapture
        ? ''
        : `relative mb-4 md:mb-2 transition-transform duration-300 ease-in-out w-[240px] h-[360px] md:w-[420px] md:h-[700px] ${view && view !== 'main' ? currentConfig.zoom : ''}`;

    // Graphic size - uses shared config from capturePositions.js
    const sizeConfig = isMobile ? GRAPHIC_MAX_SIZE.mobile : GRAPHIC_MAX_SIZE.desktop;
    const graphicMaxSize = `${sizeConfig[side] * 100}%`;
    const metallicGradient = getMetallicGradientCSS(selectedColor);
    const metallicTextFilter = getMetallicTextFilterCSS(selectedColor);
    const metalMaskSrc = (graphicInput && (!graphicInput.isUpload || graphicInput.maskSrc)) ? loadedGraphicSrc : null;

    // =========================================================================
    // Text sizing: horizontal text should never wrap; it shrinks to fit bounds.
    // =========================================================================
    const textBoxRef = useRef(null);
    const textMeasureRef = useRef(null);
    const [textBoxSize, setTextBoxSize] = useState({ width: 0, height: 0 });
    const [fittedFontSizePx, setFittedFontSizePx] = useState(null);
    const [fontReadyTick, setFontReadyTick] = useState(0);

    const fontStyleObj = fonts.find(f => f.name === selectedFont)?.style || {};
    const fontFamily = fontStyleObj.fontFamily || 'sans-serif';
    const fontWeight = fontStyleObj.fontWeight || 'normal';
    const fontStyle = fontStyleObj.fontStyle || 'normal';

    // When the font finishes loading, re-run fitting.
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                if (document?.fonts?.load) {
                    await document.fonts.load(`16px ${fontFamily}`);
                }
                if (document?.fonts?.ready) {
                    await document.fonts.ready;
                }
            } finally {
                if (!cancelled) setFontReadyTick(t => t + 1);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [fontFamily]);

    // Observe the text box size (works for both normal view + capture view)
    // IMPORTANT: use offsetWidth/offsetHeight, NOT getBoundingClientRect().
    // The container has a CSS scale transform (zoom) when in text view, so
    // getBoundingClientRect returns screen-scaled dimensions, but CSS fontSize
    // operates in the element's own (unscaled) coordinate space.
    useLayoutEffect(() => {
        const el = textBoxRef.current;
        if (!el) return;

        const update = () => {
            setTextBoxSize({ width: el.offsetWidth || 0, height: el.offsetHeight || 0 });
        };

        update();

        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(update);
            ro.observe(el);
        }

        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('resize', update);
            if (ro) ro.disconnect();
        };
    }, [side, isCapture, isMobile, selectedColor, config?.isVertical, !!textInput]);

    const maxFontSizePx = useMemo(() => {
        if (!textBoxSize.width) return null;
        return Math.max(1, (side === 'FRONT' ? 0.12 : 0.54) * textBoxSize.width);
    }, [textBoxSize.width, side]);

    // Uniform vertical text scale — applied to the cqi-based size so all
    // character counts shrink consistently without abrupt jumps.
    const VERTICAL_SCALE = 0.5;

    const verticalFittedFontSizePx = useMemo(() => {
        const isVerticalText = side === 'BACK' && config?.isVertical;
        if (!isVerticalText || !textInput || !textBoxSize.height) return null;

        const cqi = textBoxSize.height / 100;
        const len = Math.max(1, textInput.length);
        const cqiBasedSize = Math.max(8, Math.min((150 / len) * cqi, 54 * cqi));

        return Math.max(8, cqiBasedSize * VERTICAL_SCALE);
    }, [side, config?.isVertical, textInput, textBoxSize.height]);

    // Fit based on actual DOM measurements (most accurate across fonts/devices).
    useLayoutEffect(() => {
        const isVerticalText = side === 'BACK' && config?.isVertical;
        if (!textInput || isVerticalText) {
            setFittedFontSizePx(null);
            return;
        }
        if (!maxFontSizePx || !textBoxSize.width || !textBoxSize.height) return;

        const boxW = textBoxSize.width;
        const boxH = textBoxSize.height;
        const measureEl = textMeasureRef.current;
        if (!measureEl) return;

        const safety = isMobile ? 0.91 : 0.92;
        const targetW = boxW * safety;
        const targetH = boxH * safety;

        const fits = (sizePx) => {
            measureEl.style.fontSize = `${sizePx}px`;
            const w = measureEl.offsetWidth || 0;
            const h = measureEl.offsetHeight || 0;
            return w <= targetW && h <= targetH;
        };

        let lo = 1;
        let hi = maxFontSizePx;
        let best = 1;

        for (let i = 0; i < 16; i++) {
            const mid = (lo + hi) / 2;
            if (fits(mid)) {
                best = mid;
                lo = mid;
            } else {
                hi = mid;
            }
        }

        // Extra shrink on mobile + zoomed editing view to absorb subpixel clipping.
        const extraShrinkFactor = isMobile ? 0.92 : 0.9;
        const zoomPenalty = (!isCapture && !isMobile && view && view !== 'main') ? 0.95 : 1;
        const finalSize = Math.max(1, best * extraShrinkFactor * zoomPenalty);
        setFittedFontSizePx(prev => (prev && Math.abs(prev - finalSize) < 0.05 ? prev : finalSize));
    }, [textInput, side, config?.isVertical, maxFontSizePx, textBoxSize.width, textBoxSize.height, fontReadyTick, isMobile, isCapture, view]);

    return (
        <div className="flex flex-col items-center">
            <div className={containerClass} style={containerStyle}>
                <img
                    src={`bottle/${side === 'FRONT' ? 'front' : 'back'}/${selectedColor}${side === 'BACK' ? 'back' : ''}.webp`}
                    alt={t('bottlePreview.alt', { side })}
                    loading="eager"
                    className={`w-full h-full object-contain mix-blend-multiply drop-shadow-2xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />

                {/* Loading Spinner */}
                {isImageLoading && !isCapture && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#002C5F] rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Text Overlay */}
                {textInput && (
                    <div
                        key={`text-${selectedColor}`}
                        ref={textBoxRef}
                        className={`${getPositionClass('text')} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{
                            containerType: 'inline-size',
                            ...getPositionStyle('text'),
                            writingMode: (side === 'BACK' && config.isVertical) ? 'vertical-rl' : undefined,
                            textOrientation: (side === 'BACK' && config.isVertical) ? 'sideways' : undefined,
                            glyphOrientationVertical: (side === 'BACK' && config.isVertical) ? '90deg' : undefined,
                        }}
                    >
                        {/* Hidden measurement element (horizontal only) */}
                        {!(side === 'BACK' && config.isVertical) && maxFontSizePx && (
                            <span
                                ref={textMeasureRef}
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    left: -99999,
                                    top: -99999,
                                    visibility: 'hidden',
                                    pointerEvents: 'none',
                                    ...fonts.find(f => f.name === selectedFont)?.style,
                                    fontSize: `${maxFontSizePx}px`,
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'pre',
                                    wordBreak: 'normal',
                                    overflowWrap: 'normal',
                                    lineHeight: 1.2,
                                    display: 'inline-block',
                                }}
                            >
                                {textInput}
                            </span>
                        )}
                        <span
                            className="text-center block"
                            style={{
                                ...fonts.find(f => f.name === selectedFont)?.style,
                                // Horizontal: never wrap; shrink-to-fit inside the boundary.
                                // Vertical: cqi-based sizing with centered column block.
                                fontSize: (side === 'BACK' && config.isVertical)
                                    ? (verticalFittedFontSizePx
                                        ? `${verticalFittedFontSizePx}px`
                                        : `max(8px, min(${150 / Math.max(1, textInput.length)}cqi, 54cqi))`)
                                    : (fittedFontSizePx ? `${fittedFontSizePx}px` : (side === 'FRONT'
                                        ? `max(4px, min(${100 / Math.max(1, textInput.length)}cqi, 18cqi))`
                                        : `max(8px, min(${150 / Math.max(1, textInput.length)}cqi, 54cqi))`)),
                                letterSpacing: '0.5px',
                                // No auto line breaks — new columns only from explicit Enter.
                                wordBreak: 'normal',
                                overflowWrap: 'normal',
                                whiteSpace: 'pre',
                                lineHeight: 1.2,
                                fontVariantEmoji: 'text',
                                verticalAlign: 'middle',
                                textRendering: 'geometricPrecision',
                                boxSizing: 'border-box',
                                // Vertical: let the span shrink-wrap its columns so the
                                // flex parent can center it; use full height for inline flow.
                                // Horizontal: full width so text fills the boundary.
                                width: (side === 'BACK' && config.isVertical) ? 'fit-content' : '100%',
                                height: (side === 'BACK' && config.isVertical) ? '100%' : undefined,
                                maxWidth: '100%',
                                display: (side === 'BACK' && config.isVertical) ? 'inline-block' : 'block',
                                marginInline: (side === 'BACK' && config.isVertical) ? 'auto' : undefined,
                                // Silver Gradient Style
                                background: metallicGradient,
                                backgroundBlendMode: getMetallicBlendMode(),
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                filter: metallicTextFilter,
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {textInput}
                        </span>
                    </div>
                )}

                {/* Graphic Overlay */}
                {graphicInput && (
                    <div
                        key={`graphic-${selectedColor}-${loadedGraphicSrc}`}
                        className={`${getPositionClass('graphic')} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{
                            containerType: 'inline-size',
                            transform: graphicInput.scale ? `scale(${graphicInput.scale})` : 'none',
                            transformOrigin: 'center center',
                            ...getPositionStyle('graphic')
                        }}
                    >
                        {/* Loading Spinner for Graphics */}
                        {isGraphicLoading && !isCapture && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#002C5F] rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Only show graphic when loaded */}
                        {loadedGraphicSrc && !isGraphicLoading && (
                            <>
                                {/* Uploaded images use metallic mask when available */}
                                {metalMaskSrc ? (
                                    <div
                                        className="w-full h-full transition-opacity duration-200"
                                        style={{
                                            maskImage: cssUrl(metalMaskSrc),
                                            WebkitMaskImage: cssUrl(metalMaskSrc),
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskPosition: 'center',
                                            WebkitMaskPosition: 'center',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            background: metallicGradient,
                                            backgroundBlendMode: getMetallicBlendMode(),
                                            filter: 'contrast(1.1) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                            opacity: 0.95,
                                            maxHeight: graphicMaxSize,
                                            maxWidth: graphicMaxSize
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={graphicInput.src}
                                        alt={graphicInput.name || t('bottlePreview.uploadedImageAlt')}
                                        className="w-full h-full object-contain transition-opacity duration-200"
                                        style={{
                                            filter: 'grayscale(100%) contrast(1.2) brightness(1.2)',
                                            maxHeight: graphicMaxSize,
                                            maxWidth: graphicMaxSize
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Monogram Overlay */}
                {monogramInput && shouldDisplayMonogram(selectedMonogram, monogramInput.length) && (
                    <div
                        key={`monogram-${selectedColor}-${selectedMonogram}`}
                        className={`${getPositionClass('monogram')} flex items-center justify-center z-20 pointer-events-none`}
                        style={{ containerType: 'inline-size', ...getPositionStyle('monogram') }}
                    >
                        {usesCircleGlyphs(selectedMonogram) ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    fontFamily: getCircleFontFamily(monogramInput.length),
                                    fontSize: scaleMonogramSize(getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile)),
                                    lineHeight: 1.4,
                                    background: metallicGradient,
                                    backgroundBlendMode: getMetallicBlendMode(),
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {convertToCircleGlyphs(monogramInput, selectedMonogram)}
                            </span>
                        ) : usesNGramGlyphs(selectedMonogram) ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    fontFamily: getNGramFontFamily(monogramInput.length),
                                    fontSize: scaleMonogramSize(getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile)),
                                    lineHeight: 1.4,
                                    background: metallicGradient,
                                    backgroundBlendMode: getMetallicBlendMode(),
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {convertToNGramGlyphs(monogramInput)}
                            </span>
                        ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    fontSize: scaleMonogramSize(getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile)),
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    lineHeight: 1.4,
                                    background: metallicGradient,
                                    backgroundBlendMode: getMetallicBlendMode(),
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                <span style={{ fontSize: isMobile && side === 'FRONT' ? '0.2em' : '0.75em' }}>{monogramInput[0]}</span>
                                <span style={{ fontSize: isMobile && side === 'FRONT' ? '1.3em' : '1em' }}>{monogramInput[1]}</span>
                                <span style={{ fontSize: isMobile && side === 'FRONT' ? '0.2em' : '0.75em' }}>{monogramInput[2]}</span>
                            </span>
                        ) : (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    fontSize: scaleMonogramSize(getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile)),
                                    lineHeight: selectedMonogram === 'Vine' ? 2.4 : 1.4,
                                    // Override Vine's marginLeft and use symmetric padding instead for centering
                                    marginLeft: selectedMonogram === 'Vine' ? 0 : undefined,
                                    paddingLeft: selectedMonogram === 'Vine' ? '0.6em' : undefined,
                                    paddingTop: selectedMonogram === 'Vine' ? '0.3em' : undefined,
                                    paddingBottom: selectedMonogram === 'Vine' ? '0.3em' : undefined,
                                    background: metallicGradient,
                                    backgroundBlendMode: getMetallicBlendMode(),
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {monogramStyles.find(m => m.name === selectedMonogram)?.maxLength === 1
                                    ? monogramInput.charAt(0)
                                    : monogramInput
                                }
                            </span>
                        )}
                    </div>
                )}

                {/* Dashed Box Overlay - only for non-capture editing views */}
                {view && view !== 'main' && !isCapture && (
                    <div className={`absolute ${currentConfig.boundary} border border-dashed border-gray-400/60 rounded-sm pointer-events-none transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}></div>
                )}
            </div>
        </div>
    );
};

export default BottlePreview;
