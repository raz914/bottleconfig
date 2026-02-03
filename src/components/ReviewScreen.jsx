import React, { useCallback, useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

const ReviewScreen = ({
    onClose,
    onRequestClose,
    customization,
    selectedColor,
    selectedFont,
    selectedMonogramBySide, // { FRONT: '...', BACK: '...' }
    frontImage, // Received from parent (snapshot)
    backImage,   // Received from parent (snapshot)
    frontDesignImage,
    backDesignImage,
    setActiveTab,
    setView
}) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // Listen for status messages from the parent window
    useEffect(() => {
        const handleMessage = (event) => {
            const payload = event.data;
            if (!payload || payload.type !== 'BOTTLE_CUSTOMIZER_ADD_TO_CART_STATUS') return;

            if (payload.status === 'loading') {
                setIsAddingToCart(true);
                setErrorMessage('');
            } else if (payload.status === 'success') {
                // Parent will close the modal; we can optionally do cleanup here
                setIsAddingToCart(false);
            } else if (payload.status === 'error') {
                setIsAddingToCart(false);
                setErrorMessage(payload.message || 'Failed to add to cart. Please try again.');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // "Add to Cart" logic
    const handleAddToCart = useCallback(async () => {
        // Collect all customization data - FLAT structure matching WordPress plugin expectations
        const frontGraphicSrc =
            customization.FRONT.graphic && typeof customization.FRONT.graphic.src === 'string' && customization.FRONT.graphic.src.startsWith('gallery/')
                ? customization.FRONT.graphic.src
                : '';
        const backGraphicSrc =
            customization.BACK.graphic && typeof customization.BACK.graphic.src === 'string' && customization.BACK.graphic.src.startsWith('gallery/')
                ? customization.BACK.graphic.src
                : '';

        const customizationData = {
            color: selectedColor,
            font: selectedFont,
            // Per-side monogram styles
            frontMonogramStyle: selectedMonogramBySide?.FRONT || '',
            backMonogramStyle: selectedMonogramBySide?.BACK || '',
            // Backward compatibility: keep a single monogramStyle (use BACK as default)
            monogramStyle: selectedMonogramBySide?.BACK || '',
            frontText: customization.FRONT.text || '',
            backText: customization.BACK.text || '',
            frontMonogram: customization.FRONT.monogram || '',
            backMonogram: customization.BACK.monogram || '',
            frontGraphic: customization.FRONT.graphic ? customization.FRONT.graphic.name : '',
            backGraphic: customization.BACK.graphic ? customization.BACK.graphic.name : '',
            frontGraphicSrc,
            backGraphicSrc,
            frontImage: frontImage || '', // Base64 snapshot
            backImage: backImage || '',   // Base64 snapshot
            frontDesignImage: frontDesignImage || '', // Base64 isolated design
            backDesignImage: backDesignImage || '',   // Base64 isolated design
        };

        console.log("Adding to Cart - Customization Data:", customizationData);

        // Clear any previous error
        setErrorMessage('');

        // Post message to parent window (WordPress/WooCommerce)
        // Use the exact message type expected by the WordPress plugin's frontend.js
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
            // Set loading state immediately (parent will also send status)
            setIsAddingToCart(true);
            window.parent.postMessage({
                type: 'BOTTLE_CUSTOMIZER_ADD_TO_CART',
                data: customizationData
            }, '*');
            // Don't close here - wait for parent to send success status
        } else {
            // Standalone mode - log the data
            console.log("Standalone mode - Add to Cart Data:", customizationData);
            alert("Added to cart! (Check console for payload)");
            onRequestClose();
        }

    }, [customization, selectedColor, selectedFont, selectedMonogramBySide, frontImage, backImage, frontDesignImage, backDesignImage, onRequestClose]);


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
            {/* Full-screen loader overlay when adding to cart */}
            {isAddingToCart && (
                <div className="fixed inset-0 z-[100] bg-white/90 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#002C5F] rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-semibold text-[#002C5F]">Adding to cart...</p>
                </div>
            )}

            {/* Header with Logo */}
            <header className="bg-white border-b border-gray-200 flex-shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <img
                        src="logo.png"
                        alt="Logo"
                        className="h-8 md:h-10 w-auto object-contain"
                    />
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f9fafb]">
                {/* Page Heading */}
                <div className="text-center mb-6 md:mb-8 max-w-2xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-bold text-[#002C5F] uppercase tracking-wider mb-3">
                        Review Your Design
                    </h1>
                    <p className="text-sm md:text-base text-gray-800 font-medium leading-relaxed px-4">
                        Please allow 7 business days for personalization and 2-3 days for delivery. Delivery dates cannot be guaranteed. ALL PURCHASES ARE FINAL.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* FRONT VIEW */}
                    <div className="flex flex-col items-center bg-[#f9fafb] p-6 rounded-lg ">
                        <div className="relative w-full max-w-[300px] aspect-[3/5] flex items-center justify-center bg-[#f9fafb] rounded-md overflow-visible mb-6">
                            {frontImage ? (
                                <img src={frontImage} alt="Front Preview" className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" />
                            ) : (
                                <div className="text-gray-400 text-sm">No Preview Available</div>
                            )}
                        </div>
                        <button
                            onClick={() => handleEdit('FRONT')}
                            className="group flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 uppercase font-bold text-[#002C5F] text-xs md:text-sm tracking-wider hover:shadow-md transition-all"
                        >
                            <span>Edit Front</span>
                            <div className="w-6 h-6 rounded-full border border-[#002C5F] flex items-center justify-center group-hover:bg-[#002C5F] group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    {/* BACK VIEW */}
                    <div className="flex flex-col items-center bg-[#f9fafb] p-6 rounded-lg ">
                        <div className="relative w-full max-w-[300px] aspect-[3/5] flex items-center justify-center bg-[#f9fafb] rounded-md overflow-visible mb-6">
                            {backImage ? (
                                <img src={backImage} alt="Back Preview" className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" />
                            ) : (
                                <div className="text-gray-400 text-sm">No Preview Available</div>
                            )}
                        </div>
                        <button
                            onClick={() => handleEdit('BACK')}
                            className="group flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 uppercase font-bold text-[#002C5F] text-xs md:text-sm tracking-wider hover:shadow-md transition-all"
                        >
                            <span>Edit Back</span>
                            <div className="w-6 h-6 rounded-full border border-[#002C5F] flex items-center justify-center group-hover:bg-[#002C5F] group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>

                </div>
            </main>

            {/* Footer Actions */}
            <footer className="bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex-shrink-0">
                <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-4">
                    <div className="text-center w-full">
                        {errorMessage ? (
                            <p className="text-sm font-medium text-red-600">
                                {errorMessage}
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-gray-500">
                                Please review your spelling and design. Custom products cannot be returned.
                            </p>
                        )}
                    </div>
                    <div className="w-full flex space-x-3 px-4 md:px-0">
                        <button
                            onClick={onClose}
                            disabled={isAddingToCart}
                            className={`flex-1 px-6 py-4 rounded-lg text-sm bg-white border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-widest transition-colors ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#002C5F] hover:text-[#002C5F]'}`}
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setShowConfirmationModal(true)}
                            disabled={isAddingToCart}
                            className={`flex-1 px-6 py-4 rounded-lg text-[12px] md:text-sm bg-black text-white font-bold uppercase tracking-widest transition-colors ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                        >
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </footer>

            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={() => {
                    setShowConfirmationModal(false);
                    handleAddToCart();
                }}
            />
        </div>
    );
};

export default ReviewScreen;
