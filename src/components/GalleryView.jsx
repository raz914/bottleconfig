import React, { useState } from 'react';
import { galleryCategories, galleryIcons } from '../data/galleryData';

const GalleryView = ({ setView, setGraphic, selectedGraphic }) => {
    const [view, setViewInternal] = useState('categories'); // 'categories' | 'icons'
    const [activeCategory, setActiveCategory] = useState(null);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        setViewInternal('icons');
        // Scroll to header on mobile
        const target = document.getElementById('mobile-color-trigger');
        if (target && window.innerWidth < 768) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleIconClick = (icon) => {
        setGraphic(icon); // Pass the entire icon object
        // Scroll to header on mobile
        const target = document.getElementById('mobile-color-trigger');
        if (target && window.innerWidth < 768) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleBackClick = () => {
        if (view === 'icons') {
            setViewInternal('categories');
            setActiveCategory(null);
        } else {
            setView('main');
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header / Navigation */}
            <button
                onClick={handleBackClick}
                className="flex items-center text-[#002C5F] font-bold text-sm mb-4 hover:underline self-start"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {view === 'categories' ? 'BACK' : 'BACK TO CATEGORIES'}
            </button>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                {/* Categories Grid */}
                {view === 'categories' && (
                    <div className="grid grid-cols-2 gap-4">
                        {galleryCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="aspect-square bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-4 hover:border-[#002C5F] hover:shadow-md transition-all group"
                            >
                                {/* Category Preview Icon (using the defined 'icon' string to find a sample) */}
                                <div className="text-gray-400 group-hover:text-[#002C5F] mb-3 transition-colors">
                                    <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        {/* Simple dynamic rendering or placeholder based on cat.icon. 
                                            For simplicity, we'll try to find an icon named similar or just generic folder 
                                        */}
                                        {/* Actually, let's just grab the first icon from that category to show as preview */}
                                        {galleryIcons[cat.id]?.[0]?.path}
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-[#002C5F] uppercase tracking-wider">
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
                                    className={`aspect-square bg-white border rounded-md flex items-center justify-center p-2 transition-all
                                        ${selectedGraphic?.id === icon.id
                                            ? 'border-[#002C5F] ring-1 ring-[#002C5F]'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }
                                    `}
                                >
                                    <svg viewBox={icon.viewBox} className="w-full h-full text-slate-800">
                                        {icon.path}
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
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
