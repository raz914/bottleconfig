import React, { useState } from 'react';

const ColorSelector = ({ colors, selectedColor, setSelectedColor, isMobile }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentColor = colors.find(c => c.id === selectedColor);

    return (
        <>
            {/* Mobile Color Picker Trigger */}
            {isMobile && (
                <button
                    id="mobile-color-trigger"
                    onClick={() => setIsOpen(true)}
                    className="absolute top-2 right-2 md:hidden flex items-center bg-white rounded-full shadow-lg p-1 pr-2 border border-gray-200 z-30 transition-transform active:scale-95"
                >
                    <div className={`w-8 h-8 rounded-full ${currentColor?.bg} ${currentColor?.border || ''} shadow-inner`} />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Mobile Color Selection Modal */}
            {isMobile && isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8 pt-10">
                            <h3 className="text-xl font-bold text-[#002C5F] leading-tight mb-2 tracking-wide uppercase">
                                RAMBLER® 16 OZ TRAVEL BOTTLE
                            </h3>

                            <hr className="mb-6 opacity-20" />

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                                        COLOR: <span className="text-black ml-1">{currentColor?.name}</span>
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {colors.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => setSelectedColor(color.id)}
                                                className={`relative w-12 h-12 rounded-full ${color.bg} ${color.border || ''} 
                                                    ring-2 ring-offset-4 transition-all duration-200
                                                    ${selectedColor === color.id ? 'ring-[#002C5F]' : 'ring-transparent'}
                                                `}
                                                aria-label={`Select ${color.name} color`}
                                            >
                                                {selectedColor === color.id && (
                                                    <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-black text-white font-bold py-4 rounded-lg tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg"
                                >
                                    UPDATE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ColorSelector;
