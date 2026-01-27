import React, { useState, useEffect } from 'react';
import MainView from './MainView';
import TextView from './TextView';
import MonogramView from './MonogramView';
import GalleryView from './GalleryView';
import ColorSelector from './ColorSelector';
import BottomBar from './BottomBar';
import ReviewScreen from './ReviewScreen';
import UploadView from './UploadView';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';

const Customizer = () => {
    const [activeTab, setActiveTab] = useState('FRONT');
    const [selectedColor, setSelectedColor] = useState('black');
    const [view, setView] = useState('main'); // 'main' | 'text' | 'monogram'
    const [isMobile, setIsMobile] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show loader when color or tab changes
    useEffect(() => {
        setIsImageLoading(true);
    }, [selectedColor, activeTab]);

    const [customization, setCustomization] = useState({
        FRONT: { text: '', monogram: '' },
        BACK: { text: '', monogram: '' }
    });

    const [selectedFont, setSelectedFont] = useState('BeFit');
    const [selectedMonogram, setSelectedMonogram] = useState('Circle');

    const [showReview, setShowReview] = useState(false);

    // Derived values for the current view
    const textInput = customization[activeTab].text;
    const monogramInput = customization[activeTab].monogram;
    const graphicInput = customization[activeTab].graphic;

    const setTextInput = (val) => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                text: val,
                monogram: val ? '' : prev[activeTab].monogram, // Clear monogram if text is added
                graphic: val ? null : prev[activeTab].graphic // Clear graphic if text is added
            }
        }));
    }

    const setMonogramInput = (val) => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                monogram: val,
                text: val ? '' : prev[activeTab].text, // Clear text if monogram is added
                graphic: val ? null : prev[activeTab].graphic // Clear graphic if monogram is added
            }
        }));
    }

    const setGraphic = (val) => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                graphic: val,
                text: val ? '' : prev[activeTab].text, // Clear text if graphic is selected
                monogram: val ? '' : prev[activeTab].monogram // Clear monogram if graphic is selected
            }
        }));
    }

    const handleRemove = () => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                text: '',
                monogram: '',
                graphic: null
            }
        }));
    };

    const hasContent = textInput || monogramInput || graphicInput;

    const colors = [
        { id: 'black', name: 'BLACK', bg: 'bg-black', text: 'text-white' },
        { id: 'white', name: 'WHITE', bg: 'bg-white', text: 'text-black', border: 'border-gray-200' },
        { id: 'aqua', name: 'NAVY', bg: 'bg-[#002C5F]', text: 'text-white' },
        { id: 'red', name: 'RED', bg: 'bg-[#C8102E]', text: 'text-white' },
    ];

    const fonts = [
        { name: 'BeFit', css: 'font-sans', style: { fontFamily: 'BeFit, "Noto Emoji", sans-serif' } },
        { name: 'BeFit Slim', css: 'font-sans', style: { fontFamily: 'BeFit Slim, "Noto Emoji", sans-serif' } },
        { name: 'BeFit Bold Italic', css: 'font-sans font-bold italic', style: { fontFamily: 'BeFit, "Noto Emoji", sans-serif', fontWeight: 'bold', fontStyle: 'italic' } },
        { name: 'Sackers Gothic', css: 'font-sans uppercase tracking-widest', style: { fontFamily: 'Oswald, "Noto Emoji", sans-serif' } },
        { name: 'Yearbook Solid', css: 'font-serif uppercase font-black', style: { fontFamily: 'Bebas Neue, "Noto Emoji", sans-serif' } },
        { name: 'VAG Rounded Next', css: 'font-sans', style: { fontFamily: 'Nunito, "Noto Emoji", sans-serif' } },
        { name: 'Samantha Script', css: 'font-cursive', style: { fontFamily: 'Dancing Script, "Noto Emoji", cursive' } },
        // { name: 'Nexa Script', css: 'font-cursive', style: { fontFamily: 'Pacifico, cursive' } },
        { name: 'Cotford', css: 'font-serif', style: { fontFamily: 'Merriweather, "Noto Emoji", serif' } },
        { name: 'Arial Bold', css: 'font-sans font-bold', style: { fontFamily: 'Arial, "Noto Emoji", sans-serif', fontWeight: 'bold' } },
        { name: 'ITC Modern No 216', css: 'font-serif font-bold', style: { fontFamily: 'Bodoni Moda, "Noto Emoji", serif' } },
        { name: 'Benguiat Pro ITC Bold', css: 'font-serif font-bold', style: { fontFamily: 'Playfair Display, "Noto Emoji", serif', fontWeight: 'bold' } },
        { name: 'Rockwell Bold', css: 'font-serif font-bold', style: { fontFamily: 'Alfa Slab One, "Noto Emoji", serif' } },
        { name: 'WHIPHAND', css: 'font-display uppercase', style: { fontFamily: 'Permanent Marker, "Noto Emoji", cursive', fontStyle: 'italic' } },
        { name: 'WOOD TYPE', css: 'font-display uppercase tracking-wide', style: { fontFamily: 'Bungee, "Noto Emoji", sans-serif' } },
        { name: 'Futura Bold', css: 'font-sans font-bold uppercase', style: { fontFamily: 'Oswald, "Noto Emoji", sans-serif', fontWeight: 'bold' } },
        { name: 'Script MT Bold', css: 'font-cursive font-bold', style: { fontFamily: 'Dancing Script, "Noto Emoji", cursive', fontWeight: 'bold' } },
        { name: 'Times New Roman', css: 'font-serif', style: { fontFamily: 'Times New Roman, "Noto Emoji", serif' } },
    ];

    const SIDE_CONFIG = {
        FRONT: {
            text: "top-[27.3%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[62%] md:bottom-[62%]",
            monogram: "top-[25.2%] md:top-[32.4%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[60%] md:bottom-[61%]",
            graphic: "top-[27%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[61%] md:bottom-[62%]",
            boundary: "top-[29%] md:top-[32.5%] left-[35%] md:left-[35%] right-[34%] md:right-[34%] bottom-[63%] md:bottom-[61%]",
            zoom: "scale-[1.5] translate-y-[3%] md:scale-[2] md:translate-y-[5%]"
        },
        BACK: {
            text: "top-[38%] md:top-[39%] left-[38%] md:left-[36%] right-[38%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            monogram: "top-[37%] md:top-[33%] left-[36%] md:left-[36%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            graphic: "top-[33%] md:top-[33%] left-[20%] md:left-[36%] right-[20%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            boundary: "top-[39.5%] md:top-[40.5%] left-[36%] md:left-[35.5%] right-[36%] md:right-[36%] bottom-[31%] md:bottom-[31%]",
            zoom: "scale-[1.5] translate-y-[2%] md:scale-[2] md:translate-y-[5%]"
        }
    };

    const currentConfig = SIDE_CONFIG[activeTab];

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans text-slate-900 overflow-y-auto">
            {/* Header */}
            <header id="app-header" className="bg-white border-b border-gray-200 z-10 relative">
                <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <img src="logo.png" alt="YETI" loading="lazy" className="h-8 md:h-10 w-auto object-contain" />
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex space-x-4 md:space-x-8 h-full">
                        {['FRONT', 'BACK'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative h-full px-1 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors
                  ${activeTab === tab
                                        ? 'text-[#002C5F] border-b-4 border-[#002C5F]'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    {/* Close Button */}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002C5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
                {/* Left Panel - Bottle Preview */}
                <div id="bottle-canvas" className="w-full md:w-1/2 flex items-center justify-center bg-[#f3f4f6] relative py-6 md:py-0 overflow-hidden min-h-[300px] md:min-h-0">
                    <div className="flex flex-col items-center">
                        {/* Bottle Image Container - scales entire container when zoomed */}
                        <div
                            className={`relative mb-4 md:mb-12 transition-transform duration-300 ease-in-out
                                w-[200px] h-[280px] md:w-[300px] md:h-[500px]
                                ${view !== 'main' ? currentConfig.zoom : ''}
                            `}

                        // ${view !== 'main' ? currentConfig.zoom : ''}
                        >
                            <img
                                src={`bottle/${activeTab === 'FRONT' ? 'front' : 'back'}/${selectedColor}${activeTab === 'BACK' ? 'back' : ''}.webp`}
                                alt="Yeti Bottle"
                                loading="lazy"
                                className={`w-full h-full object-contain mix-blend-multiply drop-shadow-2xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setIsImageLoading(false)}
                                onError={(e) => {
                                    console.warn("Image load error", e.target.src);
                                    setIsImageLoading(false);
                                }}
                            />

                            {/* Loading Spinner */}
                            {isImageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-gray-300 border-t-[#002C5F] rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Text Overlay - positioned within customization area */}
                            {textInput && (
                                <div
                                    className={`absolute ${currentConfig.text} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                                    style={{ containerType: 'inline-size' }}
                                >
                                    <span
                                        className="text-center block overflow-hidden"
                                        style={{
                                            ...fonts.find(f => f.name === selectedFont)?.style,
                                            color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(216, 216, 216, 0.73)',
                                            fontSize: activeTab === 'FRONT'
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
                                            ...(activeTab === 'FRONT' && {
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
                                    className={`absolute ${currentConfig.graphic} flex items-center justify-center z-20 pointer-events-none overflow-hidden`}
                                    style={{
                                        containerType: 'inline-size',
                                        transform: graphicInput.scale ? `scale(${graphicInput.scale})` : 'none',
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
                                            maxHeight: isMobile ? '45%' : '75%',
                                            maxWidth: isMobile ? '45%' : '75%'
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
                                                maxHeight: isMobile ? '45%' : '75%',
                                                maxWidth: isMobile ? '45%' : '75%',
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
                                        // Circle glyph fonts (2-char or 3-char based on input)
                                        <span
                                            className="text-center whitespace-nowrap block"
                                            style={{
                                                fontFamily: getCircleFontFamily(monogramInput.length),
                                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                                fontSize: getMonogramFontSize(selectedMonogram, activeTab, monogramInput.length, isMobile),
                                                lineHeight: 1,
                                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                            }}
                                        >
                                            {convertToCircleGlyphs(monogramInput, selectedMonogram)}
                                        </span>
                                    ) : usesNGramGlyphs(selectedMonogram) ? (
                                        // N-Gram glyph fonts (2-char or 3-char based on input)
                                        <span
                                            className="text-center whitespace-nowrap block"
                                            style={{
                                                ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                                fontFamily: getNGramFontFamily(monogramInput.length),
                                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                                fontSize: getMonogramFontSize(selectedMonogram, activeTab, monogramInput.length, isMobile),
                                                lineHeight: 1,
                                                mixBlendMode: selectedColor === 'white' ? 'multiply' : 'overlay',
                                            }}
                                        >
                                            {convertToNGramGlyphs(monogramInput)}
                                        </span>
                                    ) : monogramStyles.find(m => m.name === selectedMonogram)?.middleLarger && monogramInput.length === 3 ? (
                                        // Roman style with larger middle letter
                                        <span
                                            className="text-center whitespace-nowrap block"
                                            style={{
                                                ...monogramStyles.find(m => m.name === selectedMonogram)?.style,
                                                color: selectedColor === 'white' ? 'rgba(50,50,50,0.85)' : 'rgba(255, 255, 255, 0.73)',
                                                fontSize: getMonogramFontSize(selectedMonogram, activeTab, monogramInput.length, isMobile),
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
                                                fontSize: getMonogramFontSize(selectedMonogram, activeTab, monogramInput.length, isMobile),
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

                            {/* Dashed Box Overlay for Customization Area - FIXED position */}
                            <div className={`absolute ${currentConfig.boundary} border border-dashed border-gray-400/60 rounded-sm pointer-events-none transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}></div>
                        </div>


                        {/* Product Info - Hidden when editing */}
                        <div className={`text-center space-y-2 md:space-y-4 hidden md:block transition-opacity duration-300 ${view !== 'main' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <h2 className="text-xs md:text-sm font-bold text-[#002C5F] tracking-wider uppercase">
                                RAMBLER® 16 OZ TRAVEL BOTTLE
                            </h2>

                            {/* Color Picker */}
                            <div className="flex items-center justify-center space-x-3">
                                {colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color.id)}
                                        className={`w-8 h-8 rounded-full ${color.bg} ${color.border || ''} 
                                     ring-2 ring-offset-2 transition-all duration-200
                                     ${selectedColor === color.id ? 'ring-[#002C5F]' : 'ring-transparent hover:ring-gray-300'}
                                 `}
                                        aria-label={`Select ${color.name} color`}
                                    />
                                ))}
                            </div>

                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                PRODUCT COLOR: <span className="text-black">{colors.find(c => c.id === selectedColor)?.name}</span>
                            </p>
                        </div>
                    </div>

                    {/* Mobile Color Selector - Top Right of Preview Panel */}
                    <ColorSelector
                        colors={colors}
                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}
                        isMobile={isMobile}
                    />

                    {/* Trust Badge / Icon in bottom left */}
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Customization Options */}
                <div className="w-full md:w-1/2 bg-white md:bg-[#f3f4f6] p-4 md:p-12 flex flex-col items-center justify-start flex-1 mb-16 md:mb-0 md:overflow-y-auto md:pb-32">
                    {view === 'main' && <MainView setView={setView} />}

                    {view === 'text' && (
                        <TextView
                            setView={setView}
                            textInput={textInput}
                            setTextInput={setTextInput}
                            fonts={fonts}
                            selectedFont={selectedFont}
                            setSelectedFont={setSelectedFont}
                            activeTab={activeTab}
                        />
                    )}

                    {view === 'monogram' && (
                        <MonogramView
                            setView={setView}
                            monogramInput={monogramInput}
                            setMonogramInput={setMonogramInput}
                            monogramStyles={monogramStyles}
                            selectedMonogram={selectedMonogram}
                            setSelectedMonogram={setSelectedMonogram}
                        />
                    )}

                    {view === 'gallery' && (
                        <GalleryView
                            setView={setView}
                            setGraphic={setGraphic}
                            selectedGraphic={graphicInput}
                        />
                    )}

                    {view === 'upload' && (
                        <UploadView
                            setView={setView}
                            setGraphic={setGraphic}
                            graphicInput={graphicInput}
                        />
                    )}
                </div>

                {/* Bottom Actions Bar */}
                {view !== 'main' && (
                    <BottomBar
                        onRemove={handleRemove}
                        onReview={() => setShowReview(true)}
                        isDisabled={!hasContent}
                    />
                )}
            </main>

            {/* Review Screen Modal */}
            {showReview && (
                <ReviewScreen
                    onClose={() => setShowReview(false)}
                    customization={customization}
                    selectedColor={selectedColor}
                    selectedFont={selectedFont}
                    selectedMonogram={selectedMonogram}
                    fonts={fonts}
                    monogramStyles={monogramStyles}
                    convertToCircleGlyphs={convertToCircleGlyphs}
                    getCircleFontFamily={getCircleFontFamily}
                    usesCircleGlyphs={usesCircleGlyphs}
                    convertToNGramGlyphs={convertToNGramGlyphs}
                    getNGramFontFamily={getNGramFontFamily}
                    usesNGramGlyphs={usesNGramGlyphs}
                    getMonogramFontSize={getMonogramFontSize}
                    shouldDisplayMonogram={shouldDisplayMonogram}
                    setActiveTab={setActiveTab}
                    setView={setView}
                />
            )}
        </div>
    );
};


export default Customizer;
