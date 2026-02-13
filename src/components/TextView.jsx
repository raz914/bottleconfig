import React from 'react';
import MiniNav from './MiniNav';
import { t } from '../i18n';

const TextView = ({ setView, textInput, setTextInput, fonts, selectedFont, setSelectedFont, activeTab, isVertical, setIsVertical }) => {
    const MAX_CHARS_PER_LINE = 20;
    const MAX_FRONT_LINES = 4;
    const MAX_FRONT_TOTAL = (MAX_CHARS_PER_LINE * MAX_FRONT_LINES) + (MAX_FRONT_LINES - 1); // include newlines

    return (
        <div className="flex flex-col h-full w-full max-w-2xl">
            <MiniNav setView={setView} activeView="text" activeTab={activeTab} />

            {/* Back Button */}
            <button
                onClick={() => setView('main')}
                className="flex items-center text-black font-bold text-xs md:text-sm tracking-widest uppercase mb-2 md:mb-6 hover:text-gray-600 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('text.back')}
            </button>

            {/* Text Input */}
            <div className="bg-white rounded-lg shadow-sm  mb-3 border border-gray-200 flex items-center flex-shrink-0">
                <textarea
                    value={textInput}
                    onChange={(e) => {
                        const raw = String(e.target.value || '').replace(/\r\n/g, '\n');
                        let lines = raw.split('\n').map(line => line.slice(0, MAX_CHARS_PER_LINE));

                        if (activeTab === 'FRONT') {
                            lines = lines.slice(0, MAX_FRONT_LINES);
                        }

                        setTextInput(lines.join('\n'));
                    }}
                    placeholder={t('text.placeholder')}
                    maxLength={activeTab === 'FRONT' ? MAX_FRONT_TOTAL : 150}
                    rows={1}
                    wrap="off"
                    className="flex-1 w-full px-2 md:px-4 py-2 text-center text-sm md:text-base text-gray-700 placeholder-gray-300 focus:outline-none resize-none min-h-[44px] md:min-h-[48px]"
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
                <div className="text-green-500 px-2 pt-2">
                    {textInput && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Vertical Orientation Toggle - Only for Back Side */}
            {activeTab === 'BACK' && (
                <div className="mb-6 flex flex-col items-start w-full px-1">
                    <span className="text-sm font-bold text-gray-800 mb-2">
                        {t('text.orientationLabel')} <span className="font-normal">{isVertical ? t('text.vertical') : t('text.horizontal')}</span>
                    </span>
                    <div className="flex space-x-3">
                        {/* Vertical Button */}
                        <button
                            onClick={() => setIsVertical(true)}
                            className={`w-12 h-12 rounded flex items-center justify-center transition-all bg-white
                                ${isVertical
                                    ? 'border-2 border-black shadow-sm'
                                    : 'border border-gray-300 hover:border-gray-400'
                                }
                            `}
                            aria-label={t('text.verticalAria')}
                        >
                            <span className="text-xs font-medium text-gray-800 transform rotate-90 leading-none">Aaa</span>
                        </button>

                        {/* Horizontal Button */}
                        <button
                            onClick={() => setIsVertical(false)}
                            className={`w-12 h-12 rounded flex items-center justify-center transition-all bg-white
                                ${!isVertical
                                    ? 'border-2 border-black shadow-sm'
                                    : 'border border-gray-300 hover:border-gray-400'
                                }
                            `}
                            aria-label={t('text.horizontalAria')}
                        >
                            <span className="text-xs font-medium text-gray-800 leading-none">Aaa</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Font Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[50vh] md:max-h-full">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {fonts.map((font) => (
                        <button
                            key={font.name}
                            onClick={() => setSelectedFont(font.name)}
                            className={`p-3 md:p-2 bg-white rounded-lg border transition-all duration-200 flex items-center justify-center h-14 md:h-12 shadow-md
                                ${selectedFont === font.name
                                    ? 'border-brand-blue ring-1 ring-brand-blue shadow-lg'
                                    : 'border-transparent hover:shadow-lg hover:border-brand-blue text-gray-400 hover:text-brand-blue'
                                }
                            `}
                        >
                            <span className={`text-xs md:text-sm ${selectedFont === font.name ? 'text-brand-blue' : ''}`} style={font.style}>
                                {font.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default TextView;
