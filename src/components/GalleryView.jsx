import React, { useState, useRef } from 'react';
import { galleryCategories, galleryIcons } from '../data/galleryData';

const GalleryView = ({ setView, setGraphic, selectedGraphic }) => {
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
            {/* Mini Nav for Tools - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center space-x-4 mb-4">
                <button onClick={() => setView('upload')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/upload.svg" className="w-10 h-10" alt="Upload" />
                </button>
                <button onClick={() => setView('text')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/text.png" className="w-10 h-10 object-contain" alt="Text" />
                </button>
                <button onClick={() => setView('monogram')} className="p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <img src="UI/icons/monogram.svg" className="w-10 h-10" alt="Monogram" />
                </button>
                <button className="p-4 bg-white rounded-xl shadow-sm border-2 border-brand-blue">
                    <img src="UI/icons/gallery.svg" className="w-10 h-10" alt="Gallery" />
                </button>
            </div>

            <div className="hidden md:block text-center mb-8">
                <span className="text-xs font-bold tracking-wider text-gray-900 uppercase block mb-1">GALLERY</span>
            </div>

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
                    <div className="grid grid-cols-2 gap-4">
                        {galleryCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="aspect-square bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-4 hover:border-brand-blue hover:shadow-md transition-all group"
                            >
                                {/* Category Preview Icon (using the defined 'icon' string to find a sample) */}
                                <div className="text-gray-400 group-hover:text-brand-blue mb-3 transition-colors">
                                    <img
                                        src={galleryIcons[cat.id]?.[0]?.src}
                                        alt={cat.name}
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-blue uppercase tracking-wider">
                                    {cat.name}
                                </span>
                            </button>
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
                                    className={`aspect-square bg-white border rounded-md flex items-center justify-center p-4 transition-all
                                        ${selectedGraphic?.id === icon.id
                                            ? 'border-brand-blue ring-1 ring-brand-blue'
                                            : 'border-gray-200 hover:border-brand-blue'
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
