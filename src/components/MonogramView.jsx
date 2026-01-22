import React from 'react';

const MonogramView = ({ setView, monogramInput, setMonogramInput, monogramStyles, selectedMonogram, setSelectedMonogram }) => {
    return (
        <div className="w-full max-w-2xl">
            {/* Mini Nav for Tools - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center space-x-4 mb-8">
                <button onClick={() => setView('main')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/upload.svg" className="w-10 h-10" alt="Upload" />
                </button>
                <button onClick={() => setView('text')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/text.png" className="w-10 h-10 object-contain" alt="Text" />
                </button>
                <button className="p-4 bg-white rounded-xl shadow-sm border-2 border-black">
                    <img src="/UI/icons/monogram.svg" className="w-10 h-10" alt="Monogram" />
                </button>
                <button onClick={() => setView('main')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/gallery.svg" className="w-10 h-10" alt="Gallery" />
                </button>
            </div>

            <div className="hidden md:block text-center mb-8">
                <span className="text-xs font-bold tracking-wider text-gray-900 uppercase block mb-1">MONOGRAM</span>
            </div>

            {/* Back Button */}
            <button
                onClick={() => setView('main')}
                className="flex items-center text-[#002C5F] font-bold text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6 hover:opacity-80 transition-opacity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                BACK
            </button>

            {/* Monogram Input */}
            <div className="bg-white rounded-lg shadow-sm p-2 mb-6 border border-gray-200 flex items-center">
                <input
                    type="text"
                    value={monogramInput}
                    onChange={(e) => setMonogramInput(e.target.value.toUpperCase())}
                    placeholder={
                        monogramStyles.find(m => m.name === selectedMonogram)?.maxLength === 1
                            ? "ONE LETTER ONLY"
                            : monogramStyles.find(m => m.name === selectedMonogram)?.useCircleGlyphs || monogramStyles.find(m => m.name === selectedMonogram)?.useNGramGlyphs
                                ? "AT LEAST 2 LETTERS"
                                : "ENTER YOUR INITIALS"
                    }
                    maxLength={monogramStyles.find(m => m.name === selectedMonogram)?.maxLength || 3}
                    onFocus={() => {
                        setTimeout(() => {
                            const target = document.getElementById('mobile-color-trigger');
                            if (target && window.innerWidth < 768) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 350);
                    }}
                    className="flex-1 w-full px-2 md:px-4 py-2 text-center text-sm md:text-base text-gray-700 font-bold placeholder-gray-300 focus:outline-none uppercase"
                />
                <div className="text-green-500 px-2">
                    {monogramInput && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Single Letter Warning */}
            {monogramStyles.find(m => m.name === selectedMonogram)?.maxLength === 1 && monogramInput.length > 1 && (
                <div className="text-red-500 text-xs font-bold text-center -mt-4 mb-4">
                    ONLY FIRST LETTER WILL BE SHOWN
                </div>
            )}

            {/* Minimum Length Warning for Circle/NGram */}
            {(monogramStyles.find(m => m.name === selectedMonogram)?.useCircleGlyphs || monogramStyles.find(m => m.name === selectedMonogram)?.useNGramGlyphs) && monogramInput.length === 1 && (
                <div className="text-red-500 text-xs font-bold text-center -mt-4 mb-4">
                    PLEASE ENTER AT LEAST 2 LETTERS
                </div>
            )}

            {/* Info Note */}
            <div className="bg-gray-100 rounded p-2 md:p-3 mb-4 md:mb-6 text-[10px] md:text-xs text-gray-600">
                <span className="font-bold">Note:</span> Monograms with three initials display the last name initial in the center.
            </div>

            {/* Monogram Style Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {monogramStyles.map((monogram) => {
                    // Custom display for Circle font (rjm = rJ#)
                    const isCircleFont = monogram.useCircleGlyphs;
                    // Custom display for N-Gram font (rjm = ?rJ#)
                    const isNGramFont = monogram.useNGramGlyphs;
                    // Single letter fonts
                    const isSingleLetter = monogram.maxLength === 1;

                    let displayText = 'RJM';  // Default: show RJM for all fonts
                    let displayFont = monogram.style?.fontFamily;

                    if (isCircleFont) {
                        displayText = 'rJ#';  // r=lowercase, J=uppercase, #=M glyph
                        displayFont = 'Three Character Circle';
                    } else if (isNGramFont) {
                        displayText = '?rJ#';  // ?=container, r=lowercase, J=uppercase, #=M glyph
                        displayFont = 'Three Character N-Gram';
                    } else if (isSingleLetter) {
                        displayText = 'J';  // Single letter preview
                    }

                    return (
                        <button
                            key={monogram.name}
                            onClick={() => setSelectedMonogram(monogram.name)}
                            className={`p-4 md:p-8 bg-white rounded-lg border transition-all duration-200 flex items-center justify-center h-24 md:h-36
                                ${selectedMonogram === monogram.name
                                    ? 'border-[#002C5F] ring-1 ring-[#002C5F] shadow-md'
                                    : 'border-transparent shadow-sm hover:shadow hover:border-gray-200 text-gray-400 hover:text-gray-600'
                                }
                            `}
                        >
                            <span
                                className={`text-4xl md:text-5xl lg:text-7xl ${selectedMonogram === monogram.name ? 'text-[#002C5F]' : ''}`}
                                style={{ ...(({ fontSize, ...rest }) => rest)(monogram.style), fontFamily: displayFont }}
                            >
                                {displayText}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MonogramView;
