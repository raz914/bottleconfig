import React from 'react';
import { t } from '../i18n';

const MiniNav = ({ setView, activeView, activeTab }) => {
    const allNavItems = [
        { id: 'upload', label: t('miniNav.upload'), icon: 'UI/icons/upload.svg' },
        { id: 'text', label: t('miniNav.text'), icon: 'UI/icons/text.png' },
        { id: 'monogram', label: t('miniNav.monogram'), icon: 'UI/icons/monogram.svg' },
        { id: 'gallery', label: t('miniNav.gallery'), icon: 'UI/icons/gallery.svg' },
    ];

    const navItems = activeTab === 'FRONT'
        ? allNavItems.filter(item => item.id === 'text')
        : allNavItems;

    return (
        <div className="hidden md:flex items-start justify-center space-x-6 mb-8 transform -translate-x-2">
            {navItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={!isActive ? () => setView(item.id) : undefined}
                        className={`group flex flex-col items-center gap-2 ${isActive ? 'cursor-default' : ''}`}
                    >
                        <div
                            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors
                                ${isActive
                                    ? 'bg-white shadow-md border-2 border-brand-blue'
                                    : 'bg-white shadow-sm group-hover:bg-gray-50'
                                }
                            `}
                        >
                            <img
                                src={item.icon}
                                className="w-8 h-8 object-contain"
                                alt={item.label}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default MiniNav;
