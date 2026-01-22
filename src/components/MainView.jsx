import React from 'react';
import OptionCard from './OptionCard';

const MainView = ({ setView }) => {
    return (
        <div className="w-full max-w-2xl mt-4 md:mt-12">
            <h3 className="text-center text-xs md:text-sm font-bold text-gray-700 tracking-wider mb-6 md:mb-12 uppercase">
                CUSTOMIZE IT YOUR WAY
            </h3>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
                <OptionCard
                    icon="/UI/icons/upload.svg"
                    label="UPLOAD YOUR OWN IMAGE"
                    onClick={() => { }}
                />
                <OptionCard
                    icon="/UI/icons/text.png"
                    label="TEXT"
                    isImage={true}
                    onClick={() => setView('text')}
                />
                <OptionCard
                    icon="/UI/icons/monogram.svg"
                    label="MONOGRAM"
                    onClick={() => setView('monogram')}
                />
                <OptionCard
                    icon="/UI/icons/snow.svg"
                    label="HOLIDAY DESIGNS"
                    onClick={() => { }}
                />
                <OptionCard
                    icon="/UI/icons/gallery.svg"
                    label="GALLERY"
                    onClick={() => setView('gallery')}
                />
            </div>
        </div>
    );
};

export default MainView;
