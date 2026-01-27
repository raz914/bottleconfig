import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

const ReviewScreen = ({ onClose, customization, selectedColor, selectedFont, selectedMonogram, fonts, monogramStyles, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs, getMonogramFontSize, shouldDisplayMonogram, setActiveTab, setView }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const frontBottleRef = useRef(null);
    const backBottleRef = useRef(null);

    // Handle Add to Cart - captures screenshots and sends to parent window
    const handleAddToCart = useCallback(async () => {
        setIsAddingToCart(true);

        try {
            // Capture front bottle screenshot
            let frontImage = '';
            let backImage = '';

            if (frontBottleRef.current) {
                const frontCanvas = await html2canvas(frontBottleRef.current, {
                    backgroundColor: '#f3f4f6',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                });
                frontImage = frontCanvas.toDataURL('image/png');
            }

            // Capture back bottle screenshot
            if (backBottleRef.current) {
                const backCanvas = await html2canvas(backBottleRef.current, {
                    backgroundColor: '#f3f4f6',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                });
                backImage = backCanvas.toDataURL('image/png');
            }

            // Prepare customization data
            const customizationData = {
                color: selectedColor,
                frontText: customization.FRONT?.text || '',
                backText: customization.BACK?.text || '',
                frontMonogram: customization.FRONT?.monogram || '',
                backMonogram: customization.BACK?.monogram || '',
                frontGraphic: customization.FRONT?.graphic?.name || '',
                backGraphic: customization.BACK?.graphic?.name || '',
                font: selectedFont,
                monogramStyle: selectedMonogram,
                frontImage: frontImage,
                backImage: backImage,
            };

            // Send to parent window (WordPress)
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'BOTTLE_CUSTOMIZER_ADD_TO_CART',
                    data: customizationData
                }, '*');
            } else {
                // For standalone testing, log the data
                console.log('Add to Cart Data:', customizationData);
                alert('Customization ready! (Standalone mode - no parent window)');
            }
        } catch (error) {
            console.error('Error capturing screenshots:', error);
            alert('Error preparing customization. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    }, [customization, selectedColor, selectedFont, selectedMonogram]);

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
                    src={`bottle/${side === 'FRONT' ? 'front' : 'back'}/${selectedColor}${side === 'BACK' ? 'back' : ''}.webp`}
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
                            className="text-center block"
                            style={{
                                ...fonts.find(f => f.name === selectedFont)?.style,
                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                fontSize: `max(4px, min(${100 / Math.max(1, textInput.length)}cqi, 24cqi))`,
                                letterSpacing: '0.5px',
                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                filter: 'grayscale(1)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
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
                        style={{
                            containerType: 'inline-size',
                            transform: graphicInput.isUpload && graphicInput.scale ? `scale(${graphicInput.scale})` : 'none',
                            transformOrigin: 'center center'
                        }}
                    >
                        <img
                            src={graphicInput.src}
                            alt={graphicInput.name}
                            className="w-full h-full object-contain"
                            style={{
                                filter: graphicInput.isUpload
                                    ? 'grayscale(100%) contrast(1.2) brightness(1.2)'
                                    : selectedColor === 'white'
                                        ? 'brightness(0) saturate(100%) invert(15%) sepia(5%) saturate(0%) hue-rotate(0deg)'
                                        : 'brightness(0) saturate(100%) invert(95%) sepia(0%) saturate(0%) hue-rotate(0deg)',
                                opacity: graphicInput.isUpload
                                    ? 0.9
                                    : selectedColor === 'white' ? 0.85 : 0.73,
                                mixBlendMode: graphicInput.isUpload
                                    ? 'normal'
                                    : selectedColor === 'white' ? 'multiply' : 'overlay',
                                maxHeight: isMobile ? '60%' : '80%',
                                maxWidth: isMobile ? '60%' : '80%'
                            }}
                        />
                        {/* Uploaded Image Gradient Overlay */}
                        {graphicInput.isUpload && (
                            <div
                                className="absolute w-full h-full pointer-events-none"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    maxHeight: isMobile ? '60%' : '80%',
                                    maxWidth: isMobile ? '60%' : '80%',
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
                        <img src="logo.png" alt="YETI" className="h-8 md:h-10 w-auto object-contain" />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002C5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-24 md:pb-28">
                <h1 className="text-xl md:text-2xl font-bold text-[#002C5F] uppercase tracking-wider mb-2">REVIEW YOUR DESIGN</h1>
                <p className="text-xs text-gray-500 mb-8 md:mb-12 text-center max-w-xl">
                    Please allow 7 business days for customization and 2-3 days for shipping. Delivery date cannot be guaranteed. ALL SALES ARE FINAL.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 w-full max-w-5xl">
                    {/* Front View */}
                    <div className="flex flex-col items-center">
                        <div ref={frontBottleRef}>
                            {renderBottle('FRONT')}
                        </div>
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
                        <div ref={backBottleRef}>
                            {renderBottle('BACK')}
                        </div>
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
            </main>

            {/* Sticky Add to Cart Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
                <div className="max-w-[1920px] mx-auto flex justify-center md:justify-end">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full md:w-auto px-8 py-3 bg-[#002C5F] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#003a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAddingToCart ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                ADDING...
                            </>
                        ) : (
                            'ADD TO CART'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewScreen;
