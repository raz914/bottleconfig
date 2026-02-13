import React from 'react';
import OptionCard from './OptionCard';
import { t } from '../i18n';

const MainView = ({ setView, activeTab, openGallery, openGalleryCategory }) => {
    return (
        <div className="w-full max-w-2xl mt-4 md:mt-12">
            <h3 className="text-center text-xs md:text-sm font-bold text-gray-700 tracking-wider mb-6 md:mb-12 uppercase">
                {t('main.heading')}
            </h3>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
                {activeTab === 'BACK' && (
                    <OptionCard
                        icon="UI/icons/upload.svg"
                        label={t('main.uploadOwn')}
                        onClick={() => setView('upload')}
                    />
                )}
                <OptionCard
                    icon="UI/icons/text.png"
                    label={t('main.text')}
                    isImage={true}
                    onClick={() => setView('text')}
                />
                {activeTab === 'BACK' && (
                    <>
                        <OptionCard
                            icon="UI/icons/monogram.svg"
                            label={t('main.monogram')}
                            onClick={() => setView('monogram')}
                        />
                        <OptionCard
                            icon="gallery/Valentine's Day/heart-hooks.svg"
                            label={t('main.valentines')}
                            onClick={() => openGalleryCategory('valentines')}
                        />
                        <OptionCard
                            icon="UI/icons/gallery.svg"
                            label={t('main.gallery')}
                            onClick={openGallery}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default MainView;
