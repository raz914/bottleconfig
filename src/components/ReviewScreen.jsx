import React, { useCallback } from 'react';

const ReviewScreen = ({
    onClose,
    onRequestClose,
    customization,
    selectedColor,
    selectedFont,
    selectedMonogram,
    frontImage, // Received from parent (snapshot)
    backImage,   // Received from parent (snapshot)
    setActiveTab,
    setView
}) => {
    // "Add to Cart" logic
    const handleAddToCart = useCallback(async () => {
        // Collect all customization data - FLAT structure matching WordPress plugin expectations
        const customizationData = {
            color: selectedColor,
            font: selectedFont,
            monogramStyle: selectedMonogram,
            frontText: customization.FRONT.text || '',
            backText: customization.BACK.text || '',
            frontMonogram: customization.FRONT.monogram || '',
            backMonogram: customization.BACK.monogram || '',
            frontGraphic: customization.FRONT.graphic ? customization.FRONT.graphic.name : '',
            backGraphic: customization.BACK.graphic ? customization.BACK.graphic.name : '',
            frontImage: frontImage || '', // Base64 snapshot
            backImage: backImage || '',   // Base64 snapshot
        };

        console.log("Adding to Cart - Customization Data:", customizationData);

        // Post message to parent window (WordPress/WooCommerce)
        // Use the exact message type expected by the WordPress plugin's frontend.js
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'BOTTLE_CUSTOMIZER_ADD_TO_CART',
                data: customizationData
            }, '*');
        } else {
            // Standalone mode - log the data
            console.log("Standalone mode - Add to Cart Data:", customizationData);
            alert("Added to cart! (Check console for payload)");
        }

        // Close the customizer
        onRequestClose();

    }, [customization, selectedColor, selectedFont, selectedMonogram, frontImage, backImage, onRequestClose]);


    const handleEdit = (side) => {
        setActiveTab(side);
        // Determine view based on what content exists, defaulting to main text input or generic
        const config = customization[side];
        if (config.graphic) {
            setView('gallery'); // or upload
        } else if (config.monogram) {
            setView('monogram');
        } else {
            setView('text');
        }
        onClose(); // Close review screen to go back to editor
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans text-slate-900 animate-in fade-in active:fade-out duration-300">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 flex-shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <h1 className="text-lg md:text-xl font-bold text-[#002C5F] uppercase tracking-wider">
                        Review Your Design
                    </h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close Review"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#002C5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f3f4f6]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* FRONT VIEW */}
                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Front View</h3>
                        <div className="relative w-[240px] h-[360px] md:w-[300px] md:h-[500px] flex items-center justify-center bg-[#f9fafb] rounded-md overflow-visible">
                            {frontImage ? (
                                <img src={frontImage} alt="Front Preview" className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" />
                            ) : (
                                <div className="text-gray-400 text-sm">No Preview Available</div>
                            )}
                        </div>
                        <button
                            onClick={() => handleEdit('FRONT')}
                            className="mt-6 text-sm font-bold text-[#002C5F] underline hover:text-blue-800 uppercase tracking-wider"
                        >
                            Edit Front
                        </button>
                    </div>

                    {/* BACK VIEW */}
                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Back View</h3>
                        <div className="relative w-[240px] h-[360px] md:w-[300px] md:h-[500px] flex items-center justify-center bg-[#f9fafb] rounded-md overflow-visible">
                            {backImage ? (
                                <img src={backImage} alt="Back Preview" className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" />
                            ) : (
                                <div className="text-gray-400 text-sm">No Preview Available</div>
                            )}
                        </div>
                        <button
                            onClick={() => handleEdit('BACK')}
                            className="mt-6 text-sm font-bold text-[#002C5F] underline hover:text-blue-800 uppercase tracking-wider"
                        >
                            Edit Back
                        </button>
                    </div>

                </div>
            </main>

            {/* Footer Actions */}
            <footer className="bg-white border-t border-gray-200 p-4 md:p-6 flex-shrink-0">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-medium text-gray-500">
                            Please review your spelling and design. Custom products cannot be returned.
                        </p>
                    </div>
                    <div className="flex space-x-4 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-8 py-3 bg-white border-2 border-[#002C5F] text-[#002C5F] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 md:flex-none px-8 py-3 bg-[#002C5F] text-white font-bold uppercase tracking-widest hover:bg-[#001D40] transition-colors shadow-lg"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ReviewScreen;
