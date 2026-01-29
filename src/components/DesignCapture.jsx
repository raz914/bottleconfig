import React from 'react';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';

const DesignCapture = ({
    side, // 'FRONT' or 'BACK'
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    fonts
}) => {
    const config = customization[side];
    const textInput = config.text;
    const monogramInput = config.monogram;
    const graphicInput = config.graphic;

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
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '10px',
                        writingMode: (side === 'BACK' && config.isVertical) ? 'vertical-rl' : undefined,
                    }}
                >
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
                            fontSize: side === 'FRONT'
                                ? `max(16px, min(${100 / Math.max(1, textInput.length)}cqi, 72px))`
                                : `max(16px, min(${100 / Math.max(1, textInput.length)}cqi, 72px))`, // Larger for isolated view
                            letterSpacing: '0.5px',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.2,
                            fontVariantEmoji: 'text',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            textRendering: 'geometricPrecision',
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
                    <img
                        src={graphicInput.src}
                        alt={graphicInput.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            // For uploaded images, keep original. For gallery icons (usually white/transparent), make them black?
                            // Gallery icons are often white for dark bottles.
                            // If it's a gallery icon, apply filter to make it dark?
                            // Usually they are white PNGs.
                            // Let's invert if it's not an upload.
                            filter: graphicInput.isUpload ? 'none' : 'brightness(0)',
                        }}
                    />
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
                                fontSize: '180px', // Fixed large size for capture
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
                                fontSize: '180px',
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
                                fontSize: '180px',
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
                                fontSize: '180px',
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
