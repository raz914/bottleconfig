import React from 'react';

const TextView = ({ setView, textInput, setTextInput, fonts, selectedFont, setSelectedFont }) => {
    return (
        <div className="w-full max-w-2xl">
            {/* Mini Nav for Tools - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center space-x-4 mb-8">
                <button onClick={() => setView('main')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/upload.svg" className="w-10 h-10" alt="Upload" />
                </button>
                <button className="p-4 bg-white rounded-xl shadow-sm border-2 border-black">
                    <img src="/UI/icons/text.png" className="w-10 h-10 object-contain" alt="Text" />
                </button>
                <button onClick={() => setView('monogram')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/monogram.svg" className="w-10 h-10" alt="Monogram" />
                </button>
                <button onClick={() => setView('main')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="/UI/icons/gallery.svg" className="w-10 h-10" alt="Gallery" />
                </button>
            </div>

            <div className="hidden md:block text-center mb-8">
                <span className="text-xs font-bold tracking-wider text-gray-900 uppercase block mb-1">TEXT</span>
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

            {/* Text Input */}
            <div className="bg-white rounded-lg shadow-sm p-2 mb-6 border border-gray-200 flex items-center">
                <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="TYPE TEXT HERE"
                    maxLength={15}
                    className="flex-1 w-full px-2 md:px-4 py-2 text-center text-sm md:text-base text-gray-700 placeholder-gray-300 focus:outline-none"
                    onFocus={() => {
                        setTimeout(() => {
                            const target = document.getElementById('mobile-color-trigger');
                            if (target && window.innerWidth < 768) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 350);
                    }}
                    style={fonts.find(f => f.name === selectedFont)?.style}
                />
                <div className="text-green-500 px-2">
                    {textInput && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Font Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {fonts.map((font) => (
                    <button
                        key={font.name}
                        onClick={() => setSelectedFont(font.name)}
                        className={`p-3 md:p-6 bg-white rounded-lg border transition-all duration-200 flex items-center justify-center h-14 md:h-20
                            ${selectedFont === font.name
                                ? 'border-[#002C5F] ring-1 ring-[#002C5F] shadow-md'
                                : 'border-transparent shadow-sm hover:shadow hover:border-gray-200 text-gray-400 hover:text-gray-600'
                            }
                        `}
                    >
                        <span className={`text-xs md:text-base lg:text-lg ${selectedFont === font.name ? 'text-[#002C5F]' : ''}`} style={font.style}>
                            {font.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TextView;
