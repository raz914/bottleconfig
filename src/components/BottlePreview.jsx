import React from 'react';
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
            zoom: "scale-[1.5] translate-y-[3%] md:scale-[2] md:translate-y-[5%]"
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
            zoom: "scale-[1.5] translate-y-[2%] md:scale-[2] md:translate-y-[5%]"
        }
    };

    const currentConfig = SIDE_CONFIG[side];
    // Use mobile positions for capture mode on mobile devices
    const capturePos = (isCapture && isMobile) ? getPositions(MOBILE_POSITIONS) : getPositions(DESKTOP_POSITIONS);
    const config = customization[side];
    const textInput = config.text;
    const monogramInput = config.monogram;
    const graphicInput = config.graphic;

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
                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                fontSize: side === 'FRONT'
                                    ? `max(4px, min(${100 / Math.max(1, textInput.length)}cqi, 18cqi))`
                                    : `max(8px, min(${100 / Math.max(1, textInput.length)}cqi, 34cqi))`,
                                letterSpacing: '0.5px',
                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.2,
                                fontVariantEmoji: 'text',
                                verticalAlign: 'middle',
                                textRendering: 'geometricPrecision',
                                filter: 'grayscale(1)',
                                ...(side === 'FRONT' && {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                }),
                            }}
                        >
                            {textInput}
                        </span>
                    </div>
                )}

                {/* Graphic Overlay */}
                {graphicInput && (
                    <div
                        className={`${getPositionClass('graphic')} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{
                            containerType: 'inline-size',
                            transform: graphicInput.scale ? `scale(${graphicInput.scale})` : 'none',
                            transformOrigin: 'center center',
                            ...getPositionStyle('graphic')
                        }}
                    >
                        <img
                            src={graphicInput.src}
                            alt={graphicInput.name}
                            className="w-full h-full object-contain"
                            style={{
                                filter: graphicInput.isUpload
                                    ? 'grayscale(100%) contrast(1.2) brightness(1.2)'
                                    : `grayscale(1)${selectedColor !== 'white' ? ' invert(1)' : ''}`,
                                opacity: graphicInput.isUpload
                                    ? 0.9
                                    : (selectedColor === 'white' ? 0.85 : 0.73),
                                mixBlendMode: graphicInput.isUpload
                                    ? 'normal'
                                    : (selectedColor === 'white' ? 'multiply' : 'overlay'),
                                maxHeight: graphicMaxSize,
                                maxWidth: graphicMaxSize
                            }}
                        />
                        {/* Engraved Gradient Overlay - Only for Uploaded Images */}
                        {graphicInput.isUpload && (
                            <div
                                className="absolute w-full h-full pointer-events-none"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    maxHeight: graphicMaxSize,
                                    maxWidth: graphicMaxSize,
                                    maskImage: `url(${graphicInput.src})`,
                                    WebkitMaskImage: `url(${graphicInput.src})`,
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)',
                                    mixBlendMode: 'overlay',
                                    zIndex: 21
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Monogram Overlay */}
                {monogramInput && shouldDisplayMonogram(selectedMonogram, monogramInput.length) && (
                    <div
                        className={`${getPositionClass('monogram')} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{ containerType: 'inline-size', ...getPositionStyle('monogram') }}
                    >
                        {usesCircleGlyphs(selectedMonogram) ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    fontFamily: getCircleFontFamily(monogramInput.length),
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                    filter: 'grayscale(1)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: 1,
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
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                    filter: 'grayscale(1)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: 1,
                                }}
                            >
                                {convertToNGramGlyphs(monogramInput)}
                            </span>
                        ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                    filter: 'grayscale(1)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
                                    lineHeight: 1,
                                }}
                            >
                                <span style={{ fontSize: '0.75em' }}>{monogramInput[0]}</span>
                                <span style={{ fontSize: '1em' }}>{monogramInput[1]}</span>
                                <span style={{ fontSize: '0.75em' }}>{monogramInput[2]}</span>
                            </span>
                        ) : (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                    filter: 'grayscale(1)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isCapture ? false : isMobile),
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

                {/* Dashed Box Overlay - only for non-capture editing views */}
                {view && view !== 'main' && !isCapture && (
                    <div className={`absolute ${currentConfig.boundary} border border-dashed border-gray-400/60 rounded-sm pointer-events-none transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}></div>
                )}
            </div>
        </div>
    );
};

export default BottlePreview;
