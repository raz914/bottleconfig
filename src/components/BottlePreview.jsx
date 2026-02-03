import React, { useState, useEffect } from 'react';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';
import { DESKTOP_POSITIONS, MOBILE_POSITIONS, GRAPHIC_MAX_SIZE } from '../data/capturePositions';

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
    view // 'main', 'text', 'monogram', 'capture' etc.
}) => {

    const isCapture = view === 'capture';
    const isVertical = side === 'BACK' && customization.BACK?.isVertical;

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
            text: "top-[27.3%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[62%] md:bottom-[62%]",
            monogram: "top-[25.2%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[60%] md:bottom-[61%]",
            graphic: "top-[26%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[61%] md:bottom-[62%]",
            boundary: "top-[29%] md:top-[32.5%] left-[35%] md:left-[35%] right-[34%] md:right-[34%] bottom-[63%] md:bottom-[61%]",
            zoom: "scale-[2.1] translate-y-[20%] md:scale-[2] md:translate-y-[5%]"
        },
        BACK: {
            text: (side === 'BACK' && customization.BACK?.isVertical)
                ? "top-[38%] md:top-[40%] left-[38%] md:left-[36%] right-[38%] md:right-[36%] bottom-[25%] md:bottom-[25%]" // Vertical text: Taller box
                : "top-[38%] md:top-[39%] left-[38%] md:left-[36%] right-[38%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            monogram: "top-[37%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            graphic: "top-[33%] md:top-[33%] left-[20%] md:left-[36%] right-[20%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            boundary: (side === 'BACK' && customization.BACK?.isVertical)
                ? "top-[38%] md:top-[39%] left-[36%] md:left-[35.5%] right-[36%] md:right-[36%] bottom-[21%] md:bottom-[25%]"
                : "top-[39.5%] md:top-[40.5%] left-[36%] md:left-[35.5%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            zoom: "scale-[1.5] translate-y-[10%] md:scale-[2] md:translate-y-[5%]"
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
        : `relative mb-4 md:mb-12 transition-transform duration-300 ease-in-out w-[200px] h-[280px] md:w-[300px] md:h-[500px] ${view && view !== 'main' ? currentConfig.zoom : ''}`;

    // Graphic size - uses shared config from capturePositions.js
    const sizeConfig = isMobile ? GRAPHIC_MAX_SIZE.mobile : GRAPHIC_MAX_SIZE.desktop;
    const graphicMaxSize = `${sizeConfig[side] * 100}%`;
    const metallicGradient = selectedColor === 'white'
        ? 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)'
        : 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)';
    const metalMaskSrc = (graphicInput && (!graphicInput.isUpload || graphicInput.maskSrc)) ? loadedGraphicSrc : null;

    return (
        <div className="flex flex-col items-center">
            <div className={containerClass} style={containerStyle}>
                <img
                    src={`bottle/${side === 'FRONT' ? 'front' : 'back'}/${selectedColor}${side === 'BACK' ? 'back' : ''}.webp`}
                    alt={`Yeti Bottle ${side}`}
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
                        className={`${getPositionClass('text')} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{
                            containerType: 'inline-size',
                            ...getPositionStyle('text'),
                            writingMode: (side === 'BACK' && config.isVertical) ? 'vertical-rl' : undefined,
                        }}
                    >
                        <span
                            className="text-center block overflow-hidden"
                            style={{
                                ...fonts.find(f => f.name === selectedFont)?.style,
                                fontSize: side === 'FRONT'
                                    ? `max(4px, min(${100 / Math.max(1, textInput.length)}cqi, 18cqi))`
                                    : `max(8px, min(${100 / Math.max(1, textInput.length)}cqi, 34cqi))`,
                                letterSpacing: '0.5px',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.2,
                                fontVariantEmoji: 'text',
                                verticalAlign: 'middle',
                                textRendering: 'geometricPrecision',
                                ...(side === 'FRONT' && {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                }),
                                // Silver Gradient Style
                                ...(selectedColor === 'white' ? {
                                    background: 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'contrast(1.1) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                    WebkitTextFillColor: 'transparent',
                                } : {
                                    background: 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                    filter: 'contrast(1.1) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                    WebkitTextFillColor: 'transparent',
                                })
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
                                            maskImage: `url(${metalMaskSrc})`,
                                            WebkitMaskImage: `url(${metalMaskSrc})`,
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskPosition: 'center',
                                            WebkitMaskPosition: 'center',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            background: metallicGradient,
                                            filter: 'contrast(1.1) brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                                            opacity: 0.95,
                                            maxHeight: graphicMaxSize,
                                            maxWidth: graphicMaxSize
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={graphicInput.src}
                                        alt={graphicInput.name || 'Uploaded image'}
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
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: 1.4,
                                    ...(selectedColor === 'white' ? {
                                        background: 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    } : {
                                        background: 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    })
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
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: 1.4,
                                    ...(selectedColor === 'white' ? {
                                        background: 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    } : {
                                        background: 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    })
                                }}
                            >
                                {convertToNGramGlyphs(monogramInput)}
                            </span>
                        ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    lineHeight: 1.4,
                                    ...(selectedColor === 'white' ? {
                                        background: 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    } : {
                                        background: 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    })
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
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: selectedMonogram === 'Vine' ? 2.4 : 1.4,
                                    // Override Vine's marginLeft and use symmetric padding instead for centering
                                    marginLeft: selectedMonogram === 'Vine' ? 0 : undefined,
                                    paddingLeft: selectedMonogram === 'Vine' ? '0.6em' : undefined,
                                    paddingTop: selectedMonogram === 'Vine' ? '0.3em' : undefined,
                                    paddingBottom: selectedMonogram === 'Vine' ? '0.3em' : undefined,
                                    ...(selectedColor === 'white' ? {
                                        background: 'linear-gradient(90deg, #b8b7b7ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    } : {
                                        background: 'linear-gradient(90deg, #e6e5e5ff 0%, #9e9e9e 50%, #656565 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        WebkitTextFillColor: 'transparent',
                                    })
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
