import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import MainView from './MainView';
import TextView from './TextView';
import MonogramView from './MonogramView';
import GalleryView from './GalleryView';
import ColorSelector from './ColorSelector';
import BottomBar from './BottomBar';
import ReviewScreen from './ReviewScreen';
import UploadView from './UploadView';
import BottlePreview from './BottlePreview';
import DesignCapture from './DesignCapture';
import { monogramStyles, getMonogramFontSize, shouldDisplayMonogram, convertToCircleGlyphs, getCircleFontFamily, usesCircleGlyphs, convertToNGramGlyphs, getNGramFontFamily, usesNGramGlyphs } from '../data/monogramConfig';
import { isIOSDevice, captureBottleSnapshotCanvas, captureDesignSnapshotCanvas } from '../utils/canvasCapture';

const Customizer = () => {
    const [activeTab, setActiveTab] = useState('FRONT');
    const bottlePreviewRef = useRef(null);
    const frontCaptureRef = useRef(null);
    const backCaptureRef = useRef(null);
    const frontDesignCaptureRef = useRef(null);
    const backDesignCaptureRef = useRef(null);

    const [selectedColor, setSelectedColor] = useState('black');
    const [view, setView] = useState('main'); // 'main' | 'text' | 'monogram'
    const [isMobile, setIsMobile] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Force canvas capture flag for desktop testing of iOS code path
    const [forceCanvasCapture, setForceCanvasCaptureState] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        // Expose snapshot function (html-to-image)
        window.takeSnapshot = async () => {
            if (bottlePreviewRef.current) {
                try {
                    const dataUrl = await toPng(bottlePreviewRef.current, { cacheBust: true });

                    const link = document.createElement('a');
                    link.download = `bottle-snapshot-${Date.now()}.png`;
                    link.href = dataUrl;
                    link.click();
                    console.log('Snapshot taken with html-to-image!');
                } catch (err) {
                    console.error('Snapshot failed:', err);
                }
            } else {
                console.warn('Bottle preview ref not found');
            }
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            delete window.takeSnapshot;
        };
    }, []);

    // Show loader when color or tab changes
    useEffect(() => {
        setIsImageLoading(true);
    }, [selectedColor, activeTab]);

    // Expose canvas capture testing functions for desktop iPhone simulation
    useEffect(() => {
        // Toggle force canvas capture mode
        window.setForceCanvasCapture = (value) => {
            setForceCanvasCaptureState(!!value);
            console.log(`[Customizer] Force canvas capture: ${!!value}`);
        };

        // Get current force canvas capture state
        window.getForceCanvasCapture = () => forceCanvasCapture;

        return () => {
            delete window.setForceCanvasCapture;
            delete window.getForceCanvasCapture;
        };
    }, [forceCanvasCapture]);

    const [customization, setCustomization] = useState({
        FRONT: { text: '', monogram: '' },
        BACK: { text: '', monogram: '', isVertical: false }
    });

    const [selectedFont, setSelectedFont] = useState('BeFit');
    const [selectedMonogram, setSelectedMonogram] = useState('Circle');

    // Fonts array
    const fonts = [
        { name: 'BeFit', css: 'font-sans', style: { fontFamily: 'BeFit, "Noto Emoji", sans-serif' } },
        { name: 'BeFit Slim', css: 'font-sans', style: { fontFamily: 'BeFit Slim, "Noto Emoji", sans-serif' } },
        { name: 'BeFit Bold Italic', css: 'font-sans font-bold italic', style: { fontFamily: 'BeFit, "Noto Emoji", sans-serif', fontWeight: 'bold', fontStyle: 'italic' } },
        { name: 'Sackers Gothic', css: 'font-sans uppercase tracking-widest', style: { fontFamily: 'Oswald, "Noto Emoji", sans-serif' } },
        { name: 'Yearbook Solid', css: 'font-serif uppercase font-black', style: { fontFamily: 'Bebas Neue, "Noto Emoji", sans-serif' } },
        { name: 'VAG Rounded Next', css: 'font-sans', style: { fontFamily: 'Nunito, "Noto Emoji", sans-serif' } },
        { name: 'Samantha Script', css: 'font-cursive', style: { fontFamily: 'Dancing Script, "Noto Emoji", cursive' } },
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
        { name: 'Allura', css: 'font-cursive', style: { fontFamily: 'Allura, "Noto Emoji", cursive' } },
        { name: 'Bebas Neue Bold', css: 'font-display', style: { fontFamily: 'Bebas Neue, "Noto Emoji", sans-serif', fontWeight: 'bold' } },
        { name: 'Libre Baskerville', css: 'font-serif', style: { fontFamily: 'Libre Baskerville, "Noto Emoji", serif' } },
        { name: 'Montserrat Italics', css: 'font-sans italic', style: { fontFamily: 'Montserrat, "Noto Emoji", sans-serif', fontStyle: 'italic' } },
        { name: 'Dancing Script', css: 'font-cursive', style: { fontFamily: 'Dancing Script, "Noto Emoji", cursive' } },
        { name: 'Yellowtail', css: 'font-cursive', style: { fontFamily: 'Yellowtail, "Noto Emoji", cursive' } },
    ];

    const [showReview, setShowReview] = useState(false);
    const [isPreparingReview, setIsPreparingReview] = useState(false);
    const [capturedImages, setCapturedImages] = useState({
        front: null,
        back: null,
        frontDesign: null,
        backDesign: null
    });

    const requestParentClose = () => {
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'BOTTLE_CUSTOMIZER_CLOSE' }, '*');
            return true;
        }
        return false;
    };

    // Derived values for the current view
    const textInput = customization[activeTab].text;
    const monogramInput = customization[activeTab].monogram;
    const graphicInput = customization[activeTab].graphic;

    const setTextInput = (val) => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
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
                ...prev[activeTab],
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
                ...prev[activeTab],
                graphic: val,
                text: val ? '' : prev[activeTab].text, // Clear text if graphic is selected
                monogram: val ? '' : prev[activeTab].monogram // Clear monogram if graphic is selected
            }
        }));
    }

    const setIsVertical = (val) => {
        setCustomization(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                isVertical: val
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

    // Helper to wait for image to load inside a ref
    const waitForImagesToLoad = (ref) => {
        return new Promise((resolve) => {
            if (!ref.current) {
                resolve();
                return;
            }
            const images = ref.current.querySelectorAll('img');
            if (images.length === 0) {
                resolve();
                return;
            }
            let loadedCount = 0;
            const checkAllLoaded = () => {
                loadedCount++;
                if (loadedCount >= images.length) {
                    resolve();
                }
            };
            images.forEach((img) => {
                if (img.complete) {
                    checkAllLoaded();
                } else {
                    img.addEventListener('load', checkAllLoaded);
                    img.addEventListener('error', checkAllLoaded); // Resolve even on error
                }
            });
            // Timeout fallback in case images take too long
            setTimeout(resolve, 2000);
        });
    };

    // Expose canvas snapshot function for testing iOS capture path on desktop
    useEffect(() => {
        window.takeSnapshotCanvas = async (side = 'FRONT') => {
            const sideUpper = side.toUpperCase();
            if (sideUpper !== 'FRONT' && sideUpper !== 'BACK') {
                console.error('[takeSnapshotCanvas] Invalid side. Use "FRONT" or "BACK".');
                return;
            }

            console.log(`[takeSnapshotCanvas] Capturing ${sideUpper} with canvas compositor...`);

            try {
                // Wait for fonts
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                const dataUrl = await captureBottleSnapshotCanvas(
                    sideUpper,
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );

                // Download
                const link = document.createElement('a');
                link.download = `bottle-canvas-${sideUpper.toLowerCase()}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();

                console.log(`[takeSnapshotCanvas] ${sideUpper} snapshot saved!`);
            } catch (err) {
                console.error('[takeSnapshotCanvas] Failed:', err);
            }
        };

        // Compare both capture methods side-by-side
        window.compareSnapshots = async (side = 'FRONT') => {
            const sideUpper = side.toUpperCase();
            if (sideUpper !== 'FRONT' && sideUpper !== 'BACK') {
                console.error('[compareSnapshots] Invalid side. Use "FRONT" or "BACK".');
                return;
            }

            const ref = sideUpper === 'FRONT' ? frontCaptureRef : backCaptureRef;

            console.log(`[compareSnapshots] Capturing ${sideUpper} with both methods...`);

            try {
                // Wait for images and fonts
                await waitForImagesToLoad(ref);
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }
                await new Promise(r => setTimeout(r, 100));

                // Capture with html-to-image
                let htmlToImageUrl = null;
                if (ref.current) {
                    htmlToImageUrl = await toPng(ref.current, { cacheBust: true, skipAutoScale: true });
                }

                // Capture with canvas
                const canvasUrl = await captureBottleSnapshotCanvas(
                    sideUpper,
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );

                // Open comparison in new window
                const compareWindow = window.open('', '_blank', 'width=700,height=600');
                compareWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Snapshot Comparison - ${sideUpper}</title></head>
                    <body style="margin:0;padding:20px;background:#f0f0f0;font-family:sans-serif;">
                        <h3 style="margin:0 0 10px;">Snapshot Comparison: ${sideUpper}</h3>
                        <div style="display:flex;gap:20px;">
                            <div style="text-align:center;">
                                <p style="margin:0 0 5px;font-weight:bold;">html-to-image</p>
                                <img src="${htmlToImageUrl}" style="border:1px solid #ccc;max-width:300px;" />
                            </div>
                            <div style="text-align:center;">
                                <p style="margin:0 0 5px;font-weight:bold;">Canvas Compositor</p>
                                <img src="${canvasUrl}" style="border:1px solid #ccc;max-width:300px;" />
                            </div>
                        </div>
                        <p style="margin-top:20px;font-size:12px;color:#666;">
                            Canvas should match html-to-image. If text/position differs, adjust canvasCapture.js
                        </p>
                    </body>
                    </html>
                `);

                console.log('[compareSnapshots] Comparison window opened!');
            } catch (err) {
                console.error('[compareSnapshots] Failed:', err);
            }
        };

        return () => {
            delete window.takeSnapshotCanvas;
            delete window.compareSnapshots;
        };
    }, [customization, selectedColor, selectedFont, selectedMonogram]);

    const handleReview = async () => {
        try {
            setIsPreparingReview(true); // Show full-screen loader
            setIsImageLoading(true);

            let frontImg = null;
            let backImg = null;
            let frontDesignImg = null;
            let backDesignImg = null;

            // Check if we're on iOS OR force canvas capture is enabled - use canvas compositor instead of html-to-image
            const useCanvasCapture = isIOSDevice() || forceCanvasCapture;

            if (useCanvasCapture) {
                // iOS or forced: Use canvas compositor for reliable snapshot generation
                console.log(`[Customizer] Using canvas capture (iOS: ${isIOSDevice()}, forced: ${forceCanvasCapture})`);

                // Wait for fonts to be ready
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }

                // Capture using canvas compositor
                frontImg = await captureBottleSnapshotCanvas(
                    'FRONT',
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );

                backImg = await captureBottleSnapshotCanvas(
                    'BACK',
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );

                // Design captures
                frontDesignImg = await captureDesignSnapshotCanvas(
                    'FRONT',
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );

                backDesignImg = await captureDesignSnapshotCanvas(
                    'BACK',
                    customization,
                    selectedColor,
                    selectedFont,
                    selectedMonogram,
                    fonts
                );
            } else {
                // Non-iOS: Use html-to-image (works well on Android/Desktop)
                console.log('[Customizer] Using html-to-image capture');

                // Wait a frame for React to render the hidden components
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                // Wait for images to load in hidden capture areas
                await Promise.all([
                    waitForImagesToLoad(frontCaptureRef),
                    waitForImagesToLoad(backCaptureRef),
                    waitForImagesToLoad(frontDesignCaptureRef),
                    waitForImagesToLoad(backDesignCaptureRef)
                ]);

                // Small additional delay to ensure paint
                await new Promise(resolve => setTimeout(resolve, 100));

                // Capture Front
                if (frontCaptureRef.current) {
                    frontImg = await toPng(frontCaptureRef.current, { cacheBust: true, skipAutoScale: true });
                }

                // Capture Back
                if (backCaptureRef.current) {
                    backImg = await toPng(backCaptureRef.current, { cacheBust: true, skipAutoScale: true });
                }

                // Capture Front Design (Isolated)
                if (frontDesignCaptureRef.current) {
                    // Only capture if there is content
                    if (customization.FRONT.text || customization.FRONT.monogram || customization.FRONT.graphic) {
                        frontDesignImg = await toPng(frontDesignCaptureRef.current, { cacheBust: true, backgroundColor: null });
                    }
                }

                // Capture Back Design (Isolated)
                if (backDesignCaptureRef.current) {
                    if (customization.BACK.text || customization.BACK.monogram || customization.BACK.graphic) {
                        backDesignImg = await toPng(backDesignCaptureRef.current, { cacheBust: true, backgroundColor: null });
                    }
                }
            }

            setCapturedImages({
                front: frontImg,
                back: backImg,
                frontDesign: frontDesignImg,
                backDesign: backDesignImg
            });
            setIsImageLoading(false);
            setIsPreparingReview(false);
            setShowReview(true);

        } catch (error) {
            console.error("Failed to capture review images", error);
            setIsImageLoading(false);
            setIsPreparingReview(false);
            setShowReview(true);
        }
    };

    const hasContent = textInput || monogramInput || graphicInput;

    const colors = [
        { id: 'black', name: 'BLACK', bg: 'bg-black', text: 'text-white' },
        { id: 'white', name: 'WHITE', bg: 'bg-white', text: 'text-black', border: 'border-gray-200' },
        { id: 'aqua', name: 'NAVY', bg: 'bg-[#002C5F]', text: 'text-white' },
        { id: 'red', name: 'RED', bg: 'bg-[#C8102E]', text: 'text-white' },
    ];

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
                                        ? 'text-black border-b-4 border-brand-blue'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    {/* Close Button */}
                    <button onClick={requestParentClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                    <div ref={bottlePreviewRef} className="flex flex-col items-center">

                        {/* Using Clean Component for Preview */}
                        <BottlePreview
                            side={activeTab}
                            customization={customization}
                            selectedColor={selectedColor}
                            selectedFont={selectedFont}
                            selectedMonogram={selectedMonogram}
                            fonts={fonts}
                            isMobile={isMobile}
                            isImageLoading={isImageLoading}
                            setIsImageLoading={setIsImageLoading}
                            view={view}
                        />

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


                    {/* <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div> */}
                </div>

                {/* Right Panel - Customization Options */}
                <div className={`w-full md:w-1/2 bg-white md:bg-[#f3f4f6] p-4 md:p-12 flex flex-col items-center justify-start flex-1 md:mb-0 md:overflow-y-auto md:pb-32 ${view !== 'main' ? 'mb-16' : ''}`}>
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
                            isVertical={customization[activeTab].isVertical}
                            setIsVertical={setIsVertical}
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
                        onReview={handleReview}
                        isDisabled={!hasContent}
                        isPreparing={isPreparingReview}
                    />
                )}
            </main>

            {/* HIDDEN CAPTURE AREA */}
            {/* Render both sides off-screen with fixed 'Desktop' dimensions for high-quality capture */}
            {/* Position offscreen (not opacity:0) for better html-to-image compatibility on non-iOS browsers */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', pointerEvents: 'none', zIndex: -1 }}>
                <div ref={frontCaptureRef}>
                    <BottlePreview
                        side="FRONT"
                        customization={customization}
                        selectedColor={selectedColor}
                        selectedFont={selectedFont}
                        selectedMonogram={selectedMonogram}
                        fonts={fonts}
                        isMobile={false} // Force Desktop Mode
                        view="capture" // Special view mode to force sizes
                    />
                </div>
                <div ref={backCaptureRef}>
                    <BottlePreview
                        side="BACK"
                        customization={customization}
                        selectedColor={selectedColor}
                        selectedFont={selectedFont}
                        selectedMonogram={selectedMonogram}
                        fonts={fonts}
                        isMobile={false} // Force Desktop Mode
                        view="capture"
                    />
                </div>

                {/* VISUAL DESIGN CAPTURES (No Bottle, Just Design) */}
                <div ref={frontDesignCaptureRef}>
                    <DesignCapture
                        side="FRONT"
                        customization={customization}
                        selectedColor={selectedColor}
                        selectedFont={selectedFont}
                        selectedMonogram={selectedMonogram}
                        fonts={fonts}
                    />
                </div>
                <div ref={backDesignCaptureRef}>
                    <DesignCapture
                        side="BACK"
                        customization={customization}
                        selectedColor={selectedColor}
                        selectedFont={selectedFont}
                        selectedMonogram={selectedMonogram}
                        fonts={fonts}
                    />
                </div>
            </div>

            {/* Full-screen loader while preparing review */}
            {isPreparingReview && (
                <div className="fixed inset-0 z-[60] bg-white/95 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 border-4 border-gray-300 border-t-[#002C5F] rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-semibold text-[#002C5F]">Preparing your design...</p>
                </div>
            )}

            {/* Review Screen Modal */}
            {showReview && (
                <ReviewScreen
                    onClose={() => setShowReview(false)}
                    onRequestClose={requestParentClose}
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
                    frontImage={capturedImages.front}
                    backImage={capturedImages.back}
                    frontDesignImage={capturedImages.frontDesign}
                    backDesignImage={capturedImages.backDesign}
                />
            )}
        </div>
    );
};


export default Customizer;
