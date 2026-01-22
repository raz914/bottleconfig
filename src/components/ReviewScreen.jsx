import React, { useState } from 'react';

const ReviewScreen = ({ onClose, customization, selectedColor, selectedFont, selectedMonogram, fonts, monogramStyles, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs, getMonogramFontSize, shouldDisplayMonogram, setActiveTab, setView }) => {

    // Helper to render the bottle view
    const renderBottle = (side) => {
        const config = customization[side];
        const textInput = config.text;
        const monogramInput = config.monogram;
        const graphicInput = config.graphic;
        const isMobile = window.innerWidth < 768;

        // Configuration for positioning - simplified version of Customizer.jsx's SIDE_CONFIG
        // We'll reuse the classes but might need to adjust if the review scale is different
        // For now, assuming standard display similar to main view but potentially scaled

        // Replicating logic from Customizer.jsx for rendering overlay
        const SIDE_CONFIG = {
            FRONT: {
                text: "top-[28%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[62%] md:bottom-[62%]",
                monogram: "top-[25.2%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[60%] md:bottom-[61%]",
                graphic: "top-[27%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[61%] md:bottom-[62%]",
            },
            BACK: {
                text: "top-[38%] md:top-[39%] left-[38%] md:left-[36%] right-[38%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
                monogram: "top-[37%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
                graphic: "top-[33%] md:top-[33%] left-[20%] md:left-[36%] right-[20%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            }
        };

        const currentConfig = SIDE_CONFIG[side];

        return (
            <div className="relative w-[180px] h-[252px] md:w-[240px] md:h-[400px] flex items-center justify-center">
                <img
                    src={`/bottle/${side === 'FRONT' ? 'front' : 'back'}/${selectedColor}${side === 'BACK' ? 'back' : ''}.webp`}
                    alt={`Yeti Bottle ${side}`}
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
                />

                {/* Text Overlay */}
                {textInput && (
                    <div
                        className={`absolute ${currentConfig.text} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{ containerType: 'inline-size' }}
                    >
                        <span
                            className="text-center whitespace-nowrap block"
                            style={{
                                ...fonts.find(f => f.name === selectedFont)?.style,
                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                fontSize: `max(4px, min(${100 / Math.max(1, textInput.length)}cqi, 24cqi))`,
                                letterSpacing: '0.5px',
                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                            }}
                        >
                            {textInput}
                        </span>
                    </div>
                )}

                {/* Graphic Overlay */}
                {graphicInput && (
                    <div
                        className={`absolute ${currentConfig.graphic} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{ containerType: 'inline-size' }}
                    >
                        <svg
                            viewBox={graphicInput.viewBox}
                            className="w-full h-full text-slate-800"
                            style={{
                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                maxHeight: isMobile ? '38%' : '80%',
                                maxWidth: isMobile ? '38%' : '80%'
                            }}
                        >
                            {graphicInput.path}
                        </svg>
                    </div>
                )}

                {/* Monogram Overlay */}
                {monogramInput && shouldDisplayMonogram(selectedMonogram, monogramInput.length) && (
                    <div
                        className={`absolute ${currentConfig.monogram} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                        style={{ containerType: 'inline-size' }}
                    >
                        {usesCircleGlyphs(selectedMonogram) ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    fontFamily: getCircleFontFamily(monogramInput.length),
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isMobile),
                                    lineHeight: 1,
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
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
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isMobile),
                                    lineHeight: 1,
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                }}
                            >
                                {convertToNGramGlyphs(monogramInput)}
                            </span>
                        ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                            <span
                                className="text-center whitespace-nowrap block"
                                style={{
                                    ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isMobile),
                                    lineHeight: 1,
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
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
                                    color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                    fontSize: getMonogramFontSize(selectedMonogram, side, monogramInput.length, isMobile),
                                    lineHeight: 1,
                                    mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
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

    const handleEdit = (tab) => {
        setActiveTab(tab);
        // Determine which view to switch to based on content
        if (customization[tab].text) setView('text');
        else if (customization[tab].monogram) setView('monogram');
        else if (customization[tab].graphic) setView('gallery');
        else setView('text'); // Default to text if empty

        onClose(); // Close review screen
    };

    return (
        <div className="fixed inset-0 bg-[#f3f4f6] z-50 overflow-y-auto flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 relative">
                <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <div className="flex-shrink-0">
                        <img src="/logo.png" alt="YETI" className="h-8 md:h-10 w-auto object-contain" />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002C5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                <h1 className="text-xl md:text-2xl font-bold text-[#002C5F] uppercase tracking-wider mb-2">REVIEW YOUR DESIGN</h1>
                <p className="text-xs text-gray-500 mb-8 md:mb-12 text-center max-w-xl">
                    Please allow 7 business days for customization and 2-3 days for shipping. Delivery date cannot be guaranteed. ALL SALES ARE FINAL.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 w-full max-w-5xl">
                    {/* Front View */}
                    <div className="flex flex-col items-center">
                        {renderBottle('FRONT')}
                        <button
                            onClick={() => handleEdit('FRONT')}
                            className="mt-6 md:mt-8 px-6 py-2 bg-white border border-gray-300 rounded-full text-xs font-bold text-[#002C5F] uppercase tracking-widest hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <span>EDIT FRONT</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Back View */}
                    <div className="flex flex-col items-center">
                        {renderBottle('BACK')}
                        <button
                            onClick={() => handleEdit('BACK')}
                            className="mt-6 md:mt-8 px-6 py-2 bg-white border border-gray-300 rounded-full text-xs font-bold text-[#002C5F] uppercase tracking-widest hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <span>EDIT BACK</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Disclaimer / Add to Cart Region */}
                <div className="w-full bg-[#eef0f2] md:bg-transparent mt-auto md:mt-12 p-4 flex justify-end">
                    <button className="w-full md:w-auto px-8 py-3 bg-[#002C5F] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#003a7a] transition-colors">
                        ADD TO CART
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ReviewScreen;
