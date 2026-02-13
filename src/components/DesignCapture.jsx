import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';
import { getMetallicGradientCSS, cssUrl } from '../utils/metallicStyle';

const DesignCapture = ({
    side, // 'FRONT' or 'BACK'
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    fonts,
    monogramScale = 1 // Scale factor for monogram font size (< 1 to shrink for capture)
}) => {
    const config = customization[side];
    const textInput = config.text;
    const monogramInput = config.monogram;
    const graphicInput = config.graphic;
    const monogramCaptureFontSize = `${Math.round(180 * monogramScale)}px`;
    const metallicGradient = getMetallicGradientCSS(selectedColor);
    const graphicMaskSrc = graphicInput
        ? (graphicInput.isUpload ? graphicInput.maskSrc : graphicInput.src)
        : null;

    const textBoxRef = useRef(null);
    const textMeasureRef = useRef(null);
    const [textBoxSize, setTextBoxSize] = useState({ width: 0, height: 0 });
    const [fittedFontSizePx, setFittedFontSizePx] = useState(null);
    const [fontReadyTick, setFontReadyTick] = useState(0);

    const fontStyleObj = fonts.find(f => f.name === selectedFont)?.style || {};
    const fontFamily = fontStyleObj.fontFamily || 'sans-serif';
    const fontWeight = fontStyleObj.fontWeight || 'normal';
    const fontStyle = fontStyleObj.fontStyle || 'normal';

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
    }, [side, config?.isVertical]);

    const maxFontSizePx = useMemo(() => 72, []);

    useLayoutEffect(() => {
        const isVerticalText = side === 'BACK' && config?.isVertical;
        if (!textInput || isVerticalText) {
            setFittedFontSizePx(null);
            return;
        }
        if (!textBoxSize.width || !textBoxSize.height) return;

        // Account for the fixed padding: 10px on each side
        const availableWidth = Math.max(0, textBoxSize.width - 20);
        const availableHeight = Math.max(0, textBoxSize.height - 20);

        const measureEl = textMeasureRef.current;
        if (!measureEl) return;

        const safety = 0.92;
        const targetW = availableWidth * safety;
        const targetH = availableHeight * safety;

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

        // Extra global shrink factor to avoid edge clipping on narrow devices/fonts.
        const extraShrinkFactor = 0.9;
        const finalSize = Math.max(1, best * extraShrinkFactor);
        setFittedFontSizePx(prev => (prev && Math.abs(prev - finalSize) < 0.05 ? prev : finalSize));
    }, [textInput, side, config?.isVertical, textBoxSize.width, textBoxSize.height, maxFontSizePx, fontReadyTick]);

    // Fixed container size for standardized capture
    const containerStyle = {
        width: '300px',
        height: '300px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    };

    return (
        <div style={containerStyle}>
            {/* Text Overlay */}
            {textInput && (
                <div
                    ref={textBoxRef}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '10px',
                        boxSizing: 'border-box',
                        writingMode: (side === 'BACK' && config.isVertical) ? 'vertical-rl' : undefined,
                    }}
                >
                    {/* Hidden measurement element (horizontal only) */}
                    {!(side === 'BACK' && config.isVertical) && (
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
                        style={{
                            ...fonts.find(f => f.name === selectedFont)?.style,
                            // Use black for capture unless explicitly white on dark bg, but here we want it visible on white cart background?
                            // Actually, the user screenshot shows distinct designs.
                            // If the design is white text, it won't show on white cart background.
                            // However, Yeti usually renders the design in black for preview if it's white?
                            // Or maybe we should keep the color true to the design.
                            // If selectedColor is 'black' (bottle color), text is 'text-white'.
                            // If selectedColor is 'white' (bottle color), text is 'text-black'.
                            // Let's stick to true colors but inverted for visibility if needed?
                            // Screenshot shows black monogram and graphic.
                            // Let's assume we render "as is" but maybe enforce black if the text is white/light,
                            // OR render a background color.
                            // BUT the user asked for "text used on the bottle".
                            // If I have a black bottle, text is white. White text on white cart background is invisible.
                            // Solution: Always render in BLACK for the cart preview, unless we pass a specific color.
                            // Let's hardcode color to '#000000' for visibility in cart, or '#333333'.
                            color: '#333333',
                            fontSize: (side === 'BACK' && config.isVertical)
                                ? `max(16px, min(${100 / Math.max(1, textInput.length)}cqi, 72px))`
                                : (fittedFontSizePx ? `${fittedFontSizePx}px` : `max(16px, min(${100 / Math.max(1, textInput.length)}cqi, 72px))`),
                            letterSpacing: '0.5px',
                            ...(side === 'BACK' && config.isVertical
                                ? { wordBreak: 'break-word', whiteSpace: 'pre-wrap' }
                                : { wordBreak: 'normal', overflowWrap: 'normal', whiteSpace: 'pre' }),
                            lineHeight: 1.2,
                            fontVariantEmoji: 'text',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            textRendering: 'geometricPrecision',
                            display: 'block',
                            width: '100%',
                            containerType: 'inline-size',
                        }}
                    >
                        {textInput}
                    </span>
                </div>
            )}

            {/* Graphic Overlay */}
            {graphicInput && (
                <div
                    style={{
                        width: '80%',
                        height: '80%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {graphicMaskSrc ? (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                maskImage: cssUrl(graphicMaskSrc),
                                WebkitMaskImage: cssUrl(graphicMaskSrc),
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                background: metallicGradient,
                                filter: 'contrast(1.1) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                opacity: 0.95,
                            }}
                        />
                    ) : (
                        <img
                            src={graphicInput.src}
                            alt={graphicInput.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'grayscale(100%) contrast(1.2) brightness(1.2)',
                            }}
                        />
                    )}
                </div>
            )}

            {/* Monogram Overlay */}
            {monogramInput && shouldDisplayMonogram(selectedMonogram, monogramInput.length) && (
                <div
                    style={{
                        width: '80%',
                        height: '80%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {usesCircleGlyphs(selectedMonogram) ? (
                        <span
                            style={{
                                fontFamily: getCircleFontFamily(monogramInput.length),
                                color: '#333333',
                                fontSize: monogramCaptureFontSize, // Scaled capture size
                                lineHeight: 1,
                            }}
                        >
                            {convertToCircleGlyphs(monogramInput, selectedMonogram)}
                        </span>
                    ) : usesNGramGlyphs(selectedMonogram) ? (
                        <span
                            style={{
                                ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                fontFamily: getNGramFontFamily(monogramInput.length),
                                color: '#333333',
                                fontSize: monogramCaptureFontSize,
                                lineHeight: 1,
                            }}
                        >
                            {convertToNGramGlyphs(monogramInput)}
                        </span>
                    ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                        <span
                            style={{
                                ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                color: '#333333',
                                fontSize: monogramCaptureFontSize,
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ fontSize: '0.75em' }}>{monogramInput[0]}</span>
                            <span style={{ fontSize: '1em' }}>{monogramInput[1]}</span>
                            <span style={{ fontSize: '0.75em' }}>{monogramInput[2]}</span>
                        </span>
                    ) : (
                        <span
                            style={{
                                ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                color: '#333333',
                                fontSize: monogramCaptureFontSize,
                                lineHeight: 1,
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
        </div>
    );
};

export default DesignCapture;
