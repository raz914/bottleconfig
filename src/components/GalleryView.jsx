import React, { useState, useRef } from 'react';
import { galleryCategories, galleryIcons } from '../data/galleryData';
import MiniNav from './MiniNav';

const GalleryView = ({ setView, setGraphic, selectedGraphic, activeTab }) => {
    const [view, setViewInternal] = useState('categories'); // 'categories' | 'icons'
    const [activeCategory, setActiveCategory] = useState(null);
    const contentRef = useRef(null);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setViewInternal('icons');
        // Reset scroll position of content area
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    };

    const handleIconClick = (icon) => {
        setGraphic({ ...icon, scale: 1 }); // Default scale 1
    };

    const handleBackClick = () => {
        if (view === 'icons') {
            setViewInternal('categories');
            setActiveCategory(null);
            // Reset scroll position
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
        } else {
            setView('main');
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <MiniNav setView={setView} activeView="gallery" activeTab={activeTab} />

            {/* Header / Navigation */}
            <button
                onClick={handleBackClick}
                className="flex items-center text-black font-bold text-sm mb-4 hover:text-gray-600 hover:underline self-start"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {view === 'categories' ? 'BACK' : 'BACK TO CATEGORIES'}
            </button>

            {/* Selected Graphic Controls */}
            {selectedGraphic && !selectedGraphic.isUpload && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">SELECTED: {selectedGraphic.name}</span>
                        <span className="text-xs font-bold text-gray-500">{Math.round((selectedGraphic.scale || 1) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={selectedGraphic.scale || 1}
                        onChange={(e) => setGraphic({ ...selectedGraphic, scale: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#002C5F]"
                    />
                </div>
            )}

            {/* Content Area */}
            <div ref={contentRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[50vh] md:max-h-full">

                {/* Categories Grid */}
                {view === 'categories' && (
                    <div className="grid grid-cols-3 gap-4">
                        {galleryCategories.map((cat) => (
                            <div key={cat.id} className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className="aspect-square w-full bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4 shadow-md hover:border-brand-blue hover:shadow-lg transition-all group"
                                >
                                    {/* Category Preview Icon */}
                                    <img
                                        src={galleryIcons[cat.id]?.[0]?.src}
                                        alt={cat.name}
                                        className="w-12 h-12 md:w-16 md:h-16 object-contain group-hover:scale-105 transition-transform"
                                    />
                                </button>
                                <span className={`font-bold text-gray-600 uppercase tracking-wider text-center leading-tight
                                    ${cat.name.length > 8 ? 'text-[10px]' : 'text-xs'}
                                `}>
                                    {cat.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Icons Grid */}
                {view === 'icons' && activeCategory && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                            {galleryCategories.find(c => c.id === activeCategory)?.name}
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {galleryIcons[activeCategory]?.map((icon) => (
                                <button
                                    key={icon.id}
                                    onClick={() => handleIconClick(icon)}
                                    className={`aspect-square bg-white border rounded-md flex items-center justify-center p-4 shadow-md transition-all
                                        ${selectedGraphic?.id === icon.id
                                            ? 'border-brand-blue ring-1 ring-brand-blue shadow-lg'
                                            : 'border-gray-200 hover:border-brand-blue hover:shadow-lg'
                                        }
                                    `}
                                >
                                    <img
                                        src={icon.src}
                                        alt={icon.name}
                                        className="w-full h-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
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

export default GalleryView;
